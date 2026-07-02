export interface AppSettings {

    documentsFolder: string;

    lastRefresh: string | null;

    databaseVersion: number;

    parserVersion: number;

}

class SettingsService {

    private settings: AppSettings = {

        documentsFolder: "",

        lastRefresh: null,

        databaseVersion: 1,

        parserVersion: 1

    };

    public initialize(): void {

        // Később itt töltjük be a settings.json-t.

    }

    public get(): AppSettings {

        return this.settings;

    }

    public update(values: Partial<AppSettings>): void {

        this.settings = {

            ...this.settings,

            ...values

        };

    }

}

export const settingsService = new SettingsService();