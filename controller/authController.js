const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { pool } = require("../db");
const sendVerificationEmail = require("../utils/sendVerificationEmail");
const generateOtp = require("../utils/generateOtp");

class AuthController {
  // POST /api/auth/register
  static async register(req, res) {
    const { username, email, password, phone } = req.body;

    try {
      const emailExists = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
      );
      if (emailExists.rows.length > 0) {
        return res.status(400).json({ message: "Email already in use" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // 🔐 Generate OTP
      const otp = generateOtp();
      const otpHash = await bcrypt.hash(otp, 10);
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

      await pool.query(
        `INSERT INTO users
         (username, password, email, phone, role,
          is_verified, email_otp_hash, email_otp_expires)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          username,
          hashedPassword,
          email,
          phone,
          1,
          false,
          otpHash,
          otpExpires,
        ]
      );

      await sendVerificationEmail(email, otp);

      return res.status(201).json({
        message: "Registered successfully. Check your email for the OTP.",
      });
    } catch (err) {
      console.error("Register error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }

    // POST /api/auth/verify-email
  static async verifyEmail(req, res) {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    try {
      const result = await pool.query(
        `SELECT id, email_otp_hash, email_otp_expires, is_verified
         FROM users WHERE email = $1`,
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({ message: "User not found" });
      }

      const user = result.rows[0];

      if (user.is_verified) {
        return res.status(400).json({ message: "Email already verified" });
      }

      if (new Date(user.email_otp_expires) < new Date()) {
        return res.status(400).json({ message: "OTP expired" });
      }

      const isValidOtp = await bcrypt.compare(otp, user.email_otp_hash);
      if (!isValidOtp) {
        return res.status(400).json({ message: "Invalid OTP" });
      }

      await pool.query(
        `UPDATE users
         SET is_verified = TRUE,
             email_otp_hash = NULL,
             email_otp_expires = NULL
         WHERE id = $1`,
        [user.id]
      );

      return res.json({ message: "Email verified successfully" });
    } catch (err) {
      console.error("Verify OTP error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = AuthController;
