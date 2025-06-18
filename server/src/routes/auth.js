import express from "express";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { query } from "../db.js";
import { generateAccessToken, generateRefreshToken, verifyToken } from "../utils/jwt.js";

const router = express.Router();

// Register new user
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Check if user already exists
    const existingUser = await query("SELECT id FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const result = await query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, created_at",
      [email, hashedPassword]
    );

    const user = result.rows[0];
    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user
    const result = await query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user || !user.is_active) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate tokens
    const accessToken = generateAccessToken({ 
      id: user.id, 
      email: user.email,
      role: user.role 
    });
    const refreshToken = generateRefreshToken({ id: user.id });

    // Store refresh token in database
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await query(
      "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [user.id, refreshToken, expiresAt]
    );

    // Update last login
    await query("UPDATE users SET last_login = NOW() WHERE id = $1", [user.id]);

    // Set refresh token as httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Refresh access token
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ error: "Refresh token required" });
    }

    // Verify refresh token
    const payload = verifyToken(refreshToken, process.env.REFRESH_SECRET);

    // Check if refresh token exists in database
    const tokenResult = await query(
      "SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()",
      [refreshToken]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(403).json({ error: "Invalid refresh token" });
    }

    // Get user data
    const userResult = await query("SELECT * FROM users WHERE id = $1", [payload.id]);
    const user = userResult.rows[0];

    if (!user || !user.is_active) {
      return res.status(403).json({ error: "User not found or inactive" });
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    res.json({ accessToken });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(403).json({ error: "Invalid refresh token" });
  }
});

// Logout user
router.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
      // Remove refresh token from database
      await query("DELETE FROM refresh_tokens WHERE token = $1", [refreshToken]);
    }

    // Clear refresh token cookie
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Request password reset
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Find user
    const userResult = await query("SELECT id FROM users WHERE email = $1", [email]);
    const user = userResult.rows[0];

    if (!user) {
      // Don't reveal if email exists or not
      return res.json({ message: "If the email exists, a reset link has been sent" });
    }

    // Generate reset token
    const resetToken = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token
    await query(
      "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [user.id, resetToken, expiresAt]
    );

    // In a real app, you would send an email here
    console.log(`Password reset token for ${email}: ${resetToken}`);

    res.json({ message: "If the email exists, a reset link has been sent" });
  } catch (error) {
    console.error("Password reset request error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Reset password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: "Token and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Find valid reset token
    const tokenResult = await query(
      "SELECT user_id FROM password_reset_tokens WHERE token = $1 AND expires_at > NOW()",
      [token]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    const userId = tokenResult.rows[0].user_id;

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await query("UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2", [
      hashedPassword,
      userId
    ]);

    // Delete used reset token
    await query("DELETE FROM password_reset_tokens WHERE token = $1", [token]);

    // Delete all refresh tokens for this user (force re-login)
    await query("DELETE FROM refresh_tokens WHERE user_id = $1", [userId]);

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
