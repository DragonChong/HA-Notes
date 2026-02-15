# HL7 Example

## A01

Below is an example HL7 Version 2.x message for **Event A01 (Admit/Visit Notification)** in XML format, based on the provided "PMI-HL7.pdf" specification and tailored to the context of your previous queries. Event A01 is used for inpatient registration (CPI transaction type 100, `case_type = 'I'`) in the Hospital Authority’s system, typically to record a patient’s admission to a hospital ward. The message will be presented in XML format, as per your interest in HL7 2.x XML encoding, and will align with the mappings and structure defined in the specification.

---

### **Context and Assumptions**

- **Transaction Type**: 100 (Patient Registration, `case_type = 'I'` for inpatient).
- **Purpose**: To notify the system of a patient’s admission, including demographic and visit details such as HKID, name, admission date, ward, and case number.
- **Message Format**: As per the specification (Page 8), the A01 message uses the `ADT^A01^ADT_A01` structure and includes segments like MSH, EVN, PID, PV1, and OBX, with optional segments like NK1 omitted for simplicity unless required.
- **PMI Data** (assumed for this example):
    - `hkid`: C456789
    - `patient_key`: 00234567
    - `patient_name`: Lee Ka Yan
    - `chi_name`: 李嘉欣
    - `cccode1-3`: 26241^12341^45671 (Chinese character codes)
    - `sex`: F
    - `dob`: 19851210
    - `exact_dob_flag`: Y
    - `home_phone_no`: 23456789
    - `building`: Happy Gardens
    - `room`: 803
    - `floor`: 8
    - `block`: B
    - `district`: HKI (Hong Kong Island)
    - `HA address code`: HACODE:98765
    - `case_no`: 654321
    - `hospital_code`: PWH (Prince of Wales Hospital)
    - `ward_code`: 5B
    - `bed_no`: 12A
    - `specialty_code`: MED (Medicine)
    - `adm_dtm`: 20250428120000
    - `system_dtm`: 20250428123000

---

### **Example A01 Message in XML Format**

The message is encoded in HL7 2.8 XML format, using the structure defined in the HL7 2.x XML Encoding Rules and the PMI-HL7 specification mappings (Pages 8, 41-49).

```xml
<ADT_A01 xmlns="urn:hl7-org:v2xml">
  <MSH>
    <MSH.1>|</MSH.1>
    <MSH.2>^~\&</MSH.2>
    <MSH.3>
      <HD.1>PMI</HD.1>
    </MSH.3>
    <MSH.4>
      <HD.1>PWH</HD.1>
    </MSH.4>
    <MSH.5>
      <HD.1>RECEIVING_APP</HD.1>
    </MSH.5>
    <MSH.6>
      <HD.1>RECEIVING_FACILITY</HD.1>
    </MSH.6>
    <MSH.7>
      <TS.1>20250428123000</TS.1>
    </MSH.7>
    <MSH.9>
      <MSG.1>ADT</MSG.1>
      <MSG.2>A01</MSG.2>
      <MSG.3>ADT_A01</MSG.3>
    </MSH.9>
    <MSH.10>123456789</MSH.10>
    <MSH.11>
      <PT.1>P</PT.1>
    </MSH.11>
    <MSH.12>
      <VID.1>2.8</VID.1>
    </MSH.12>
  </MSH>
  <EVN>
    <EVN.1>A01</EVN.1>
    <EVN.2>
      <TS.1>20250428123000</TS.1>
    </EVN.2>
  </EVN>
  <PID>
    <PID.1>1</PID.1>
    <PID.3>
      <CX.1>C456789</CX.1>
      <CX.5>HKID</CX.5>
    </PID.3>
    <PID.3>
      <CX.1>00234567</CX.1>
      <CX.5>PATKEY</CX.5>
    </PID.3>
    <PID.5>
      <XPN.1>
        <FN.1>Lee Ka Yan</FN.1>
      </XPN.1>
      <XPN.7>L</XPN.7>
    </PID.5>
    <PID.5>
      <XPN.1>
        <FN.1>李嘉欣</FN.1>
      </XPN.1>
      <XPN.7>I</XPN.7>
      <XPN.8>26241:12341:45671:::</XPN.8>
    </PID.5>
    <PID.7>
      <TS.1>19851210</TS.1>
    </PID.7>
    <PID.8>F</PID.8>
    <PID.11>
      <XAD.1>803,8,B,Happy Gardens,HACODE:98765</XAD.1>
      <XAD.2>HKI</XAD.2>
    </PID.11>
    <PID.13>
      <XTN.2>PRN</XTN.2>
      <XTN.3>PH</XTN.3>
      <XTN.6>23456789</XTN.6>
    </PID.13>
    <PID.30>Y</PID.30>
  </PID>
  <PV1>
    <PV1.1>1</PV1.1>
    <PV1.2>I</PV1.2>
    <PV1.3>
      <PL.1>MED</PL.1>
      <PL.2>5B</PL.2>
      <PL.3>12A</PL.3>
    </PV1.3>
    <PV1.19>
      <CX.1>654321</CX.1>
    </PV1.19>
    <PV1.44>
      <TS.1>20250428120000</TS.1>
    </PV1.44>
  </PV1>
  <OBX>
    <OBX.1>1</OBX.1>
    <OBX.2>ST</OBX.2>
    <OBX.3>
      <CE.1>exact_dob_flag</CE.1>
    </OBX.3>
    <OBX.5>Y</OBX.5>
    <OBX.11>F</OBX.11>
  </OBX>
</ADT_A01>
```

