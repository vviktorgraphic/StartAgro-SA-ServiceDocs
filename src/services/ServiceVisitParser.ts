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

            const values = row
                .map(item => item.text.trim())
                .filter(value => value.length > 0);

            // dátummal kell kezdődnie
            if (!/^\d{4}-\d{2}-\d{2}$/.test(values[0])) {
                continue;
            }

            // legalább 5 oszlop kell
            if (values.length < 5) {
                continue;
            }

            // technikus kötelező
            if (values[1].length === 0) {
                continue;
            }

            // km és óra legyen szám
            if (
                isNaN(Number(values[3])) ||
                isNaN(Number(values[4]))
            ) {
                continue;
            }

            visits.push({

                date: values[0],

                technician: values[1],

                travelCost: Number(values[2]),

                kilometers: Number(values[3]),

                workHours: Number(values[4]),

                shortDescription: values[5] ?? ""

            });

        }

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