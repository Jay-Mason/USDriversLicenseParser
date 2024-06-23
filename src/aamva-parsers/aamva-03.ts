import { DriversLicense } from "../DriversLicense";
import { AAMVAParser } from "./aamva-parser";

enum AAMVA03FieldMapping {
    //Mandatory Fields
    DCA = "Jurisdiction-specific vehicle class",
    DCB = "Jurisdiction-specific restriction codes",
    DCD = "Jurisdiction-specific endorsement codes",
    DBA = "Document Expiration Date",
    DCS = "Customer Family Name",
    DCT = "Customer Given Name (First + Middle)",
    DBD = "Document Issue Date",
    DBB = "Date of Birth",
    DBC = "Physical Description - Sex",
    DAY = "Eye Color",
    DAU = "Height",
    DAG = "Street Address 1",
    DAI = "City",
    DAJ = "State",
    DAK = "Postal Code",
    DAQ = "Customer Id Number",
    DCF = "Document Discriminator",
    DCG = "Country Identification",
    DCH = "Federal Commercial Vehicle Codes",
    //Optional Fields
    DAH = "Street Address 2",
    DAZ = "Hair Color",
    DCI = "Place of Birth",
    DCJ = "Audit Information",
    DCK = "Inventory Control Number",
    DBN = "Alias / AKA Family Name",
    DBG = "Alias / AKA Given Name",
    DBS = "Alias / AKA Suffix Name",
    DCU = "Name Suffix",
    DCE = "Weight Range",
    DCL = "Race/Ethnicity",
    DCM = "Standard Vehicle Classification",
    DCN = "Standard Endorsement Code",
    DCO = "Standard Restriction Code",
    DCP = "Jurisdiction-specific vehicle classification description",
    DCQ = "Jurisdiction-specific endorsement code description",
    DCR = "Jurisdiction-specific restriction code description"
}

export class AAMVA03Parser {
    public parse(raw: string): DriversLicense {
        const baseParser = new AAMVAParser();
        const keys = Object.keys(AAMVA03FieldMapping);
        const parsedFields = baseParser.parse(raw, keys);
        
        if (parsedFields.size === 0) {
            throw new Error("No fields found in barcode");
        }

        const givenNameSplit = parsedFields.get("DCT")?.split(" ") ?? undefined;

        let firstName = undefined;
        let middleName = undefined;

        if (givenNameSplit) {
            firstName = givenNameSplit.length > 0 ? givenNameSplit[0] : undefined;
            middleName = givenNameSplit.length > 1 ? givenNameSplit.slice(1).join(" ") : undefined;
        }

        const license: DriversLicense = {
            AddressCity: parsedFields.get("DAI"),
            AddressCountry: parsedFields.get("DCG"),
            AddressPostalCode: parsedFields.get("DAK"),
            AddressState: parsedFields.get("DAJ"),
            AddressStreet: parsedFields.get("DAG"),
            AliasFamilyName: parsedFields.get("DBN"),
            AliasGivenName: parsedFields.get("DBG"),
            AliasSuffixName: parsedFields.get("DBS"),
            DateOfBirth: parsedFields.get("DBB"),
            DocumentIssueDate: parsedFields.get("DBD"),
            EyeColor: parsedFields.get("DAY"),
            FirstName: firstName,
            HairColor: parsedFields.get("DAZ"),
            Height: parsedFields.get("DAU"),
            IsMale: parsedFields.get("DBC") === "1",
            LastName: parsedFields.get("DCS"),
            LicenseId: parsedFields.get("DAQ"),
            MiddleName: middleName,
            NameSuffix: parsedFields.get("DCU"),
            OrganDonor: undefined,
            PlaceOfBirth: parsedFields.get("DCI"),
            RaceEthnicity: parsedFields.get("DCL"),
            Under18Until: undefined,
            Under19Until: undefined,
            Under21Until: undefined,
            Veteran: undefined,
            WeightRange: parsedFields.get("DCE")
        };

        return license;
    }
}