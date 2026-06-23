const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const db = require("../config/db");
const { sendEmail } = require("../config/mail");

// 1. Register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const [existingUser] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    await db.query(
      `INSERT INTO users(name, email, password, role, verified, verification_token)
       VALUES(?, ?, ?, ?, 0, ?)`,
      [
        name,
        email,
        hashedPassword,
        role || "student",
        verificationToken
      ]
    );

    // Send email verification
    const verificationLink = `http://localhost:5173/verify-email?token=${verificationToken}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #4f46e5; text-align: center;">Welcome to ETLP!</h2>
        <p>Dear ${name},</p>
        <p>Thank you for registering on the Emerging Technologies Learning Portal. Please click the button below to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all;"><a href="${verificationLink}">${verificationLink}</a></p>
        <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">If you did not sign up for this account, you can safely ignore this email.</p>
      </div>
    `;

    await sendEmail({
      to: email,
      subject: "Verify Your Email - ETLP",
      html: emailHtml
    });

    res.status(201).json({
      success: true,
      message: "Registration successful! Please check your email to verify your account."
    });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// 2. Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid Password"
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile_image: user.profile_image,
        verified: user.verified
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// 3. Verify Email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const [users] = await db.query(
      "SELECT * FROM users WHERE verification_token = ?",
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token"
      });
    }

    const user = users[0];
    await db.query(
      "UPDATE users SET verified = 1, verification_token = NULL WHERE id = ?",
      [user.id]
    );

    res.json({
      success: true,
      message: "Email verified successfully! You can now log in."
    });

  } catch (error) {
    console.error("Verify Email Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// 4. Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User with this email does not exist"
      });
    }

    const user = users[0];
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

    await db.query(
      "UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?",
      [resetToken, resetTokenExpires, user.id]
    );

    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #e11d48; text-align: center;">Reset Your Password</h2>
        <p>Dear ${user.name},</p>
        <p>You requested to reset your password. Please click the button below to set a new password. This link will expire in 1 hour:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #e11d48; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all;"><a href="${resetLink}">${resetLink}</a></p>
        <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">If you did not request a password reset, you can safely ignore this email.</p>
      </div>
    `;

    await sendEmail({
      to: email,
      subject: "Password Reset Request - ETLP",
      html: emailHtml
    });

    res.json({
      success: true,
      message: "Password reset link sent to your email."
    });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// 5. Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const [users] = await db.query(
      "SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()",
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token"
      });
    }

    const user = users[0];
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?",
      [hashedPassword, user.id]
    );

    res.json({
      success: true,
      message: "Password reset successful! You can now log in with your new password."
    });

  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// 6. Get Current User Details
exports.getMe = async (req, res) => {
  try {
    const [users] = await db.query(
      "SELECT id, name, email, role, profile_image, verified, created_at FROM users WHERE id = ?",
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      user: users[0]
    });

  } catch (error) {
    console.error("GetMe Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// 7. Update User Profile
exports.updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;
    let query = "UPDATE users SET name = ?";
    let params = [name];

    if (req.file) {
      query += ", profile_image = ?";
      params.push(req.file.url);
    }

    query += " WHERE id = ?";
    params.push(userId);

    await db.query(query, params);

    // Get updated user details
    const [users] = await db.query(
      "SELECT id, name, email, role, profile_image, verified, created_at FROM users WHERE id = ?",
      [userId]
    );

    res.json({
      success: true,
      message: "Profile updated successfully!",
      user: users[0]
    });

  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};