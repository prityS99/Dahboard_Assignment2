const mongoose = require("mongoose");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const OTPModel = require("../models/otp");
const { sendOtpEmail } = require("../utils/sendMail");
const { UserValidation } = require("../utils/joiValidation");
const cloudinary = require("../config/cloudinary");

class AuthController {
  // REGISTER //
 async register(req, res) {
  try {
    const { error } = UserValidation.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { name, email, password, role } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Profile image is required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "users",
    });

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashPassword,
      profileImage: {
        url: result.secure_url,
        profileImageId: result.public_id,
      },
      role: role || "user",
    });

    if (!user) {
      return res.status(500).json({
        success: false,
        message: "User creation failed",
      });
    }

    
    await sendOtpEmail(req, user);

    return res.status(201).json({
      success: true,
      message: "Registered successfully. OTP sent to email, please verify.",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
}

  // VERIFY MAIL //
  async verify(req, res) {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          message: "Email and OTP are required",
        });
      }

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (user.isVerified) {
        return res.status(400).json({
          success: false,
          message: "Already verified",
        });
      }

      const otpRecord = await OTPModel.findOne({
        userId: user._id,
        otp: otp.toString(),
      });

      if (!otpRecord) {
        // Optional: Re-send OTP logic if record not found
        return res.status(400).json({
          success: false,
          message: "Invalid or expired OTP",
        });
      }

      user.isVerified = true;
      await user.save();

      await OTPModel.deleteMany({ userId: user._id });

      return res.status(200).json({
        success: true,
        message: "Email verified successfully",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Verification failed",
      });
    }
  }

  // LOGIN //
  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (!user.isVerified) {
        return res.status(403).json({
          success: false,
          message: "Please verify your email first",
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "1h" },
      );

      return res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error during login",
      });
    }
  }

  // DASHBOARD //
  async dashboard(req, res) {
    try {
      return res.status(200).json({
        success: true,
        message: "Welcome to user dashboard",
        data: req.user,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Dashboard access error" });
    }
  }

  // GET //
  async getAllUsers(req, res) {
    try {
      const users = await User.find({});
      res.status(200).json({ success: true, users });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // UPDATE //
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (req.file) {
        updates.profileImage = req.file.path;
      }

      delete updates.password; 

      const updatedUser = await User.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
      });

      if (!updatedUser) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // DELETE //
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      const deletedUser = await User.findByIdAndDelete(id);

      if (!deletedUser) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new AuthController();
