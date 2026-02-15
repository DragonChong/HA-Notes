# Order Gateway

## To Get Started

Let’s draft a Spring Boot API to handle this `PrintRequest` transaction, converting the XML structure into a JSON-based REST endpoint. The XML you provided (`gcrLis`) contains nested sections like `tranDtl`, `patInfo`, `reqStdInfo`, `testDtl` (multiple entries), and `specDtl` (multiple entries). We’ll model this as Java classes, set up a REST controller, and ensure the API accepts JSON that mirrors this structure.

### Step 1: Define the Data Models

We’ll create Java classes to represent the XML structure, using Jackson annotations to map JSON fields. Here’s how we can structure it:

#### Root Class: `GcrLis`

```java
import com.fasterxml.jackson.annotation.JsonProperty;

public class GcrLis {
    @JsonProperty("tranDtl")
    private TranDtl tranDtl;

    @JsonProperty("patInfo")
    private PatInfo patInfo;

    @JsonProperty("reqStdInfo")
    private ReqStdInfo reqStdInfo;

    @JsonProperty("testDtl")
    private List<TestDtl> testDtl;

    @JsonProperty("specDtl")
    private List<SpecDtl> specDtl;

    // Getters and setters
    public TranDtl getTranDtl() { return tranDtl; }
    public void setTranDtl(TranDtl tranDtl) { this.tranDtl = tranDtl; }
    public PatInfo getPatInfo() { return patInfo; }
    public void setPatInfo(PatInfo patInfo) { this.patInfo = patInfo; }
    public ReqStdInfo getReqStdInfo() { return reqStdInfo; }
    public void setReqStdInfo(ReqStdInfo reqStdInfo) { this.reqStdInfo = reqStdInfo; }
    public List<TestDtl> getTestDtl() { return testDtl; }
    public void setTestDtl(List<TestDtl> testDtl) { this.testDtl = testDtl; }
    public List<SpecDtl> getSpecDtl() { return specDtl; }
    public void setSpecDtl(List<SpecDtl> specDtl) { this.specDtl = specDtl; }
}
```

#### `TranDtl`

```java
public class TranDtl {
    private String msgId;
    private String tranTyp;
    private String tranDtm;

    // Getters and setters
    public String getMsgId() { return msgId; }
    public void setMsgId(String msgId) { this.msgId = msgId; }
    public String getTranTyp() { return tranTyp; }
    public void setTranTyp(String tranTyp) { this.tranTyp = tranTyp; }
    public String getTranDtm() { return tranDtm; }
    public void setTranDtm(String tranDtm) { this.tranDtm = tranDtm; }
}
```

#### `PatInfo`

```java
public class PatInfo {
    private String patId;
    private String patName;
    private String sex;
    private String patDob;
    private String hospCode;
    private String caseNum;
    private String spec;
    private String subSpec;

    // Getters and setters
    public String getPatId() { return patId; }
    public void setPatId(String patId) { this.patId = patId; }
    public String getPatName() { return patName; }
    public void setPatName(String patName) { this.patName = patName; }
    public String getSex() { return sex; }
    public void setSex(String sex) { this.sex = sex; }
    public String getPatDob() { return patDob; }
    public void setPatDob(String patDob) { this.patDob = patDob; }
    public String getHospCode() { return hospCode; }
    public void setHospCode(String hospCode) { this.hospCode = hospCode; }
    public String getCaseNum() { return caseNum; }
    public void setCaseNum(String caseNum) { this.caseNum = caseNum; }
    public String getSpec() { return spec; }
    public void setSpec(String spec) { this.spec = spec; }
    public String getSubSpec() { return subSpec; }
    public void setSubSpec(String subSpec) { this.subSpec = subSpec; }
}
```

#### `ReqStdInfo`

