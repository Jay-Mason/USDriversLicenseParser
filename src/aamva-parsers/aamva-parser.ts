export class AAMVAParser {
    public parse(raw: string, fieldDefinitions: string[]): Map<string, string> {
        const result = new Map<string, string>();

        const fieldsPattern = fieldDefinitions.join("|");
        const regex = new RegExp(`(${fieldsPattern})(.*?)(?=${fieldsPattern}|$)`, "g");

        let match;

        while ((match = regex.exec(raw)) !== null) {
            const field = match[1];
            const value = match[2].trim();

            if (fieldDefinitions.some(x => x === field)) {
                result.set(field, value);
            }
        }

        return result;
    }
}