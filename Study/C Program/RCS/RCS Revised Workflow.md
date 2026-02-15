# RCS Revised Workflow

```bash
graph TD
  subgraph "Retrieve Outstanding Records"
    START["Start"] --> CHECK_PROCESSING{"Regular Processing?"}
    CHECK_PROCESSING -->|True| SET_REGULAR["Set rowcount to 50<br>db_complete_flag = 0"]
    CHECK_PROCESSING -->|False| SET_BULK["Set rowcount to 5000<br>db_complete_flag = 1"]
    SET_REGULAR --> CHECK_ACTION_CODE{"Action Code = ACT_RCW_SEND?"}
    SET_BULK --> CHECK_ACTION_CODE
    CHECK_ACTION_CODE -->|True| RETRIEVE_WKT[("Retrieve: trans_testrslt_wkt<br>Condition: ttrslt_complete = 0 , create_datetime >= 1 hour ago<br>Order: create_datetime ASC")]
    CHECK_ACTION_CODE -->|False| RETRIEVE_TRANS[("Retrieve: trans_testrslt<br>Condition: ttrslt_complete = db_complete_flag<br>Order: urgency DESC, create_datetime ASC")]
    RETRIEVE_WKT --> END["End"]
    RETRIEVE_TRANS --> END
  end
```

```bash
graph TD
    subgraph "Get Header Key"
        START["Start"] --> RETRIEVE_REQUEST[(Retrieve: Request Complete<br>Condition: By Request No.)]
        RETRIEVE_REQUEST --> REQUEST_FOUND{"Request Found?"}
        REQUEST_FOUND -->|False| LOG_NO_REQUEST[Log 'No Request Found']
        REQUEST_FOUND -->|True| CHECK_ARCHIVED{"Request Complete = REQ_ARCHIVED?"}
        LOG_NO_REQUEST --> CHECK_ACTION_CODE{"Action Code = ACT_RCS_SEND?"}
        CHECK_ACTION_CODE -->|True| RETURN_UPLOAD_FAIL[Return RESULT_UPLOAD_FAIL]
        CHECK_ACTION_CODE -->|False| RETURN_RETRIEVE_FAIL[Return RETRIEVE_FAIL]
        CHECK_ARCHIVED -->|True| RETURN_SUCCESS[Return SUCCESS]
        CHECK_ARCHIVED -->|False| RETRIEVE_HEADER_KEY[("Retrieve: testrslt_header_ckey<br>Condition: By testrslt_reqno, testrslt_member_ckey, testrslt_ctr, testrslt_rslt_ctr")]
        RETRIEVE_HEADER_KEY --> HEADER_FOUND{"Header Key found?"}
        HEADER_FOUND -->|False| CHECK_UVOL_KEY{"Tran Test Result Member = UVOL Test Key?"}
        HEADER_FOUND -->|True| CHECK_RCW_SEND{Action Code = ACT_RCW_SEND?}
        CHECK_UVOL_KEY -->|True| RETURN_RETRIEVE_FAIL_UVOL[Return RETRIEVE_FAIL]
        CHECK_UVOL_KEY -->|False| RETURN_SQL_NOT_FOUND[Return SQL_NOT_FOUND]
        CHECK_RCW_SEND -->|True| UPDATE_WKT_HEADER[("Update: trans_testrslt_wkt.ttrslt_header_ckey<br>Condition: By ttrslt_reqno, ttrslt_header_ckey = 0, ttrslt_member_ckey, ttrslt_ctr, ttrslt_rslt_ctr")]
        CHECK_RCW_SEND -->|False| UPDATE_HEADER[("Update: trans_testrslt.ttrslt_header_ckey<br>Condition: By ttrslt_reqno, ttrslt_header_ckey = 0, ttrslt_member_ckey, ttrslt_ctr, ttrslt_rslt_ctr")]
        UPDATE_WKT_HEADER --> RETURN_SUCCESS_FINAL[Return SUCCESS]
        UPDATE_HEADER --> RETURN_SUCCESS_FINAL
        RETURN_UPLOAD_FAIL --> END["End"]
        RETURN_RETRIEVE_FAIL --> END
        RETURN_SUCCESS --> END
        RETURN_RETRIEVE_FAIL_UVOL --> END
        RETURN_SQL_NOT_FOUND --> END
        RETURN_SUCCESS_FINAL --> END
    end
```

