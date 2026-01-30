import { sql } from "../config/connection.js";

async function checkConstraints() {
    try {
        const query = `
      SELECT 
        TableName = t.name,
        ConstraintName = i.name,
        ColumnName = c.name
      FROM sys.indexes i
      INNER JOIN sys.index_columns ic ON i.index_id = ic.index_id AND i.object_id = ic.object_id
      INNER JOIN sys.columns c ON ic.column_id = c.column_id AND c.object_id = ic.object_id
      INNER JOIN sys.tables t ON i.object_id = t.object_id
      WHERE i.is_unique_constraint = 1 OR i.is_unique = 1
      AND t.name = 'users';
    `;

        const result = await sql.query(query);
        console.log("Unique Constraints on 'users' table:", result.recordset);
    } catch (err) {
        console.error("❌ SQL Error:", err);
    } finally {
        process.exit();
    }
}

setTimeout(checkConstraints, 2000);
