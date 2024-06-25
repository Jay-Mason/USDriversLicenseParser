export class AAMVAParser {
    public parse(raw: string, fieldDefinitions: string[]): Map<string, string> {
        const result = new Map<string, string>();
        let barcodeData = raw.slice(raw.search(new RegExp(fieldDefinitions.join("|"))), raw.indexOf("ZMZ"));

        // Pseudocode:
        // 1. Initialize a pointer at the end of the barcodeData string.
        // 2. Loop until the pointer reaches the start of the string.
        //    a. In each iteration, check if the substring from the pointer-2 to the pointer+1 (3 characters) is in the fieldDefinitions list.
        //    b. If it is, extract the value after this field definition and assign it to the map.
        //       i. Update the barcodeData string by removing the processed part.
        //       ii. Reset the pointer to the new end of the barcodeData string.
        //    c. If not, move the pointer one character towards the start of the string (decrement the pointer).
        // 3. If the loop exits and there are unprocessed characters left in barcodeData, throw an error.

        while (barcodeData.length > 0) {
            let pointer = barcodeData.length;
            let found = false;
        
            while (pointer > 0) {
                pointer--;
                if (pointer >= 2) {
                    const potentialField = barcodeData.substring(pointer - 2, pointer + 1);
                    if (fieldDefinitions.includes(potentialField)) {
                        const value = barcodeData.substring(pointer + 1);
                        result.set(potentialField, value.trim());
                        barcodeData = barcodeData.substring(0, pointer - 2);
                        pointer = barcodeData.length;
                        found = true;
                    }
                }
            }
        
            if (!found) {
                throw new Error("Unprocessed characters left in barcodeData or no matching field definitions found.");
            }
        }
        
        return result;
    }
}