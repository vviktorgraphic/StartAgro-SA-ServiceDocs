import { WorkOrder } from "../models/WorkOrder";
import { workOrderRepository } from "../database/WorkOrderRepository";

class RepositoryTest {

    public async run(): Promise<void> {

        console.log("=== REPOSITORY TEST ===");

        const workOrder: WorkOrder = {

            workOrderNumber: "TEST-000001",

            prefix: "TEST",

            pdfFile: "C:\\Temp\\test.pdf",

            imageFiles: [],

            partnerName: "Teszt Partner",

            taxNumber: "12345678-1-12",

            contactName: "Teszt Elek",

            email: "teszt@startagro.hu",

            phone: "+36301234567",

            machineType: "John Deere",

            serialNumber: "SN-123456",

            workType: "Javítás",

            reportedIssue: "Teszt hiba",

            completedWork: "Teszt javítás",

            serviceVisits: []

        };

        const id =
            await workOrderRepository.save(
                workOrder
            );

        console.log(
            "WorkOrder ID:",
            id
        );

        const rows =
            await workOrderRepository.loadAll();

        console.table(rows);

        console.log("=== REPOSITORY TEST END ===");

    }

}

export const repositoryTest =
    new RepositoryTest();