```java
public class ReqStdInfo {
    private String hospCode;
    private String ordNum;
    private String verNum;
    private String reqBy;
    private String reqByDept;
    private String requestLoc;
    private String reportLoc;
    private String copytoLoc;
    private String reqlocHosp;
    private String reqlocSpec;
    private String reqlocWardClinic;
    private String replocHosp;
    private String replocSpec;
    private String replocWardClinic;
    private String copytolocHosp;
    private String copytolocSpec;
    private String copytolocWardClinic;
    private String requestDtm;
    private String admitDiag;
    private String clinicInfo;
    private String createBy;
    private String createDtm;
    private String updateBy;
    private String updateDtm;
    private String createSys;
    private String notifyMe;
    private String payCode;
    private String imageUsageID;

    // Getters and setters (omitted for brevity, but add them for all fields)
}
```

#### `TestDtl`

```java
public class TestDtl {
    private String requestNum;
    private String testNum;
    private String labCode;
    private String testCode;
    private String testCat;
    private String testUrg;
    private String testSts;
    private String testDesc;
    private String imageDtm;
    private String imageNum;
    private String specNum;

    // Getters and setters (omitted for brevity, but add them for all fields)
}
```

#### `SpecDtl`

```java
public class SpecDtl {
    private String specNum;
    private String specNumsuffix;
    private String specDesc;
    private String specSite;
    private String specTypedtl;
    private String specSts;
    private String specPrep;
    private String markerDiag;
    private String specifiedLocation;
    private String chemoInfo;
    private String worklistType;

    // Getters and setters (omitted for brevity, but add them for all fields)
}
```

### Step 2: Create the REST Controller

Now, let’s define a controller to accept this JSON structure via a POST request:

```java
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class PrintRequestController {
    private final PrintRequestService printRequestService;

    public PrintRequestController(PrintRequestService printRequestService) {
        this.printRequestService = printRequestService;
    }

    @PostMapping("/print-request")
    public String handlePrintRequest(@RequestBody GcrLis request) {
        // Delegate to service for processing
        return printRequestService.processPrintRequest(request);
    }
}
```

### Step 3: Create a Service Layer

This is where you’d put your business logic from the socket program:

```java
import org.springframework.stereotype.Service;

@Service
public class PrintRequestService {
    public String processPrintRequest(GcrLis request) {
        // Replace this with your actual processing logic from the socket program
        System.out.println("Processing request: " + request.getTranDtl().getMsgId());
        System.out.println("Patient: " + request.getPatInfo().getPatName());
        for (TestDtl test : request.getTestDtl()) {
            System.out.println("Test: " + test.getTestDesc());
        }
        return "Print request processed successfully for msgId: " + request.getTranDtl().getMsgId();
    }
}
```

### Step 4: Example JSON Input

The equivalent JSON for your XML would look like this (trimmed for brevity):

```json
{
    "tranDtl": {
        "msgId": "20250000000000000071",
        "tranTyp": "PO1",
        "tranDtm": "202502051710"
    },
    "patInfo": {
        "patId": "E027998A",
        "patName": "PATIENT, 57401",
        "sex": "M",
        "patDob": "20180607",
        "hospCode": "PMH",
        "caseNum": "HN92000002A",
        "spec": "MED",
        "subSpec": ""
    },
    "reqStdInfo": {
        "hospCode": "PMH",
        "ordNum": "OR2500000370",
        "verNum": "0",
        "reqBy": "TESTER",
        "reqByDept": "A&E",
        "requestDtm": "202502050000",
        "admitDiag": "mild COVID\nmild fluid overload",
        "createBy": "TESTER",
        "createDtm": "202502051710",
        "updateBy": "TESTER",
        "updateDtm": "202502051710",
        "createSys": "GCR",
        "notifyMe": "N",
        "payCode": "EP1"
    },
    "testDtl": [
        {
            "requestNum": "RQ2500000026",
            "testNum": "01",
            "labCode": "C",
            "testCode": "C223P",
            "testCat": "Occult Blood",
            "testUrg": "N",
            "testSts": "P",
            "testDesc": "Occult Blood (Day 1)",
            "specNum": "SP2500000591"
        },
        {
            "requestNum": "RQ2500000026",
            "testNum": "02",
            "labCode": "C",
            "testCode": "C232P",
            "testCat": "Occult Blood",
            "testUrg": "N",
            "testSts": "P",
            "testDesc": "Occult Blood (Day 2)",
            "specNum": "SP2500000605"
        }
    ],
    "specDtl": [
        {
            "specNum": "SP2500000591",
            "specNumsuffix": "0",
            "specDesc": "FOB card - Day 1",
            "specSts": "P"
        },
        {
            "specNum": "SP2500000605",
            "specNumsuffix": "0",
            "specDesc": "FOB card - Day 2",
            "specSts": "P"
        }
    ]
}
```

