# U.S. Drivers License Parser

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/Jay-Mason/USDriversLicenseParser/blob/main/LICENSE)
[![npm version](https://img.shields.io/npm/v/usdriverslicenseparser.svg)](https://www.npmjs.com/package/usdriverslicenseparser)

Parse PDF417 barcode data from U.S. driver's licenses and ID cards encoded according to [AAMVA](https://www.aamva.org/) standards (versions `03` through `10`).

Zero runtime dependencies. Works in Node.js and browsers.

## Install

```bash
npm install usdriverslicenseparser
```

## Quick start

```typescript
import { parseLicense, parseLicenseSafe, parseAamvaDate, isExpired } from "usdriverslicenseparser";

const license = parseLicense(barcodeText);

console.log(license.FirstName);
console.log(license.LastName);
console.log(license.DocumentExpirationDate);
console.log(license.AamvaVersion);
console.log(isExpired(license));

const expiration = parseAamvaDate(license.DocumentExpirationDate);
```

For production UIs and APIs, prefer the non-throwing helper:

```typescript
import { parseLicenseSafe } from "usdriverslicenseparser";

const result = parseLicenseSafe(barcodeText);

if (result.success) {
  console.log(result.data.FirstName);
} else {
  console.error(result.code, result.error);
}
```

## API

### Parsing

| Function | Description |
|----------|-------------|
| `parseLicense(barcode)` | Parse a raw barcode string. Throws typed errors on failure. |
| `parseLicenseSafe(barcode)` | Same as above, but returns `{ success, data }` or `{ success, error, code }`. |
| `normalizeBarcode(barcode)` | Normalize scanner output (`\r\n` → `\n`, trim whitespace). Applied automatically by `parseLicense`. |

### Helpers

| Function | Description |
|----------|-------------|
| `parseAamvaDate(value)` | Convert an AAMVA date string (`MMDDYYYY`) to a `Date`, or `undefined` if invalid. |
| `isExpired(license, asOf?)` | Returns whether the license is expired, or `undefined` if no expiration date is present. |
| `getAge(license, asOf?)` | Returns age in whole years, or `undefined` if date of birth is missing/invalid. |
| `isUnder21(license, asOf?)` | Uses `Under21Until` when present, otherwise falls back to age. |

### Metadata

Every successful parse includes header metadata:

| Field | Description |
|-------|-------------|
| `AamvaVersion` | AAMVA standard version (`03`–`10`) |
| `IssuerId` | Six-digit issuer identification number (IIN) |
| `JurisdictionVersion` | Jurisdiction-specific version number |

### Errors

| Error | Code | When |
|-------|------|------|
| `MissingHeaderError` | `MISSING_HEADER` | Barcode does not contain a valid `@ANSI` header |
| `UnsupportedVersionError` | `UNSUPPORTED_VERSION` | AAMVA version is not supported |
| `MalformedBarcodeError` | `MALFORMED_BARCODE` | DL subfile data could not be parsed |

## Supported versions

| AAMVA Version | Parser |
|---------------|--------|
| `03`, `04` | AAMVA 03 (combined `DCT` given name) |
| `05`–`07` | AAMVA 05 |
| `08` | AAMVA 08 |
| `09` | AAMVA 09 |
| `10` | AAMVA 10 |

## Parsed fields

| Field | AAMVA ID | Notes |
|-------|----------|-------|
| `FirstName` | `DAC` / `DCT` | Split from `DCT` on v03 |
| `MiddleName` | `DAD` / `DCT` | |
| `LastName` | `DCS` | |
| `LicenseId` | `DAQ` | |
| `DateOfBirth` | `DBB` | Raw `MMDDYYYY` string |
| `DocumentIssueDate` | `DBD` | |
| `DocumentExpirationDate` | `DBA` | |
| `Gender` | `DBC` | `Male`, `Female`, or `NotSpecified` |
| `IsMale` | `DBC` | Kept for backward compatibility |
| `AddressStreet` | `DAG` | |
| `AddressStreet2` | `DAH` | |
| `AddressCity` | `DAI` | |
| `AddressState` | `DAJ` | |
| `AddressPostalCode` | `DAK` | |
| `OrganDonor` | `DDK` | |
| `Veteran` | `DDL` | |
| `Under21Until` | `DDJ` | |

See `DriversLicense` in the source for the full list of optional fields.

## Privacy & security

This library parses sensitive personally identifiable information (PII) including names, addresses, dates of birth, and license numbers.

- All parsing happens **locally** in your application — this library does not transmit data anywhere.
- You are responsible for securely handling, storing, transmitting, and retaining any parsed license data in compliance with applicable laws and your own privacy policies.
- Avoid logging raw barcode strings or parsed PII in production systems.

## Contributing

Contributions are welcome! Please open an issue or pull request on [GitHub](https://github.com/Jay-Mason/USDriversLicenseParser).

## License

MIT
