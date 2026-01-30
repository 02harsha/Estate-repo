import { sql } from "../config/connection.js";

async function cleanupUsers() {
    try {
        const result = await sql.query`DELETE FROM users WHERE email = ''`;
        console.log("Deleted users with empty email:", result.rowsAffected);
    } catch (err) {
        console.error("❌ SQL Error:", err);
    } finally {
        process.exit();
    }
}

setTimeout(cleanupUsers, 2000);
