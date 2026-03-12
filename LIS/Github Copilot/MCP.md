# SonarQube
| URL                                                                | Token                                        |
| ------------------------------------------------------------------ | -------------------------------------------- |
| [https://hatool-sonarqube.home/](https://hatool-sonarqube.home/)   | squ_551cb1dcf32f48442a7d1648db5b2e00c9f9e9d3 |
| https://sonarqube-h-qatool-sonarqube-dev.tstcld61.server.ha.org.hk | squ_15a058e33bdd83af5e5ce01944f3dafce1dd2166 |
```json
"sonarqube": {

        "type": "stdio",

        "command": "node",

        "args": [

          "D:\\ha-sonarqube-mcp-server\\package\\dist\\index.js"

        ],

        "env": {

          "SONARQUBE_URL": "https://sonarqube-h-qatool-sonarqube-dev.tstcld61.server.ha.org.hk",

          "SONARQUBE_TOKEN": "squ_15a058e33bdd83af5e5ce01944f3dafce1dd2166",

          "SONARQUBE_IDE_PORT": "64127"

        }

      }
```
