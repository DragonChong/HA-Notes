# CalcLabResultWebS

---

## Short Summary

This service calculates special lab test results that depend on the values of other tests (called "derived" or "calculated" tests).

1. **What it needs:** You give it an identifier for a specific lab request and the ID of the calculated test you want. You can also tell it to recalculate even if a result already exists.
2. **What it does:**
    - It checks if the information you provided is valid.
    - It looks up the lab request and the patient's details.
    - It finds the specific calculated test you asked for.
    - **First, it checks:** Has this test already been calculated and finalized (endorsed)?
        - If yes, and you didn't ask for a recalculation, it simply returns that existing final result.
        - If the existing results were canceled or aren't finalized yet, it reports that status.
    - **If no final result exists (or you asked for a recalculation):**
        - It finds the mathematical formula needed to calculate the test.
        - It gathers the results of all the other tests required by the formula.
        - *(Helpful Feature):* If a required test result is missing, the system might be configured to look for and use the result of a very similar test instead.
        - It makes sure all the needed results are available, numeric, and have been finalized (endorsed).
        - If everything needed is ready, it performs the calculation using the formula.
3. **What it gives back:**
    - If successful, it returns the calculated result value, units, and other relevant details.
    - If anything goes wrong (invalid input, missing data, calculation impossible), it returns a clear error message explaining the problem.

---

## Detailed Summary

**Overall Purpose:**

The `CalcLabResultWebS` is a stateless EJB exposed as a SOAP web service. Its primary function is to provide calculated (derived) laboratory test results for a specific lab request. It can either retrieve a previously calculated and endorsed result or perform the calculation on demand based on the results of dependent tests.

**Input & Initialization:**

1. **Input:** It accepts a single XML string (`paramXml`) containing:
    - `eprRecordKey`: A composite identifier (e.g., `TKO118C9999123`) encoding the hospital (`serverName`), lab (`serverLab`), and `requestNo`.
    - `entityId`: A corporate identifier for the specific derived test being requested.
    - `isForcedCalculate` (Optional): A boolean flag; if true, it forces recalculation even if an endorsed result exists.
2. **Validation:** It first performs strict validation on the input:
    - Checks if `paramXml` is null (Error: `INVALID_PARAMETER`).
    - Checks if `eprRecordKey` and `entityId` are present, well-formatted (correct length, numeric lab code, numeric entity ID) (Error: `INVALID_PARAMETER`).
3. **Initialization:** If input is valid, it initializes Data Access Object (`DaoService`) instances for the specified lab (`serverName`, `serverLab`) and a central repository (`CRS`), along with a `ResultService` for business logic.

**Core Processing Logic & Decision Points:**

1. **Request Lookup:** It fetches the lab request details (`RequestVo`) using `requestNo`.
    - If not found: Error `REQUEST_NOT_FOUND`.
2. **Patient Lookup:** It fetches patient details (`PatientVo`) from the central repository using the request's encounter number.
    - If the patient is marked as 'UNK' (not found in central index), it uses the sex from the lab request for calculations.
    - If not found (unlikely due to 'UNK' handling): Error `PATIENT_NOT_FOUND`.
3. **Test Mapping (`corp_test`):** It looks up the mapping between the requested `entityId` and the local test key (`localCkey`) in the `corp_test` table for the specific hospital/lab.
    - If no mapping exists: Error `TEST_ENTITY_NOT_FOUND`.
4. **Local Test Definition (`test_dict`):** It verifies that the mapped `localCkey` exists in the local `test_dict`.
    - If not found: Error `TEST_NOT_EXIST`.
5. **Handling Multiple Mappings:** If the `entityId` maps to multiple local derived tests (`testCkey`s):
    - It prioritizes the test that already exists as a result line item in the current request (`isDerivedTestExist`).
    - If none exist, it prioritizes a test for which all its dependent tests currently exist in the request (`isAllDependentTestsExist`).
    - It uses a fallback if neither of the above yields a clear candidate.
6. **Numeric Result Check:** It ensures the selected test definition (`TestInfoVo`) has a result type flagged as numeric.
    - If not numeric: Error `TEST_NOT_NUMERIC`.
