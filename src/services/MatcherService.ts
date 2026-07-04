import { WorkOrder } from "../models/WorkOrder";
import { PdfFile } from "./TauriService";
import { nameParser } from "./NameParser";

export class MatcherService {

    public match(
        pdfFiles: PdfFile[],
        imageFiles: string[]
    ): WorkOrder[] {

        const workOrders: WorkOrder[] = [];

        for (const pdf of pdfFiles) {

            const pdfFileName =
                pdf.path.split(/[\\/]/).pop() ?? pdf.path;

            const parsed =
                nameParser.parse(pdfFileName);

            if (!parsed) {
                continue;
            }

            const images = imageFiles.filter(image => {

                const imageFileName =
                    image.split(/[\\/]/).pop() ?? image;

                return imageFileName.startsWith(
                    parsed.workOrderNumber
                );

            });

            workOrders.push({

                workOrderNumber: parsed.workOrderNumber,

                prefix: parsed.prefix,

                pdfFile: pdf.path,

                imageFiles: images,

                serviceVisits: []

            });

        }

        return workOrders;

    }

}

export const matcherService =
    new MatcherService();