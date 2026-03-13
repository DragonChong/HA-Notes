
Status:
- OUTSTANDING (0) : Processed by processSender API
- COMPLETE (1)
- PROCESSING (98)
- FAIL (10)
- RETRY-1 (1001): Processed by application's scheduler
- RETRY-2 (1002): Processed by application's scheduler

OUTSTANDING -> PROCESSING -> COMPLETE
                          -> RETRY-1 -> PROCESSING -> COMPLETE
						             -> PROCESSING -> RETRY-2 -> PROCESSING -> COMPLETE
									                          -> PROCESSING -> FAIL
															  
Retry by configuration											  
						      
default (OBSOLETE)
Insert trigger
- 0 -> OUTSTANDING
Update Trigger
- COMPLETE -> 1
- PROCESSING -> 98
- FAIL -> 10
- RETRY-1 -> 1001
- RETRY-2 -> 1002


SKIP LOE_ORDER_IGNORE_LIST
