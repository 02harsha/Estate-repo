import { sql } from "../config/connection.js";

async function setupPointsTable() {
    try {
        const tableQuery = `
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='points' AND xtype='U')
      CREATE TABLE points (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        points INT DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `;

        await sql.query(tableQuery);
        console.log("✅ Points table checked/created.");
    } catch (err) {
        console.error("❌ Error setting up points table:", err);
    } finally {
        process.exit();
    }
}

setTimeout(setupPointsTable, 2000);
