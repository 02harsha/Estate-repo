import { sql } from "../config/connection.js";

async function makeEmailNullable() {
    try {
        console.log("Altering 'users' table to make 'email' nullable...");
        await sql.query`ALTER TABLE users ALTER COLUMN email VARCHAR(255) NULL`;
        console.log("✅ 'email' column is now nullable.");

    } catch (error) {
        console.error("Error:", error);
    } finally {
        setTimeout(() => process.exit(0), 1000);
    }
}

makeEmailNullable();
