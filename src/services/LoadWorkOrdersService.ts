import { WorkOrder } from "../models/WorkOrder";
import {
    WorkOrderRecord,
    workOrderRepository
} from "../database/WorkOrderRepository";
import { serviceVisitRepository } from "../database/ServiceVisitRepository";

class LoadWorkOrdersService {

    public async loadAll(): Promise<WorkOrder[]> {

        const records: WorkOrderRecord[] =
            await workOrderRepository.loadAll();

        const workOrders: WorkOrder[] = [];

        for (const record of records) {

            const serviceVisits =
                await serviceVisitRepository.loadByWorkOrderNumber(
                    record.workOrderNumber
                );

            workOrders.push({

                workOrderNumber: record.workOrderNumber,

                prefix: record.prefix,

                pdfFile: record.pdfFile,

                imageFiles:
                    this.parseImageFiles(
                        record.imageFiles
                    ),

                partnerName: record.partnerName,

                taxNumber: record.taxNumber,

                contactName: record.contactName,

                email: record.email,

                phone: record.phone,

                machineType: record.machineType,

                serialNumber: record.serialNumber,

                workType: record.workType,

                reportedIssue: record.reportedIssue,

                completedWork: record.completedWork,

                serviceVisits

            });

        }

        return workOrders;

    }

    private parseImageFiles(
        imageFiles: string
    ): string[] {

        try {

            const parsed =
                JSON.parse(
                    imageFiles
                );

            return Array.isArray(parsed)
                ? parsed.filter(item => typeof item === "string")
                : [];

        } catch {

            return [];

        }

    }

}

export const loadWorkOrdersService =
    new LoadWorkOrdersService();
