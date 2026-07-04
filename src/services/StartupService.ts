import { migrationService } from "../database/MigrationService";

class StartupService {

    private initialized = false;

    public async initialize(): Promise<void> {

        if (this.initialized) {
            return;
        }

        console.log(
            "Startup indul..."
        );

        await migrationService.migrate();

        this.initialized = true;

        console.log(
            "Alkalmazás inicializálva."
        );

    }

}

export const startupService =
    new StartupService();