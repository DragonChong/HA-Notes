# PowerShell Proxy

```bash
$pass = ConvertTo-SecureString "password" -AsPlainText -Force
$cred = New-Object System.Management.Automation.PSCredential ("username", $pass)
Invoke-RestMethod -Uri "https://astral.sh/uv/install.ps1" -Proxy "http://proxy.ha.org.hk:8080" -ProxyCredential $cred | Invoke-Expression
```