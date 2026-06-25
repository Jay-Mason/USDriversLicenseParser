import {
    getAge,
    isExpired,
    isUnder21,
    MissingHeaderError,
    normalizeBarcode,
    parseAamvaDate,
    parseLicense,
    parseLicenseSafe,
    UnsupportedVersionError,
} from "../src/index";
import {
    aamva03CombinedName,
    californiaAamva05,
    californiaAamva08,
    californiaUnder21,
    dagostinoAamva08,
    femaleAamva08,
    nebraskaAamva09,
    nebraskaAamva09CrOnly,
    nebraskaAamva09Crlf,
    nebraskaAamva10,
    nebraskaWithAddressLine2,
    notSpecifiedGenderAamva09,
    michiganAamva10,
    michiganAamva10WithNewlines,
    michiganAamva09Concatenated,
    michiganV8NormalAdult,
    michiganV8NoMiddleName,
    michiganV8OutOfOrder,
    michiganV8ApartmentAddress,
    michiganV8HyphenatedLastName,
    michiganV9NormalAdult,
    michiganV9CityWithSpaces,
    michiganV9Suffix,
    michiganV9ZipPlusFour,
    michiganV9OutOfOrder,
    michiganFixtures,
} from "./fixtures";

describe("parseLicense", () => {
    it("parses Nebraska AAMVA 09 calibration sample", () => {
        const result = parseLicense(nebraskaAamva09);

        expect(result.FirstName).toBe("FIRSTNAME");
        expect(result.LastName).toBe("LASTNAME");
        expect(result.MiddleName).toBe("MIDDLENAME");
        expect(result.LicenseId).toBe("N99999999");
        expect(result.AddressStreet).toBe("123 MAIN STREET");
        expect(result.AddressCity).toBe("LINCOLN");
        expect(result.AddressState).toBe("NE");
        expect(result.AddressPostalCode).toBe("685011234");
        expect(result.DateOfBirth).toBe("01121967");
        expect(result.DocumentIssueDate).toBe("05012019");
        expect(result.DocumentExpirationDate).toBe("01122024");
        expect(result.Gender).toBe("Male");
        expect(result.IsMale).toBe(true);
        expect(result.EyeColor).toBe("BLU");
        expect(result.HairColor).toBe("BRO");
        expect(result.NameSuffix).toBe("JR");
        expect(result.AamvaVersion).toBe("09");
        expect(result.IssuerId).toBe("636054");
        expect(result.JurisdictionVersion).toBe("00");
    });

    it("parses California AAMVA 08 sample with organ donor flag", () => {
        const result = parseLicense(californiaAamva08);

        expect(result.FirstName).toBe("JOHN");
        expect(result.LastName).toBe("PUBLIC");
        expect(result.MiddleName).toBe("QUINCY");
        expect(result.LicenseId).toBe("D12345678");
        expect(result.DocumentExpirationDate).toBe("01312035");
        expect(result.Gender).toBe("Male");
        expect(result.OrganDonor).toBe(true);
        expect(result.AamvaVersion).toBe("08");
    });

    it("parses AAMVA 10 sample", () => {
        const result = parseLicense(nebraskaAamva10);
        expect(result.AamvaVersion).toBe("10");
        expect(result.LastName).toBe("LASTNAME");
    });

    it("parses Michigan AAMVA 10 concatenated fields with no newline after @", () => {
        const result = parseLicense(michiganAamva10);

        expect(result.AamvaVersion).toBe("10");
        expect(result.IssuerId).toBe("636032");
        expect(result.JurisdictionVersion).toBe("02");
        expect(result.LicenseId).toBe("W 000 000 000 000");
        expect(result.LastName).toBe("LASTN");
        expect(result.FirstName).toBe("FIRSTN");
    });

    it("parses Michigan AAMVA 10 with newline field separators", () => {
        const result = parseLicense(michiganAamva10WithNewlines);
        expect(result.LicenseId).toBe("W 000 000 000 000");
        expect(result.LastName).toBe("LASTN");
        expect(result.FirstName).toBe("FIRSTN");
    });

    it("parses Michigan AAMVA 09 concatenated barcode quickly with license id", () => {
        const start = Date.now();
        const result = parseLicense(michiganAamva09Concatenated);
        expect(Date.now() - start).toBeLessThan(100);

        expect(result.AamvaVersion).toBe("09");
        expect(result.IssuerId).toBe("636032");
        expect(result.LicenseId).toBe("R 400 114 286 000");
        expect(result.LastName).toBe("ROBINSON");
        expect(result.FirstName).toBe("MARCUS");
        expect(result.MiddleName).toBe("ANTHONY");
        expect(result.NameSuffix).toBe("JR");
        expect(result.AddressStreet).toBe("9082 LAKEVIEW DR");
        expect(result.AddressCity).toBe("NOVI");
        expect(result.AddressState).toBe("MI");
        expect(result.AddressPostalCode).toBe("483750000");
        expect(result.DateOfBirth).toBe("03051986");
        expect(result.DocumentIssueDate).toBe("05122026");
        expect(result.DocumentExpirationDate).toBe("05122032");
        expect(result.Gender).toBe("Male");
    });

    it("parses Michigan v8 normal adult license", () => {
        const result = parseLicense(michiganV8NormalAdult);

        expect(result.AamvaVersion).toBe("08");
        expect(result.LicenseId).toBe("A 145 782 439 000");
        expect(result.LastName).toBe("ANDERSON");
        expect(result.FirstName).toBe("MELISSA");
        expect(result.MiddleName).toBe("JOAN");
        expect(result.Gender).toBe("Female");
        expect(result.AddressStreet).toBe("4126 PINE HOLLOW DR");
        expect(result.AddressCity).toBe("ROCHESTER HILLS");
        expect(result.AddressState).toBe("MI");
        expect(result.DateOfBirth).toBe("02271984");
        expect(result.DocumentExpirationDate).toBe("08142031");
    });

    it("parses Michigan v8 license without middle name", () => {
        const result = parseLicense(michiganV8NoMiddleName);

        expect(result.LicenseId).toBe("B 382 119 640 000");
        expect(result.LastName).toBe("BENNETT");
        expect(result.FirstName).toBe("RYAN");
        expect(result.MiddleName).toBeUndefined();
        expect(result.AddressCity).toBe("TROY");
    });

    it("parses Michigan v8 out-of-order fields", () => {
        const result = parseLicense(michiganV8OutOfOrder);

        expect(result.LicenseId).toBe("C 927 450 118 000");
        expect(result.LastName).toBe("COLLINS");
        expect(result.FirstName).toBe("PRIYA");
        expect(result.MiddleName).toBe("MAE");
        expect(result.AddressStreet).toBe("221 S SAGINAW ST");
        expect(result.AddressCity).toBe("FLINT");
    });

    it("parses Michigan v8 apartment address", () => {
        const result = parseLicense(michiganV8ApartmentAddress);

        expect(result.LicenseId).toBe("M 640 287 551 000");
        expect(result.LastName).toBe("MARTINEZ");
        expect(result.FirstName).toBe("DANIEL");
        expect(result.AddressStreet).toBe("1555 WOODWARD AVE APT 12C");
        expect(result.AddressCity).toBe("DETROIT");
    });

    it("parses Michigan v8 hyphenated last name", () => {
        const result = parseLicense(michiganV8HyphenatedLastName);

        expect(result.LicenseId).toBe("R 118 905 773 000");
        expect(result.LastName).toBe("REED-WALKER");
        expect(result.FirstName).toBe("KAITLYN");
        expect(result.AddressCity).toBe("GROSSE POINTE");
    });

    it("parses Michigan v9 normal adult license", () => {
        const result = parseLicense(michiganV9NormalAdult);

        expect(result.AamvaVersion).toBe("09");
        expect(result.LicenseId).toBe("H 506 218 934 000");
        expect(result.LastName).toBe("HARRIS");
        expect(result.FirstName).toBe("JACOB");
        expect(result.MiddleName).toBe("ALLEN");
        expect(result.AddressCity).toBe("WEST BLOOMFIELD");
    });

    it("parses Michigan v9 city with spaces", () => {
        const result = parseLicense(michiganV9CityWithSpaces);

        expect(result.LicenseId).toBe("K 333 672 140 000");
        expect(result.LastName).toBe("KIM");
        expect(result.FirstName).toBe("NORA");
        expect(result.AddressCity).toBe("ROYAL OAK");
    });

    it("parses Michigan v9 suffix", () => {
        const result = parseLicense(michiganV9Suffix);

        expect(result.LicenseId).toBe("L 772 349 506 000");
        expect(result.LastName).toBe("LEWIS");
        expect(result.FirstName).toBe("ANTHONY");
        expect(result.NameSuffix).toBe("JR");
        expect(result.AddressCity).toBe("SOUTH LYON");
    });

    it("parses Michigan v9 zip plus four style postal code", () => {
        const result = parseLicense(michiganV9ZipPlusFour);

        expect(result.LicenseId).toBe("S 915 004 226 000");
        expect(result.LastName).toBe("SULLIVAN");
        expect(result.FirstName).toBe("RACHEL");
        expect(result.AddressCity).toBe("MT CLEMENS");
        expect(result.AddressPostalCode).toBe("480431234");
    });

    it("parses Michigan v9 out-of-order fields", () => {
        const result = parseLicense(michiganV9OutOfOrder);

        expect(result.LicenseId).toBe("T 204 888 731 000");
        expect(result.LastName).toBe("NGUYEN");
        expect(result.FirstName).toBe("ETHAN");
        expect(result.MiddleName).toBeUndefined();
        expect(result.AddressStreet).toBe("9940 GRAND RIVER AVE");
        expect(result.AddressCity).toBe("BRIGHTON");
    });

    it.each(michiganFixtures)("parses $name within performance budget", ({ barcode, maxMs }) => {
        const start = Date.now();
        const result = parseLicenseSafe(barcode);
        expect(Date.now() - start).toBeLessThan(maxMs);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.LicenseId).toBeDefined();
            expect(result.data.LastName).toBeDefined();
        }
    });

    it("parses AAMVA 05 sample", () => {
        const result = parseLicense(californiaAamva05);
        expect(result.AamvaVersion).toBe("05");
        expect(result.FirstName).toBe("JOHN");
    });

    it("parses AAMVA 03 combined-name format", () => {
        const result = parseLicense(aamva03CombinedName);

        expect(result.AamvaVersion).toBe("03");
        expect(result.LastName).toBe("DAGOSTINO");
        expect(result.FirstName).toBe("ANTHONY");
        expect(result.MiddleName).toBe("MARIO");
        expect(result.LicenseId).toBe("X12345678");
    });

    it("parses address line 2", () => {
        const result = parseLicense(nebraskaWithAddressLine2);
        expect(result.AddressStreet).toBe("123 MAIN STREET");
        expect(result.AddressStreet2).toBe("APT 4B");
    });

    it("parses names and addresses containing field-like letter sequences", () => {
        const result = parseLicense(dagostinoAamva08);

        expect(result.LastName).toBe("DAGOSTINO");
        expect(result.FirstName).toBe("ANTHONY");
        expect(result.MiddleName).toBe("MARIO");
        expect(result.AddressStreet).toBe("789 DAGGETT AVE");
    });

    it("normalizes CRLF barcodes before parsing", () => {
        const result = parseLicense(nebraskaAamva09Crlf);
        expect(result.LastName).toBe("LASTNAME");
    });

    it("normalizes CR-only barcodes before parsing", () => {
        const result = parseLicense(nebraskaAamva09CrOnly);
        expect(result.LastName).toBe("LASTNAME");
    });

    it("maps not specified gender for DBC9", () => {
        const result = parseLicense(notSpecifiedGenderAamva09);

        expect(result.Gender).toBe("NotSpecified");
        expect(result.IsMale).toBe(false);
    });

    it("maps female gender correctly", () => {
        const result = parseLicense(femaleAamva08);

        expect(result.Gender).toBe("Female");
        expect(result.IsMale).toBe(false);
        expect(result.FirstName).toBe("JANE");
    });

    it("does not treat field codes embedded in values as delimiters", () => {
        const result = parseLicense(nebraskaAamva09);
        expect(result.MiddleName).toBe("MIDDLENAME");
    });

    it("throws MissingHeaderError for invalid header", () => {
        expect(() => parseLicense("INVALID HEADER")).toThrow(MissingHeaderError);
    });

    it("throws UnsupportedVersionError for unsupported AAMVA version", () => {
        expect(() => parseLicense("@ANSI 6360000202DL")).toThrow(UnsupportedVersionError);
    });
});

