import { MissingHeaderError } from "./errors";

export interface HeaderMetadata {
    AamvaVersion: string;
    IssuerId: string;
    JurisdictionVersion: string;
}

const HEADER_PATTERN = /@\s*ANSI\s+(\d{6})(\d{2})(\d{2})/;

export function parseHeaderMetadata(barcode: string): HeaderMetadata {
    const headerMatch = barcode.match(HEADER_PATTERN);

    if (!headerMatch) {
        throw new MissingHeaderError();
    }

    return {
        IssuerId: headerMatch[1],
        AamvaVersion: headerMatch[2],
        JurisdictionVersion: headerMatch[3],
    };
}

export function getAamvaVersion(barcode: string): string {
    return parseHeaderMetadata(barcode).AamvaVersion;
}
