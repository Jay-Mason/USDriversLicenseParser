import { DriversLicense } from "../DriversLicense";
import { AAMVAParser } from "./aamva-parser";

enum AAMVA09FieldMapping {
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

export class AAMVA09Parser {
    public parse(raw: string): DriversLicense {
        const baseParser = new AAMVAParser();
        const keys = Object.keys(AAMVA09FieldMapping);
        const parsedFields = baseParser.parse(raw, keys);
        
        if (parsedFields.size === 0) {
            throw new Error("No fields found in barcode");
        }

        const license: DriversLicense = {
            AddressCity: parsedFields.get(AAMVA09FieldMapping.DAI),
            AddressCountry: parsedFields.get(AAMVA09FieldMapping.DCG),
            AddressJurisdictionCode: parsedFields.get(AAMVA09FieldMapping.DAJ),
            AddressPostalCode: parsedFields.get(AAMVA09FieldMapping.DAK),
            AddressStreet: parsedFields.get(AAMVA09FieldMapping.DAG),
            AliasFamilyName: parsedFields.get(AAMVA09FieldMapping.DBN),
            AliasGivenName: parsedFields.get(AAMVA09FieldMapping.DBG),
            AliasSuffixName: parsedFields.get(AAMVA09FieldMapping.DBS),
            DateOfBirth: parsedFields.get(AAMVA09FieldMapping.DBB),
            DocumentIssueDate: parsedFields.get(AAMVA09FieldMapping.DBD),
            EyeColor: parsedFields.get(AAMVA09FieldMapping.DAY),
            FirstName: parsedFields.get(AAMVA09FieldMapping.DAC),
            HairColor: parsedFields.get(AAMVA09FieldMapping.DAZ),
            Height: parsedFields.get(AAMVA09FieldMapping.DAU),
            IsMale: parsedFields.get(AAMVA09FieldMapping.DBC) === "1",
            LastName: parsedFields.get(AAMVA09FieldMapping.DCS),
            LicenseId: parsedFields.get(AAMVA09FieldMapping.DAQ),
            MiddleName: parsedFields.get(AAMVA09FieldMapping.DAD),
            NameSuffix: parsedFields.get(AAMVA09FieldMapping.DCU),
            OrganDonor: parsedFields.get(AAMVA09FieldMapping.DDK) === "1",
            PlaceOfBirth: parsedFields.get(AAMVA09FieldMapping.DCI),
            RaceEthnicity: parsedFields.get(AAMVA09FieldMapping.DCL),
            Under18Until: parsedFields.get(AAMVA09FieldMapping.DDH),
            Under19Until: parsedFields.get(AAMVA09FieldMapping.DDI),
            Under21Until: parsedFields.get(AAMVA09FieldMapping.DDJ),
            Veteran: parsedFields.get(AAMVA09FieldMapping.DDL) === "1",
            WeightRange: parsedFields.get(AAMVA09FieldMapping.DCE)
        };

        return license;
    }
}