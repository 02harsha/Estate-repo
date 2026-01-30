import { sql } from "../config/connection.js";

async function addPlaceColumn() {
    try {
        console.log("Checking for 'place' column...");
        const checkResult = await sql.query`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'place'
        `;

        if (checkResult.recordset.length === 0) {
            console.log("Adding 'place' column...");
            await sql.query`ALTER TABLE users ADD place VARCHAR(255)`;
            console.log("✅ 'place' column added successfully.");
        } else {
            console.log("ℹ️ 'place' column already exists.");
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        setTimeout(() => process.exit(0), 1000);
    }
}

addPlaceColumn();
