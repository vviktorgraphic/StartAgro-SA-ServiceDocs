import { DiscoveredWorkOrder } from "../models/DiscoveredWorkOrder";
import { nameParser } from "./NameParser";

export class MatcherService {

    public match(
        pdfFiles: string[],
        imageFiles: string[]
    ): DiscoveredWorkOrder[] {

        const workOrders: DiscoveredWorkOrder[] = [];

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

                imageFiles: images

            });

        }

        return workOrders;

    }

}

export const matcherService =
    new MatcherService();