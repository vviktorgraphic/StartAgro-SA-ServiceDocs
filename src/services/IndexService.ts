import { workOrderRepository } from "../database/WorkOrderRepository";
import { WorkOrder } from "../models/WorkOrder";
import { tauriService } from "../tauri/TauriService";
import { matcherService } from "./MatcherService";
import { pdfParser } from "./PdfParser";
import { pdfService } from "./PdfService";

export class IndexService {

    public async run(
        folder: string
    ): Promise<WorkOrder[]> {

        const result =
            await tauriService.scanDocuments(folder);

        console.log(
            `PDF: ${result.pdf_count}, JPG: ${result.image_count}`
        );

        const workOrders =
            matcherService.match(
                result.pdf_files,
                result.image_files
            );

        console.log(
            `Felismert munkalapok: ${workOrders.length}`
        );

        for (const workOrder of workOrders) {

            try {

                const pages =
                    await pdfService.readPages(
                        workOrder.pdfFile
                    );

                const textItems =
                    await pdfService.readTextItems(
                        workOrder.pdfFile
                    );

                const parsed =
                    pdfParser.parse(
                        pages,
                        textItems
                    );

                Object.assign(
                    workOrder,
                    parsed
                );

                await workOrderRepository.save(
                    workOrder
                );

            } catch (error) {

                console.error(
                    `PDF feldolgozási hiba: ${workOrder.pdfFile}`,
                    error
                );

            }

        }

        return workOrders;

    }

}

export const indexService =
    new IndexService();