import { sql } from "../config/connection.js";

async function addReferredByColumn() {
    try {
        console.log("Checking for 'referred_by' column...");
        const checkResult = await sql.query`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'referred_by'
        `;

        if (checkResult.recordset.length === 0) {
            console.log("Adding 'referred_by' column...");
            await sql.query`ALTER TABLE users ADD referred_by VARCHAR(255)`;
            console.log("✅ 'referred_by' column added successfully.");
        } else {
            console.log("ℹ️ 'referred_by' column already exists.");
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        setTimeout(() => process.exit(0), 1000);
    }
}

addReferredByColumn();
