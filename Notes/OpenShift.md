# OpenShift

## Secret Encryption

```javascript
// Encoding (string to base64)
const password = "r3cw3b@QAST";
const encoded = btoa(password);
console.log(encoded); // Output: cjNjdzNiQFFBU1Q=

// Decoding (base64 to string)
const decoded = atob("cjNjdzNiQFFBU1Q=");
console.log(decoded); // Output: r3cw3b@QAST
```

---

# oc Commands

## API Token

```bash
sha256~NVjCr__7EmnBhEdt345lCrqTtweEQt7flOQjufBRlyw
```

## Login

```bash
oc login https://api.tstcld61.server.ha.org.hk:6443 --token=sha256~NVjCr__7EmnBhEdt345lCrqTtweEQt7flOQjufBRlyw --insecure-skip-tls-verify
```

## API

```bash
curl -H "Authorization: Bearer sha256~NVjCr__7EmnBhEdt345lCrqTtweEQt7flOQjufBRlyw" "https://api.tstcld61.server.ha.org.hk:6443/apis/user.openshift.io/v1/users/~"
```

## ConfigMap

```bash
oc get configmap sybase-jdbc -o yaml
```