# Functions

# start_process



![Mermaid Chart - Create complex, visual diagrams with text. A smarter way of creating diagrams.-2025-08-14-083226.png](Functions.assets/Mermaid%20Chart%20-%20Create%20complex,%20visual%20diagrams%20with%20text.%20A%20smarter%20way%20of%20creating%20diagrams.-2025-08-14-083226.png)

```other
flowchart TD
    A["start_process(current_reqno, labno)"] --> B["Initialize variables & copy action types"]
    B --> C["Set labno and reset flags"]
    C --> D["Begin transaction & log time"]
    D --> E["get_trans_key(current_reqno)"]
    
    E --> F{get_trans_key result}
    F -->|ERR_RCS_UPLOAD| G["Return ERR_RCS_UPLOAD"]
    F -->|-3| H["Return ERR_SUCCESS (Request ARCHIVED)"]
    F -->|-2| I["Return ERR_RET_TRANS (UVOL + SQL_NOT_FOUND)"]
    F -->|-1| J["Return ERR_RET_TRANS"]
    F -->|SQL_NOT_FOUND| K["Handle SQL_NOT_FOUND cases"]
    F -->|Success| L["Continue processing"]
    
    K --> K1{Action Type}
    K1 -->|ACTTYPE_ADD_TEST| K2["rcw_add_test()"]
    K1 -->|ACTTYPE_ADD_TEST_BY_HEADER| K3["rcw_add_test() + post_process"]
    K1 -->|ACTTYPE_CHANGE_REPORTTYPE| K4["reporttype_changed()"]
    K1 -->|ACTTYPE_CANCEL_TEST| K5["Return ERR_SUCCESS"]
    K1 -->|ACTTYPE_URINE_CHECK| K6["urine_checking()"]
    K1 -->|ACTTYPE_DH_ACKNOWLEDGEMENT| K7["update_dh_ack_test()"]
    K1 -->|ACTTYPE_DH_ADD_TEST_PANEL| K8["change_test_profile_desc()"]
    
    K2 --> K9["get_trans_key() again"]
    K3 --> K9
    K4 --> L
    K5 --> L
    K6 --> L
    K7 --> L
    K8 --> L
    K9 --> L
    
    L --> M["init_trans() & set create_date"]
    M --> N{"Header = 0 AND Member = 0?"}
    N -->|Yes| O["Return ERR_SUCCESS"]
    N -->|No| P["Process action types"]
    
    P --> P1{Action Type}
    P1 -->|ACTTYPE_ADD_TEST| P2["Set override flags"]
    P1 -->|ACTTYPE_ADD_TEST_BY_HEADER| P3["rcw_add_test() + post_process"]
    P1 -->|ACTTYPE_GROUP_CHK| P4["group_object_checking()"]
    P1 -->|ACTTYPE_DH_CPLC| P5["Handle CPLC reference"]
    
    P2 --> P6["Continue"]
    P3 --> P6
    P4 --> P6
    P5 --> P6
    
    P6 --> Q["Retrieve trans_testrslt"]
    Q --> R{"retrieve_trans_testrslt result"}
    R -->|SQL_NOT_FOUND| S{"Need to add test?"}
    R -->|Success| T["Continue"]
    
    S -->|Yes| S1["Check if derived test"]
    S -->|No| S2["Log error & return ERR_RCS_UPLOAD"]
    
    S1 --> S3{"Is derived test?"}
    S3 -->|Yes| S4["check_last_deleted()"]
    S3 -->|No| S5["rcw_add_test()"]
    
    S4 --> S6{"Will be deleted?"}
    S6 -->|Yes| S7["Return ERR_SUCCESS"]
    S6 -->|No| S8["Continue"]
    
    S5 --> S9{"Add test success?"}
    S9 -->|No| S10["check_last_deleted()"]
    S10 --> S11{"Will be deleted?"}
    S11 -->|Yes| S7
    S11 -->|No| S12["Return ERR_ADDTEST/ERR_RCS_UPLOAD"]
    
    S8 --> S13["retrieve_trans_testrslt() again"]
    S13 --> T
    
    T --> U["check_cancel()"]
    U --> V{"Cancel check result"}
    V -->|>0| W["Return ERR_SUCCESS"]
    V -->|<0| X["Return ERR_RET_TRANS"]
    V -->|=0| Y["Continue"]
    
    Y --> Z["print_trans()"]
    Z --> AA{"rslttype == 0?"}
    AA -->|Yes| BB["group_object_checking()"]
    AA -->|No| CC["process_action_type()"]
    
    CC --> DD{"process_action_type result"}
    DD -->|!=0| EE["Return error"]
    DD -->|=0| FF["Continue"]
    
    FF --> GG["status_update()"]
    GG --> HH["correct_flow()"]
    HH --> II["signout_check()"]
    II --> JJ{"signout_check result"}
    JJ -->|<0| KK["Return ERR_STUS_UPD"]
    JJ -->|>=0| LL["Continue"]
    
    LL --> MM{"rslt_changed == RSLT_COMM_FINAL?"}
    MM -->|Yes| NN["clear_cras()"]
    MM -->|No| OO["Continue"]
    
    NN --> OO
    OO --> PP{"Start flow condition?"}
    PP -->|Yes| QQ["start_flow()"]
    PP -->|No| RR["Skip flow"]
    
    QQ --> SS{"start_flow result"}
    SS -->|<0| TT["Return ERR_RSLTFLOW"]
    SS -->|>=0| UU["Continue"]
    
    RR --> UU
    UU --> VV{"cbc_ret == 999?"}
    VV -->|Yes| WW["Return ERR_SUCCESS"]
    VV -->|No| XX["Continue"]
    
    XX --> YY{"new_status < 0?"}
    YY -->|Yes| ZZ["Return ERR_STUS_ERR"]
    YY -->|No| AAA["Continue"]
    
    AAA --> BBB["Update reference range (CPLC)"]
    BBB --> CCC["syn_trans()"]
    CCC --> DDD{"syn_trans result"}
    DDD -->|<0| EEE["Return ERR_SYN_TRAN"]
    DDD -->|>=0| FFF["Continue"]
    
    FFF --> GGG["Update cancel comment reqlist"]
    GGG --> HHH{"Update result"}
    HHH -->|<0| III["Return ERR_SYN_TRAN"]
    HHH -->|>=0| JJJ["Continue"]
    
    JJJ --> KKK["der_test()"]
    KKK --> LLL{"der_test result"}
    LLL -->|<0| MMM["Return ERR_GROUP"]
    LLL -->|>=0| NNN["Continue"]
    
    NNN --> OOO{"need_ins_prs?"}
    OOO -->|Yes| PPP["prs_insert_tasklst()"]
    OOO -->|No| QQQ["Continue"]
    
    PPP --> RRR{"prs_insert_tasklst result"}
    RRR -->|Success| QQQ
    RRR -->|Failure| SSS["Return -1"]
    
    QQQ --> TTT["Return ERR_SUCCESS"]
    
    style A fill:#e1f5fe
    style TTT fill:#c8e6c9
    style G fill:#ffcdd2
    style H fill:#ffcdd2
    style I fill:#ffcdd2
    style J fill:#ffcdd2
    style O fill:#ffcdd2
    style BB fill:#ffcdd2
    style EE fill:#ffcdd2
    style KK fill:#ffcdd2
    style TT fill:#ffcdd2
    style WW fill:#ffcdd2
    style ZZ fill:#ffcdd2
    style EEE fill:#ffcdd2
    style III fill:#ffcdd2
    style MMM fill:#ffcdd2
    style SSS fill:#ffcdd2
```

