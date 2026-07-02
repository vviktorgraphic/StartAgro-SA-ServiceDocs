import { getDocument } from "pdfjs-dist";

import { tauriService } from "../tauri/TauriService";

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
            .map((item: any) => item.str ?? "")
            .join("\n");

        return text;

    }

}

export const pdfService = new PdfService();

