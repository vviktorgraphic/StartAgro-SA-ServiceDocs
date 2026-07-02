import { tauriService } from "../tauri/TauriService";
import { nameParser } from "./NameParser";

export class IndexService {

    public async run(folder: string): Promise<void> {

        const result = await tauriService.scanDocuments(folder);

        console.log(
            `PDF: ${result.pdf_count}, JPG: ${result.image_count}`
        );

        for (const filePath of result.pdf_files) {

            const fileName =
                filePath.split(/[\\/]/).pop() ?? filePath;

            const parsed =
                nameParser.parse(fileName);

            if (parsed) {

                console.log(
                    `✓ ${parsed.workOrderNumber}`
                );

            } else {

                console.warn(
                    `❌ Ismeretlen fájlnév: ${fileName}`
                );

            }

        }

    }

}

export const indexService = new IndexService();