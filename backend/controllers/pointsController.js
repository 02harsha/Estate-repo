import { sql } from "../config/connection.js";

export const addPointsOnDailyCheckIn = async (req, res) => {
    try {
        const { userId } = req.body;
        const result = await sql.query`SELECT * FROM users WHERE id = ${userId}`;
        const user = result.recordset[0];
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check last check-in date
        const lastCheckIn = user.last_check_in_date;
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        if (lastCheckIn) {
            const lastCheckInDate = new Date(lastCheckIn);
            // reset time part for accurate comparison just in case
            const startOfLastCheckIn = new Date(lastCheckInDate.getFullYear(), lastCheckInDate.getMonth(), lastCheckInDate.getDate());

            if (startOfLastCheckIn.getTime() === startOfToday.getTime()) {
                return res.status(400).json({ message: "Points already collected today" });
            }
        }

        const refCode = user.referral_code;

        // Update points AND last_check_in_date
        // We use GETDATE() for current server time
        await sql.query`UPDATE points SET points = points + 10000 WHERE referral_code = ${refCode}`;
        await sql.query`UPDATE users SET last_check_in_date = GETDATE() WHERE id = ${userId}`;

        res.json({ message: "Points added successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getCurrentPoints = async (req, res) => {
    try {
        const { userId } = req.body;
        const result = await sql.query`SELECT * FROM users WHERE id = ${userId}`;
        const user = result.recordset[0];
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const referral_code = user.referral_code;
        const pointsResult = await sql.query`SELECT points FROM points WHERE referral_code = ${referral_code}`;
        const currentPoints = pointsResult.recordset[0];
        return res.json({ currentPoints: currentPoints });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
