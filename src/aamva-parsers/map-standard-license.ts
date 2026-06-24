import { DriversLicense, parseGender } from "../DriversLicense";

export function mapStandardLicense(parsedFields: Map<string, string>): DriversLicense {
    const gender = parseGender(parsedFields.get("DBC"));

    return {
        AddressCity: parsedFields.get("DAI"),
        AddressCountry: parsedFields.get("DCG"),
        AddressPostalCode: parsedFields.get("DAK"),
        AddressState: parsedFields.get("DAJ"),
        AddressStreet: parsedFields.get("DAG"),
        AddressStreet2: parsedFields.get("DAH"),
        AliasFamilyName: parsedFields.get("DBN"),
        AliasGivenName: parsedFields.get("DBG"),
        AliasSuffixName: parsedFields.get("DBS"),
        DateOfBirth: parsedFields.get("DBB"),
        DocumentExpirationDate: parsedFields.get("DBA"),
        DocumentIssueDate: parsedFields.get("DBD"),
        EyeColor: parsedFields.get("DAY"),
        FirstName: parsedFields.get("DAC"),
        Gender: gender,
        HairColor: parsedFields.get("DAZ"),
        Height: parsedFields.get("DAU"),
        IsMale: gender === "Male",
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
        WeightRange: parsedFields.get("DCE"),
    };
}