### Step 5: Test the API

Run your Spring Boot application and test with a tool like Postman or curl:

```other
curl -X POST http://localhost:8080/api/print-request -H "Content-Type: application/json" -d @request.json
```

(Where `request.json` contains the JSON above.)

### Next Steps

- **Validation**: Add `@NotNull` or `@Size` annotations (from `javax.validation`) to enforce required fields.
- **Error Handling**: Use `@ExceptionHandler` in the controller to manage invalid inputs.
- **Response Format**: If your socket program returned XML, decide if the API should return JSON (e.g., a success object) and define a response class.
- **Logic Migration**: Replace the placeholder logic in `PrintRequestService` with your socket program’s processing code.

This gives you a solid foundation. Let me know if you need help with specific parts, like integrating your existing logic or handling the DTD reference!

---

## PO1

To migrate the `printRequest()` method from your Java Socket program to a Spring Boot API using repositories for the `GcrLis` model, we need to translate the raw SQL inserts into Spring Data JPA repository operations. The `printRequest()` method inserts data into multiple tables (`loe_order`, `loe_request_test`, `loe_test_info`, `loe_request_test_spec`, `loe_specimen_detail`, etc.) based on the `varStruct` data structure, which we’ll map to the `GcrLis` model you’ve previously defined. Below, I’ll create repository interfaces and demonstrate how to handle these inserts using Spring Data JPA, assuming an Oracle database (as indicated by the code comments).

### Assumptions

1. You’ve already defined the `GcrLis` model with nested classes (`TranDtl`, `PatInfo`, `ReqStdInfo`, `TestDtl`, `SpecDtl`) as provided earlier.
2. Each table in `printRequest()` corresponds to an entity in your application.
3. We’ll use Spring Data JPA with entity classes and repositories to persist the data.
4. The `varStruct` fields map to the `GcrLis` model fields (e.g., `varStruct.hospCode` → `GcrLis.patInfo.hospCode`).

### Step 1: Define Entity Classes

First, create JPA entity classes for each table involved in `printRequest()`. These entities will map to the database tables and reflect the `GcrLis` structure.

#### `LoeOrder`

```java
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "loe_order")
public class LoeOrder {
    @Id
    @Column(name = "loeord_orderno")
    private String orderNo;

    @Column(name = "loeord_send_hosp")
    private String sendHosp;

    @Column(name = "loeord_pat_case")
    private String patCase;

    @Column(name = "loeord_pat_hkid")
    private String patHkid;

    @Column(name = "loeord_pat_name")
    private String patName;

    @Column(name = "loeord_pat_dob")
    private String patDob;

    @Column(name = "loeord_pat_sex")
    private String patSex;

    @Column(name = "loeord_pat_spec")
    private String patSpec;

    @Column(name = "loeord_pat_sub_spec")
    private String patSubSpec;

    @Column(name = "loeord_request_dtm")
    private LocalDateTime requestDtm;

    @Column(name = "loeord_admit_dx")
    private String admitDx;

    @Column(name = "loeord_clinical_info")
    private String clinicalInfo;

    @Column(name = "loeord_request_by")
    private String requestBy;

    @Column(name = "loeord_request_loc")
    private String requestLoc;

    @Column(name = "loeord_report_loc")
    private String reportLoc;

    @Column(name = "loeord_copy_to")
    private String copyTo;

    @Column(name = "loeord_create_by")
    private String createBy;

    @Column(name = "loeord_create_dtm")
    private LocalDateTime createDtm;

    @Column(name = "loeord_update_by")
    private String updateBy;

    @Column(name = "loeord_update_dtm")
    private LocalDateTime updateDtm;

    @Column(name = "loeord_ver")
    private int ver;

    @Column(name = "loeord_reqloc_hosp")
    private String reqLocHosp;

    @Column(name = "loeord_reqloc_spec")
    private String reqLocSpec;

    @Column(name = "loeord_reqloc_ward")
    private String reqLocWard;

    @Column(name = "loeord_reptloc_hosp")
    private String reptLocHosp;

    @Column(name = "loeord_reptloc_spec")
    private String reptLocSpec;

    @Column(name = "loeord_reptloc_ward")
    private String reptLocWard;

    @Column(name = "loeord_copyto_hosp")
    private String copyToHosp;

    @Column(name = "loeord_copyto_spec")
    private String copyToSpec;

    @Column(name = "loeord_copyto_ward")
    private String copyToWard;

    @Column(name = "loeord_create_sys")
    private String createSys;

    @Column(name = "loeord_request_by_dept")
    private String requestByDept;

    @Column(name = "loeord_ic_mo")
    private String icMo;

    @Column(name = "loeord_ic_mo_dept")
    private String icMoDept;

    // Getters and setters
}
```

