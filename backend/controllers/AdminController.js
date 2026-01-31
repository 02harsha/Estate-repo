import bcrypt from "bcrypt";
import { sql } from "../config/connection.js";
import { sendEmail } from "../services/emailService.js";
import crypto from "crypto";

// In-memory OTP Store removed

export const adminSignup = async (req, res) => {
    // ... (keep existing implementation)
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
        return res.status(400).json({ message: "Full Name, Email, and Password are required." });
    }

    try {
        const existingAdmin = await sql.query`SELECT * FROM admins WHERE Email = ${email}`;
        if (existingAdmin.recordset.length > 0) {
            return res.status(400).json({ message: "Admin with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await sql.query`
      INSERT INTO admins (FullName, Email, PasswordHash)
      VALUES (${fullName}, ${email}, ${hashedPassword})
    `;

        return res.status(201).json({ message: "Admin Registration Successful" });

    } catch (err) {
        console.error("Error registering admin:", err);
        return res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

export const adminLogin = async (req, res) => {
    // ... (keep existing implementation)
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and Password are required." });
    }

    try {
        const result = await sql.query`SELECT * FROM admins WHERE Email = ${email}`;
        const admin = result.recordset[0];

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        const isMatch = await bcrypt.compare(password, admin.PasswordHash);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid Credentials" });
        }

        return res.status(200).json({
            message: "Login Successful",
            admin: {
                id: admin.Id,
                fullName: admin.FullName,
                email: admin.Email,
                createdAt: admin.CreatedAt
            }
        });

    } catch (err) {
        console.error("Error logging in admin:", err);
        return res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

export const getDashboardStats = async (req, res) => {
    // ... (keep existing implementation)
    try {
        const totalUsersResult = await sql.query`SELECT COUNT(*) as count FROM users`;
        const totalUsers = totalUsersResult.recordset[0].count;

        const activeUsersResult = await sql.query`
      SELECT COUNT(*) as count FROM users 
      WHERE last_check_in_date >= DATEADD(day, -30, GETDATE())
    `;
        const activeUsers = activeUsersResult.recordset[0].count;

        const dailyUsersResult = await sql.query`
      SELECT COUNT(*) as count FROM users 
      WHERE CAST(last_check_in_date AS DATE) = CAST(GETDATE() AS DATE)
    `;
        const dailyUsers = dailyUsersResult.recordset[0].count;

        let weeklyGrowth = 0;
        try {
            const weeklyGrowthResult = await sql.query`
          SELECT COUNT(*) as count FROM users 
          WHERE created_at >= DATEADD(day, -7, GETDATE())
        `;
            weeklyGrowth = weeklyGrowthResult.recordset[0].count;
        } catch (e) {
            console.warn("Could not calculate weekly growth (missing created_at?):", e.message);
        }

        const monthlyGrowth = activeUsers;

        return res.status(200).json({
            totalUsers,
            activeUsers,
            dailyUsers,
            weeklyGrowth,
            monthlyGrowth
        });

    } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        return res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

export const getUsers = async (req, res) => {
    // ... (keep existing implementation)
    try {
        const { search } = req.query;
        let query = `SELECT * FROM users`;

        if (search) {
            query += ` WHERE full_name LIKE '%${search}%' OR email LIKE '%${search}%'`;
        }

        query += ` ORDER BY created_at DESC`;

        const result = await sql.query(query);

        const users = result.recordset.map(user => {
            let status = 'disabled';
            if (user.last_check_in_date) {
                const checkedInDate = new Date(user.last_check_in_date);
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                if (checkedInDate >= thirtyDaysAgo) {
                    status = 'active';
                }
            } else if (user.created_at) {
                const createdDate = new Date(user.created_at);
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                if (createdDate >= thirtyDaysAgo) {
                    status = 'active';
                }
            }

            return {
                id: user.id || user.referral_code,
                user_id: user.id,
                full_name: user.full_name,
                email: user.email,
                phone: user.phone_number,
                city: user.place,
                region: null,
                role: 'buyer',
                account_status: status,
                last_login: user.last_check_in_date,
                created_at: user.created_at
            };
        });

        return res.status(200).json(users);

    } catch (err) {
        console.error("Error fetching users:", err);
        return res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

export const exportUsers = async (req, res) => {
    // ... (keep existing implementation)
    try {
        const result = await sql.query`SELECT * FROM users ORDER BY created_at DESC`;

        const users = result.recordset.map(user => {
            let status = 'Disabled';
            if (user.last_check_in_date) {
                const checkedInDate = new Date(user.last_check_in_date);
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                if (checkedInDate >= thirtyDaysAgo) status = 'Active';
            } else if (user.created_at) {
                const createdDate = new Date(user.created_at);
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                if (createdDate >= thirtyDaysAgo) status = 'Active';
            }
            return {
                ...user,
                status
            };
        });

        let csv = 'User ID,Full Name,Email,Phone,Place,Status,Created At\n';

        users.forEach(user => {
            csv += `"${user.id}","${user.full_name}","${user.email}","${user.phone_number}","${user.place}","${user.status}","${user.created_at}"\n`;
        });

        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', 'attachment; filename="users_export.csv"');
        return res.send(csv);

    } catch (err) {
        console.error("Error exporting users:", err);
        return res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

export const sendOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    // Verify admin exists
    try {
        const result = await sql.query`SELECT * FROM admins WHERE Email = ${email}`;
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: "Admin not found" });
        }

        const otp = crypto.randomInt(100000, 999999).toString();
        // Expires in 10 minutes
        const minutes = 10;

        // Use DATEADD for SQL expiration time
        await sql.query`
            INSERT INTO admin_otps (Email, OtpCode, ExpiresAt)
            VALUES (${email}, ${otp}, DATEADD(minute, ${minutes}, GETDATE()))
        `;

        await sendEmail(email, "Your Admin Verification Code", `Your OTP code is: ${otp}. It expires in 10 minutes.`);

        return res.status(200).json({ message: "OTP sent successfully" });
    } catch (err) {
        console.error("Error sending OTP:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    try {
        const result = await sql.query`
            SELECT TOP 1 * FROM admin_otps 
            WHERE Email = ${email} AND OtpCode = ${otp} AND ExpiresAt > GETDATE()
            ORDER BY CreatedAt DESC
        `;

        const storedData = result.recordset[0];

        if (!storedData) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // OTP verified
        return res.status(200).json({ message: "OTP verified successfully" });
    } catch (err) {
        console.error("Error verifying OTP:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const changePassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ message: "Email, OTP, and New Password are required" });

    try {
        // Verify OTP
        const result = await sql.query`
            SELECT TOP 1 * FROM admin_otps 
            WHERE Email = ${email} AND OtpCode = ${otp} AND ExpiresAt > GETDATE()
            ORDER BY CreatedAt DESC
        `;

        if (result.recordset.length === 0) {
            return res.status(400).json({ message: "Invalid or expired OTP session" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await sql.query`UPDATE admins SET PasswordHash = ${hashedPassword} WHERE Email = ${email}`;

        // Clear OTPs for this email after successful change
        await sql.query`DELETE FROM admin_otps WHERE Email = ${email}`;

        return res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
        console.error("Error updating password:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const changeEmail = async (req, res) => {
    const { email, otp, newEmail } = req.body;
    if (!email || !otp || !newEmail) return res.status(400).json({ message: "Email, OTP, and New Email are required" });

    try {
        // Verify OTP
        const result = await sql.query`
            SELECT TOP 1 * FROM admin_otps 
            WHERE Email = ${email} AND OtpCode = ${otp} AND ExpiresAt > GETDATE()
            ORDER BY CreatedAt DESC
        `;

        if (result.recordset.length === 0) {
            return res.status(400).json({ message: "Invalid or expired OTP session" });
        }

        // Check if new email exists
        const existing = await sql.query`SELECT * FROM admins WHERE Email = ${newEmail}`;
        if (existing.recordset.length > 0) {
            return res.status(400).json({ message: "Email already in use" });
        }

        await sql.query`UPDATE admins SET Email = ${newEmail} WHERE Email = ${email}`;

        // Clear OTPs
        await sql.query`DELETE FROM admin_otps WHERE Email = ${email}`;

        return res.status(200).json({ message: "Email updated successfully" });
    } catch (err) {
        console.error("Error updating email:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