describe("parseLicenseSafe", () => {
    it("returns success for valid barcodes", () => {
        const result = parseLicenseSafe(nebraskaAamva09);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.LastName).toBe("LASTNAME");
        }
    });

    it("returns structured failure for invalid header", () => {
        const result = parseLicenseSafe("INVALID HEADER");
        expect(result).toEqual({
            success: false,
            error: "Missing ANSI Header, unable to determine version",
            code: "MISSING_HEADER",
        });
    });

    it("returns structured failure for unsupported version", () => {
        const result = parseLicenseSafe("@ANSI 6360000202DL");
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.code).toBe("UNSUPPORTED_VERSION");
        }
    });
});

describe("normalizeBarcode", () => {
    it("converts CRLF to LF and trims whitespace", () => {
        expect(normalizeBarcode("  @\r\nANSI 636054090002  ")).toBe("@\nANSI 636054090002");
    });

    it("converts CR-only line endings to LF", () => {
        expect(normalizeBarcode("DAQN99999999\rDCSLASTNAME")).toBe("DAQN99999999\nDCSLASTNAME");
    });

    it("converts RS element separators to LF", () => {
        expect(normalizeBarcode("DAQN99999999\x1eDCSLASTNAME")).toBe("DAQN99999999\nDCSLASTNAME");
    });
});

