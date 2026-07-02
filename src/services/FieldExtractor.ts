export class FieldExtractor {

    public extract(
        text: string,
        label: string
    ): string | null {

        const lines = text
            .split(/\r?\n/)
            .map(line => line.trim());

        const index = lines.findIndex(
            line => line === label
        );

        if (index === -1) {
            return null;
        }

        if (index + 1 >= lines.length) {
            return null;
        }

        const value = lines[index + 1].trim();

        return value.length > 0
            ? value
            : null;

    }

}

export const fieldExtractor =
    new FieldExtractor();