import { parseLicense } from "../src/index";

jest.mock('../src/aamva-parsers/aamva-08', () => {
  return {
    AAMVA08Parser: jest.fn().mockImplementation(() => {
      return {parse: jest.fn().mockReturnValue({version: '08'})};
    })
  };
});

jest.mock('../src/aamva-parsers/aamva-09', () => {
  return {
    AAMVA09Parser: jest.fn().mockImplementation(() => {
      return {parse: jest.fn().mockReturnValue({version: '09'})};
    })
  };
});

jest.mock('../src/aamva-parsers/aamva-10', () => {
  return {
    AAMVA10Parser: jest.fn().mockImplementation(() => {
      return {parse: jest.fn().mockReturnValue({version: '10'})};
    })
  };
});

describe('parseLicense', () => {
  it('should parse AAMVA08 barcode correctly', () => {
    const barcode = '@ANSI 12345608...';
    expect(parseLicense(barcode)).toEqual({version: '08'});
  });

  it('should parse AAMVA09 barcode correctly', () => {
    const barcode = '@ANSI 12345609...';
    expect(parseLicense(barcode)).toEqual({version: '09'});
  });

  it('should parse AAMVA10 barcode correctly', () => {
    const barcode = '@ANSI 12345610...';
    expect(parseLicense(barcode)).toEqual({version: '10'});
  });

  it('should throw an error for invalid header', () => {
    const barcode = 'INVALID HEADER';
    expect(() => parseLicense(barcode)).toThrow('Missing ANSI Header, unable to determine version');
  });
});