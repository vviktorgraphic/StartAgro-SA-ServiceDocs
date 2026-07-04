import { database } from "./Database";
import { SCHEMA } from "./Schema";

class MigrationService {

    public async migrate(): Promise<void> {

        await database.open();

        const statements = SCHEMA
            .split(";")
            .map(statement => statement.trim())
            .filter(statement => statement.length > 0);

        for (const statement of statements) {

            await database.connection.execute(
                statement
            );

        }

    }

}

export const migrationService =
    new MigrationService();
