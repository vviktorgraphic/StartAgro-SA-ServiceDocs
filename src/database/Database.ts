import Database from "@tauri-apps/plugin-sql";

class DatabaseService {

    private db: Database | null = null;

    public async open(): Promise<void> {

        if (this.db) {
            return;
        }

        this.db = await Database.load(
            "sqlite:startagro.db"
        );

        await this.db.execute(
            "PRAGMA foreign_keys = ON"
        );

        console.log(
            "SQLite adatbázis megnyitva."
        );

    }

    public get connection(): Database {

        if (!this.db) {
            throw new Error(
                "Az adatbázis nincs megnyitva."
            );
        }

        return this.db;

    }

    public async close(): Promise<void> {

        this.db = null;

    }

}

export const database =
    new DatabaseService();