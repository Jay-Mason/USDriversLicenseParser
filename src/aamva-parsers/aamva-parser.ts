import { MalformedBarcodeError } from "../errors";

const FIELD_ID_PATTERN = /D[A-Z]{2}/;

function alignSubfileSlice(raw: string, offset: number, length: number): string {
    let data = raw.slice(offset, offset + length);

    if (!FIELD_ID_PATTERN.test(data.substring(0, 3))) {
        for (let back = 1; back <= 2; back++) {
            if (offset - back < 0) {
                break;
            }
            const candidate = raw.slice(offset - back, offset + length);
            if (FIELD_ID_PATTERN.test(candidate.substring(0, 3))) {
                data = candidate;
                break;
            }
        }
    }

    const jurisdictionIndex = data.search(/\nZ[A-Z]{2}/);
    if (jurisdictionIndex >= 0) {
        data = data.slice(0, jurisdictionIndex);
    }

    if (data.startsWith("DL")) {
        const afterType = data.slice(2);
        if (FIELD_ID_PATTERN.test(afterType.substring(0, 3))) {
            data = afterType;
        }
    }

    const fieldStart = data.search(FIELD_ID_PATTERN);
    if (fieldStart > 0) {
        data = data.slice(fieldStart);
    }

    return data;
}

function extractDlSubfile(raw: string, fieldDefinitions: string[]): string {
    const designatorMatch = raw.match(/DL(\d{4})(\d{4})/);
    if (designatorMatch) {
        const offset = parseInt(designatorMatch[1], 10);
        const length = parseInt(designatorMatch[2], 10);
        return alignSubfileSlice(raw, offset, length);
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
