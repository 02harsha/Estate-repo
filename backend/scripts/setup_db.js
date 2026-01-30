import { sql } from "../config/connection.js";

async function createTable() {
    try {
        const tableQuery = `
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
      CREATE TABLE users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        full_name NVARCHAR(255) NOT NULL,
        email NVARCHAR(255) UNIQUE NOT NULL,
        phone_number NVARCHAR(50),
        password NVARCHAR(255) NOT NULL,
        referral_code NVARCHAR(100),
        created_at DATETIME DEFAULT GETDATE()
      );
    `;

        await sql.query(tableQuery);
        console.log("✅ Users table created or already exists.");
    } catch (err) {
        console.error("❌ Error creating table:", err);
    } finally {
        process.exit();
    }
}

// Wait for connection to be established (connection.js has top-level await but we need to receive the object)
// Since connection.js exports 'sql' which is the mssql object, and it connects on load.
// We might need a small delay or check connection state, but usually with top level await it resolves before import returns?
// Let's just try calling it.
setTimeout(createTable, 2000); 
