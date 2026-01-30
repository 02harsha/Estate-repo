import { sql } from "../config/connection.js";
import fs from 'fs';

async function checkUsersSchema() {
    try {
        console.log("Checking users schema...");
        const result = await sql.query`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'users'
        `;

        const columns = result.recordset.map(row => row.COLUMN_NAME);
        console.log("Columns:", columns);
        fs.writeFileSync('cols.json', JSON.stringify(columns, null, 2));

    } catch (error) {
        console.error("Error:", error);
    } finally {
        setTimeout(() => process.exit(0), 1000);
    }
}

checkUsersSchema();