#### `LoeRequestTest`

```java
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "loe_request_test")
public class LoeRequestTest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "loereqtst_send_hosp")
    private String sendHosp;

    @Column(name = "loereqtst_req_seqno")
    private String reqSeqNo;

    @Column(name = "loereqtst_test_seqno")
    private String testSeqNo;

    @Column(name = "loereqtst_orderno")
    private String orderNo;

    @Column(name = "loereqtst_lab_code")
    private String labCode;

    @Column(name = "loereqtst_test_code")
    private String testCode;

    @Column(name = "loereqtst_test_urgency")
    private String testUrgency;

    @Column(name = "loereqtst_test_info")
    private String testInfo;

    @Column(name = "loereqtst_test_status")
    private String testStatus;

    @Column(name = "loereqtst_reqno")
    private String reqNo;

    @Column(name = "loereqtst_create_dtm")
    private LocalDateTime createDtm;

    @Column(name = "loereqtst_test_desc")
    private String testDesc;

    @Column(name = "loereqtst_test_category")
    private String testCategory;

    @Column(name = "loereqtst_dup_reason")
    private String dupReason;

    @Column(name = "loereqtst_dup_flag")
    private String dupFlag;

    @Column(name = "loereqtst_imageno")
    private Integer imageNo;

    @Column(name = "loereqtst_image_dtm")
    private LocalDateTime imageDtm;

    // Getters and setters
}
```

#### `LoeTestInfo`

```java
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "loe_test_info")
public class LoeTestInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "loetstinfo_send_hosp")
    private String sendHosp;

    @Column(name = "loetstinfo_req_seqno")
    private String reqSeqNo;

    @Column(name = "loetstinfo_test_seqno")
    private String testSeqNo;

    @Column(name = "loetstinfo_code")
    private String code;

    @Column(name = "loetstinfo_desc")
    private String description;

    @Column(name = "loetstinfo_value")
    private String value;

    @Column(name = "loetstinfo_dtm")
    private LocalDateTime dtm;

    @Column(name = "loetstinfo_display_order")
    private Integer displayOrder;

    // Getters and setters
}
```

#### `LoeRequestTestSpec`

```java
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "loe_request_test_spec")
public class LoeRequestTestSpec {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "loereqtsp_send_hosp")
    private String sendHosp;

    @Column(name = "loereqtsp_req_seqno")
    private String reqSeqNo;

    @Column(name = "loereqtsp_test_seqno")
    private String testSeqNo;

    @Column(name = "loereqtsp_specno")
    private String specNo;

    @Column(name = "loereqtsp_create_dtm")
    private LocalDateTime createDtm;

    // Getters and setters
}
```

#### `LoeSpecimenDetail`

