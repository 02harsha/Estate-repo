import { sql } from "../config/connection.js";

async function checkSchema() {
    try {
        console.log("Checking schema...");
        const result = await sql.query`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'points'
        `;

        const columns = result.recordset.map(row => row.COLUMN_NAME);
        console.log("Columns in 'points' table:", JSON.stringify(columns));

        if (columns.includes('points')) {
            console.log("✅ Column 'points' exists.");
        } else {
            console.log("❌ Column 'points' MISSING.");
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        setTimeout(() => process.exit(0), 1000);
    }
}

checkSchema();
