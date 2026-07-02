import {
    getDocument,
    GlobalWorkerOptions,
    type TextItem
} from "pdfjs-dist";

import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

import { PdfTextItem } from "../models/PdfTextItem";
import { tauriService } from "../tauri/TauriService";

GlobalWorkerOptions.workerSrc = pdfWorker;

export class PdfService {

    public async open(pdfPath: string) {

        const bytes =
            await tauriService.readPdfBytes(pdfPath);

        const pdf = await getDocument({
            data: bytes
        }).promise;

        console.log(
            `PDF betöltve: ${pdf.numPages} oldal`
        );

        return pdf;

    }

    public async readFirstPageText(
        pdfPath: string
    ): Promise<string> {

        const pdf = await this.open(pdfPath);

        const page = await pdf.getPage(1);

        const content = await page.getTextContent();

        const text = content.items
            .map(item => (item as TextItem).str)
            .join("\n");

        return text;

    }

    public async readPages(
        pdfPath: string
    ): Promise<string[]> {

        const pdf = await this.open(pdfPath);

        const pages: string[] = [];

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {

            const page = await pdf.getPage(pageNumber);

            const content = await page.getTextContent();

            const text = content.items
                .map(item => (item as TextItem).str)
                .join("\n");

            pages.push(text);

        }

        return pages;

    }

    public async readTextItems(
        pdfPath: string
    ): Promise<PdfTextItem[]> {

        const pdf = await this.open(pdfPath);

        const items: PdfTextItem[] = [];

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {

            const page = await pdf.getPage(pageNumber);

            const content = await page.getTextContent();

            for (const item of content.items) {

                const textItem = item as TextItem;

                items.push({

                    text: textItem.str,

                    x: textItem.transform[4],

                    y: textItem.transform[5],

                    page: pageNumber

                });

            }

        }

        return items;

    }

    public async readAllText(
        pdfPath: string
    ): Promise<string> {

        const pages =
            await this.readPages(pdfPath);

        return pages.join("\n\n");

    }

}

export const pdfService = new PdfService();