```bash
graph TD
    subgraph "Check Action Type"
        START["Start"] --> CHECK_ACTION{"Check Action Type"}
        CHECK_ACTION --> |ACTTYPE_ADD_TEST OR ACTTYPE_ADD_TEST_NON_OVER| ACTION_CHECK{Action Code = ACT_RCW_SEND?}
        ACTION_CHECK --> |Yes| OVERRIDE_ACTION["Action Type = ACTTYPE_OVERRIDE"]
        ACTION_CHECK --> |No| NON_OVERRIDE_ACTION["Action Type = ACTTYPE_NON_OVERRIDE"]
        OVERRIDE_ACTION --> END
        NON_OVERRIDE_ACTION --> END
        CHECK_ACTION --> |ACTTYPE_ADD_TEST_BY_HEADER| ADD_TEST[["Add Test"]]
        ADD_TEST --> SUCCESS_TEST{Success?}
        SUCCESS_TEST --> |No| ERR_TEST["return ERR_ADDTEST"]
        SUCCESS_TEST --> |Yes| UPDATE_HEADER[["Update Header = 0"]]
        UPDATE_HEADER --> SUCCESS_HEADER{Success?}
        SUCCESS_HEADER --> |Yes| ERR_TRANS["return ERR_RET_TRANS"]
        SUCCESS_HEADER --> |No| GET_HEADER[["Get Header Key"]]
        GET_HEADER --> SUCCESS_GET{Success?}
        SUCCESS_GET --> |No| ERR_TRANS
        SUCCESS_GET --> |Yes| END
        CHECK_ACTION --> |ACTTYPE_GROUP_CHK| GROUP_CHECK[["Group Check"]]
        CHECK_ACTION --> |ACTTYPE_DH_CPLC| END["End"]
        GROUP_CHECK --> END
        ERR_TEST --> END
        ERR_TRANS --> END
    end
```

```bash
graph TD
    subgraph "Process Action Type"
        START["Start"] --> CHECK_ACTION{"Check Action Type"}
        CHECK_ACTION -->|ACTTYPE_ADD_TEST OR ACTTYPE_ADD_TEST_NON_OVER| ADD_TEST[["Add Test"]]
        ADD_TEST --> SUCCESS_ADD{"Success?"}
        SUCCESS_ADD -->|No| ERR_ADD["Return ERR_ADDTEST"]
        SUCCESS_ADD -->|Yes| GET_HEADER[["Get Header Key"]]
        GET_HEADER --> SUCCESS_HEADER{"Success?"}
        SUCCESS_HEADER -->|No| ERR_TRANS["Return ERR_RET_TRANS"]
        SUCCESS_HEADER --> END["End"]
        CHECK_ACTION -->|ACTTYPE_ADD_TEST_BY_HEADER| ADD_TEST_HEADER[["Add Test"]]
        ADD_TEST_HEADER --> SUCCESS_HEADER_ADD{"Success?"}
        SUCCESS_HEADER_ADD -->|Yes| UPDATE_HEADER[["Update Header = 0"]]
        SUCCESS_HEADER_ADD -->|No| ERR_ADD_HEADER["Return ERR_ADDTEST"]
        ERR_ADD_HEADER --> END
        UPDATE_HEADER --> SUCCESS_ADD
        CHECK_ACTION -->|ACTTYPE_CHANGE_REPORTTYPE| UPDATE_REPORT[["Update Test Result on Report Type Changed"]]
        UPDATE_REPORT --> SUCCESS_REPORT{"Success?"}
        SUCCESS_REPORT -->|No| ERR_REPORT["Return ERR_RET_TRANS"]
        SUCCESS_REPORT --> END
        CHECK_ACTION -->|ACTTYPE_CANCEL_TEST| SUCCESS_CANCEL["Return ERR_SUCCESS"]
        SUCCESS_CANCEL --> END
        CHECK_ACTION -->|ACTTYPE_URINE_CHECK| URINE_CHECK[["Urine Check"]]
        URINE_CHECK --> SUCCESS_CHECK{"Success?"}
        CHECK_ACTION -->|ACTTYPE_DH_ACKNOWLEDGEMENT| DH_ACK[["DH Report Ack"]]
        DH_ACK --> SUCCESS_CHECK
        SUCCESS_CHECK -->|No| ERR_SYNC["Return ERR_SYN_TRAN"]
        SUCCESS_CHECK -->|Yes| SUCCESS["Return ERR_SUCCESS"]
        SUCCESS --> END
        CHECK_ACTION -->|ACTTYPE_DH_ADD_TEST_PANEL| CHANGE_PROFILE[["Change Test Profile Desc"]]
        CHANGE_PROFILE --> SUCCESS_PROFILE{"Success?"}
        SUCCESS_PROFILE -->|No| ERR_PROFILE["Return ERR_RET_TRANS"]
        SUCCESS_PROFILE --> END
        ERR_ADD --> END
        ERR_TRANS --> END
        ERR_REPORT --> END
        ERR_SYNC --> END
        ERR_PROFILE --> END
    end
```