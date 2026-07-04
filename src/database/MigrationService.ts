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

        await this.addColumnIfMissing(
            "work_orders",
            "pdf_last_modified",
            "INTEGER NOT NULL DEFAULT 0"
        );

        await this.addColumnIfMissing(
            "work_orders",
            "pdf_file_size",
            "INTEGER NOT NULL DEFAULT 0"
        );

    }

    private async addColumnIfMissing(
        table: string,
        column: string,
        definition: string
    ): Promise<void> {

        const columns =
            await database.connection.select<
                { name: string }[]
            >(
                `PRAGMA table_info(${table})`
            );

        const exists =
            columns.some(c => c.name === column);

        if (exists) {
            return;
        }

        await database.connection.execute(

            `
            ALTER TABLE ${table}
            ADD COLUMN ${column} ${definition}
            `

        );

    }

}

export const migrationService =
    new MigrationService();