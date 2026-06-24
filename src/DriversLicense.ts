export type Gender = "Male" | "Female" | "NotSpecified";

export function parseGender(dbc?: string): Gender | undefined {
    switch (dbc) {
        case "1":
            return "Male";
        case "2":
            return "Female";
        case "9":
            return "NotSpecified";
        default:
            return undefined;
    }
}

export interface DriversLicense {
    AamvaVersion?: string;
    AddressCity?: string;
    AddressCountry?: string;
    AddressPostalCode?: string;
    AddressState?: string;
    AddressStreet?: string;
    AddressStreet2?: string;
    AliasFamilyName?: string;
    AliasGivenName?: string;
    AliasSuffixName?: string;
    DateOfBirth?: string;
    DocumentExpirationDate?: string;
    DocumentIssueDate?: string;
    EyeColor?: string;
    FirstName?: string;
    Gender?: Gender;
    HairColor?: string;
    Height?: string;
    IsMale?: boolean;
    IssuerId?: string;
    JurisdictionVersion?: string;
    LastName?: string;
    LicenseId?: string;
    MiddleName?: string;
    NameSuffix?: string;
    OrganDonor?: boolean;
    PlaceOfBirth?: string;
    RaceEthnicity?: string;
    Under18Until?: string;
    Under19Until?: string;
    Under21Until?: string;
    Veteran?: boolean;
    WeightRange?: string;
}
