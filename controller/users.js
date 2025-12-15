const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const nodemailer = require('nodemailer');

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

const ROLES = {
  ADMIN: 30,
  MANAGER: 20,
  USER: 10
};

class UserController {
  async getAllUsers(req, res) {
    const users = await User.getAllUsers();
    res.json({ success: true, data: users });
  }
  async register(req, res) {
    try {
      const { username, email, password, phone } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      // Check if user exists
      const existingUser = await User.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Create new user
      const user = await User.createUser({
        username,
        email,
        phone,
        password: hashedPassword,
        role: 10 // Default role as 'USER'
      });

      return res.status(201).json({
        message: "User registered successfully",
        user
      });
    } catch (err) {
      next(err);
    }

  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      console.log("Login attempt for email:", email);

      const user = await User.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Wrong password or username" });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      if (!user.is_verified && user.role !== 30) {
        return res.status(403).json({
          message: "Please verify your email before logging in",
        });
      }


      return res.json({ token });
    } catch (err) {
        next(err);
      }

  }

  async profile(req, res) {
    try {
      const user = await User.getUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.json({ user });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch profile" });
    }
  }
  async changePassword(req, res) {
  try {
    const userId = req.user.id; // set by authGuard
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Old and new passwords are required" });
    }

    const user = await User.getUserById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: "Old password is incorrect" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updatePassword(userId, hashedPassword);

    return res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to change password" });
  }
}
// controller/users.js
async updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const { username, email, phone, role } = req.body;

    // Basic validation
    if (!username || !email) {
      return res.status(400).json({
        message: "Username and email are required",
      });
    }

    const updatedUser = await User.updateUser(id, {
      username,
      email,
      phone,
      role,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (err) {
    next(err); // 🔥 goes to error logger
  }
}

async deleteUser(req, res, next) {
  try {
    const { id } = req.params;

    const deletedUser = await User.deleteUserById(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    next(err);
  }
}
}

module.exports = UserController;
