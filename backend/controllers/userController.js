import bcrypt from "bcrypt";
import { sql } from "../config/connection.js";
import { generateReferralUUID } from "../services/unqReferralGenerationService.js";


export const userRegistration = async (req, res) => {
  const { full_name, email, phone_number, place, password, referral_code } = req.body;

  if (!full_name || !phone_number || !place || !password) {
    return res.status(400).json({ message: "Full Name, Phone Number, Place, and Password are required." });
  }

  try {
    // ✅ Check if User Exists (by Phone Number)
    const existingUser = await sql.query`SELECT * FROM users WHERE phone_number = ${phone_number}`;
    if (existingUser.recordset.length > 0) {
      return res.status(400).json({ message: "User with this phone number already exists" });
    }

    // ✅ Generate new referral code for the registering user
    const new_referral_code = generateReferralUUID();

    // ✅ Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Initialize Referrer
    let referrer_code = null;

    if (referral_code) {
      const referrerResult = await sql.query`SELECT * FROM users WHERE referral_code = ${referral_code}`;
      if (referrerResult.recordset.length > 0) {
        referrer_code = referral_code;
      }
    }

    // ✅ Insert New User
    const emailValue = email || null;

    await sql.query`
      INSERT INTO users (full_name, email, phone_number, place, password, referral_code, referred_by)
      VALUES (${full_name}, ${emailValue}, ${phone_number}, ${place}, ${hashedPassword}, ${new_referral_code}, ${referrer_code})
    `;

    // ✅ Initialize Points for New User (using their own referral code as ID)
    // New user starts with 0 points
    await sql.query`INSERT INTO points (referral_code, points) VALUES (${new_referral_code}, 0)`;

    // ✅ Reward Referrer if a VALID referral code was used
    if (referrer_code) {
      // Update referrer's points by adding 100,000
      await sql.query`UPDATE points SET points = points + 1000000 WHERE referral_code = ${referrer_code}`;
    }

    return res.status(201).json({
      message: "User Registration Successful",
      referral_code: new_referral_code,
    });
  } catch (err) {
    console.log("Error inserting user:", err);

    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

export const userLogin = async (req, res) => {
  const { email, phone_number, password } = req.body;

  try {
    let result;
    if (email) {
      result = await sql.query`SELECT * FROM users WHERE email = ${email}`;
    } else if (phone_number) {
      result = await sql.query`SELECT * FROM users WHERE phone_number = ${phone_number}`;
    } else {
      return res.status(400).json({ message: "Email or Phone Number required" });
    }

    const user = result.recordset[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    // ✅ Fetch User Points
    const pointsResult = await sql.query`SELECT points FROM points WHERE referral_code = ${user.referral_code}`;

    // ✅ Fetch Referral Count
    const referralCountResult = await sql.query`SELECT COUNT(*) as count FROM users WHERE referred_by = ${user.referral_code}`;
    const referralCount = referralCountResult.recordset[0].count;

    return res.status(200).json({
      message: "Login Successful",
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
        referral_code: user.referral_code,
        points: pointsResult.recordset[0] ? pointsResult.recordset[0].points : 0,
        last_check_in_date: user.last_check_in_date,
        referral_count: referralCount,
      },
    });
  } catch (err) {
    console.log("Error logging in:", err);
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};