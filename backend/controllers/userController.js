import bcrypt from "bcrypt";
import { sql } from "../config/connection.js";
import { generateReferralUUID } from "../services/unqReferralGenerationService.js";


export const userRegistration = async (req, res) => {
  const { full_name, email, phone_number, password, referral_code } = req.body;

  if (!email || !password || !full_name) {
    return res.status(400).json({ message: "Full Name, Email, and Password are required." });
  }

  try {
    // ✅ Generate new referral code for the registering user
    const new_referral_code = generateReferralUUID();

    // ✅ Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Insert New User
    await sql.query`
      INSERT INTO users (full_name, email, phone_number, password, referral_code)
      VALUES (${full_name}, ${email}, ${phone_number}, ${hashedPassword}, ${new_referral_code})
    `;

    // ✅ Initialize Points for New User (using their own referral code as ID)
    // New user starts with 0 points
    await sql.query`INSERT INTO points (referral_code, points) VALUES (${new_referral_code}, 0)`;

    // ✅ Reward Referrer if a referral code was used
    if (referral_code) {
      const referrerResult = await sql.query`SELECT * FROM users WHERE referral_code = ${referral_code}`;
      const referrer = referrerResult.recordset[0];

      if (referrer) {
        // Update referrer's points by adding 100,000
        await sql.query`UPDATE points SET points = points + 1000000 WHERE referral_code = ${referral_code}`;
      }
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

    return res.status(200).json({
      message: "Login Successful",
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
        referral_code: user.referral_code,
      },
    });
  } catch (err) {
    console.log("Error logging in:", err);
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};