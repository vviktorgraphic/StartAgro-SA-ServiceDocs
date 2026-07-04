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
            "image_files",
            "TEXT NOT NULL DEFAULT '[]'"
        );

        await this.addWorkOrderColumnMigrations();

    }

    private async addWorkOrderColumnMigrations(): Promise<void> {

        const columns = [
            "billing_address",
            "service_location",
            "material_total",
            "total_kilometers",
            "total_work_hours",
            "washing",
            "closed_at",
            "handed_over_by",
            "received_by"
        ];

        for (const column of columns) {

            await this.addColumnIfMissing(
                "work_orders",
                column,
                "TEXT"
            );

        }

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