describe("date and age helpers", () => {
    it("parseAamvaDate returns undefined for invalid input", () => {
        expect(parseAamvaDate(undefined)).toBeUndefined();
        expect(parseAamvaDate("123")).toBeUndefined();
        expect(parseAamvaDate("02312000")).toBeUndefined();
    });

    it("parseAamvaDate parses valid AAMVA dates", () => {
        const date = parseAamvaDate("01121967");
        expect(date).toEqual(new Date(1967, 0, 12));
    });

    it("isExpired uses the document expiration date", () => {
        const license = parseLicense(nebraskaAamva09);
        expect(isExpired(license, new Date(2024, 0, 11))).toBe(false);
        expect(isExpired(license, new Date(2024, 0, 13))).toBe(true);
    });

    it("getAge calculates age from date of birth", () => {
        const license = parseLicense(nebraskaAamva09);
        expect(getAge(license, new Date(2024, 0, 12))).toBe(57);
    });

    it("isUnder21 uses DDJ when present", () => {
        const license = parseLicense(californiaUnder21);
        expect(isUnder21(license, new Date(2030, 0, 13))).toBe(true);
        expect(isUnder21(license, new Date(2030, 1, 1))).toBe(false);
    });

    it("isUnder21 falls back to age when DDJ is absent", () => {
        const license = parseLicense(californiaAamva08);
        expect(isUnder21(license, new Date(2020, 0, 1))).toBe(false);
    });
});
