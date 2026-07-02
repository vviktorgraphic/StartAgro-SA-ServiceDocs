import { WorkOrder } from "../models/WorkOrder";
import { nameParser } from "./NameParser";

export class MatcherService {

    public match(
        pdfFiles: string[],
        imageFiles: string[]
    ): WorkOrder[] {

        const workOrders: WorkOrder[] = [];

        for (const pdf of pdfFiles) {

            const pdfFileName =
                pdf.split(/[\\/]/).pop() ?? pdf;

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

                pdfFile: pdf,

                imageFiles: images,

                serviceVisits: []

            });

        }

        return workOrders;

    }

}

export const matcherService =
    new MatcherService();