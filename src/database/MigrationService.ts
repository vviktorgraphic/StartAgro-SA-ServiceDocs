import { database } from "./Database";
import { SCHEMA } from "./Schema";

class MigrationService {

    public async migrate(): Promise<void> {

        await database.open();

        const statements = SCHEMA
            .split(";")
            .map(sql => sql.trim())
            .filter(sql => sql.length > 0);

        for (const sql of statements) {

            console.log("SQL:", sql);

            await database.connection.execute(sql);

        }

        console.log(
            "SQLite séma létrehozva."
        );

    }

}

export const migrationService =
    new MigrationService();