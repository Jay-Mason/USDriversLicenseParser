import { MalformedBarcodeError } from "../errors";

const FIELD_ID_PATTERN = /D[A-Z]{2}/;
const JURISDICTION_SUBFILE_PATTERN = /Z[A-Z]{2}\d{8}/;
const SINGLE_CHAR_FIELDS = new Set(["DDA", "DDE", "DDF", "DDG", "DDD"]);

function stripJurisdictionSubfile(data: string): string {
    const newlineIndex = data.search(/\nZ[A-Z]{2}/);
    if (newlineIndex >= 0) {
        return data.slice(0, newlineIndex);
    }

    const match = data.match(JURISDICTION_SUBFILE_PATTERN);
    if (match && match.index !== undefined && match.index > 0) {
        return data.slice(0, match.index);
    }

    return data;
}

function stripLeadingSubfileMarker(data: string, allowedFields: Set<string>): string {
    if (data.startsWith("DL")) {
        const afterType = data.slice(2);
        if (allowedFields.has(afterType.substring(0, 3))) {
            return afterType;
        }
    }

    return data;
}

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

    return data;
}

const FIELD_ORDER = [
    "DAQ",
    "DCS",
    "DDE",
    "DAC",
    "DDF",
    "DAD",
    "DDG",
    "DCU",
    "DBN",
    "DBG",
    "DBS",
    "DCA",
    "DCB",
    "DCD",
    "DBA",
    "DBD",
    "DBB",
    "DBC",
    "DAY",
    "DAZ",
    "DAU",
    "DAW",
    "DAX",
    "DAG",
    "DAH",
    "DAI",
    "DAJ",
    "DAK",
    "DCF",
    "DCG",
    "DCI",
    "DCJ",
    "DCK",
    "DCL",
    "DCE",
    "DCM",
    "DCN",
    "DCO",
    "DCP",
    "DCQ",
    "DCR",
    "DDA",
    "DDB",
    "DDC",
    "DDD",
    "DDH",
    "DDI",
    "DDJ",
    "DDK",
    "DDL",
    "DCT",
];

function getFieldOrder(code: string): number {
    const index = FIELD_ORDER.indexOf(code);
    return index >= 0 ? index : FIELD_ORDER.length;
}

function findNextFieldIndex(
    compact: string,
    from: number,
    allowedFields: Set<string>,
    currentCode?: string
): number {
    const currentOrder = currentCode ? getFieldOrder(currentCode) : -1;

    let first = -1;
    for (let i = from; i + 3 <= compact.length; i++) {
        if (allowedFields.has(compact.substring(i, i + 3))) {
            first = i;
            break;
        }
    }
    if (first < 0) {
        return -1;
    }

    let best = first;
    let bestOrder = getFieldOrder(compact.substring(first, first + 3));
    for (let i = first + 1; i <= first + 2 && i + 3 <= compact.length; i++) {
        const code = compact.substring(i, i + 3);
        if (!allowedFields.has(code)) {
            continue;
        }

        const order = getFieldOrder(code);
        if (order > currentOrder && order < bestOrder) {
            best = i;
            bestOrder = order;
        }
    }

    return best;
}

function resolveSubfileData(
    raw: string,
    designatorEnd: number,
    offset: number,
    length: number,
    allowedFields: Set<string>
): string {
    let data = stripJurisdictionSubfile(alignSubfileSlice(raw, offset, length));
    data = stripLeadingSubfileMarker(data, allowedFields);

    if (allowedFields.has(data.substring(0, 3))) {
        return data;
    }

    const searchEnd = Math.min(raw.length, Math.max(offset + length, designatorEnd + length));
    for (let i = designatorEnd; i + 3 <= searchEnd; i++) {
        const code = raw.substring(i, i + 3);
        if (!allowedFields.has(code)) {
            continue;
        }

        let end = Math.max(offset + length, i + length);
        end = Math.min(end, raw.length);
        data = stripJurisdictionSubfile(raw.slice(i, end));
        return stripLeadingSubfileMarker(data, allowedFields);
    }

    return data;
}

function parseByLines(lines: string[], allowedFields: Set<string>): Map<string, string> {
    const result = new Map<string, string>();

    for (const line of lines) {
        if (line.length < 3) {
            continue;
        }

        const fieldCode = line.substring(0, 3);
        if (allowedFields.has(fieldCode)) {
            result.set(fieldCode, line.substring(3).trim());
        }
    }

    return result;
}

function parseConcatenated(data: string, allowedFields: Set<string>): Map<string, string> {
    const compact = data.replace(/\n/g, "");
    const result = new Map<string, string>();

    let pos = allowedFields.has(compact.substring(0, 3))
        ? 0
        : findNextFieldIndex(compact, 0, allowedFields);
    if (pos < 0) {
        return result;
    }

    while (pos + 3 <= compact.length) {
        const code = compact.substring(pos, pos + 3);
        if (!allowedFields.has(code)) {
            break;
        }

        if (SINGLE_CHAR_FIELDS.has(code)) {
            if (pos + 4 > compact.length) {
                break;
            }
            result.set(code, compact.substring(pos + 3, pos + 4));
            pos += 4;
            continue;
        }

        const nextPos = findNextFieldIndex(compact, pos + 3, allowedFields, code);
        if (nextPos < 0) {
            result.set(code, compact.substring(pos + 3).trim());
            break;
        }

        result.set(code, compact.substring(pos + 3, nextPos).trim());
        pos = nextPos;
    }

    return result;
}

function extractDlSubfile(raw: string, fieldDefinitions: string[], allowedFields: Set<string>): string {
    const designatorMatch = raw.match(/DL(\d{4})(\d{4})/);
    if (designatorMatch) {
        const offset = parseInt(designatorMatch[1], 10);
        const length = parseInt(designatorMatch[2], 10);
        const designatorEnd = designatorMatch.index! + designatorMatch[0].length;
        return resolveSubfileData(raw, designatorEnd, offset, length, allowedFields);
    }

    const fieldPattern = new RegExp(fieldDefinitions.join("|"));
    const start = raw.search(fieldPattern);
    if (start < 0) {
        throw new MalformedBarcodeError("No DL subfile data found in barcode");
    }

    return stripJurisdictionSubfile(raw.slice(start));
}

export class AAMVAParser {
    public parse(raw: string, fieldDefinitions: string[]): Map<string, string> {
        const allowedFields = new Set(fieldDefinitions);
        const barcodeData = extractDlSubfile(raw, fieldDefinitions, allowedFields);
        const lines = barcodeData.split("\n").filter((line) => line.length >= 3);
        const result =
            lines.length <= 1
                ? parseConcatenated(barcodeData, allowedFields)
                : parseByLines(lines, allowedFields);

        if (result.size === 0) {
            throw new MalformedBarcodeError("No recognized fields found in DL subfile");
        }

        return result;
    }
}
