# Command Prompt

## Enable Telnet Client

```bash
dism /online /Enable-Feature /FeatureName:TelnetClient
```

## Download File

```bash
curl -k -o C:\temp\test.xls "https://lis-ecsearchquery-svc-devqa.tstcld61.server.ha.org.hk:443/api/file/download/SYB_AHN_3_LAB_DB_21_20251106152933278.xlsx" --progress-bar
```