export function normalizeBarcode(raw: string): string {
    return raw.replace(/\r\n?/g, "\n").trim();
}
