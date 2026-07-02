import { PdfTextItem } from "../models/PdfTextItem";
import { ServiceVisit } from "../models/ServiceVisit";
import { fieldExtractor } from "./FieldExtractor";
import { serviceVisitParser } from "./ServiceVisitParser";

export interface ParsedPdfData {

    partnerName?: string;

    taxNumber?: string;

    contactName?: string;

    machineType?: string;

    serialNumber?: string;

    workType?: string;

    reportedIssue?: string;

    completedWork?: string;

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
                fieldExtractor.extract(
                    firstPage,
                    "Partner neve"
                ) ?? undefined,

            taxNumber:
                fieldExtractor.extract(
                    firstPage,
                    "Adószám"
                ) ?? undefined,

            contactName:
                fieldExtractor.extract(
                    firstPage,
                    "Kapcsolattartó"
                ) ?? undefined,
            email:
                fieldExtractor.extract(
                    firstPage,
                    "Email"
                ) ?? undefined,

            phone:
                fieldExtractor.extract(
                    firstPage,
                    "Telefon"
                ) ?? undefined,    

            machineType:
                fieldExtractor.extract(
                    firstPage,
                    "Gép típusa"
                ) ?? undefined,

            serialNumber:
                fieldExtractor.extract(
                    firstPage,
                    "Alvázszám"
                ) ?? undefined,

            workType:
                fieldExtractor.extract(
                    firstPage,
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

            serviceVisits

        };

    }

}

export const pdfParser = new PdfParser();