import { database } from "./Database";

class DatabaseTest {

    public async run(): Promise<void> {

        console.log("=== DATABASE TEST ===");

        await database.open();

        await database.connection.execute(`
            CREATE TABLE IF NOT EXISTS test (

                id INTEGER PRIMARY KEY AUTOINCREMENT,

                name TEXT NOT NULL

            )
        `);

        console.log("✓ test tábla létrehozva");

        const insertResult =
            await database.connection.execute(

                `
                INSERT INTO test(name)
                VALUES($1)
                `,

                [

                    "Hello SQLite"

                ]

            );

        console.log(
            "INSERT:",
            insertResult
        );

        const rows =
            await database.connection.select(

                `
                SELECT *
                FROM test
                ORDER BY id
                `
            );

        console.table(rows);

        console.log("=== TEST END ===");

    }

}

export const databaseTest =
    new DatabaseTest();