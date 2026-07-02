import { WorkOrder } from "../models/WorkOrder";
import { tauriService } from "../tauri/TauriService";
import { matcherService } from "./MatcherService";

export class IndexService {

    public async run(
        folder: string
    ): Promise<WorkOrder[]> {

        const result = await tauriService.scanDocuments(folder);

        console.log(
            `PDF: ${result.pdf_count}, JPG: ${result.image_count}`
        );

        const workOrders = matcherService.match(
            result.pdf_files,
            result.image_files
        );

        console.log(
            `Felismert munkalapok: ${workOrders.length}`
        );

        return workOrders;

    }

}

export const indexService = new IndexService();