# Enhancement for NBS

## Code Change

- ### BarcodeEntryPm
    - Add Labels below barcode input if barcode with regType "NBS-Private-XXX" is scanned, mark **✔** when corresponding barcode scanned (dun know if tick symbol can be displayed, or display picture?)
        - Registration: **✔**
        - Proforma: **✔**
    - barcodeModifiedFunction
        - NBS-Private
            - Set params: isNewEncounter, isImmediateAutoSave, promptReturnScreenAlert, returnScreenMenuCode **[TBC]**
            - Parse Registration
                - DOB format: dd-MMM-yyyy
                - collection datetime format: dd-MMM-yyyy hh:mm
            - Parse Proforma Data
                - Get mapped LIS Test Code from JSON key
                    - Keyword Group = 'PROFORMA': alpha1 = JSON key, alpha2 = LIS Test Code, description = field description
                - ResultEntryHelper#constructTransTestrsltWkt
                    - requestNo need to be set in Registration screen
                    - defaultAuthorize? **[confirm with Joan]**
            - Open Registration when both 2D barcode scanned
        - regInfo → class variable
        - Call clear() instead of barcodeInputPm.clear()
    - getTestCodeForProforma (NEW)
    - clear
        - Reset Label visibility & content
        - Reset Registration & Proforma Input Indicator
        - Reset regInfo
        - Clear Barcode Input
- ### BarcodeEntry
    - Add Labels for Registration & Proforma
- ### RegistrationInfoVo
    - Add testResults:ArrayCollection
- ### RegistrationConstants
    - Add Auto Reg Keys for Proforma
    - fix AUTO_REG_KEY_REFERENCE: refr ⟶ ref
- ### RegistrationDataConvertor
    - Append testResults to RegistrationPackingVo.testResults
        - Set requestNo if missing

---

## Database Data Change

    - ### keyword_group & keyword_list
        - Keyword Group = 'PROFORMA': alpha1 = JSON key, alpha2 = `LIS Test Code`, description = field description
    - ### top_menu
        - Add separator in Request
        - Add Barcode Entry in Request

        

    

---

    ## Workflow

    1. Open Screen Barcode Entry
    2. Input Registration 2D Barcode
        - Display Labels:
            - Registration: **✔**
            - Proforma: 
    3. Input Proforma 2D Barcode
        - Display Labels:
            - Registration: **✔**
            - Proforma: **✔**
    6. Open Registration
    7. Scan Pseudo ID
        - Prompt New Encounter Dialogue
    8. Press OK
        - Patient detail is filled
    1. Scan Request No.
    2. Registration detail is filled

[Barcode Entry (NBS) [[Board]]](https://www.figma.com/board/JcgCfF08RfqjJ63RyVWx43/Barcode-Entry--NBS-?node-id=0-1&t=jxnO5n9nt0NNpUar-1)