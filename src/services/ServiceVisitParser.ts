import { PdfTextItem } from "../models/PdfTextItem";
import { ServiceVisit } from "../models/ServiceVisit";

export class ServiceVisitParser {

    public parse(
    items: PdfTextItem[]
): ServiceVisit[] {

    const secondPage = items.filter(
        item =>
            item.page === 2 &&
            item.text.trim().length > 0
    );

    const rows = this.groupRows(secondPage);

    const visits: ServiceVisit[] = [];

    for (const row of rows) {

        row.sort((a, b) => a.x - b.x);

        const values =
            row.map(item => item.text.trim());

        // Csak dátummal kezdődő sorokat dolgozunk fel
        if (!/^\d{4}-\d{2}-\d{2}$/.test(values[0])) {
            continue;
        }

        visits.push({

            date: values[0],

            technician: values[1] ?? "",

            travelCost: Number(values[2] ?? 0),

            kilometers: Number(values[3] ?? 0),

            workHours: Number(values[4] ?? 0),

            shortDescription: values[5] ?? ""

        });

    }

    console.table(visits);

    return visits;

}

    private groupRows(
        items: PdfTextItem[]
    ): PdfTextItem[][] {

        const sorted = [...items].sort((a, b) => {

            if (Math.abs(a.y - b.y) < 2) {
                return a.x - b.x;
            }

            return b.y - a.y;

        });

        const rows: PdfTextItem[][] = [];

        for (const item of sorted) {

            let row = rows.find(r =>
                Math.abs(r[0].y - item.y) < 2
            );

            if (!row) {

                row = [];

                rows.push(row);

            }

            row.push(item);

        }

        return rows;

    }

}

export const serviceVisitParser =
    new ServiceVisitParser();