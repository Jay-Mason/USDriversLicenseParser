import { DriversLicense } from "./DriversLicense";
import { AAMVA08Parser } from "./aamva-parsers/aamva-08";
import { AAMVA09Parser } from "./aamva-parsers/aamva-09";
import { AAMVA10Parser } from "./aamva-parsers/aamva-10";

export function parseLicense(barcode: string): DriversLicense {
    const headerMatch = barcode.match(/@ANSI (\d{6})(\d{2})/);

    if (!headerMatch) {
        throw new Error("Header does not match AAMVA Standards");
    }

    const version = headerMatch[2];

    switch (version) {
        case "08":
            return new AAMVA08Parser().parse(barcode);
        case "09":
            return new AAMVA09Parser().parse(barcode);
        case "10":
            return new AAMVA10Parser().parse(barcode);
        default:
            throw new Error("Unsupported AAMVA version");
    }
}