## Key Business Logic Summary:

### **1. Initialization Phase**

- Copy action types from global arrays
- Set laboratory number and reset processing flags
- Begin database transaction and log timing

### **2. Transaction Key Retrieval**

- Get key fields for the current test result
- Handle various error conditions (upload failures, archived requests, etc.)
- Process special action types when transaction not found

### **3. Test Result Processing**

- Initialize transaction structure
- Handle special cases (header/member = 0)
- Process different action types (add test, group check, CPLC handling)

### **4. Data Retrieval & Validation**

- Retrieve transaction test result data
- Handle missing test results by adding tests when appropriate
- Check for cancelled requests
- Validate derived test dependencies

### **5. Core Processing**

- Process action types
- Update test result status
- Correct result flow
- Perform signout checks
- Execute result flow logic

### **6. Finalization**

- Synchronize transaction data
- Update cancel comment requirements
- Handle derived tests
- Insert PRS task list if needed
- Return success status

The function handles complex laboratory workflow logic including test creation, result processing, status updates, and integration with other laboratory systems.

---

# get_header

## **Function Purpose**

The `get_header()` function retrieves and validates the header key (`testrslt_header_ckey`) for a laboratory test result, ensuring data integrity and handling various edge cases in the LIS system.

## **Business Logic Flow**

### **1. Request Validation**

```other
select req_complete from request where req_reqno = :cur_reqno
```

