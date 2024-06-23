import { DriversLicense } from "../DriversLicense";
import { AAMVAParser } from "./aamva-parser";

enum AAMVA05FieldMapping {
    //Mandatory Fields
    DCA = "Jurisdiction-specific vehicle class",
    DCB = "Jurisdiction-specific restriction codes",
    DCD = "Jurisdiction-specific endorsement codes",
    DBA = "Document Expiration Date",
    DCS = "Customer Family Name",
    DAC = "Customer First Name",
    DAD = "Customer Middle Name",
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
    DDE = "Customer Family Name Truncation",
    DDF = "Customer First Name Truncation",
    DDG = "Customer Middle Name Truncation",
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
    DCR = "Jurisdiction-specific restriction code description",
    DDA = "Compliance Type",
    DDB = "Card Revision Date",
    DDC = "HazMat Endorsement Expiry Date",
    DDD = "Limited Duration Document Indicator",
    DAW = "Weight (pounds)",
    DAX = "Weight (kilograms)",
    DDH = "Under 18 Until",
    DDI = "Under 19 Until",
    DDJ = "Under 21 Until",
    DDK = "Organ Donor",
    DDL = "Veteran"
}

export class AAMVA05Parser {
    public parse(raw: string): DriversLicense {
        const baseParser = new AAMVAParser();
        const keys = Object.keys(AAMVA05FieldMapping);
        const parsedFields = baseParser.parse(raw, keys);
        
        if (parsedFields.size === 0) {
            throw new Error("No fields found in barcode");
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
            FirstName: parsedFields.get("DAC"),
            HairColor: parsedFields.get("DAZ"),
            Height: parsedFields.get("DAU"),
            IsMale: parsedFields.get("DBC") === "1",
            LastName: parsedFields.get("DCS"),
            LicenseId: parsedFields.get("DAQ"),
            MiddleName: parsedFields.get("DAD"),
            NameSuffix: parsedFields.get("DCU"),
            OrganDonor: parsedFields.get("DDK") === "1",
            PlaceOfBirth: parsedFields.get("DCI"),
            RaceEthnicity: parsedFields.get("DCL"),
            Under18Until: parsedFields.get("DDH"),
            Under19Until: parsedFields.get("DDI"),
            Under21Until: parsedFields.get("DDJ"),
            Veteran: parsedFields.get("DDL") === "1",
            WeightRange: parsedFields.get("DCE")
        };

        return license;
    }
}