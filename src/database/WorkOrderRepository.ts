import { WorkOrder } from "../models/WorkOrder";
import { database } from "./Database";

export interface WorkOrderRecord {

    workOrderNumber: string;

    prefix: string;

    pdfFile: string;

    partnerName?: string;

    taxNumber?: string;

    contactName?: string;

    email?: string;

    phone?: string;

    machineType?: string;

    serialNumber?: string;

    workType?: string;

    reportedIssue?: string;

    completedWork?: string;

}

export interface WorkOrderIndexRecord {

    workOrderNumber: string;

    pdfFile: string;

    pdfLastModified: number;

    pdfFileSize: number;

}

class WorkOrderRepository {

    public async save(
        workOrder: WorkOrder
    ): Promise<number> {

        await database.connection.execute(

            `
            INSERT INTO work_orders (

                work_order_number,
                prefix,
                pdf_file,

                partner_name,
                tax_number,
                contact_name,
                email,
                phone,

                machine_type,
                serial_number,

                work_type,

                reported_issue,

                completed_work

            )

            VALUES (

                $1,$2,$3,
                $4,$5,$6,$7,$8,
                $9,$10,
                $11,
                $12,
                $13

            )

            ON CONFLICT(work_order_number)

            DO UPDATE SET

                prefix = excluded.prefix,
                pdf_file = excluded.pdf_file,

                partner_name = excluded.partner_name,
                tax_number = excluded.tax_number,
                contact_name = excluded.contact_name,
                email = excluded.email,
                phone = excluded.phone,

                machine_type = excluded.machine_type,
                serial_number = excluded.serial_number,

                work_type = excluded.work_type,

                reported_issue = excluded.reported_issue,

                completed_work = excluded.completed_work
            `,

            [

                workOrder.workOrderNumber,

                workOrder.prefix,

                workOrder.pdfFile,

                workOrder.partnerName ?? null,

                workOrder.taxNumber ?? null,

                workOrder.contactName ?? null,

                workOrder.email ?? null,

                workOrder.phone ?? null,

                workOrder.machineType ?? null,

                workOrder.serialNumber ?? null,

                workOrder.workType ?? null,

                workOrder.reportedIssue ?? null,

                workOrder.completedWork ?? null

            ]

        );

        const rows =
            await database.connection.select<
                { id: number }[]
            >(

                `
                SELECT id
                FROM work_orders
                WHERE work_order_number = $1
                `,

                [

                    workOrder.workOrderNumber

                ]

            );

        if (rows.length === 0) {

            throw new Error(
                `Nincs ilyen munkalap: ${workOrder.workOrderNumber}`
            );

        }

        return rows[0].id;

    }

    public async loadAll(): Promise<WorkOrderRecord[]> {

        return await database.connection.select<WorkOrderRecord[]>(

            `
            SELECT

                work_order_number AS workOrderNumber,

                prefix,

                pdf_file AS pdfFile,

                partner_name AS partnerName,

                tax_number AS taxNumber,

                contact_name AS contactName,

                email,

                phone,

                machine_type AS machineType,

                serial_number AS serialNumber,

                work_type AS workType,

                reported_issue AS reportedIssue,

                completed_work AS completedWork

            FROM work_orders

            ORDER BY work_order_number
            `

        );

    }

    public async loadIndexInfo(): Promise<WorkOrderIndexRecord[]> {

        return await database.connection.select<WorkOrderIndexRecord[]>(

            `
            SELECT

                work_order_number AS workOrderNumber,

                pdf_file AS pdfFile,

                pdf_last_modified AS pdfLastModified,

                pdf_file_size AS pdfFileSize

            FROM work_orders
            `

        );

    }

    public async deleteAll(): Promise<void> {

        await database.connection.execute(

            `
            DELETE FROM work_orders
            `

        );

    }

}

export const workOrderRepository =
    new WorkOrderRepository();