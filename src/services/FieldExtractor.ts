export class FieldExtractor {

    /**
     * Egy mező értékének kiolvasása.
     *
     * Példa:
     *
     * Partner neve
     * Agro-Reform Kft
     */
    public extract(
        text: string,
        label: string
    ): string | null {

        const lines = this.normalize(text);

        const index = lines.findIndex(
            line => line === label
        );

        if (index === -1) {
            return null;
        }

        for (let i = index + 1; i < lines.length; i++) {

            if (lines[i].length > 0) {
                return lines[i];
            }

        }

        return null;

    }

    /**
     * Többsoros mező kiolvasása.
     *
     * A következő címkéig olvas.
     */
    public extractMultiLine(
        text: string,
        startLabel: string,
        endLabel: string
    ): string | null {

        const lines = this.normalize(text);

        const start = lines.findIndex(
            line => line === startLabel
        );

        if (start === -1) {
            return null;
        }

        const values: string[] = [];

        for (let i = start + 1; i < lines.length; i++) {

            const line = lines[i];

            if (line === endLabel) {
                break;
            }

            if (line.length > 0) {
                values.push(line);
            }

        }

        return values.length > 0
            ? values.join("\n")
            : null;

    }

    /**
     * Egységesíti a PDF-ből kapott szöveget.
     */
    private normalize(text: string): string[] {

        return text
            .replace(/\r/g, "")
            .split("\n")
            .map(line => line.trim());

    }

}

export const fieldExtractor =
    new FieldExtractor();