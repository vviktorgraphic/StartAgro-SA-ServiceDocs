import { invoke } from "@tauri-apps/api/core";

export interface ScanResult {

    pdf_count: number;

    image_count: number;

    pdf_files: string[];

}

class TauriService {

    public async scanDocuments(folder: string): Promise<ScanResult> {

        return await invoke<ScanResult>(
            "scan_documents",
            { folder }
        );

    }

}

export const tauriService = new TauriService();