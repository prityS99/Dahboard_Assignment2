const mongoose=require("mongoose");

// Defining Schema
const OTPMSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: '5m' }
});

// Model
const OTPModel = mongoose.model("EmailVerification", OTPMSchema);

module.exports= OTPModel;