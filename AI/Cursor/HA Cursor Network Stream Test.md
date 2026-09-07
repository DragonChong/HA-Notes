---
title: HA Cursor Network Stream Test
aliases:
  - Corporate Network Diagnosis
  - Cursor curl stream test
tags:
  - cursor
  - network
  - ha
  - proxy
created: '2026-09-07'
updated: '2026-09-07'
status: runbook
---
# HA Cursor Network Stream Test

How to test whether the HA Forcepoint/WCG proxy (`proxy.ha.org.hk:8080`) is buffering Cursor Agent / IDE chat streams. Official tests: [Network configuration](https://cursor.com/docs/enterprise/network-configuration).

Related: [[Cursor Setup]]

> [!abstract] When to run this
> IDE chat is **jerky after the first token**, or Agent drops mid-reply, while Agents Window looks fine. Chat/Agent diagnostics may still pass.

## Symptoms we saw

| Surface | Typical behaviour |
|---|---|
| Cursor **Agents Window** | Feels normal |
| **IDE chat** | Jerky streaming after it starts |
| Network diagnostics | Chat/Agent/API pass; DNS / Auth UI / Tab / Agent Endpoint `ENOTFOUND`; ping ~1s |

`ENOTFOUND` on those four checks is often **cosmetic** on a proxy-only PC: the diagnostic does a local `getaddrinfo`, while real traffic uses the proxy. Cursor does not use the system `curl.exe`.

Jerky streaming is almost always **WCG response buffering** (or a stale CONNECT), not a slow model.

## PowerShell paste

Windows PowerShell 5.1 (`PS C:\WINDOWS\system32>`) pastes Unix `\n` multiline blocks **bottom-to-top**, then sits on `>>` because of backticks.

> [!tip] Paste one line only
> Use the one-liners below. If you are already on `>>`, press `Ctrl+C` first. Prefer Windows Terminal if you must paste several lines.

HA `curl.exe` is often **7.35.0** (2014). It does not use the Windows cert store and does not send proxy auth unless you pass `-U`. That is why curl can fail while Cursor still works.

> [!danger] Do not paste `curl -v` output
> `-v` prints `Proxy-Authorization: Basic …` (username and password). Redact it. Do not put the password in the command you share.

## Command — streaming test (the one that matters)

Creates the payload file, authenticates to the HA proxy, and times HTTP/1.1 SSE to `api2.cursor.sh`.

`-k` is only so old curl can finish. It does not change Cursor. curl will prompt for the HA proxy password.

```powershell
$bin = Join-Path $env:TEMP "cursor-sse.bin"; [IO.File]::WriteAllBytes($bin, ([byte[]](0,0,0,0,0x11) + [Text.Encoding]::ASCII.GetBytes('{"payload":"foo"}'))); curl.exe -k -U $env:USERNAME --proxy-basic --http1.1 -N -o - -XPOST -H "Content-Type: application/connect+json" --data-binary "@$bin" --write-out "\ntime_starttransfer=%{time_starttransfer}\ntime_total=%{time_total}\n" https://api2.cursor.sh/aiserver.v1.HealthService/StreamSSE
```

If 407 persists, retry with `--proxy-ntlm` instead of `--proxy-basic`.

Healthy output looks like five `{"payload":"foo"}` frames (they may sit on one line — the protocol uses binary length prefixes, not newlines) plus a final `{}`.

### How to read timings

| `time_starttransfer` | `time_total` | Meaning |
|---|---|---|
| ~0–1.5s | ~5–6.5s (about **5s after** start) | Stream is fine. First-byte delay is proxy + TLS. |
| ~5s | ~5s (almost the same) | **Buffered** — frames dumped at the end. IDE chat will jerk. |
| ~0s | <1s | Request never streamed. Read the curl error. |

Observed healthy run (colleague PC, 2026-09-07):

- `time_starttransfer=1.266` / `time_total=6.266`
- Repeat: `1.343` / `6.343`
- Gap = 5.0s → not buffered

## Command — connectivity and cert issuer

Stop reading at `issuer`. Do not share the full `-v` log.

```powershell
curl.exe -k -v https://api2.cursor.sh 2>&1 | findstr /i "issuer subject Connected proxy"
```

| What you see | Meaning |
|---|---|
| `Connected to proxy.ha.org.hk` + `CONNECT … 200` | Tunnel through WCG is allowed |
| `issuer: Amazon RSA …` | No SSL inspection on this host (good) |
| Issuer is HA / Websense / Forcepoint | SSL inspection on — more likely to jerk |
| `Welcome to Cursor` / HTTP 200 | Origin reachable |

A workstation with `CAfile: C:\certs\ca-bundle-plus-ha.pem` can omit `-k` and still verify.

## Failed tests (do not compare these)

These are setup failures, not streaming results. Another PC can show the same curl error and still use Cursor normally.

| Error | Cause | What to do |
|---|---|---|
| `Couldn't read data from file … cursor-sse.bin` / empty POST | Payload file not created | Run the one-liner that writes `$bin` first |
| `curl: (60) SSL certificate problem` | Old curl CA bundle; Cursor uses Windows certs | Use `-k` for this test only |
| `curl: (56) … HTTP code 407 … after CONNECT` | curl sent no proxy login | `-U $env:USERNAME --proxy-basic` (or `--proxy-ntlm`) |

## After a successful curl, IDE chat may look “fixed”

curl does **not** change Cursor settings. A successful authenticated CONNECT can still:

1. Warm WCG auth / host cache for `api2.cursor.sh`
2. Push Cursor off a stale tunnel onto a new CONNECT

So the IDE can suddenly stream smoothly after the test. That is a **session warmup**, not a permanent fix. If jerkiness returns after idle, lock screen, or VPN flap, it is the same proxy path.

Do not tell people to run curl before every chat.

## Cursor settings (client)

Settings → Network → HTTP Compatibility Mode → **HTTP/1.1**. Then **fully quit** Cursor (not Reload Window).

In Settings search `http`:

- **Disable HTTP/2** = on
- **Disable HTTP/1 SSE** = off

If PAC/system proxy is ignored (common since Cursor 3.9), set explicitly:

```json
"http.proxy": "http://proxy.ha.org.hk:8080",
"http.proxySupport": "override",
"cursor.general.disableHttp2": true
```

Until IT changes the proxy, **Agents Window** is a reasonable workaround. IDE chat paints every token, so the same buffered path looks worse there.

## Ask IT

For `*.cursor.sh` (at least `api2.cursor.sh`, `api5.cursor.sh`, `agent.api5.cursor.sh`):

- No response buffering for SSE / `application/connect+json`
- No short idle timeout on long HTTPS CONNECT tunnels
- Prefer no SSL inspection (passthrough CONNECT is enough)

Also allowlist `*.cursor-cdn.com`, `*.cursorapi.com`. See [Network configuration](https://cursor.com/docs/enterprise/network-configuration) and [common issues](https://cursor.com/docs/troubleshooting/common-issues).

## Related

- [[Cursor Setup]]
