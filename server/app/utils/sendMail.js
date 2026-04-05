const transporter = require("../config/emailConfig");
const OTPModel = require("../models/otp");

// 1. OTP email
const sendOtpEmail = async (req, user) => {
  if (!user || !user._id) {
    throw new Error("User ID is missing for OTP generation");
  }

  const otp = Math.floor(1000 + Math.random() * 9000);

  await OTPModel.deleteMany({ userId: user._id });

  await OTPModel.create({
    userId: user._id,
    otp,
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: "OTP - Verify your account",
    html: `
      <p>Dear ${user.name},</p>
      <p>Verify your email using this OTP:</p>
      <h2 style="text-align:center; background:#a61616; padding:10px;">
        ${otp}
      </h2>
      <p>This OTP is valid for 5 minutes.</p>
    `,
  });

  return otp;
};

// 2. Credentials email
const sendCredentialsEmail = async (to, subject, html) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};

module.exports = {
  sendOtpEmail,
  sendCredentialsEmail,
};