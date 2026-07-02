import { fieldExtractor } from "./FieldExtractor";

export interface ParsedPdfData {

    partnerName?: string;

    taxNumber?: string;

    contactName?: string;

    machineType?: string;

    serialNumber?: string;

    workType?: string;

    reportedIssue?: string;

    completedWork?: string;

}

export class PdfParser {

    public parse(text: string): ParsedPdfData {

        return {

            partnerName:
                fieldExtractor.extract(
                    text,
                    "Partner neve"
                ) ?? undefined,

            taxNumber:
                fieldExtractor.extract(
                    text,
                    "Adószám"
                ) ?? undefined,

            contactName:
                fieldExtractor.extract(
                    text,
                    "Kapcsolattartó"
                ) ?? undefined,

            machineType:
                fieldExtractor.extract(
                    text,
                    "Gép típusa"
                ) ?? undefined,

            serialNumber:
                fieldExtractor.extract(
                    text,
                    "Alvázszám"
                ) ?? undefined,

            workType:
                fieldExtractor.extract(
                    text,
                    "Munka típusa"
                ) ?? undefined,

            reportedIssue:
                fieldExtractor.extractMultiLine(
                    text,
                    "Bejelentett hiba részletei",
                    "Elvégzett munka részletes leírása"
                ) ?? undefined,

            completedWork:
                fieldExtractor.extractMultiLine(
                    text,
                    "Elvégzett munka részletes leírása",
                    "Felhasznált anyagok"
                ) ?? undefined

        };

    }

}

export const pdfParser = new PdfParser();