import { DriversLicense, Gender, parseGender } from "./DriversLicense";
import { AAMVA03Parser } from "./aamva-parsers/aamva-03";
import { AAMVA05Parser } from "./aamva-parsers/aamva-05";
import { AAMVA08Parser } from "./aamva-parsers/aamva-08";
import { AAMVA09Parser } from "./aamva-parsers/aamva-09";
import { AAMVA10Parser } from "./aamva-parsers/aamva-10";
import {
    MalformedBarcodeError,
    MissingHeaderError,
    ParseError,
    UnsupportedVersionError,
} from "./errors";
import { getAge, isExpired, isUnder21, parseAamvaDate } from "./helpers";
import { normalizeBarcode } from "./normalizeBarcode";
import { getAamvaVersion, HeaderMetadata, parseHeaderMetadata } from "./parseHeader";

export type ParseLicenseResult =
    | { success: true; data: DriversLicense }
    | { success: false; error: string; code: string };

function parseByVersion(barcode: string, version: string): DriversLicense {
    switch (version) {
        case "10":
            return new AAMVA10Parser().parse(barcode);
        case "09":
            return new AAMVA09Parser().parse(barcode);
        case "08":
            return new AAMVA08Parser().parse(barcode);
        case "07":
        case "06":
        case "05":
            return new AAMVA05Parser().parse(barcode);
        case "04":
        case "03":
            return new AAMVA03Parser().parse(barcode);
        default:
            throw new UnsupportedVersionError(version);
    }
}

function attachMetadata(license: DriversLicense, metadata: HeaderMetadata): DriversLicense {
    return {
        ...license,
        AamvaVersion: metadata.AamvaVersion,
        IssuerId: metadata.IssuerId,
        JurisdictionVersion: metadata.JurisdictionVersion,
    };
}

export function parseLicense(barcode: string): DriversLicense {
    const normalized = normalizeBarcode(barcode);
    const metadata = parseHeaderMetadata(normalized);
    const license = parseByVersion(normalized, metadata.AamvaVersion);
    return attachMetadata(license, metadata);
}

export function parseLicenseSafe(barcode: string): ParseLicenseResult {
    try {
        return { success: true, data: parseLicense(barcode) };
    } catch (error) {
        if (error instanceof ParseError) {
            return { success: false, error: error.message, code: error.code };
        }

        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: message, code: "UNKNOWN" };
    }
}

export {
    DriversLicense,
    Gender, getAamvaVersion, getAge, HeaderMetadata,
    isExpired,
    isUnder21,
    MalformedBarcodeError,
    MissingHeaderError,
    normalizeBarcode,
    parseAamvaDate, ParseError, parseGender,
    parseHeaderMetadata, UnsupportedVersionError
};

