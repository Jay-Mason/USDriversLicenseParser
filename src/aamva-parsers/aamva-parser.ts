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

const SINGLE_CHAR_FIELDS = new Set(["DDA", "DDE", "DDF", "DDG", "DDD"]);

function parseConcatenatedFrom(
    compact: string,
    allowedFields: Set<string>,
    pos: number
): Map<string, string> {
    if (pos + 3 > compact.length) {
        return new Map();
    }

    const code = compact.substring(pos, pos + 3);
    if (!allowedFields.has(code)) {
        return new Map();
    }

    if (SINGLE_CHAR_FIELDS.has(code)) {
        if (pos + 4 > compact.length) {
            return new Map();
        }
        const result = new Map<string, string>();
        result.set(code, compact.substring(pos + 3, pos + 4));
        const rest = parseConcatenatedFrom(compact, allowedFields, pos + 4);
        rest.forEach((value, key) => result.set(key, value));
        return result;
    }

    const candidates: number[] = [];
    for (let i = pos + 3; i + 3 <= compact.length; i++) {
        if (allowedFields.has(compact.substring(i, i + 3))) {
            candidates.push(i);
        }
    }

    if (candidates.length === 0) {
        const result = new Map<string, string>();
        result.set(code, compact.substring(pos + 3).trim());
        return result;
    }

    let best: Map<string, string> | undefined;
    for (const nextPos of candidates) {
        const trial = new Map<string, string>();
        trial.set(code, compact.substring(pos + 3, nextPos).trim());
        const rest = parseConcatenatedFrom(compact, allowedFields, nextPos);
        rest.forEach((value, key) => trial.set(key, value));

        if (
            !best ||
            trial.size > best.size ||
            (trial.size === best.size &&
                (trial.get(code)?.length ?? 0) > (best.get(code)?.length ?? 0))
        ) {
            best = trial;
        }
    }

    return best ?? new Map();
}

function parseConcatenated(data: string, allowedFields: Set<string>): Map<string, string> {
    const compact = data.replace(/\n/g, "");

    let pos = 0;
    if (pos + 3 <= compact.length && !allowedFields.has(compact.substring(pos, pos + 3))) {
        let found = -1;
        for (let i = 0; i + 3 <= compact.length; i++) {
            if (allowedFields.has(compact.substring(i, i + 3))) {
                found = i;
                break;
            }
        }
        if (found < 0) {
            return new Map();
        }
        pos = found;
    }

    return parseConcatenatedFrom(compact, allowedFields, pos);
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
