import { DriversLicense } from "./DriversLicense";
import { AAMVA03Parser } from "./aamva-parsers/aamva-03";
import { AAMVA05Parser } from "./aamva-parsers/aamva-05";
import { AAMVA08Parser } from "./aamva-parsers/aamva-08";
import { AAMVA09Parser } from "./aamva-parsers/aamva-09";
import { AAMVA10Parser } from "./aamva-parsers/aamva-10";

export function parseLicense(barcode: string): DriversLicense {
    const headerMatch = barcode.match(/@\s*ANSI\s+(\d{6})(\d{2})/);

    if (!headerMatch) {
        throw new Error("Missing ANSI Header, unable to determine version");
    }

    const version = headerMatch[2];

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
            throw new Error("Unsupported AAMVA version");
    }
}