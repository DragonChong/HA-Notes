---
title: Oracle ServiceEntry Setup and Diagnosis
tags:
  - lis
  - ecp
  - openshift
  - istio
  - oracle
  - serviceentry
  - scan
aliases:
  - Oracle Istio ServiceEntry
  - Oracle SCAN ServiceEntry
created: 2026-07-30
updated: 2026-07-30
source: lis-gcr-order-inf-svc SIT troubleshooting
---

# Oracle ServiceEntry Setup and Diagnosis (LIS / ECP / OpenShift / Istio)

Guideline for allowing Oracle JDBC egress from Istio-injected pods, including **Oracle SCAN** and **instance VIP redirect**.

> [!summary] Bottom line
> For Oracle SCAN you need **SCAN + instance VIP redirect + node hosts**. `nslookup` on the SCAN name alone is not enough — redirect VIPs must be discovered (DBA or Istio `BlackHoleCluster` logs).

---

## 1. Architecture reminder

```text
App JDBC  →  SCAN host:port (e.g. lis-gcr-u01:29801)
          →  SCAN VIP(s) from DNS (.114/.115/.116)
          →  Oracle redirects → Instance VIP:local_port (.112/.113:24002)
```

| Layer | Example | How to discover |
|---|---|---|
| SCAN DNS name | `lis-gcr-u01` / FQDN | JDBC URL `HOST=` |
| SCAN port | `29801` | JDBC URL `PORT=` |
| SCAN VIP IPs | `.114/.115/.116` | `nslookup <SCAN>` |
| Node hostnames | `cdctst30` / `cdctst39` | DB inventory |
| Node host IPs | `.103` / `.120` | `nslookup` node hosts |
| **Instance VIPs (redirect)** | `.112` / `.113` | DBA, or Istio `BlackHoleCluster` logs |
| Local listener port | `24002` | Inventory / `Test-NetConnection` on nodes |

> [!warning] SCAN DNS ≠ instance VIP
> `nslookup lis-gcr-u01` only returns SCAN VIPs. Redirect targets are separate IPs and often have no useful DNS name from the app’s point of view.

---

## 2. Setup checklist

### 2.1 Collect facts before writing YAML

1. JDBC URL from ConfigMap / secret (`oracle-jdbc`) — note `HOST`, `PORT`, `SERVICE_NAME`.
2. `nslookup` SCAN host → SCAN VIP list.
3. DB inventory → node hosts + local listener port.
4. Confirm ports from a PC (or jump host):
   - SCAN host: JDBC port should succeed; local port often fails on SCAN VIPs.
   - Node hosts: local listener port should succeed; JDBC SCAN port often fails on node hosts.
5. Confirm **cluster DNS suffix** from a pod (often `*.serverdev.hadev.org.hk` in SIT), which may differ from desktop (`*.server.ha.org.hk`).

### 2.2 Istio rules that bite Oracle

| Rule | Implication |
|---|---|
| TCP ServiceEntry allows **one** `hosts` entry | One SE per hostname / placeholder |
| Protocol must be **TCP** | Do not use HTTP/HTTPS for Oracle JDBC |
| Hostname SEs (SCAN / nodes) | Use `resolution: DNS` — no endpoints/IPs required |
| Client may connect by **IP** after redirect | VIP SEs: `resolution: STATIC` + `addresses:` + `endpoints:` |
| Outbound policy often REGISTRY_ONLY | Missing SE → `BlackHoleCluster` / `UH` → app `Broken pipe` |

### 2.3 Mandatory ServiceEntry set (LISGCRU1 / SIT)

Validated mandatory set for `lis-gcr-u01` (GCR_UAT):

| # | ServiceEntry name | Role | Host / address | Port | Resolution |
|---|---|---|---|---|---|
| 1 | `oracle-lis-sit-lis-gcr-u01` | SCAN | `lis-gcr-u01.serverdev.hadev.org.hk` | 29801 | **DNS** (no endpoints) |
| 2 | `oracle-lis-sit-lisgcru1-vip-112` | Redirect VIP | `160.85.116.112/32` | 24002 | **STATIC** + IP |
| 3 | `oracle-lis-sit-lisgcru1-vip-113` | Redirect VIP | `160.85.116.113/32` | 24002 | **STATIC** + IP |
| 4 | `oracle-lis-sit-cdctst30` | Node host | `cdctst30` | 24002 | **DNS** (no endpoints) |
| 5 | `oracle-lis-sit-cdctst39` | Node host | `cdctst39` | 24002 | **DNS** (no endpoints) |

> [!note] Naming
> Use `oracle-lis-sit-lis-gcr-u01` for the SCAN SE (cluster FQDN). Do **not** keep a separate `*-fqdn` resource name.

> [!tip] DNS vs STATIC
> For hostname-based SEs, prefer **Option A** (`resolution: DNS`). Only instance VIP redirect SEs must pin IPs (`STATIC`).

Example VIP SE (critical piece):

```yaml
apiVersion: networking.istio.io/v1beta1
kind: ServiceEntry
metadata:
  name: oracle-lis-sit-lisgcru1-vip-112
  namespace: lis-sit
  labels:
    ha.type: db
spec:
  exportTo:
    - lis-sit
  hosts:
    - oracle-lisgcru1-vip-112.local   # placeholder; TCP requires exactly one host
  addresses:
    - 160.85.116.112/32               # required for IP-based redirect
  location: MESH_EXTERNAL
  ports:
    - name: tcp-24002
      number: 24002
      protocol: TCP
  resolution: STATIC
  endpoints:
    - address: 160.85.116.112
      ports:
        tcp-24002: 24002
```

> [!tip] Labels / annotations
> Follow platform convention, e.g. `ha.type: db`, `ha.typeDesc: oracle DB ...`.

