# DHX Specific Result Processing

## Original Flow

```bash
flowchart TD
  subgraph JMS["JMS"]
        MSG_RECEIVED["Message Received<br>[TransTestrsltMdb#onMessage]"]
  end
  subgraph TransTestrsltWorker["Trans Testrslt Worker"]
        RETRIEVE_OUTSTANDING["Retrieve Outstanding Records<br>[TransTestrsltAppService#processTrans]"]
        CONSTRUCT_JMS["Construct JMS Message<br>[TransTestrsltAppService#consolidate]<br>[TransTestrsltAppService#processSend]"]
  end
  subgraph RsltProcessWorker["Result Processing Worker"]
        RETRIEVE_OUTSTANDING_2["Retrieve Outstanding Records<br>[ResultProcessAppService#processTransResult]"]
        RETRIEVE_LAB_RESULT["Retrieve Lab Results<br>[ResultProcessAppService#processResults]"]
        PROCESS_LAB_RESULT["Process Lab Results<br>[ResultProcessAppService#processResults]"]
        PROCESS_ACT_TYPE["Process Action Type<br>[ResultProcessAppService#processActionType"]
  end

  RETRIEVE_OUTSTANDING --> CONSTRUCT_JMS
  CONSTRUCT_JMS -- Send --> JMS
  MSG_RECEIVED -- Trigger --> RsltProcessWorker
  RETRIEVE_OUTSTANDING_2 --> RETRIEVE_LAB_RESULT
  RETRIEVE_LAB_RESULT --> PROCESS_LAB_RESULT
  PROCESS_LAB_RESULT --> PROCESS_ACT_TYPE
```