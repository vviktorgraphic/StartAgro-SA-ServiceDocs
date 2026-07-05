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

export interface IndexingSummary {
    scannedPdfs: number;
    scannedImages: number;
    parsed: number;
    skipped: number;
    deleted: number;
    errors: number;
    processed: number;
    totalCandidates: number;
}

export interface IndexingResult {
    workOrders: WorkOrder[];
    summary: IndexingSummary;
}

export type IndexingProgress = IndexingSummary;

export const INDEX_BATCH_SIZE = 100;

export class IndexService {

    public async run(
        folder: string,
        onProgress?: (progress: IndexingProgress) => void
    ): Promise<IndexingResult> {

        const result =
            await tauriService.scanDocuments(folder);

        console.log(
            `PDF: ${result.pdf_count}, JPG: ${result.image_count}`
        );

        let parsedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;
        let processedCount = 0;

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

        const deletedCount =
            await this.deleteMissingRecords(
                imports,
                pdfFileByPath
            );

        const totalCandidates =
            workOrders.length;

        const createSummary = (): IndexingSummary => ({
            scannedPdfs: result.pdf_count,
            scannedImages: result.image_count,
            parsed: parsedCount,
            skipped: skippedCount,
            deleted: deletedCount,
            errors: errorCount,
            processed: processedCount,
            totalCandidates
        });

        onProgress?.(
            createSummary()
        );

        for (let index = 0; index < workOrders.length; index++) {

            const workOrder =
                workOrders[index];

            try {

                const pdfFile =
                    pdfFileByPath.get(
                        this.normalizePath(
                            workOrder.pdfFile
                        )
                    );

                if (!pdfFile) {
                    processedCount++;
                    onProgress?.(
                        createSummary()
                    );

                    if (this.isBatchEnd(index)) {
                        await this.yieldToUi();
                    }

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
                    skippedCount++;
                    processedCount++;

                    await workOrderRepository.updateImageFiles(
                        workOrder.workOrderNumber,
                        workOrder.imageFiles
                    );

                    onProgress?.(
                        createSummary()
                    );

                    if (this.isBatchEnd(index)) {
                        await this.yieldToUi();
                    }

                    continue;
                }

                await this.parseAndSave(
                    workOrder,
                    workOrderImport
                );

                parsedCount++;
                processedCount++;

            } catch (error) {

                errorCount++;
                processedCount++;

                console.error(
                    `PDF feldolgozasi hiba: ${workOrder.pdfFile}`,
                    error
                );

            }

            onProgress?.(
                createSummary()
            );

            if (this.isBatchEnd(index)) {
                await this.yieldToUi();
            }

        }

        const summary =
            createSummary();

        console.log(
            [
                `Index scanned PDFs: ${summary.scannedPdfs}`,
                `images: ${summary.scannedImages}`,
                `parsed: ${summary.parsed}`,
                `skipped: ${summary.skipped}`,
                `deleted: ${summary.deleted}`,
                `errors: ${summary.errors}`,
                `processed: ${summary.processed}`,
                `total candidates: ${summary.totalCandidates}`
            ].join(", ")
        );

        return {
            workOrders,
            summary
        };

    }

    private createImportMap(
        imports: WorkOrderImport[]
    ): Map<string, WorkOrderImport> {

        return new Map(
            imports.map(workOrderImport => [
                this.normalizePath(
                    workOrderImport.pdfFile
                ),
                workOrderImport
            ])
        );

    }

    private createPdfFileMap(
        pdfFiles: PdfFile[]
    ): Map<string, PdfFile> {

        return new Map(
            pdfFiles.map(pdfFile => [
                this.normalizePath(
                    pdfFile.path
                ),
                pdfFile
            ])
        );

    }

    private async deleteMissingRecords(
        imports: WorkOrderImport[],
        pdfFileByPath: Map<string, PdfFile>
    ): Promise<number> {

        let deletedCount = 0;

        for (const workOrderImport of imports) {

            if (pdfFileByPath.has(
                this.normalizePath(
                    workOrderImport.pdfFile
                )
            )) {
                continue;
            }

            await workOrderRepository.deleteByWorkOrderNumber(
                workOrderImport.workOrderNumber
            );

            await workOrderImportRepository.delete(
                workOrderImport.workOrderNumber
            );

            deletedCount++;

        }

        return deletedCount;

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
                this.normalizePath(
                    workOrderImport.pdfFile
                )
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

    private normalizePath(
        path: string
    ): string {

        return path
            .replace(/\\/g, "/")
            .toLowerCase();

    }

    private async yieldToUi(): Promise<void> {

        await new Promise<void>(resolve =>
            window.setTimeout(
                resolve,
                0
            )
        );

    }

    private isBatchEnd(
        index: number
    ): boolean {

        return (index + 1) % INDEX_BATCH_SIZE === 0;

    }

}

export const indexService =
    new IndexService();
