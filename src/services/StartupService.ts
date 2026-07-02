
import { migrationService } from "../database/MigrationService";

class StartupService {

    private initialized = false;

    public async initialize(): Promise<void> {

    console.log("Startup indul");

    if (this.initialized) {
        return;
    }

    await migrationService.migrate();

    this.initialized = true;

    console.log("Alkalmazás inicializálva.");

}

}

export const startupService =
    new StartupService();