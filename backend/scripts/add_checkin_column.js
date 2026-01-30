import { sql } from "../config/connection.js";

async function addColumn() {
    try {
        console.log("Starting migration...");

        try {
            await sql.query`ALTER TABLE users ADD last_check_in_date DATE DEFAULT NULL`;
            console.log("Successfully added last_check_in_date column.");
        } catch (err) {
            console.log("Query error (might be expected if column exists):", err.message);
        }

    } catch (error) {
        console.error("General error:", error);
    } finally {
        setTimeout(() => process.exit(0), 1000);
    }
}

addColumn();
