import { DriversLicense } from "./DriversLicense";

function startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function parseAamvaDate(value?: string): Date | undefined {
    if (!value || value.length !== 8 || !/^\d{8}$/.test(value)) {
        return undefined;
    }

    const month = parseInt(value.substring(0, 2), 10);
    const day = parseInt(value.substring(2, 4), 10);
    const year = parseInt(value.substring(4, 8), 10);

    if (month < 1 || month > 12 || day < 1 || day > 31) {
        return undefined;
    }

    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
        return undefined;
    }

    return date;
}

export function isExpired(license: DriversLicense, asOf: Date = new Date()): boolean | undefined {
    const expiration = parseAamvaDate(license.DocumentExpirationDate);
    if (!expiration) {
        return undefined;
    }

    return startOfDay(asOf) > startOfDay(expiration);
}

export function getAge(license: DriversLicense, asOf: Date = new Date()): number | undefined {
    const dateOfBirth = parseAamvaDate(license.DateOfBirth);
    if (!dateOfBirth) {
        return undefined;
    }

    let age = asOf.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = asOf.getMonth() - dateOfBirth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && asOf.getDate() < dateOfBirth.getDate())) {
        age--;
    }

    return age;
}

export function isUnder21(license: DriversLicense, asOf: Date = new Date()): boolean | undefined {
    const under21Until = parseAamvaDate(license.Under21Until);
    if (under21Until) {
        return startOfDay(asOf) <= startOfDay(under21Until);
    }

    const age = getAge(license, asOf);
    if (age === undefined) {
        return undefined;
    }

    return age < 21;
}
