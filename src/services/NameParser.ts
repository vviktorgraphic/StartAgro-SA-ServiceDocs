export interface ParsedFileName {

    prefix: string;

    number: string;

    workOrderNumber: string;

}

export class NameParser {

    public parse(fileName: string): ParsedFileName | null {

        const match =
            /^([A-Z]{2})-(\d+)/i.exec(fileName);

        if (!match) {

            return null;

        }

        return {

            prefix: match[1].toUpperCase(),

            number: match[2],

            workOrderNumber:
                `${match[1].toUpperCase()}-${match[2]}`

        };

    }

}

export const nameParser =
    new NameParser();