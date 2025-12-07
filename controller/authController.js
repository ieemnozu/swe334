const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { pool } = require("../db");
const sendVerificationEmail = require("../utils/sendVerificationEmail");

class AuthController {
  // POST /api/auth/register
  static async register(req, res) {
    const { username, email, password, phone } = req.body;

    try {
      // 1) check if email already used
      const existing = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
      );
      if (existing.rows.length > 0) {
        return res.status(400).json({ message: "Email already in use" });
      }

      // (optional) check username unique too
      const existingUser = await pool.query(
        "SELECT id FROM users WHERE username = $1",
        [username]
      );
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ message: "Username already taken" });
      }

      // 2) hash password (stored in `password` column)
      const hashedPassword = await bcrypt.hash(password, 10);

      // 3) generate verification token + expiry
      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // 4) default role (change this to what you use, e.g. 1 = customer)
      const defaultRole = 1;

      // 5) insert user
      const result = await pool.query(
        `INSERT INTO users
           (username, password, email, phone, role,
            is_verified, verification_token, verification_expires)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, email`,
        [
          username,
          hashedPassword,
          email,
          phone,
          defaultRole,
          false,
          token,
          expires,
        ]
      );

      const user = result.rows[0];

      // 6) send verification email
      await sendVerificationEmail(user.email, token);

      return res.status(201).json({
        message:
          "Registered successfully. Please check your email to verify your account.",
      });
    } catch (err) {
      console.error("Register error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }

  // GET /api/auth/verify-email?token=...
  static async verifyEmail(req, res) {
    const { token } = req.query;

    if (!token) {
      return res.status(400).send("Missing verification token");
    }

    try {
      // 1) find user by token
      const result = await pool.query(
        `SELECT id, is_verified, verification_expires
         FROM users
         WHERE verification_token = $1`,
        [token]
      );

      if (result.rows.length === 0) {
        return res.status(400).send("Invalid verification link");
      }

      const user = result.rows[0];

      // already verified
      if (user.is_verified) {
        return res.status(400).send("Email already verified");
      }

      // expired token
      if (new Date(user.verification_expires) < new Date()) {
        return res.status(400).send("Verification link has expired");
      }

      // 2) update user as verified
      await pool.query(
        `UPDATE users
         SET is_verified = TRUE,
             verification_token = NULL,
             verification_expires = NULL
         WHERE id = $1`,
        [user.id]
      );

      // you can redirect to frontend login page here instead of send()
      return res.send("Email verified successfully. You can now log in.");
    } catch (err) {
      console.error("Verify email error:", err);
      return res.status(500).send("Server error");
    }
  }
}

module.exports = AuthController;
