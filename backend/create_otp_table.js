import { sql } from './config/connection.js';

async function setup() {
    try {
        console.log("Creating admin_otps table...");
        await sql.query`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='admin_otps' AND xtype='U')
            BEGIN
                CREATE TABLE admin_otps (
                    Id INT IDENTITY(1,1) PRIMARY KEY,
                    Email NVARCHAR(255) NOT NULL,
                    OtpCode NVARCHAR(10) NOT NULL,
                    ExpiresAt DATETIME NOT NULL,
                    CreatedAt DATETIME DEFAULT GETDATE()
                );
                PRINT 'Table admin_otps created.';
            END
            ELSE
            BEGIN
                PRINT 'Table admin_otps already exists.';
            END
        `;
        console.log("Done.");
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

setup();
