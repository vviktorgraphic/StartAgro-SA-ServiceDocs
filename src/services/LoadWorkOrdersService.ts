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

                imageFiles: [],

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

}

export const loadWorkOrdersService =
    new LoadWorkOrdersService();