import { ServiceVisit } from "../models/ServiceVisit";
import { database } from "./Database";

class ServiceVisitRepository {

    public async save(
        workOrderId: number,
        visits: ServiceVisit[]
    ): Promise<void> {

        await this.deleteByWorkOrderId(
            workOrderId
        );

        for (const visit of visits) {

            await database.connection.execute(

                `
                INSERT INTO service_visits (

                    work_order_id,

                    visit_date,

                    technician,

                    travel_cost,

                    kilometers,

                    work_hours,

                    short_description

                )

                VALUES (

                    $1,$2,$3,$4,$5,$6,$7

                )
                `,

                [

                    workOrderId,

                    visit.date,

                    visit.technician,

                    visit.travelCost,

                    visit.kilometers,

                    visit.workHours,

                    visit.shortDescription

                ]

            );

        }

    }

    public async loadByWorkOrderNumber(
        workOrderNumber: string
    ): Promise<ServiceVisit[]> {

        return await database.connection.select<ServiceVisit[]>(

            `
            SELECT

                sv.visit_date AS date,

                sv.technician,

                sv.travel_cost AS travelCost,

                sv.kilometers,

                sv.work_hours AS workHours,

                sv.short_description AS shortDescription

            FROM service_visits sv

            INNER JOIN work_orders wo

                ON wo.id = sv.work_order_id

            WHERE wo.work_order_number = $1

            ORDER BY sv.visit_date
            `,

            [

                workOrderNumber

            ]

        );

    }

    public async deleteByWorkOrderId(
        workOrderId: number
    ): Promise<void> {

        await database.connection.execute(

            `
            DELETE
            FROM service_visits
            WHERE work_order_id = $1
            `,

            [

                workOrderId

            ]

        );

    }

}

export const serviceVisitRepository =
    new ServiceVisitRepository();