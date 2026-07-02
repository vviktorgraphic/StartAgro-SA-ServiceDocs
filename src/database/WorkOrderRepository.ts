import { WorkOrder } from "../models/WorkOrder";
import { database } from "./Database";

class WorkOrderRepository {

    public async save(
        workOrder: WorkOrder
    ): Promise<void> {

        await database.connection.execute(

            `

            INSERT OR REPLACE INTO work_orders (

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

                ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?,
                ?,
                ?,
                ?

            )

            `,

            [

                workOrder.workOrderNumber,

                workOrder.prefix,

                workOrder.pdfFile,

                workOrder.partnerName,

                workOrder.taxNumber,

                workOrder.contactName,

                workOrder.email,

                workOrder.phone,

                workOrder.machineType,

                workOrder.serialNumber,

                workOrder.workType,

                workOrder.reportedIssue,

                workOrder.completedWork

            ]

        );

    }

}

export const workOrderRepository =
    new WorkOrderRepository();