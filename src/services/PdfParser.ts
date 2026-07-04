import { PdfTextItem } from "../models/PdfTextItem";
import { ServiceVisit } from "../models/ServiceVisit";
import { fieldExtractor } from "./FieldExtractor";
import { serviceVisitParser } from "./ServiceVisitParser";

export interface ParsedPdfData {

    partnerName?: string;

    taxNumber?: string;

    contactName?: string;

    email?: string;

    phone?: string;

    machineType?: string;

    serialNumber?: string;

    workType?: string;

    reportedIssue?: string;

    completedWork?: string;

    billingAddress?: string;

    serviceLocation?: string;

    materialTotal?: string;

    totalKilometers?: string;

    totalWorkHours?: string;

    washing?: string;

    closedAt?: string;

    handedOverBy?: string;

    receivedBy?: string;

    serviceVisits: ServiceVisit[];

}

export class PdfParser {

    public parse(
        pages: string[],
        textItems: PdfTextItem[]
    ): ParsedPdfData {

        const firstPage =
            pages[0] ?? "";

        const allPages =
            pages.join("\n");

        const serviceVisits =
            serviceVisitParser.parse(textItems);

        return {

            partnerName:
                this.extractField(
                    firstPage,
                    ["Partner neve"]
                ) ?? undefined,

            taxNumber:
                this.extractField(
                    firstPage,
                    ["Adószám"]
                ) ?? undefined,

            contactName:
                this.extractField(
                    firstPage,
                    ["Kapcsolattartó"]
                ) ?? undefined,

            email:
                this.extractField(
                    firstPage,
                    ["Email"]
                ) ?? undefined,

            phone:
                this.extractField(
                    firstPage,
                    ["Telefon"]
                ) ?? undefined,

            machineType:
                this.extractField(
                    firstPage,
                    ["Gép típusa"]
                ) ?? undefined,

            serialNumber:
                this.extractField(
                    firstPage,
                    ["Alvázszám"]
                ) ?? undefined,

            workType:
                this.extractField(
                    firstPage,
                    ["Munka típusa"]
                ) ?? undefined,

            reportedIssue:
                fieldExtractor.extractMultiLine(
                    firstPage,
                    "Bejelentett hiba részletei",
                    "Elvégzett munka részletes leírása"
                ) ?? undefined,

            completedWork:
                fieldExtractor.extractMultiLine(
                    firstPage,
                    "Elvégzett munka részletes leírása",
                    "Fotó"
                ) ?? undefined,

            billingAddress:
                this.extractField(
                    allPages,
                    ["Számlázási cím", "Szamlazasi cim"]
                ) ?? undefined,

            serviceLocation:
                this.extractField(
                    allPages,
                    ["Szerviz helyszíne", "Szerviz helyszine"]
                ) ?? undefined,

            materialTotal:
                this.extractField(
                    allPages,
                    ["Rezsianyag összesen (Ft)", "Rezsianyag osszesen (Ft)"]
                ) ?? undefined,

            totalKilometers:
                this.extractField(
                    allPages,
                    ["Megtett km összesen", "Megtett km osszesen"]
                ) ?? undefined,

            totalWorkHours:
                this.extractField(
                    allPages,
                    ["Munkaidő összesen (óra)", "Munkaido osszesen (ora)"]
                ) ?? undefined,

            washing:
                this.extractField(
                    allPages,
                    ["Mosás", "Mosas"]
                ) ?? undefined,

            closedAt:
                this.extractField(
                    allPages,
                    [
                        "Munkalap lezárásának dátuma",
                        "Munkalap lezarasanak datuma"
                    ]
                ) ?? undefined,

            handedOverBy:
                this.extractField(
                    allPages,
                    [
                        "Átadó (szerviz technikus) neve",
                        "Atado (szerviz technikus) neve"
                    ]
                ) ?? undefined,

            receivedBy:
                this.extractField(
                    allPages,
                    [
                        "Átvevő (gép tulajdonosa vagy megbízottja) neve",
                        "Atvevo (gep tulajdonosa vagy megbizottja) neve"
                    ]
                ) ?? undefined,

            serviceVisits

        };

    }

    private extractField(
        text: string,
        labels: string[]
    ): string | null {

        for (const label of labels) {

            const value =
                fieldExtractor.extract(
                    text,
                    label
                );

            if (value) {
                return value;
            }

        }

        const lines =
            text
                .replace(/\r/g, "")
                .split("\n")
                .map(line => line.trim());

        for (const label of labels) {

            const line =
                lines.find(item => item.startsWith(label));

            const value =
                line
                    ?.slice(label.length)
                    .replace(/^[:\-\s]+/, "")
                    .trim();

            if (value) {
                return value;
            }

        }

        return null;

    }

}

export const pdfParser = new PdfParser();
