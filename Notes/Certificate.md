# Certificate

### Install Certificate

Go to C:\Program Files\Eclipse Adoptium\jdk-11.0.21.9-hotspot\lib\security

Input ....\bin\keytool -import -alias jrog -keystore cacerts -file C:\CA1.crt

Enter password: changeit

Trust: yes

### WebLogic Keystore

D:\ECPath5\Weblogic\wlserver\server\lib\DemoTrust.jks

Trust Store Password: DemoTrustKeyStorePassPhrase

keytool -import -alias haroot -keystore DemoTrust.jks -file haroot.crt

### **Check a Specific Certificate**

keytool -list -v -keystore DemoTrust.jks -alias haroot



**Check a Specific Certificate by OpenSSL**

openssl x509 -in tstcld61.crt -text -noout