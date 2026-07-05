import { serviceVisitRepository } from "../database/ServiceVisitRepository";
import { workOrderImportRepository } from "../database/WorkOrderImportRepository";
import { workOrderRepository } from "../database/WorkOrderRepository";
import { WorkOrder } from "../models/WorkOrder";
import { WorkOrderImport } from "../models/WorkOrderImport";
import {
    PdfFile,
    ScanResult,
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
    currentWorkOrderNumber?: string;
    currentPdfFile?: string;
    lastSavedWorkOrderNumber?: string;
    fatalError?: string;
}

export interface IndexingResult {
    workOrders: WorkOrder[];
    summary: IndexingSummary;
}

export type IndexingProgress = IndexingSummary;

export const INDEX_BATCH_SIZE = 25;

const INDEX_PROGRESS_INTERVAL_MS = 250;
const SLOW_PARSE_WARNING_MS = 2000;

export class IndexService {

    public async run(
        folder: string,
        onProgress?: (progress: IndexingProgress) => void
    ): Promise<IndexingResult> {

        console.log(
            `Index scan start: ${folder}`
        );

        let result: ScanResult;

        try {

            result =
                await tauriService.scanDocuments(folder);

        } catch (error) {

            console.error(
                "Index scan fatal error:",
                error
            );

            const summary =
                this.createEmptySummary(
                    this.formatError(error)
                );

            onProgress?.(summary);

            return {
                workOrders: [],
                summary
            };

        }

        console.log(
            `Index scan end: PDF: ${result.pdf_count}, JPG: ${result.image_count}`
        );

        let parsedCount = 0;
        let skippedCount = 0;
        let deletedCount = 0;
        let errorCount = 0;
        let processedCount = 0;
        let currentWorkOrderNumber: string | undefined;
        let currentPdfFile: string | undefined;
        let lastSavedWorkOrderNumber: string | undefined;
        let fatalError: string | undefined;
        let lastProgressAt = 0;

        let workOrders: WorkOrder[] = [];

        const createSummary = (): IndexingSummary => ({
            scannedPdfs: result.pdf_count,
            scannedImages: result.image_count,
            parsed: parsedCount,
            skipped: skippedCount,
            deleted: deletedCount,
            errors: errorCount,
            processed: processedCount,
            totalCandidates: workOrders.length,
            currentWorkOrderNumber,
            currentPdfFile,
            lastSavedWorkOrderNumber,
            fatalError
        });

        const emitProgress = (force = false) => {

            if (!onProgress) {
                return;
            }

            const now =
                Date.now();

            if (!force && now - lastProgressAt < INDEX_PROGRESS_INTERVAL_MS) {
                return;
            }

            lastProgressAt = now;

            onProgress(
                createSummary()
            );

        };

        try {

            workOrders =
                matcherService.match(
                    result.pdf_files,
                    result.image_files
                );

            console.log(
                `Index matched work orders: ${workOrders.length}`
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

            deletedCount =
                await this.deleteMissingRecords(
                    imports,
                    pdfFileByPath
                );

            emitProgress(true);

            for (let index = 0; index < workOrders.length; index++) {

                const workOrder =
                    workOrders[index];

                currentWorkOrderNumber =
                    workOrder.workOrderNumber;

                currentPdfFile =
                    workOrder.pdfFile;

                if (this.isBatchStart(index)) {
                    console.log(
                        `Index batch start: ${this.getBatchNumber(index)} (${index + 1}/${workOrders.length})`
                    );
                    this.logMemoryWarning();
                    emitProgress(true);
                }

                try {

                    await this.processWorkOrder(
                        workOrder,
                        pdfFileByPath,
                        importByPath,
                        () => skippedCount++,
                        () => parsedCount++,
                        savedWorkOrderNumber => {
                            lastSavedWorkOrderNumber =
                                savedWorkOrderNumber;
                        }
                    );

                } catch (error) {

                    errorCount++;

                    console.error(
                        `PDF feldolgozasi hiba: ${workOrder.pdfFile}`,
                        error
                    );

                } finally {

                    processedCount++;

                    emitProgress(
                        this.isBatchEnd(index, workOrders.length)
                    );

                    if (this.isBatchEnd(index, workOrders.length)) {
                        console.log(
                            `Index batch end: ${this.getBatchNumber(index)} (${processedCount}/${workOrders.length})`
                        );
                        this.logMemoryWarning();
                    }

                    await this.yieldToUi();

                }

            }

        } catch (error) {

            errorCount++;
            fatalError =
                this.formatError(error);

            console.error(
                "Fatal indexing error:",
                error
            );

        }

        currentWorkOrderNumber =
            undefined;

        currentPdfFile =
            undefined;

        emitProgress(true);

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
                `total candidates: ${summary.totalCandidates}`,
                `last saved: ${summary.lastSavedWorkOrderNumber ?? "-"}`,
                `fatal: ${summary.fatalError ?? "-"}`
            ].join(", ")
        );

