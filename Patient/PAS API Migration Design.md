# PAS API Migration Design

## Before

![image.png](PAS%20API%20Migration%20Design.assets/image.png)

```bash
---
config:
  look: classic
  layout: dagre
---
flowchart LR
 subgraph External["PAS"]
        SOAP("Web Service<br>[PatientService]")
        OLD_API("Old API<br>[pas-ipas-patientEnquiryService]")
  end
 subgraph Internal["LIS"]
        ECPath["ECPath"]
  end
    ECPath -- /searchHKPMIPatientByCaseNo --> SOAP
    ECPath -- /searchHKPMIPatientByHKID --> SOAP
    ECPath -- /patient/getLinkedHKIDByHKID --> OLD_API
    ECPath -- /patient/getCases --> OLD_API
    ECPath -- /patient/getCaseWithPatients --> OLD_API

```

## After

![image.png](PAS%20API%20Migration%20Design.assets/image%20(2).png)

```bash
---
config:
  look: classic
  layout: dagre
---
flowchart LR
 subgraph External["PAS"]
        NEW_API("New API<br>[pas-ipasservice-pmiEnquiryServices]")
  end
 subgraph Internal["LIS"]
        ECPath["ECPath"]
        PATIENT_SVC("lis-patient-svc")
  end

ECPath --> PATIENT_SVC
PATIENT_SVC -- /hkpmi/case-list --> NEW_API
PATIENT_SVC -- /hkpmi/patient-list --> NEW_API
```