- Checks if the request exists and retrieves its completion status
- Returns `ERR_RCS_UPLOAD` if request not found during result upload
- Returns `-3` if request is archived (indicating it's no longer active)

### **2. Header Key Retrieval**

```other
select testrslt_header_ckey from testrslt 
where testrslt_reqno = :cur_reqno 
  and testrslt_member_ckey = :cur_member 
  and testrslt_ctr = :cur_ctr 
  and testrslt_rslt_ctr = :cur_rslt_ctr
```

- Retrieves the header key using the composite key (request number, member, counter, result counter)
- Handles special case for UVOL tests (`uvol_test_ckey`) - returns `-2` if not found
- Returns `SQL_NOT_FOUND` for other missing results (allows result processing to add the test)

### **3. Database Update**

Updates the appropriate transaction table based on the action context:

- **For RCW operations**: Updates `trans_testrslt_wkt` (worksheet table)
- **For other operations**: Updates `trans_testrslt` (main transaction table)

## **Return Values & Error Handling**

| **Return Value** | **Meaning**         | **Business Impact**                                            |
| ---------------- | ------------------- | -------------------------------------------------------------- |
| `0`              | Success             | Header key retrieved and updated successfully                  |
| `-1`             | General error       | SQL operation failed, processing should stop                   |
| `-2`             | UVOL test not found | Special case for urine volume tests, may need special handling |
| `-3`             | Request archived    | Request is no longer active, processing should stop            |
| `ERR_RCS_UPLOAD` | Upload failure      | Result upload failed, needs audit logging                      |
| `SQL_NOT_FOUND`  | Result not found    | Allows result processing to create missing test                |

## **Key Business Rules**

### **Request Lifecycle Management**

- **Active requests**: Can be processed normally
- **Archived requests**: Cannot be processed (return -3)
- **Missing requests**: Treated as upload failures during result processing

### **UVOL Test Special Handling**

- UVOL (urine volume) tests have special logic due to timing issues
- May be registered before the main test result is inserted
- Returns `-2` to indicate this special case

### **Transaction Table Selection**

- **RCW context**: Uses worksheet table (`trans_testrslt_wkt`)
- **Other contexts**: Uses main transaction table (`trans_testrslt`)
- Ensures data consistency across different processing modes

## **Data Flow Diagram**

![Mermaid Chart - Create complex, visual diagrams with text. A smarter way of creating diagrams.-2025-08-15-085121.png](Functions.assets/Mermaid%20Chart%20-%20Create%20complex,%20visual%20diagrams%20with%20text.%20A%20smarter%20way%20of%20creating%20diagrams.-2025-08-15-085121.png)

```other
flowchart TD
    A["get_header()"] --> B["Query request completion status"]
    B --> C{"Request exists?"}
    C -->|No| D{"ACT_RCS_SEND?"}
    D -->|Yes| E["Return ERR_RCS_UPLOAD"]
    D -->|No| F["Return -1"]
    
    C -->|Yes| G{"Request archived?"}
    G -->|Yes| H["Return -3"]
    G -->|No| I["Query testrslt for header key"]
    
    I --> J{"Header found?"}
    J -->|No| K{"Is UVOL test?"}
    K -->|Yes| L["Return -2"]
    K -->|No| M["Return SQL_NOT_FOUND"]
    
    J -->|Yes| N{"ACT_RCW_SEND?"}
    N -->|Yes| O["Update trans_testrslt_wkt"]
    N -->|No| P["Update trans_testrslt"]
    
    O --> Q["Update successful?"]
    P --> Q
    Q -->|No| R["Return -1"]
    Q -->|Yes| S["Return 0 (Success)"]
    
    style A fill:#e1f5fe
    style S fill:#c8e6c9
    style E fill:#ffcdd2
    style F fill:#ffcdd2
    style H fill:#ffcdd2
    style L fill:#ffcdd2
    style M fill:#ffcdd2
    style R fill:#ffcdd2
```

## **Integration Points**

### **Called By**

- `get_trans_key()` function in the main processing flow
- Used during result processing to validate and retrieve header information

### **Dependencies**

- **Database tables**: `request`, `testrslt`, `trans_testrslt`, `trans_testrslt_wkt`
- **Global variables**: `cur_reqno`, `cur_member`, `cur_ctr`, `cur_rslt_ctr`, `cond_action_code`
- **Constants**: `REQ_ARCHIVED`, `uvol_test_ckey`, `ACT_RCS_SEND`

## **Error Handling Strategy**

1. **SQL Errors**: Logged and return -1 to stop processing
2. **Missing Data**: Differentiated handling based on context and test type
3. **Business Rule Violations**: Clear return codes for different failure scenarios
4. **Audit Trail**: Captures upload failures for compliance and debugging

This function is critical for maintaining data integrity in the laboratory information system by ensuring that test results are properly linked to their corresponding test headers and that only valid, active requests are processed.