import { sql } from "../config/connection.js";

async function checkEmailNullable() {
    try {
        console.log("Checking email column constraints...");
        const result = await sql.query`
            SELECT IS_NULLABLE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'email'
        `;

        if (result.recordset.length > 0) {
            console.log("Is Email Nullable?", result.recordset[0].IS_NULLABLE);
        } else {
            console.log("Email column not found!");
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        setTimeout(() => process.exit(0), 1000);
    }
}

checkEmailNullable();
