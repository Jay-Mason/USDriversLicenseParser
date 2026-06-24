import { MalformedBarcodeError } from "../errors";

function extractDlSubfile(raw: string, fieldDefinitions: string[]): string {
    const designatorMatch = raw.match(/DL(\d{4})(\d{4})/);
    if (designatorMatch) {
        const offset = parseInt(designatorMatch[1], 10);
        const length = parseInt(designatorMatch[2], 10);
        let data = raw.slice(offset, offset + length);
        const jurisdictionIndex = data.search(/\nZ[A-Z]{2}/);
        if (jurisdictionIndex >= 0) {
            data = data.slice(0, jurisdictionIndex);
        }
        const fieldStart = data.search(/D[A-Z]{2}/);
        if (fieldStart > 0) {
            data = data.slice(fieldStart);
        }
        return data;
    }

    const fieldPattern = new RegExp(fieldDefinitions.join("|"));
    const start = raw.search(fieldPattern);
    if (start < 0) {
        throw new MalformedBarcodeError("No DL subfile data found in barcode");
    }

    let data = raw.slice(start);
    const jurisdictionIndex = data.search(/\nZ[A-Z]{2}/);
    if (jurisdictionIndex >= 0) {
        data = data.slice(0, jurisdictionIndex);
    }
    return data;
}

export class AAMVAParser {
    public parse(raw: string, fieldDefinitions: string[]): Map<string, string> {
        const allowedFields = new Set(fieldDefinitions);
        const barcodeData = extractDlSubfile(raw, fieldDefinitions);
        const result = new Map<string, string>();

        for (const line of barcodeData.split("\n")) {
            if (line.length < 3) {
                continue;
            }

            const fieldCode = line.substring(0, 3);
            if (allowedFields.has(fieldCode)) {
                result.set(fieldCode, line.substring(3).trim());
            }
        }

        if (result.size === 0) {
            throw new MalformedBarcodeError("No recognized fields found in DL subfile");
        }

        return result;
    }
}