```java
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "loe_specimen_detail")
public class LoeSpecimenDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "loespec_send_hosp")
    private String sendHosp;

    @Column(name = "loespec_specno")
    private String specNo;

    @Column(name = "loespec_specno_suffix")
    private String specNoSuffix;

    @Column(name = "loespec_recv_hosp")
    private String recvHosp;

    @Column(name = "loespec_spec_code")
    private String specCode;

    @Column(name = "loespec_spec_type")
    private String specType;

    @Column(name = "loespec_spec_status")
    private String specStatus;

    @Column(name = "loespec_collect_by")
    private String collectBy;

    @Column(name = "loespec_ack_by")
    private String ackBy;

    @Column(name = "loespec_create_dtm")
    private LocalDateTime createDtm;

    @Column(name = "loespec_spec_site")
    private String specSite;

    @Column(name = "loespec_spec_desc")
    private String specDesc;

    @Column(name = "loespec_chemoinfo")
    private String chemoInfo;

    @Column(name = "loespec_spec_prep")
    private String specPrep;

    @Column(name = "loespec_marker_diag")
    private String markerDiag;

    @Column(name = "loespec_specified_locn")
    private String specifiedLocn;

    // Getters and setters
}
```

(Additional entities like `LoeDft`, `LoeOrderInfo`, `LoeBbnk`, etc., can be similarly defined based on the SQL inserts in `printRequest()`.)

### Step 2: Create Repository Interfaces

Spring Data JPA provides repository interfaces to handle CRUD operations. Define one for each entity.

#### `LoeOrderRepository`

```java
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoeOrderRepository extends JpaRepository<LoeOrder, String> {
}
```

#### `LoeRequestTestRepository`

```java
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoeRequestTestRepository extends JpaRepository<LoeRequestTest, Long> {
}
```

#### `LoeTestInfoRepository`

```java
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoeTestInfoRepository extends JpaRepository<LoeTestInfo, Long> {
}
```

#### `LoeRequestTestSpecRepository`

```java
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoeRequestTestSpecRepository extends JpaRepository<LoeRequestTestSpec, Long> {
}
```

#### `LoeSpecimenDetailRepository`

```java
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoeSpecimenDetailRepository extends JpaRepository<LoeSpecimenDetail, Long> {
}
```

### Step 3: Migrate `printRequest()` Logic to a Service

