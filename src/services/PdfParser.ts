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

    deliveryNoteNumber?: string;

    operatingHours?: string;

    otherAgreements?: string;

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

        const serviceVisits =
            serviceVisitParser.parse(textItems);

        return {

            partnerName:
                this.extractBelow(
                    textItems,
                    "Partner neve"
                ) ?? undefined,

            taxNumber:
                this.extractBelow(
                    textItems,
                    "Adószám"
                ) ?? undefined,

            billingAddress:
                this.extractBelow(
                    textItems,
                    "Számlázási cím",
                    3,
                    48
                ) ?? undefined,

            serviceLocation:
                this.extractBelow(
                    textItems,
                    "Szerviz helyszíne",
                    3,
                    48
                ) ?? undefined,

            contactName:
                this.extractBelow(
                    textItems,
                    "Kapcsolattartó"
                ) ?? undefined,

            phone:
                this.extractBelow(
                    textItems,
                    "Telefon"
                ) ?? undefined,

            email:
                this.extractBelow(
                    textItems,
                    "Email"
                ) ?? undefined,

            deliveryNoteNumber:
                this.extractBelow(
                    textItems,
                    "Szállítólevél száma"
                ) ?? undefined,

            machineType:
                this.extractBelow(
                    textItems,
                    "Gép típusa"
                ) ?? undefined,

            serialNumber:
                this.extractBelow(
                    textItems,
                    "Alvázszám"
                ) ?? undefined,

            operatingHours:
                this.extractBelow(
                    textItems,
                    "Üzemóra | Bála | Hektár"
                ) ?? undefined,

            otherAgreements:
                this.extractBelow(
                    textItems,
                    "Egyéb megállapodások"
                ) ?? undefined,

            workType:
                this.extractBelow(
                    textItems,
                    "Munka típusa"
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

            materialTotal:
                this.extractBelow(
                    textItems,
                    "Rezsianyag összesen (Ft)",
                    1,
                    24
                ) ?? undefined,

            totalKilometers:
                this.extractBelow(
                    textItems,
                    "Megtett km összesen",
                    1,
                    24
                ) ?? undefined,

            totalWorkHours:
                this.extractBelow(
                    textItems,
                    "Munkaidő összesen (óra)",
                    1,
                    24
                ) ?? undefined,

            washing:
                this.extractBelow(
                    textItems,
                    "Mosás",
                    1,
                    24
                ) ?? undefined,

            closedAt:
                this.extractBelow(
                    textItems,
                    "Munkalap lezárásának dátuma"
                ) ?? undefined,

            handedOverBy:
                this.extractBelow(
                    textItems,
                    "Átadó (szerviz technikus) neve"
                ) ?? undefined,

            receivedBy:
                this.extractBelow(
                    textItems,
                    "Átvevő (gép tulajdonosa vagy megbízottja) neve"
                ) ?? undefined,

            serviceVisits

        };

    }

    private extractBelow(
        items: PdfTextItem[],
        label: string,
        maxLines = 1,
        maxDistance = 24
    ): string | null {

        const labelItem =
            items.find(item => item.text.trim() === label);

        if (!labelItem) {
            return null;
        }

        const values =
            items
                .filter(item =>
                    item.page === labelItem.page &&
                    Math.abs(item.x - labelItem.x) < 4 &&
                    item.y < labelItem.y &&
                    labelItem.y - item.y <= maxDistance &&
                    item.text.trim().length > 0
                )
                .sort((a, b) => b.y - a.y)
                .slice(0, maxLines)
                .map(item => item.text.trim());

        return values.length > 0
            ? values.join("\n")
            : null;

    }

}

export const pdfParser = new PdfParser();
