import { sql } from "../config/connection.js";
import fs from 'fs';

async function listUniqueConstraints() {
    try {
        console.log("Listing UNIQUE constraints on 'users' table...");
        const result = await sql.query`
            SELECT CONSTRAINT_NAME
            FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
            WHERE TABLE_NAME = 'users' AND CONSTRAINT_TYPE = 'UNIQUE'
        `;

        const constraints = result.recordset.map(row => row.CONSTRAINT_NAME);
        console.log("Constraints:", constraints);
        fs.writeFileSync('unique_constraints.json', JSON.stringify(constraints, null, 2));

    } catch (error) {
        console.error("Error:", error);
    } finally {
        setTimeout(() => process.exit(0), 1000);
    }
}

listUniqueConstraints();
