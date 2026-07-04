import { WorkOrderImport } from "../models/WorkOrderImport";
import { database } from "./Database";

class WorkOrderImportRepository {

    public async save(
        workOrderImport: WorkOrderImport
    ): Promise<void> {

        await database.connection.execute(

            `
            INSERT INTO work_order_imports (

                work_order_number,
                pdf_file,
                pdf_last_modified,
                pdf_file_size

            )

            VALUES (

                $1,$2,$3,$4

            )

            ON CONFLICT(work_order_number)

            DO UPDATE SET

                pdf_file = excluded.pdf_file,
                pdf_last_modified = excluded.pdf_last_modified,
                pdf_file_size = excluded.pdf_file_size
            `,

            [

                workOrderImport.workOrderNumber,

                workOrderImport.pdfFile,

                workOrderImport.pdfLastModified,

                workOrderImport.pdfFileSize

            ]

        );

    }

    public async loadAll(): Promise<WorkOrderImport[]> {

        return await database.connection.select<WorkOrderImport[]>(

            `
            SELECT

                work_order_number AS workOrderNumber,

                pdf_file AS pdfFile,

                pdf_last_modified AS pdfLastModified,

                pdf_file_size AS pdfFileSize

            FROM work_order_imports

            ORDER BY work_order_number
            `

        );

    }

    public async deleteByWorkOrderNumber(
        workOrderNumber: string
    ): Promise<void> {

        await database.connection.execute(

            `
            DELETE
            FROM work_order_imports
            WHERE work_order_number = $1
            `,

            [

                workOrderNumber

            ]

        );

    }

    public async deleteAll(): Promise<void> {

        await database.connection.execute(

            `
            DELETE FROM work_order_imports
            `

        );

    }

}

export const workOrderImportRepository =
    new WorkOrderImportRepository();
