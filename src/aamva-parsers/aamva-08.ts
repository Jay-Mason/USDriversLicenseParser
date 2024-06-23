import { DriversLicense } from "../DriversLicense";
import { AAMVAParser } from "./aamva-parser";

enum AAMVA08FieldMapping {
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

export class AAMVA08Parser {
    public parse(raw: string): DriversLicense {
        const baseParser = new AAMVAParser();
        const keys = Object.keys(AAMVA08FieldMapping);
        const parsedFields = baseParser.parse(raw, keys);
        
        if (parsedFields.size === 0) {
            throw new Error("No fields found in barcode");
        }

        const license: DriversLicense = {
            AddressCity: parsedFields.get(AAMVA08FieldMapping.DAI),
            AddressCountry: parsedFields.get(AAMVA08FieldMapping.DCG),
            AddressJurisdictionCode: parsedFields.get(AAMVA08FieldMapping.DAJ),
            AddressPostalCode: parsedFields.get(AAMVA08FieldMapping.DAK),
            AddressStreet: parsedFields.get(AAMVA08FieldMapping.DAG),
            AliasFamilyName: parsedFields.get(AAMVA08FieldMapping.DBN),
            AliasGivenName: parsedFields.get(AAMVA08FieldMapping.DBG),
            AliasSuffixName: parsedFields.get(AAMVA08FieldMapping.DBS),
            DateOfBirth: parsedFields.get(AAMVA08FieldMapping.DBB),
            DocumentIssueDate: parsedFields.get(AAMVA08FieldMapping.DBD),
            EyeColor: parsedFields.get(AAMVA08FieldMapping.DAY),
            FirstName: parsedFields.get(AAMVA08FieldMapping.DAC),
            HairColor: parsedFields.get(AAMVA08FieldMapping.DAZ),
            Height: parsedFields.get(AAMVA08FieldMapping.DAU),
            IsMale: parsedFields.get(AAMVA08FieldMapping.DBC) === "1",
            LastName: parsedFields.get(AAMVA08FieldMapping.DCS),
            LicenseId: parsedFields.get(AAMVA08FieldMapping.DAQ),
            MiddleName: parsedFields.get(AAMVA08FieldMapping.DAD),
            NameSuffix: parsedFields.get(AAMVA08FieldMapping.DCU),
            OrganDonor: parsedFields.get(AAMVA08FieldMapping.DDK) === "1",
            PlaceOfBirth: parsedFields.get(AAMVA08FieldMapping.DCI),
            RaceEthnicity: parsedFields.get(AAMVA08FieldMapping.DCL),
            Under18Until: parsedFields.get(AAMVA08FieldMapping.DDH),
            Under19Until: parsedFields.get(AAMVA08FieldMapping.DDI),
            Under21Until: parsedFields.get(AAMVA08FieldMapping.DDJ),
            Veteran: parsedFields.get(AAMVA08FieldMapping.DDL) === "1",
            WeightRange: parsedFields.get(AAMVA08FieldMapping.DCE)
        };

        return license;
    }
}