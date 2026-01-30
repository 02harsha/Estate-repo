import fetch from 'node-fetch';
import { sql } from "../config/connection.js";

const BASE_URL = 'http://localhost:3000/api/users';

async function testReferral() {
    console.log("--- Starting Referral Test ---");

    // 1. Register Referrer (User A)
    const referrer = {
        full_name: "Referrer A",
        email: `referrer_${Date.now()}@test.com`,
        phone_number: `8${Date.now().toString().slice(-9)}`,
        password: "passwordA"
    };

    let referrerCode = "";

    try {
        const res = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(referrer)
        });
        const data = await res.json();
        console.log('Referrer Registration:', res.status, data);
        if (res.status === 201) {
            referrerCode = data.referral_code;
            console.log("Referrer Code obtained:", referrerCode);
        } else {
            console.error("Failed to register referrer");
            return;
        }
    } catch (err) {
        console.error("Error registering referrer:", err);
        return;
    }

    // 2. Register Referee (User B) with Referrer Code
    const referee = {
        full_name: "Referee B",
        email: `referee_${Date.now()}@test.com`,
        phone_number: `7${Date.now().toString().slice(-9)}`,
        password: "passwordB",
        referral_code: referrerCode
    };

    let refereeCode = "";

    try {
        const res = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(referee)
        });
        const data = await res.json();
        console.log('Referee Registration:', res.status, data);
        if (res.status === 201) {
            refereeCode = data.referral_code;
        }
    } catch (err) {
        console.error("Error registering referee:", err);
    }

    // 3. Verify Points in DB
    console.log("--- Verifying Points in DB ---");
    try {
        // Check Referrer Points (Should be 100000)
        // Note: They start with 0. 1 referral = +100000. Total = 100000.
        const refPoints = await sql.query`SELECT * FROM points`;
        console.log("All Points Records:", refPoints.recordset);

        const referrerRecord = refPoints.recordset.find(r => r.referral_code === referrerCode);
        console.log(`Referrer Code: ${referrerCode}, Record:`, referrerRecord);

        const refereeRecord = refPoints.recordset.find(r => r.referral_code === refereeCode);
        console.log(`Referee Code: ${refereeCode}, Record:`, refereeRecord);

    } catch (err) {
        console.error("Error checking points:", err);
    } finally {
        process.exit();
    }
}

// Give server a moment to restart if needed, though we track it via run_command usually
setTimeout(testReferral, 2000);
