import { WorkOrder } from "../models/WorkOrder";
import { PdfFile } from "../tauri/TauriService";
import { nameParser } from "./NameParser";

export class MatcherService {

    public match(
        pdfFiles: PdfFile[],
        imageFiles: string[]
    ): WorkOrder[] {

        const workOrders: WorkOrder[] = [];
        const imageFilesByWorkOrderNumber =
            this.createImageFileMap(
                imageFiles
            );

        for (const pdf of pdfFiles) {

            try {

                const pdfFileName =
                    this.getFileName(
                        pdf.path
                    );

                const parsed =
                    nameParser.parse(pdfFileName);

                if (!parsed) {
                    continue;
                }

                const images =
                    imageFilesByWorkOrderNumber.get(
                        parsed.workOrderNumber
                    ) ?? [];

                workOrders.push({

                    workOrderNumber: parsed.workOrderNumber,

                    prefix: parsed.prefix,

                    pdfFile: pdf.path,

                    imageFiles: images,

                    serviceVisits: []

                });

            } catch (error) {

                console.error(
                    `Munkalap parositasi hiba: ${pdf.path}`,
                    error
                );

            }

        }

        return workOrders;

    }

    private createImageFileMap(
        imageFiles: string[]
    ): Map<string, string[]> {

        const imageFilesByWorkOrderNumber =
            new Map<string, string[]>();

        for (const image of imageFiles) {

            try {

                const imageFileName =
                    this.getFileName(
                        image
                    );

                const parsed =
                    nameParser.parse(imageFileName);

                if (!parsed) {
                    continue;
                }

                const images =
                    imageFilesByWorkOrderNumber.get(
                        parsed.workOrderNumber
                    ) ?? [];

                images.push(image);

                imageFilesByWorkOrderNumber.set(
                    parsed.workOrderNumber,
                    images
                );

            } catch (error) {

                console.error(
                    `Kep parositasi hiba: ${image}`,
                    error
                );

            }

        }

        return imageFilesByWorkOrderNumber;

    }

    private getFileName(
        path: string
    ): string {

        return path.split(/[\\/]/).pop() ?? path;

    }

}

export const matcherService =
    new MatcherService();
