---
tags:
  - lis-hub-lib
  - component
  - command
---
# Build

```bash
cd lis-hub-lib
npm install
npm run lib          # rollup build → dist/
npm link

cd ../lis-request-app
npm link @lis/lis-hub-lib
npm run build
```

# Undo npm link
```bash
# 1. Unlink in the consuming app
cd D:\ECPath5_revamp\crs-revamp\lis-request-app
npm unlink @lis/lis-hub-lib


# 2. Reinstall the published version from registry
npm install

# 3. (Optional) Remove the global link from lis-hub-lib

cd D:\ECPath5_revmap\lis-hub-lib
npm unlink
```