7. **Retrieve or Calculate Decision:**
    - **Check Existing:** It checks if results (`TestrsltVo`) for this test already exist in the request *AND* if `isForcedCalculate` is `false`.
        - **If YES (Retrieve Path):**
            - It searches for the latest *endorsed* result. If found, formats it and returns (`NO_ERROR`).
            - If no endorsed result exists, it checks if *all* existing results are *canceled*. If yes, returns Error `TEST_IS_CANCELED`.
            - Otherwise (existing results are pending, preliminary, etc.), returns Error `TEST_NOT_ENDORSED`.
        - **If NO (Calculate Path - or Forced):**
            - **Derived Test Check:** Confirms the test is marked as derived/calculated in `test_dict`. If not, Error `REQUEST_NOT_HAVE_TEST`.
            - **Formula Retrieval:** Fetches the calculation formula(e) from `derived_test`, handling sex-specificity ('A', 'M', 'F'). If no formula found, Error `TEST_NOT_HAVE_CALC_FORMULAE_SET`.
            - **Dependency Gathering:** Extracts dependent test keys (variables) from the formula.
            - **Dependency Result Fetching & Validation:** For *each* dependent test key:
                - Attempts to fetch the result (`selectTestrslts`).
                - **Similar Test Substitution:** If the direct result is missing *and* the feature is enabled (`ENABLE_CALC_BY_SIMILAR_DEPENDENT_TEST` property), it attempts to find and use results from "similar" tests (matching units from `corp_test`), *unless* that similar test is used in another formula for the *same* target `entityId`.
                - **Validation:** The fetched dependent result (direct or similar) *must* exist, be numeric, have an endorsed status, and belong to an endorsed group.
                - **If any dependency fails validation:** Stops calculation, Error `DEPENDED_TEST_NOT_EXIST_OR_NOT_NUMERIC_OR_ENDORSED_OR_CANCELED`.
            - **Calculation:** If all dependencies are valid:
                - Substitutes dependent values and patient age into the formula. If substitution fails, Error `INTERNAL_ERROR`.
                - Evaluates the resulting mathematical expression. If evaluation fails (e.g., division by zero), Error `INTERNAL_ERROR`.
                - If successful, constructs the final `ResultVo`.

**Output:**

1. **Success:** If a result is successfully retrieved or calculated (`resultVo.getErrorCode() == NO_ERROR`), it constructs an XML `Result` object containing:
    - Patient, Lab, Request identifiers.
    - Calculated/retrieved result details: `unit`, `rawNumeric`, `derivedNumeric`, `severityIndicator`, `reportableResult`, `endorsedDate`.
    - `error = 0`, `errorMessage = null`.
2. **Error:** If any error occurs during the process, it constructs an XML `Result` object containing:
    - The relevant `error` code (e.g., `CALC_LAB_RESULT_ERROR_REQUEST_NOT_FOUND`).
    - The corresponding `errorMessage`.
    - Other fields might be null or omitted.
3. **Return:** Returns the final `Result` object marshalled into an XML string. Catches potential `JAXBException` during marshalling and general `Exception`s (returning `INTERNAL_ERROR`).

In essence, it's a robust service for handling derived test calculations, incorporating data validation, status checks, optional recalculation, and a sophisticated fallback mechanism for missing dependencies using similar tests.

---

## Detailed Logic Flow

**`getCalculatedResult` Method Flow:**

1. **`if (paramXml != null)`**:
    - **Condition:** Checks if the input XML string `paramXml` is not null.
    - **True:** Proceeds with parsing the XML and the main logic of the service. Logs the start with the input XML.
    - **False:** Skips the main logic. Logs an error "Parameter is null!". Sets the error code to `CALC_LAB_RESULT_ERROR_INVALID_PARAMETER`. Jumps to the end to construct the error response XML.
