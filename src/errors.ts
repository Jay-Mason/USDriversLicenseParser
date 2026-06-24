export class ParseError extends Error {
    public readonly code: string;

    constructor(message: string, code: string) {
        super(message);
        this.name = "ParseError";
        this.code = code;
    }
}

export class MissingHeaderError extends ParseError {
    constructor(message = "Missing ANSI Header, unable to determine version") {
        super(message, "MISSING_HEADER");
        this.name = "MissingHeaderError";
    }
}

export class UnsupportedVersionError extends ParseError {
    constructor(version: string) {
        super(`Unsupported AAMVA version: ${version}`, "UNSUPPORTED_VERSION");
        this.name = "UnsupportedVersionError";
    }
}

export class MalformedBarcodeError extends ParseError {
    constructor(message: string) {
        super(message, "MALFORMED_BARCODE");
        this.name = "MalformedBarcodeError";
    }
}
