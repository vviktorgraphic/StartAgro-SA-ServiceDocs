import { open } from "@tauri-apps/plugin-dialog";

class DialogService {

    public async selectDocumentsFolder(): Promise<string | null> {

        const result = await open({
            directory: true,
            multiple: false,
            title: "Dokumentummappa kiválasztása"
        });

        return typeof result === "string" ? result : null;

    }

    public async selectXlsxFile(): Promise<string | null> {

        const result = await open({
            directory: false,
            multiple: false,
            title: "XLSX fájl kiválasztása",
            filters: [
                {
                    name: "Excel munkafüzet",
                    extensions: [
                        "xlsx"
                    ]
                }
            ]
        });

        return typeof result === "string" ? result : null;

    }

}

export const dialogService = new DialogService();