2. **`if (checkIsValidParam(param))`**: (Inside the first `if`)
    - **Condition:** Calls the helper method `checkIsValidParam` to validate the parsed `Param` object. This method checks:
        - `param` is not null.
        - `param.getEprRecordKey()` is not empty.
        - `param.getEntityId()` is not empty.
        - `param.getEprRecordKey()` has a length of at least 14 characters.
        - The 4th character of `eprRecordKey` (index 3, the lab code) is an integer.
        - `param.getEntityId()` is an integer.
    - **True:** The parameters are considered valid. Extracts `eprRecordKey`, `entityId`, `isForcedCalculate`, `serverName`, `serverLab`, `requestNo`. Initializes services (`DaoService`, `daoServiceCrs`, `resultService`). Proceeds to fetch request data.
    - **False:** The parameters are invalid. Logs an error "Invalid parameter!". Sets the error code to `CALC_LAB_RESULT_ERROR_INVALID_PARAMETER`. Jumps to the end to construct the error response XML.
3. **`if (request != null)`**: (Inside `if (checkIsValidParam(param))`)
    - **Condition:** Checks if the `daoService.selectRequest(requestNo)` call returned a non-null `RequestVo` object, meaning a request record was found in the local lab database for the given `requestNo`.
    - **True:** A valid request exists. Proceeds to fetch patient data.
    - **False:** No request record found for `requestNo`. Logs a debug message "Request not found!". Sets the error code to `CALC_LAB_RESULT_ERROR_REQUEST_NOT_FOUND`. Jumps to the end to construct the error response XML.
4. **`if (patient != null)`**: (Inside `if (request != null)`)
    - **Condition:** Checks if the `daoServiceCrs.selectPatientByEncounter(request.getReqEncounter())` call returned a non-null `PatientVo` object, meaning patient data was found in the central repository based on the encounter number from the request. (Note: `selectPatientByEncounter` in `PatientDao` actually returns a dummy "UNK" patient if no real patient is found, so this condition might always be true unless an exception occurs).
    - **True:** Patient data (or a placeholder) is available. Proceeds to check the patient's hospital status.
    - **False:** Patient data not found (less likely given the DAO logic, but theoretically possible). Logs a debug message "Patient not found!". Sets the error code to `CALC_LAB_RESULT_ERROR_PATIENT_NOT_FOUND`. Jumps to the end to construct the error response XML.
