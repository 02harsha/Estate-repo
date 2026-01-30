import { sql } from "../config/connection.js";

async function debugPoints() {
    const code = "DEBUG_" + Date.now();
    try {
        console.log("Attempting to insert into points...");
        const result = await sql.query`INSERT INTO points (referral_code, points) VALUES (${code}, 100)`;
        console.log("Insert result:", result);

        console.log("Reading back points...");
        const read = await sql.query`SELECT * FROM points WHERE referral_code = ${code}`;
        console.log("Read result:", read.recordset);

    } catch (err) {
        console.error("❌ SQL Error:", err);
    } finally {
        process.exit();
    }
}

setTimeout(debugPoints, 2000);