Create a service class to handle the `GcrLis` data and use the repositories to persist it.

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class PrintRequestService {

    private final LoeOrderRepository orderRepository;
    private final LoeRequestTestRepository requestTestRepository;
    private final LoeTestInfoRepository testInfoRepository;
    private final LoeRequestTestSpecRepository requestTestSpecRepository;
    private final LoeSpecimenDetailRepository specimenDetailRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmm");
    private static final DateTimeFormatter IMG_DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    @Autowired
    public PrintRequestService(LoeOrderRepository orderRepository,
                               LoeRequestTestRepository requestTestRepository,
                               LoeTestInfoRepository testInfoRepository,
                               LoeRequestTestSpecRepository requestTestSpecRepository,
                               LoeSpecimenDetailRepository specimenDetailRepository) {
        this.orderRepository = orderRepository;
        this.requestTestRepository = requestTestRepository;
        this.testInfoRepository = testInfoRepository;
        this.requestTestSpecRepository = requestTestSpecRepository;
        this.specimenDetailRepository = specimenDetailRepository;
    }

    @Transactional
    public void processPrintRequest(GcrLis gcrLis) {
        // Insert into loe_order
        LoeOrder order = new LoeOrder();
        order.setOrderNo(gcrLis.getReqStdInfo().getOrdNum());
        order.setSendHosp(gcrLis.getPatInfo().getHospCode());
        order.setPatCase(gcrLis.getPatInfo().getCaseNum());
        order.setPatHkid(gcrLis.getPatInfo().getPatId());
        order.setPatName(gcrLis.getPatInfo().getPatName());
        String dob = gcrLis.getPatInfo().getPatDob();
        if (dob.length() == 4) dob += "0101";
        else if (dob.length() == 6) dob += "01";
        order.setPatDob(dob);
        order.setPatSex(gcrLis.getPatInfo().getSex());
        order.setPatSpec(gcrLis.getPatInfo().getSpec());
        order.setPatSubSpec(gcrLis.getPatInfo().getSubSpec());
        order.setRequestDtm(LocalDateTime.parse(gcrLis.getReqStdInfo().getRequestDtm(), DATE_FORMATTER));
        order.setAdmitDx(gcrLis.getReqStdInfo().getAdmitDiag());
        order.setClinicalInfo(gcrLis.getReqStdInfo().getClinicInfo());
        order.setRequestBy(gcrLis.getReqStdInfo().getReqBy());
        order.setRequestLoc(gcrLis.getReqStdInfo().getRequestLoc());
        order.setReportLoc(gcrLis.getReqStdInfo().getReportLoc());
        order.setCopyTo(gcrLis.getReqStdInfo().getCopytoLoc());
        order.setCreateBy(gcrLis.getReqStdInfo().getCreateBy());
        order.setCreateDtm(LocalDateTime.parse(gcrLis.getReqStdInfo().getCreateDtm(), DATE_FORMATTER));
        order.setUpdateBy(gcrLis.getReqStdInfo().getUpdateBy());
        order.setUpdateDtm(LocalDateTime.parse(gcrLis.getReqStdInfo().getUpdateDtm(), DATE_FORMATTER));
        order.setVer(Integer.parseInt(gcrLis.getReqStdInfo().getVerNum()));
        order.setReqLocHosp(gcrLis.getReqStdInfo().getReqlocHosp());
        order.setReqLocSpec(gcrLis.getReqStdInfo().getReqlocSpec());
        order.setReqLocWard(gcrLis.getReqStdInfo().getReqlocWardClinic());
        order.setReptLocHosp(gcrLis.getReqStdInfo().getReplocHosp());
        order.setReptLocSpec(gcrLis.getReqStdInfo().getReplocSpec());
        order.setReptLocWard(gcrLis.getReqStdInfo().getReplocWardClinic());
        order.setCopyToHosp(gcrLis.getReqStdInfo().getCopytolocHosp());
        order.setCopyToSpec(gcrLis.getReqStdInfo().getCopytolocSpec());
        order.setCopyToWard(gcrLis.getReqStdInfo().getCopytolocWardClinic());
        order.setCreateSys(gcrLis.getReqStdInfo().getCreateSys());
        order.setRequestByDept(gcrLis.getReqStdInfo().getReqByDept());
        order.setIcMo(gcrLis.getReqStdInfo().getIcMO());
        order.setIcMoDept(gcrLis.getReqStdInfo().getIcMoDept());
        orderRepository.save(order);

        // Insert into loe_request_test
        List<TestDtl> testDtls = gcrLis.getTestDtl();
        for (TestDtl testDtl : testDtls) {
            LoeRequestTest requestTest = new LoeRequestTest();
            requestTest.setSendHosp(gcrLis.getPatInfo().getHospCode());
            requestTest.setReqSeqNo(testDtl.getRequestNum());
            requestTest.setTestSeqNo(testDtl.getTestNum());
            requestTest.setOrderNo(gcrLis.getReqStdInfo().getOrdNum());
            requestTest.setLabCode(testDtl.getLabCode());
            requestTest.setTestCode(testDtl.getTestCode());
            requestTest.setTestUrgency(testDtl.getTestUrg());
            requestTest.setTestInfo(testDtl.getTestSts());
            requestTest.setTestStatus(testDtl.getTestSts());
            requestTest.setCreateDtm(LocalDateTime.parse(gcrLis.getReqStdInfo().getCreateDtm(), DATE_FORMATTER));
            requestTest.setTestDesc(testDtl.getTestDesc());
            requestTest.setTestCategory(testDtl.getTestCat());
            requestTest.setImageNo(testDtl.getImageNum() != null ? Integer.parseInt(testDtl.getImageNum()) : null);
            requestTest.setImageDtm(testDtl.getImageDtm() != null ? LocalDateTime.parse(testDtl.getImageDtm(), IMG_DATE_FORMATTER) : null);
            requestTestRepository.save(requestTest);
        }

        // Insert into loe_test_info (assuming additional logic for testInfo array)
        for (TestDtl testDtl : testDtls) {
            // This assumes testInfo is part of TestDtl or derived; adjust as needed
            LoeTestInfo testInfo = new LoeTestInfo();
            testInfo.setSendHosp(gcrLis.getPatInfo().getHospCode());
            testInfo.setReqSeqNo(testDtl.getRequestNum());
            testInfo.setTestSeqNo(testDtl.getTestNum());
            testInfo.setDtm(LocalDateTime.parse(gcrLis.getReqStdInfo().getCreateDtm(), DATE_FORMATTER));
            // Populate code, desc, value, displayOrder from testInfo if available
            testInfoRepository.save(testInfo);
        }

        // Insert into loe_request_test_spec
        if (!testDtls.isEmpty() && gcrLis.getSpecDtl() != null) {
            for (TestDtl testDtl : testDtls) {
                LoeRequestTestSpec requestTestSpec = new LoeRequestTestSpec();
                requestTestSpec.setSendHosp(gcrLis.getPatInfo().getHospCode());
                requestTestSpec.setReqSeqNo(testDtl.getRequestNum());
                requestTestSpec.setTestSeqNo(testDtl.getTestNum());
                requestTestSpec.setSpecNo(testDtl.getSpecNum());
                requestTestSpec.setCreateDtm(LocalDateTime.parse(gcrLis.getReqStdInfo().getCreateDtm(), DATE_FORMATTER));
                requestTestSpecRepository.save(requestTestSpec);
            }
        }

        // Insert into loe_specimen_detail
        List<SpecDtl> specDtls = gcrLis.getSpecDtl();
        if (specDtls != null && !specDtls.isEmpty()) {
            for (SpecDtl specDtl : specDtls) {
                LoeSpecimenDetail specimenDetail = new LoeSpecimenDetail();
                specimenDetail.setSendHosp(gcrLis.getPatInfo().getHospCode());
                specimenDetail.setSpecNo(specDtl.getSpecNum());
                specimenDetail.setSpecNoSuffix(specDtl.getSpecNumsuffix());
                specimenDetail.setSpecCode(specDtl.getSpecDesc());
                specimenDetail.setSpecType(specDtl.getSpecTypedtl());
                specimenDetail.setSpecStatus(specDtl.getSpecSts());
                specimenDetail.setCreateDtm(LocalDateTime.parse(gcrLis.getReqStdInfo().getCreateDtm(), DATE_FORMATTER));
                specimenDetail.setSpecSite(specDtl.getSpecSite());
                specimenDetail.setSpecDesc(specDtl.getSpecDesc());
                specimenDetail.setChemoInfo(specDtl.getChemoInfo());
                specimenDetail.setSpecPrep(specDtl.getSpecPrep());
                specimenDetail.setMarkerDiag(specDtl.getMarkerDiag());
                specimenDetail.setSpecifiedLocn(specDtl.getSpecifiedLocation());
                specimenDetailRepository.save(specimenDetail);
            }
        }

        // Additional tables (loe_dft, loe_order_info, etc.) can be similarly handled
    }
}
```

### Step 4: Update Controller

Update your REST controller to use this service:

```java
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class PrintRequestController {
    private final PrintRequestService printRequestService;

    @Autowired
    public PrintRequestController(PrintRequestService printRequestService) {
        this.printRequestService = printRequestService;
    }

    @PostMapping("/print-request")
    public String handlePrintRequest(@RequestBody GcrLis request) {
        printRequestService.processPrintRequest(request);
        return "Print request processed successfully for msgId: " + request.getTranDtl().getMsgId();
    }
}
```

### Notes

- **Transaction Management**: The `@Transactional` annotation ensures all inserts are part of a single transaction, mirroring the original `dbCommit()` and `dbRollback()` behavior.
- **Date Handling**: `LocalDateTime` is used instead of `Timestamp` for modern Java compatibility. Adjust formatters if needed.
- **Missing Fields**: Some fields (e.g., `testInfo`, `dupReason`, `dupFlag`) aren’t directly mapped in `GcrLis.TestDtl`. You may need to extend the model or derive them.
- **Additional Tables**: For brevity, I’ve omitted `loe_dft`, `loe_order_info`, etc. Add similar repository and entity definitions as needed.

This setup replaces the raw SQL with JPA-managed persistence, leveraging Spring Boot’s strengths. Let me know if you need further refinements!