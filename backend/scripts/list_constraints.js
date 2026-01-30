import { sql } from "../config/connection.js";

async function listConstraints() {
    try {
        console.log("Listing constraints on 'users' table...");
        const result = await sql.query`
            SELECT CONSTRAINT_NAME, CONSTRAINT_TYPE
            FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
            WHERE TABLE_NAME = 'users'
        `;

        console.log(result.recordset);

    } catch (error) {
        console.error("Error:", error);
    } finally {
        setTimeout(() => process.exit(0), 1000);
    }
}

listConstraints();