### 2.4 Apply

```bash
oc apply -f docs/serviceentry-oracle-lis-sit-lis-gcr-u01.yaml -n lis-sit
```

If an old `oracle-lis-sit-lis-gcr-u01-fqdn` exists, delete it after the renamed SCAN SE is applied:

```bash
oc delete se oracle-lis-sit-lis-gcr-u01-fqdn -n lis-sit
```

No app redeploy is required for the SE itself; `istiod` pushes to existing sidecars. Redeploy only if JDBC ConfigMap/Secret changed.

Reference: `lis-gcr-order-inf-svc/docs/serviceentry-oracle-lis-sit-lis-gcr-u01.yaml`.

---

## 3. Diagnosis flow

### 3.1 Symptom mapping

| Symptom | Likely cause |
|---|---|
| `IO Error: Broken pipe`, connect/auth lapse ~0 ms | Sidecar reset / BlackHole (missing SE or wrong IP/port) |
| TCP timeout | Firewall / NetworkPolicy / wrong network path |
| `ORA-12514` / service errors | Network OK; wrong `SERVICE_NAME` |
| `ORA-01017` | Credentials |
| Works without Istio, fails with Istio | Missing ServiceEntry for redirect VIP or host |

### 3.2 Always test the **Istio** pod

TCP success from a non-Istio pod proves network path only. The failing pod must have sidecar injected.

```sh
# From Istio app container terminal
timeout 3 bash -c '</dev/tcp/<SCAN-HOST>/<JDBC-PORT>' && echo SCAN_OK || echo SCAN_FAIL
timeout 3 bash -c '</dev/tcp/<NODE-HOST>/<LOCAL-PORT>' && echo NODE_OK || echo NODE_FAIL
```

Windows (desktop only):

```powershell
Test-NetConnection <host> -Port <port>
```

### 3.3 Confirm SE loaded

```bat
oc get se -n <namespace>
oc get se <name> -n <namespace> -o yaml
```

Windows jsonpath tip: avoid `{\n}` escapes — use:

```bat
oc get se <name> -n <namespace> -o jsonpath="{.spec.hosts}"
```

### 3.4 Read istio-proxy access log (primary for redirect VIPs)

```bat
oc logs -n <namespace> <pod> -c istio-proxy --tail=300
```

Look for:

| Field | Meaning |
|---|---|
| `BlackHoleCluster` | Destination not allowed by any ServiceEntry |
| `UH` | No healthy upstream / blackholed |
| Dest IP:port (e.g. `.112:24002`) | **Add this** to SE `addresses`/`endpoints` |

> [!example] Real SIT finding (`lis-gcr-order-inf-svc`)
> SCAN DNS = `.114/.115/.116:29801`. Redirect BlackHole = `.112/.113:24002`. Adding VIP SEs fixed Oracle; app started successfully.

### 3.5 Ways to discover instance VIP IPs

Prefer in this order:

1. **DBA / inventory** — instance VIP list for the DB service.
2. **Istio BlackHole logs** — fastest self-service inside OpenShift when SE incomplete.
3. **Oracle client tracing** — SQL\*Plus / JDBC net trace on a working client.
4. **Packet capture** — `tcpdump` on pod/node during connect.

`nslookup` on SCAN host alone will **not** list instance VIPs.

### 3.6 Verify JDBC env in pod

```sh
echo "$ORACLE_LOE_URL"
echo "$ORACLE_LOE_USERNAME"
[ -n "$ORACLE_LOE_PASSWORD" ] && echo PASSWORD_SET || echo PASSWORD_MISSING
```

Note: `SERVICE_NAME` may use `.server.ha.org.hk` — that is an Oracle service name, **not** pod DNS.

### 3.7 Success criteria

- App starts; Oracle PU / Hikari / sample query succeed.
- `istio-proxy` no longer shows `BlackHoleCluster` for Oracle SCAN/VIP ports.
- Remaining BlackHoles to unrelated IPs/ports (e.g. clusterIP:8400) are separate dependencies.

---

## 4. Quick decision tree

```text
App Oracle Broken pipe?
  ├─ istio-proxy: BlackHole to SCAN VIP:JDBC-port?
  │    → Fix/add SCAN ServiceEntry
  ├─ istio-proxy: BlackHole to other IP:local-port?
  │    → Add instance VIP ServiceEntry (addresses + endpoints)
  ├─ TCP FAIL from Istio pod?
  │    → Firewall / NetworkPolicy / wrong port
  ├─ TCP OK, ORA-xxxxx?
  │    → Credentials / SERVICE_NAME (DBA)
  └─ Works without sidecar only?
       → Missing SE for redirect path
```

---

## 5. Example — GCR UAT / LISGCRU1 mandatory SEs

| ServiceEntry | Target | Port | Resolution | Role |
|---|---|---|---|---|
| `oracle-lis-sit-lis-gcr-u01` | SCAN FQDN | 29801 | DNS | JDBC initial connect |
| `oracle-lis-sit-lisgcru1-vip-112` | `.112` | 24002 | STATIC + IP | Post-SCAN redirect |
| `oracle-lis-sit-lisgcru1-vip-113` | `.113` | 24002 | STATIC + IP | Post-SCAN redirect |
| `oracle-lis-sit-cdctst30` | `cdctst30` | 24002 | DNS | Node host |
| `oracle-lis-sit-cdctst39` | `cdctst39` | 24002 | DNS | Node host |

---

## Related

- Repo: `lis-gcr-order-inf-svc/docs/serviceentry-oracle-lis-sit-lis-gcr-u01.yaml`
- Case: SIT Istio pod `lis-gcr-order-inf-svc-istio-release-2-...` (2026-07-30)