---

### **Breakdown of the XML Message**

The message adheres to the PMI-HL7 specification (Pages 8, 41-49) and the HL7 2.8 XML encoding rules, with mappings specific to the A01 event for inpatient admission.

1. **MSH (Message Header)**:
    - `MSH.4`: `PWH` (from `hospital_code`, Page 41, Seq 2).
    - `MSH.7`: `20250428123000` (from `system_dtm`, Page 41, Seq 1).
    - `MSH.9`: `ADT^A01^ADT_A01` (from transaction type 100 mapping to A01, Page 49).
    - `MSH.10`: `123456789` (unique message control ID).
    - `MSH.12`: `2.8` (HL7 version, per document version).
2. **EVN (Event Type)**:
    - `EVN.1`: `A01` (event type for inpatient admission).
    - `EVN.2`: `20250428123000` (from `system_dtm`, Page 41, Seq 1).
3. **PID (Patient Identification)**:
    - `PID.3`: Two `<PID.3>` elements for `hkid` (`C456789^^^HKID`) and `patient_key` (`00234567^^^PATKEY`) (Page 42, Seq 5-6, repeatable).
    - `PID.5`: Two `<PID.5>` elements:
        - English name: `Lee Ka Yan^^^L` (legal name, Page 43, Seq 7).
        - Chinese name: `李嘉欣^^^^I^26241:12341:45671:::` (ideographic, with `cccode1-3`, Page 43, Seq 11-16).
    - `PID.7`: `19851210` (from `dob`, Page 43, Seq 9, format YYYYMMDD).
    - `PID.8`: `F` (from `sex`, Page 43, Seq 8).
    - `PID.11`: `803,8,B,Happy Gardens,HACODE:98765^HKI` (from `room`, `floor`, `block`, `building`, `HA address code`, `district`, Page 44, Seq 22-27).
    - `PID.13`: `^PRN^PH^^^23456789` (from `home_phone_no`, Page 45, Seq 29).
    - `PID.30`: `Y` (from `death_indicator`, assumed alive, Page 46, Seq 34).
4. **PV1 (Patient Visit)**:
    - `PV1.2`: `I` (inpatient, from `case_type`, Page 46, Seq 52).
    - `PV1.3`: `MED^5B^12A` (from `specialty_code`, `ward_code`, `bed_no`, Page 46, Seq 53, format `<point of care>^<room>^<bed>`).
    - `PV1.19`: `654321` (from `case_no`, Page 46, Seq 54).
    - `PV1.44`: `20250428120000` (from `adm_dtm`, Page 47, Seq 56, format YYYYMMDDhhmmss).
5. **OBX (Observation/Result)**:
    - `OBX.5`: `Y` (from `exact_dob_flag`, Page 43, Seq 10). Format: `OBX|1|ST|exact_dob_flag||Y||||||F` (Page 40).

---

### **Acknowledgment (ACK) Message in XML**

The receiving system responds with an ACK message to confirm receipt.

```xml
<ACK xmlns="urn:hl7-org:v2xml">
  <MSH>
    <MSH.1>|</MSH.1>
    <MSH.2>^~\&</MSH.2>
    <MSH.3>
      <HD.1>RECEIVING_APP</HD.1>
    </MSH.3>
    <MSH.4>
      <HD.1>RECEIVING_FACILITY</HD.1>
    </MSH.4>
    <MSH.5>
      <HD.1>PMI</HD.1>
    </MSH.5>
    <MSH.6>
      <HD.1>PWH</HD.1>
    </MSH.6>
    <MSH.7>
      <TS.1>20250428123001</TS.1>
    </MSH.7>
    <MSH.9>
      <MSG.1>ACK</MSG.1>
      <MSG.2>A01</MSG.2>
      <MSG.3>ACK</MSG.3>
    </MSH.9>
    <MSH.10>987654321</MSH.10>
    <MSH.11>
      <PT.1>P</PT.1>
    </MSH.11>
    <MSH.12>
      <VID.1>2.8</VID.1>
    </MSH.12>
  </MSH>
  <MSA>
    <MSA.1>AA</MSA.1>
    <MSA.2>123456789</MSA.2>
  </MSA>
</ACK>
```

- **MSH.9**: `ACK^A01^ACK` (acknowledging A01).
- **MSA.1**: `AA` (accept acknowledgment).
- **MSA.2**: `123456789` (references MSH.10 of the original message).

---

### **Notes**