        return {
            workOrders,
            summary
        };

    }

    private async processWorkOrder(
        workOrder: WorkOrder,
        pdfFileByPath: Map<string, PdfFile>,
        importByPath: Map<string, WorkOrderImport>,
        countSkipped: () => void,
        countParsed: () => void,
        setLastSaved: (workOrderNumber: string) => void
    ): Promise<void> {

        const pdfFile =
            pdfFileByPath.get(
                this.normalizePath(
                    workOrder.pdfFile
                )
            );

        if (!pdfFile) {
            return;
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
            countSkipped();

            await workOrderRepository.updateImageFiles(
                workOrder.workOrderNumber,
                workOrder.imageFiles
            );

            return;
        }

        console.log(
            `Index parsing: ${workOrder.workOrderNumber} | ${workOrder.pdfFile}`
        );

        const parseStart =
            performance.now();

        await this.parseAndSave(
            workOrder,
            workOrderImport
        );

        const parseDuration =
            performance.now() - parseStart;

        if (parseDuration > SLOW_PARSE_WARNING_MS) {
            console.warn(
                `Slow PDF parse: ${Math.round(parseDuration)}ms | ${workOrder.workOrderNumber} | ${workOrder.pdfFile}`
            );
        }

        countParsed();
        setLastSaved(
            workOrder.workOrderNumber
        );

        console.log(
            `Index last saved work order: ${workOrder.workOrderNumber}`
        );

    }

    private createEmptySummary(
        fatalError: string
    ): IndexingSummary {

        return {
            scannedPdfs: 0,
            scannedImages: 0,
            parsed: 0,
            skipped: 0,
            deleted: 0,
            errors: 1,
            processed: 0,
            totalCandidates: 0,
            fatalError
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

        const pdfData =
            await pdfService.readPagesAndTextItems(
                workOrder.pdfFile
            );

        try {

            const parsed =
                pdfParser.parse(
                    pdfData.pages,
                    pdfData.textItems
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

        } finally {

            pdfData.pages.length = 0;
            pdfData.textItems.length = 0;

        }

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

    private isBatchStart(
        index: number
    ): boolean {

        return index % INDEX_BATCH_SIZE === 0;

    }

    private isBatchEnd(
        index: number,
        total: number
    ): boolean {

        return (index + 1) % INDEX_BATCH_SIZE === 0
            || index + 1 === total;

    }

    private getBatchNumber(
        index: number
    ): number {

        return Math.floor(index / INDEX_BATCH_SIZE) + 1;

    }

    private logMemoryWarning(): void {

        const memory =
            (
                performance as Performance & {
                    memory?: {
                        usedJSHeapSize: number;
                        jsHeapSizeLimit: number;
                    };
                }
            ).memory;

        if (!memory || memory.jsHeapSizeLimit === 0) {
            return;
        }

        const usedRatio =
            memory.usedJSHeapSize / memory.jsHeapSizeLimit;

        if (usedRatio < 0.8) {
            return;
        }

        console.warn(
            `Index memory warning: ${Math.round(usedRatio * 100)}% heap used`
        );

    }

    private formatError(
        error: unknown
    ): string {

        return error instanceof Error
            ? error.message
            : String(error);

    }

}

export const indexService =
    new IndexService();
