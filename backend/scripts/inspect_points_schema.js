import { sql } from "../config/connection.js";

async function inspectTable() {
    try {
        const result = await sql.query`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'points'
    `;
        console.log("Columns in points table:", result.recordset);
    } catch (err) {
        console.error("❌ Error inspecting table:", err);
    } finally {
        process.exit();
    }
}

inspectTable();
