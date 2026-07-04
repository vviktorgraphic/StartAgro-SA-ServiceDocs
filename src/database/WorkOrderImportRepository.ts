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

    public async lookupByPdfFile(
        pdfFile: string
    ): Promise<WorkOrderImport | null> {

        const rows =
            await database.connection.select<WorkOrderImport[]>(

                `
                SELECT

                    work_order_number AS workOrderNumber,

                    pdf_file AS pdfFile,

                    pdf_last_modified AS pdfLastModified,

                    pdf_file_size AS pdfFileSize

                FROM work_order_imports

                WHERE pdf_file = $1
                `,

                [

                    pdfFile

                ]

            );

        return rows[0] ?? null;

    }

    public async update(
        workOrderImport: WorkOrderImport
    ): Promise<void> {

        await database.connection.execute(

            `
            UPDATE work_order_imports
            SET
                pdf_file = $2,
                pdf_last_modified = $3,
                pdf_file_size = $4
            WHERE work_order_number = $1
            `,

            [

                workOrderImport.workOrderNumber,

                workOrderImport.pdfFile,

                workOrderImport.pdfLastModified,

                workOrderImport.pdfFileSize

            ]

        );

    }

    public async delete(
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

    public async deleteByWorkOrderNumber(
        workOrderNumber: string
    ): Promise<void> {

        await this.delete(
            workOrderNumber
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