- **Completeness**: The message includes mandatory segments (MSH, EVN, PID, PV1) and the relevant optional OBX segment for `exact_dob_flag`, as per the A01 format (Page 8). NK1 is omitted for simplicity but can be added if next-of-kin data (e.g., `nok_name`, `nok_hkid`) is provided.
- **Hong Kong Context**: Incorporates HKID, Chinese name with character codes, and Hong Kong-specific address formatting (Page 44, Seq 22), aligning with the specification’s localization.
- **XML Encoding**: Follows HL7 2.8 XML rules, with segments as elements, fields as numbered sub-elements, and data types (e.g., `<CX>`, `<XPN>`) for structured fields like `PID.3` and `PID.5`.
- **Format Compliance**: Dates (`system_dtm`, `adm_dtm`, `dob`) use `YYYYMMDD` or `YYYYMMDDhhmmss` as specified (Page 48, Seq 86, 93). Phone numbers follow Hong Kong’s 8-digit format (Page 45, Seq 29).
- **Simplifications**: Assumed minimal data for optional fields (e.g., no `marital_status`, `religion`). These can be added to `PID.16`, `PID.17`, etc., per the mapping table if needed.

---

### **Spring Boot Integration**

If you’re processing this A01 XML message in a Spring Boot application (as discussed in your previous query), you can use the HAPI HL7 library to parse and handle it. Below is a brief example of how to process the A01 message in the Spring Boot controller from the earlier response.

**Controller Update for A01**:

```java
import ca.uhn.hl7v2.model.Message;
import ca.uhn.hl7v2.model.v28.message.ADT_A01;
import ca.uhn.hl7v2.model.v28.segment.PID;
import ca.uhn.hl7v2.model.v28.segment.PV1;
import ca.uhn.hl7v2.parser.Parser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HL7Controller {

    @Autowired
    private Parser xmlParser;

    @Autowired
    private PatientService patientService;

    @PostMapping("/hl7")
    public ResponseEntity<String> processHL7(@RequestBody String hl7Xml) {
        try {
            // Parse the HL7 XML message
            Message message = xmlParser.parse(hl7Xml);

            // Process the message
            String response = processMessage(message);

            // Generate and encode ACK response
            Message ack = message.generateACK();
            String ackXml = xmlParser.encode(ack);

            return ResponseEntity.ok(ackXml);
        } catch (Exception e) {
            return ResponseEntity.status(400).body("Error processing HL7 message: " + e.getMessage());
        }
    }

    private String processMessage(Message message) throws Exception {
        if (message instanceof ADT_A01) {
            ADT_A01 adtMessage = (ADT_A01) message;
            PID pid = adtMessage.getPID();
            PV1 pv1 = adtMessage.getPV1();

            // Extract fields based on PMI-HL7 specification
            String hkid = pid.getPatientIdentifierList(0).getIDNumber().getValue(); // PID.3.1
            String patientName = pid.getPatientName(0).getFamilyName().getOwnSurname().getValue(); // PID.5.1
            String dob = pid.getDateTimeOfBirth().getTime().getValue(); // PID.7
            String caseNo = pv1.getVisitNumber().getIDNumber().getValue(); // PV1.19
            String ward = pv1.getAssignedPatientLocation().getRoom().getValue(); // PV1.3.2
            String admDtm = pv1.getAdmitDateTime().getTime().getValue(); // PV1.44

            // Save to database or process data
            patientService.savePatientData(hkid, patientName, dob, caseNo, ward, admDtm);

            return "Patient admitted: " + patientName;
        }
        return "Unsupported message type";
    }
}
```

**Service Update**:

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PatientService {

    @Autowired
    private PatientRepository repository;

    public void savePatientData(String hkid, String name, String dob, String caseNo, String ward, String admDtm) {
        Patient patient = new Patient();
        patient.setHkid(hkid);
        patient.setPatientName(name);
        patient.setDob(dob);
        patient.setCaseNo(caseNo);
        patient.setWard(ward);
        patient.setAdmDtm(admDtm);
        repository.save(patient);
    }
}
```

**Entity Update**:

```java
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
public class Patient {
    @Id
    private String hkid;
    private String patientName;
    private String dob;
    private String caseNo;
    private String ward;
    private String admDtm;
}
```

- **Explanation**:
    - The controller parses the A01 XML message using HAPI’s `XMLParser`.
    - It extracts key fields (`hkid`, `patient_name`, `case_no`, `ward`, `adm_dtm`) per the PMI-HL7 specification (Pages 42-47).
    - The data is saved to a database via `PatientService`.
    - An ACK XML response is generated and returned.

---

### **Conclusion**

The provided A01 XML message for inpatient admission adheres to the PMI-HL7 specification and HL7 2.8 XML encoding rules, capturing essential patient and visit details like HKID, name, ward, and admission date. It can be processed in a Spring Boot application using HAPI HL7, as shown in the updated controller code. If you need further details, such as adding NK1 for next-of-kin, generating the A01 message programmatically, or handling specific validations (e.g., `HKIC_symbol`), please let me know!