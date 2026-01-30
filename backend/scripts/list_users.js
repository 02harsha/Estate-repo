import { sql } from "../config/connection.js";

async function listUsers() {
    try {
        const result = await sql.query`SELECT id, email, full_name FROM users`;
        console.log("Users:", result.recordset);
    } catch (err) {
        console.error("❌ SQL Error:", err);
    } finally {
        process.exit();
    }
}

setTimeout(listUsers, 2000);
