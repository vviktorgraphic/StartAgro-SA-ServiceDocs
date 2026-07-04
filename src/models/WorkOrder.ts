import { ServiceVisit } from "./ServiceVisit";

export interface WorkOrder {

    // Scanner tolti ki

    workOrderNumber: string;

    prefix: string;

    pdfFile: string;

    imageFiles: string[];

    // PDF parser tolti ki

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

    billingAddress?: string;

    serviceLocation?: string;

    materialTotal?: string;

    totalKilometers?: string;

    totalWorkHours?: string;

    washing?: string;

    closedAt?: string;

    handedOverBy?: string;

    receivedBy?: string;

    // Kiszallasok

    serviceVisits: ServiceVisit[];

}
