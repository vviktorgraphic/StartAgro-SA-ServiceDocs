export interface WorkOrder {

    // Scanner tölti ki

    workOrderNumber: string;

    prefix: string;

    pdfFile: string;

    imageFiles: string[];

    // PDF parser tölti ki

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