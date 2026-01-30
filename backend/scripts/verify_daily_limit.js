import { sql } from "../config/connection.js";

async function testDailyLimit() {
    try {
        console.log("Starting verification...");

        // 1. Get a test user
        const result = await sql.query`SELECT TOP 1 id, referral_code, last_check_in_date FROM users`;
        const user = result.recordset[0];

        if (!user) {
            console.log("No users found to test with.");
            process.exit(0);
        }

        console.log(`Testing with User ID: ${user.id} (Current Points: ${user.points})`);

        // Helper to simulate request
        async function callAddPoints() {
            // Mocking req, res logic effectively by calling DB directly or invoking controller? 
            // Invoking controller is hard without a server or mocking req/res.
            // Let's use fetch if server is running, OR just replicate the logic/query state.

            // To properly test the controller logic, we should probably hit the endpoint if server is running.
            // But we don't know if server is running. 
            // Let's assume we can run the test script as a standalone that imports the logic? 
            // "addPointsOnDailyCheckIn" takes (req, res).

            // Let's try to mock req, res and call the function directly.

            const req = { body: { userId: user.id } };
            let capturedStatus = 200;
            let capturedJson = {};

            const res = {
                status: (code) => { capturedStatus = code; return res; },
                json: (data) => { capturedJson = data; return res; }
            };

            // We need to import the controller
            // Dynamic import to avoid top-level issues if any
            const { addPointsOnDailyCheckIn } = await import("../controllers/pointsController.js");

            await addPointsOnDailyCheckIn(req, res);
            return { status: capturedStatus, data: capturedJson };
        }

        // 2. Reset user check-in for clean test (set to yesterday)
        await sql.query`UPDATE users SET last_check_in_date = DATEADD(day, -1, GETDATE()) WHERE id = ${user.id}`;
        console.log("Reset user last_check_in_date to yesterday.");

        // 3. First Attempt
        console.log("\nAttempt 1 (Should Succeed):");
        const res1 = await callAddPoints();
        console.log(`Status: ${res1.status}, Message: ${res1.data.message}`);

        // 4. Second Attempt
        console.log("\nAttempt 2 (Should Fail):");
        const res2 = await callAddPoints();
        console.log(`Status: ${res2.status}, Message: ${res2.data.message}`);

        if (res1.status === 200 && res2.status === 400) {
            console.log("\n✅ VERIFICATION SUCCESSFUL: Daily limit enforced.");
        } else {
            console.log("\n❌ VERIFICATION FAILED.");
        }

    } catch (error) {
        console.error("Test Error Message:", error.message);
    } finally {
        setTimeout(() => process.exit(0), 1000);
    }
}


testDailyLimit();
