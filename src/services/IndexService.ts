import { serviceVisitRepository } from "../database/ServiceVisitRepository";
import { workOrderImportRepository } from "../database/WorkOrderImportRepository";
import { workOrderRepository } from "../database/WorkOrderRepository";
import { WorkOrder } from "../models/WorkOrder";
import { WorkOrderImport } from "../models/WorkOrderImport";
import {
    PdfFile,
    tauriService
} from "../tauri/TauriService";
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

        const imports =
            await workOrderImportRepository.loadAll();

        const importByPath =
            this.createImportMap(
                imports
            );

        const pdfFileByPath =
            this.createPdfFileMap(
                result.pdf_files
            );

        await this.deleteMissingRecords(
            imports,
            pdfFileByPath
        );

        for (const workOrder of workOrders) {

            try {

                const pdfFile =
                    pdfFileByPath.get(
                        workOrder.pdfFile
                    );

                if (!pdfFile) {
                    continue;
                }

                const workOrderImport =
                    this.createWorkOrderImport(
                        workOrder,
                        pdfFile
                    );

                if (!this.shouldParse(
                    workOrderImport,
                    importByPath
                )) {
                    continue;
                }

                await this.parseAndSave(
                    workOrder,
                    workOrderImport
                );

            } catch (error) {

                console.error(
                    `PDF feldolgozasi hiba: ${workOrder.pdfFile}`,
                    error
                );

            }

        }

        return workOrders;

    }

    private createImportMap(
        imports: WorkOrderImport[]
    ): Map<string, WorkOrderImport> {

        return new Map(
            imports.map(workOrderImport => [
                workOrderImport.pdfFile,
                workOrderImport
            ])
        );

    }

    private createPdfFileMap(
        pdfFiles: PdfFile[]
    ): Map<string, PdfFile> {

        return new Map(
            pdfFiles.map(pdfFile => [
                pdfFile.path,
                pdfFile
            ])
        );

    }

    private async deleteMissingRecords(
        imports: WorkOrderImport[],
        pdfFileByPath: Map<string, PdfFile>
    ): Promise<void> {

        for (const workOrderImport of imports) {

            if (pdfFileByPath.has(workOrderImport.pdfFile)) {
                continue;
            }

            await workOrderRepository.deleteByWorkOrderNumber(
                workOrderImport.workOrderNumber
            );

            await workOrderImportRepository.deleteByWorkOrderNumber(
                workOrderImport.workOrderNumber
            );

        }

    }

    private createWorkOrderImport(
        workOrder: WorkOrder,
        pdfFile: PdfFile
    ): WorkOrderImport {

        return {

            workOrderNumber: workOrder.workOrderNumber,

            pdfFile: workOrder.pdfFile,

            pdfLastModified: pdfFile.last_modified,

            pdfFileSize: pdfFile.file_size

        };

    }

    private shouldParse(
        workOrderImport: WorkOrderImport,
        importByPath: Map<string, WorkOrderImport>
    ): boolean {

        const existing =
            importByPath.get(
                workOrderImport.pdfFile
            );

        if (!existing) {
            return true;
        }

        return existing.pdfLastModified !== workOrderImport.pdfLastModified
            || existing.pdfFileSize !== workOrderImport.pdfFileSize;

    }

    private async parseAndSave(
        workOrder: WorkOrder,
        workOrderImport: WorkOrderImport
    ): Promise<void> {

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

        const workOrderId =
            await workOrderRepository.save(
                workOrder
            );

        await serviceVisitRepository.save(
            workOrderId,
            workOrder.serviceVisits
        );

        await workOrderImportRepository.save(
            workOrderImport
        );

    }

}

export const indexService =
    new IndexService();
