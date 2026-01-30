import { sql } from "../config/connection.js";

async function modifyEmailConstraint() {
    try {
        console.log("Dropping unique constraint...");
        await sql.query`ALTER TABLE users DROP CONSTRAINT UQ__users__AB6E61645D573885`;
        console.log("✅ Constraint dropped.");

        console.log("Altering 'email' column to be nullable...");
        await sql.query`ALTER TABLE users ALTER COLUMN email VARCHAR(255) NULL`;
        console.log("✅ 'email' column is now nullable.");

        console.log("Creating filtered unique index for email...");
        await sql.query`CREATE UNIQUE INDEX IX_Users_Email ON users(email) WHERE email IS NOT NULL`;
        console.log("✅ Filtered unique index created.");

    } catch (error) {
        console.error("Error:", error);
    } finally {
        setTimeout(() => process.exit(0), 1000);
    }
}

modifyEmailConstraint();