5. **`if ("UNK".equals(patient.getPatHospital()))`**: (Inside `if (patient != null)`)
    - **Condition:** Checks if the retrieved patient record has the hospital code set to "UNK" (meaning a placeholder was created because the patient wasn't found in the central patient index).
    - **True:** Sets the patient's sex (`patient.setPatSex`) to the sex recorded in the lab request (`request.getReqSex`), as the request might have more accurate demographic info in this edge case.
    - **False:** The patient was found in the central index; their existing sex information is used.
6. **`if ((currentCorpTest != null) && (currentCorpTest.getEntityId() != null) && (currentCorpTest.getLocalCkey() != null))`**: (After patient check)
    - **Condition:** Checks if `daoServiceCrs.selectCorpTestByEntityId` successfully found a corporate test mapping (`CorpTestVo`) for the given `entityId`, `serverName`, and `serverLab`, and that the returned object and its key fields (`entityId`, `localCkey`) are not null.
    - **True:** A valid mapping exists between the requested `entityId` and a local test key (`local_ckey`) for this hospital/lab. Proceeds to check the local test dictionary.
    - **False:** No mapping found in `corp_test`. Logs a debug message "Entity ID not exist at corp_test!". Sets the error code to `CALC_LAB_RESULT_ERROR_TEST_ENTITY_NOT_FOUND`. Jumps to the end to construct the error response XML.
7. **`if ((allMatchedTestInfos != null) && (allMatchedTestInfos.size() > 0))`**: (Inside the `corp_test` check)
    - **Condition:** Checks if `daoService.findTestInfoMapping` (which queries `test_dict` joined with `corp_test`) returned a non-empty list of `TestInfoVo` objects, meaning the local test key(s) mapped from the `entityId` exist in the local test dictionary for this hospital/lab.
    - **True:** The test definition(s) exist locally. Proceeds to handle potential multiple mappings.
    - **False:** The test key found in `corp_test` doesn't have a corresponding entry in the local `test_dict`. Logs a debug message "Test not exist!". Sets the error code to `CALC_LAB_RESULT_ERROR_TEST_NOT_EXIST`. Jumps to the end to construct the error response XML.
8. **`for (TestInfoVo matchedTestInfos : allMatchedTestInfos)` loop**: (Inside the `test_dict` check)
    - **Purpose:** To group the found `TestInfoVo` objects by their `testCkey`. This is necessary because a single `entityId` might map to multiple distinct local derived tests via the `corp_test` table.
    - **`if (matchedTestInfos != null)`**: Basic null check for each item in the list.
    - **`if (!matchedTestInfosMap.containsKey(Integer.valueOf(matchedTestInfos.getTestCkey())))`**: Checks if the map already has an entry for the current `testCkey`. If not, it creates a new list for this key.
    - **`matchedTestInfosMap.get(Integer.valueOf(matchedTestInfos.getTestCkey())).add(matchedTestInfos)`**: Adds the current `TestInfoVo` to the list associated with its `testCkey` in the map.
9. **`if (matchedTestInfosMap.size() > 1)`**: (After grouping mappings)
    - **Condition:** Checks if the `entityId` mapped to more than one distinct local derived test (`testCkey`).
    - **True:** Multiple derived tests could potentially be calculated. Enters logic to select the best one. Logs "More than one matched test exist...".
    - **False:** Only one derived test mapping exists. Assigns `allMatchedTestInfos` directly to `matchedTestInfos` and skips the selection logic.
10. **`for (Entry<Integer, List<TestInfoVo>> entry : matchedTestInfosMap.entrySet())` loop**: (Inside `if (matchedTestInfosMap.size() > 1)`)
    - **Purpose:** Iterates through each potential derived test (`testCkey` and its associated `TestInfoVo` list) to find the most suitable one for calculation.
    - **`if ((entry != null) && (entry.getKey() != null))`**: Basic null checks for the map entry and its key.
    - **`if (isDerivedTestExist(requestNo, derivedTestKey))`**: Checks if a result line item for this specific `derivedTestKey` already exists in the `testrslt` table for the current `requestNo`.
        - **True:** This derived test is already part of the request's order. Selects this test (`matchedTestInfos = entry.getValue()`) and breaks the loop.
        - **False:** This derived test is not explicitly ordered. Proceeds to check dependencies.
    - **`if ((derivedTests != null) && (derivedTests.size() > 1))`**: Checks if fetching formulae (`daoService.selectDerivedTest`) returned more than one entry (usually indicating sex-specific formulae 'M'/'F' in addition to 'A').
        - **True:** Iterates through `derivedTests` to find a non-'A' sex formula to use for dependency checking.
        - **False:** Uses the default ('A') or the single returned formula's sex for dependency checking.
    - **`if (isAllDependentTestsExist(requestNo, derivedTestKey, formulaeSex))`**: Checks if *all* dependent tests required by the formula for this `derivedTestKey` (and relevant sex) have existing results in the `testrslt` table for the current `requestNo`.
        - **True:** All dependencies are present. Selects this test (`matchedTestInfos = entry.getValue()`) and *continues* the loop (it might find a test explicitly ordered later, which is preferred).
        - **False:** Not all dependencies are present. Does not select this test based on dependencies.
    - **`if (matchedTestInfos == null)`**: If after checking existence and dependencies, no test has been selected yet (`matchedTestInfos` is still null), it tentatively selects the current test from the loop (`matchedTestInfos = entry.getValue()`). This acts as a fallback if no test is explicitly ordered or has all dependencies met.
11. **`if (matchedTestInfos.get(0) != null)`**: (After the multiple-mapping selection loop)
    - **Condition:** A simple null check before logging the chosen derived test key.
    - **True:** Logs the `testCkey` that will be used for calculation.
12. **`for (TestInfoVo testInfo : matchedTestInfos)` loop**: (After selecting the `TestInfoVo` list to use)
    - **Purpose:** Iterates through the (usually single-element) list of `TestInfoVo` for the chosen derived test to find one that is numeric.
    - **`if ((currentTestInfo != null) && resultService.checkIsNumericResult(currentTestInfo.getTestRslttype()))`**: Checks if the current `TestInfoVo` is not null and if its result type (`test_rslttype`) indicates a numeric result.
        - **True:** Sets `hasNumericResult = true` and breaks the loop (assumes only one numeric definition is needed/expected per `testCkey`).
        - **False:** Continues loop.
13. **`if ((hasNumericResult) && (currentTestInfo != null))`**: (After checking for numeric type)
    - **Condition:** Checks if a numeric result type was found and `currentTestInfo` (the representative `TestInfoVo`) is not null.
    - **True:** The requested test is suitable for calculation/retrieval by this service. Proceeds to check for existing results or calculate.
    - **False:** The test associated with the `entityId` is not numeric. Logs "Given test has no numeric result test". Sets error `CALC_LAB_RESULT_ERROR_TEST_NOT_NUMERIC`. Jumps to error handling.
14. **`if ((testrslts != null) && (testrslts.size() > 0) && (!isForcedCalculate))`**: (Inside the numeric check)
    - **Condition:** Checks if results (`TestrsltVo`) already exist for this `currentTestInfo.getTestCkey()` and `requestNo`, AND if the `isForcedCalculate` flag is *false*.
    - **True:** Existing results found and recalculation is not forced. Proceeds to check the status of existing results.
    - **False:** No existing results OR recalculation is forced. Skips checking existing results and goes directly to the calculation logic (`else` block).
15. **`if (lastEndorsedTestrslt != null)`**: (Inside the "existing results" block)
    - **Condition:** Checks if `resultService.findLastEndorsedTestResult` found a non-null `TestrsltVo`, indicating at least one endorsed result exists.
    - **True:** An endorsed result is available. Logs "Result is endorsed.". Converts this `lastEndorsedTestrslt` into the `resultVo` format. Sets error code to `CALC_LAB_RESULT_NO_ERROR`. Jumps to output generation.
    - **False:** No endorsed result found among the existing ones. Proceeds to check if they are all canceled.
16. **`for (TestrsltVo testrslt : testrslts)` loop**: (Inside the "no endorsed result" block)
    - **Purpose:** Checks if *all* existing results have a status of 'Canceled'.
    - **`if (testrslt.getTestrsltStatus() != CommonConstants.RESULT_STATUS_CANCELED)`**: Checks if the current result's status is *not* canceled.
        - **True:** Found a non-canceled (but also non-endorsed) result. Sets `isAllResultCanceled = false` and breaks the loop.
        - **False:** This result is canceled. Continues checking others.
17. **`if (isAllResultCanceled)`**: (After checking all existing results' status)
    - **Condition:** Checks if the loop completed without finding any non-canceled results.
    - **True:** All existing results for this test are canceled. Logs "Test result had been cancalled!". Sets error `CALC_LAB_RESULT_ERROR_TEST_IS_CANCELED`. Jumps to error handling.
    - **False:** Some results exist but are not endorsed and not all are canceled (e.g., pending, preliminary). Logs "Test result or group is not endorsed!". Sets error `CALC_LAB_RESULT_ERROR_TEST_NOT_ENDORSED`. Jumps to error handling.
18. **`else` block for `if ((testrslts != null) && ...)`**: (Calculation logic block)
    - **Context:** This block executes if no existing results were found or if `isForcedCalculate` was true.
    - **`if (resultService.checkIsDerivedTest(currentTestInfo))`**: Checks if the `test_dict.test_dependent` flag indicates this is a derived/calculated test.
        - **True:** Proceeds with derived test calculation logic.
        - **False:** The test is not marked as derived. Logs "Lab request does not have given test and given test is not a calculation test!". Sets error `CALC_LAB_RESULT_ERROR_REQUEST_NOT_HAVE_TEST`. Jumps to error handling.
19. **`if ((derivedTests != null) && (derivedTests.size() > 1))`**: (Inside derived test logic - selecting formula)
    - **Condition:** Checks if querying `derived_test` table returned more than one formula (usually 'A' plus 'M'/'F').
    - **True:** Iterates through the list to find and use the sex-specific formula (`!"A".equals(derivedTest.getTestderSex())`).
    - **False:** Uses the first (and likely only) formula returned (`derivedTests.get(0)`).
20. **`if (!StringHelper.isBlank(formulae))`**: (After selecting the formula string)
    - **Condition:** Checks if a non-blank formula string was successfully retrieved.
    - **True:** A formula exists. Logs the formula being used. Proceeds to gather dependent test results.
    - **False:** No formula found in `derived_test` for this test/sex. Logs "Formulae not set!". Sets error `CALC_LAB_RESULT_ERROR_TEST_NOT_HAVE_CALC_FORMULAE_SET`. Jumps to error handling.
21. **`for (String variable : variables)` loop**: (Inside formula exists block)
    - **Purpose:** Iterates through the variables extracted from the formula string.
    - **`if ((!StringHelper.isBlank(variable)) && (variable.equals("AGE"))`**: Checks if the variable is "AGE".
        - **True:** Skips, as age is handled separately.
        - **False:** Continues to check if it's a test key.
    - **`else if (StringHelper.isInteger(variable))`**: Checks if the variable is a valid integer (representing a dependent test key).
        - **True:** Adds it to the `dependentTestKeys` list if not already present.
        - **False:** The variable is neither "AGE" nor an integer. Logs "Formuale [...] is invalid...". Sets error `CALC_LAB_RESULT_ERROR_INTERNAL_ERROR`. Jumps to error handling (implicitly via later checks likely).
22. **`for (Integer dependentTestKey : dependentTestKeys)` loop**: (After identifying dependent keys)
    - **Purpose:** Fetches and validates the result for each dependent test required by the formula.
    - **`if ((dependentTestKey != null) && (resultService.checkDependentTestExist(dependentTestKey.intValue())))`**: Checks if the key is valid and the test exists in `test_dict`.
        - **True:** Dependent test definition exists. Proceeds to fetch its result.
        - **False:** Invalid dependent test key specified in the formula. Sets `isAllDependentTestsReady = false` and breaks the loop.
    - **`if ((dependentTestrslts == null) || (dependentTestrslts.size() == 0))`**: (After trying `daoService.selectTestrslts` for the direct key)
        - **Condition:** Checks if no result was found for the *direct* dependent test key.
        - **True:** The direct dependent test result is missing. Proceeds to check if similar tests can be used.
        - **False:** Direct dependent test result found. Skips similar test logic for this dependency.
    - **`if (isCalcBySimilarDependentTest(serverName))`**: (Inside missing direct dependent result)
        - **Condition:** Checks the property `ENABLE_CALC_BY_SIMILAR_DEPENDENT_TEST` via the helper method to see if using similar tests is allowed for this hospital.
        - **True:** Attempts to find similar tests.
        - **False:** Using similar tests is disabled. The dependency is considered missing. Sets `isAllDependentTestsReady = false` later.
    - **`if ((similarTests != null) && (similarTests.size() > 0))`**: (Inside similar test allowed block)
        - **Condition:** Checks if `daoService.selectSimilarTests` found any similar tests (based on `corp_test` mappings and matching units).
        - **True:** Similar tests exist. Logs attempt to use them. Iterates through similar tests.
        - **False:** No similar tests found. Dependency still considered missing.
    - **`for (Integer similarTest : similarTests)` loop**: (Iterating through similar tests)
        - **`if (similarTest != null)`**: Basic null check.
        - **`if (daoService.isDependentTestExistOtherFormulae(...))`**: Checks if this `similarTest` key is *also* used as a dependent test in a *different* formula that calculates the *same* target `entityId`. This prevents potential conflicts or unexpected calculation paths.
            - **True:** This similar test cannot be used as a substitute here. Logs this reason and continues to the next similar test.
            - **False:** This similar test is potentially usable. Attempts to fetch its result (`daoService.selectTestrslts(requestNo, similarTest.intValue(), 1, 1)`).
        - **`if ((dependentTestrslts != null) && (dependentTestrslts.size() > 0))`**: (After fetching similar test result)
            - **Condition:** Checks if a result was found for the `similarTest`.
            - **True:** Found a result for a valid similar test substitute. Logs this success and breaks the inner `similarTests` loop (uses the first suitable similar test found).
            - **False:** No result found for this similar test. Continues to the next similar test.
    - **`if ((dependentTestrslts != null) && (dependentTestrslts.size() > 0))`**: (After potentially finding direct or similar results)
        - **Condition:** Checks if *some* result list (`dependentTestrslts`) was successfully obtained (either direct or via similar).
        - **True:** Results list obtained. Iterates through it to check status and type.
        - **False:** No result found for the dependency, even after checking similar tests. Sets `isAllDependentTestsReady = false` and breaks the outer `dependentTestKeys` loop.
    - **`for (TestrsltVo dependentTestrslt : dependentTestrslts)` loop**: (Processing the found dependent result(s) - usually just one due to `ctr=1, rsltCtr=1` query)
        - **`if ((dependentTestrslt != null) && ... && (resultService.checkIsNumericResult(...)) && (resultService.checkIsEndorsedStatus(...)) && (resultService.checkIsGroupEndorsed(...)))`**: Performs multiple checks on the dependent result:
            - Not null.
            - Has a valid header key.
            - Is numeric.
            - Has an endorsed status.
            - Belongs to a group that is also endorsed.
        - **True:** The dependent result is valid and ready. Converts it to `NumericResultVo` and adds it to the `dependentTestMap`. Logs success for this dependency.
        - **False:** The dependent result is not ready (null, non-numeric, not endorsed, group not endorsed). Sets `isAllDependentTestsReady = false` and breaks the inner `dependentTestrslts` loop (and subsequently the outer `dependentTestKeys` loop because of the `isAllDependentTestsReady` flag).
23. **`if (isAllDependentTestsReady)`**: (After checking all dependent keys)
    - **Condition:** Checks if the flag remained true throughout the dependent key loop, meaning all necessary, endorsed, numeric results were found.
    - **True:** All inputs ready. Calculates age, substitutes values into the formula (`resultCalculator.substitute`), evaluates the expression (`CalculatorHelper.postfixCal`).
    - **False:** One or more dependencies were not met. Logs "Dependent test results are not exist, not numeric, not endorsed or canceled!". Sets error `CALC_LAB_RESULT_ERROR_DEPENDED_TEST_NOT_EXIST_OR_NOT_NUMERIC_OR_ENDORSED_OR_CANCELED`. Jumps to error handling.
24. **`if (!StringHelper.isBlank(expression))`**: (Inside `isAllDependentTestsReady`)
    - **Condition:** Checks if substituting values into the formula produced a non-blank expression string.
    - **True:** Substitution successful. Attempts postfix calculation.
    - **False:** Substitution failed (e.g., unexpected variable left). Logs "Cancel derived test due to substitute variables failure!". Sets error `CALC_LAB_RESULT_ERROR_INTERNAL_ERROR`. Jumps to error handling.
25. **`if (derivedResult != null)`**: (After `CalculatorHelper.postfixCal(expression)`)
    - **Condition:** Checks if the postfix calculation returned a non-null `NumberVo` result.
    - **True:** Calculation successful. Constructs the final `resultVo` from the calculated numeric value, test info, age, and sex. Sets error code to `CALC_LAB_RESULT_NO_ERROR`. Jumps to output generation.
    - **False:** Postfix evaluation failed (e.g., division by zero, invalid expression). Logs "Cancel derived test due to evaluation failure!". Sets error `CALC_LAB_RESULT_ERROR_INTERNAL_ERROR` (implicitly, as `resultVo` won't be successfully populated). Jumps to error handling.
26. **`catch (Exception e)` block**:
    - **Condition:** Catches any unexpected exceptions during the process.
    - **Action:** Logs the exception details. Sets error `CALC_LAB_RESULT_ERROR_INTERNAL_ERROR`. Jumps to error handling.
27. **`if (resultVo.getErrorCode() == CommonConstants.CALC_LAB_RESULT_NO_ERROR)`**: (Before creating final XML)
    - **Condition:** Checks if the final `resultVo` indicates success.
    - **True:** Populates the `Result` JAXB object with patient, lab, request details, and all the calculated fields from `resultVo` (`unit`, `rawNumeric`, `derivedNumeric`, `severityIndicator`, `reportableResult`, `endorsedDate`, `isCalculateIndicator`).
    - **False:** An error occurred earlier. Skips populating the success fields in the `Result` JAXB object.
28. **`try...catch (JAXBException e)` block**: (Converting Result to XML)
    - **Action:** Attempts to marshal the `Result` JAXB object into an XML string.
    - **Catch:** If marshalling fails, logs "Output result error!". The `resultXml` might remain null or incomplete.

This covers the conditional logic flow within the `getCalculatedResult` method in more detail.



---

## How Patient Sex Affects Results

### **1. Formulae Selection (Lines 294-309)**

```other
derivedTests = daoService.selectDerivedTest(currentTestInfo.getTestCkey(),
        patient.getPatSex());

// Get Formulae
String formulae = null;
if ((derivedTests != null) && (derivedTests.size() > 1)) {
    // Use sex other than 'A' when more than one entry
    for (DerivedTestVo derivedTest : derivedTests) {
        if ((derivedTest != null) && (!"A".equals(derivedTest.getTestderSex()))) {
            formulae = derivedTest.getTestderProcedure();
            break;
        }
    }
} else if ((derivedTests != null) && (derivedTests.size() > 0)) {
    formulae = derivedTests.get(0).getTestderProcedure();
}
```

**Patient sex determines which calculation formulae to use:**

- The system queries for derived test configurations based on the patient's sex
- If multiple formulae exist for different sexes, it **prioritizes sex-specific formulae over generic ones**
- Sex codes: `'A'` = All/Generic, `'M'` = Male, `'F'` = Female
- **Different sexes can have completely different calculation formulae**

### **2. Reference Range Determination (Line 146 in ResultService)**

```other
TestReferenceVo testRef = daoService.selectTestReference(testInfo.getTestCkey(), 1, age, sex);
```

**Patient sex affects the normal ranges used to classify results:**

- Normal ranges (high/low thresholds) are looked up based on **both age AND sex**
- This determines if a calculated result is flagged as High, Low, or Normal

## How Patient Age Affects Results

### **1. Direct Variable Substitution in Formulae (Lines 54-59 in ResultCalculationService)**

```other
if (tempStr != null && tempStr.equals(AGE_PATTERN)) {
    if (age != null) {
        rtn = rtn.replace(tempStr, "" + age);
    } else {
        return null;
    }
}
```

**Age is used directly in calculation formulae:**

- `[AGE]` in formulae gets replaced with the patient's actual age value
- **Example**: In formulae `0.993 [AGE] ^ * 1.018 *`, the `[AGE]` becomes the patient's age
- **Age is extracted from the lab request** (`request.getReqAgeValue()`)

### **2. Age-Specific Reference Ranges**

```other
TestReferenceVo testRef = daoService.selectTestReference(testInfo.getTestCkey(), 1, age, sex);
```

**Age determines appropriate normal ranges:**

- Different age groups have different normal value ranges
- The calculated result is compared against **age-appropriate reference ranges**
- This affects the severity indicator (Normal/High/Low flag)

## Practical Impact Examples

### **For the example formulae:**

```other
141 [1037] 61.9 / 1 min -0.329 ^ * [1037] 61.9 / 1 max -1.209 ^ * 0.993 [AGE] ^ * 1.018 *
```

**Age Impact:**

- `[AGE]` gets replaced with patient's age (e.g., 45 years old)
- The calculation becomes: `... * 0.993 45 ^ * 1.018 *`
- **Different ages produce different calculated values**

**Sex Impact:**

- **Male vs Female patients might have completely different formulae**
- The same test might calculate differently based on patient sex
- **Different reference ranges** for interpreting if the result is normal/abnormal

### **Clinical Significance:**

This system accounts for the biological reality that:

- **Many lab values vary by sex** (e.g., creatinine clearance)
- **Lab normals change with age** (e.g., kidney function declines with age)
- **Some calculations are inherently age/sex-dependent** (e.g., estimated GFR calculations)

The system ensures that calculated results are both **mathematically correct** for the patient's demographics and **clinically appropriate** when flagged as normal or abnormal.

