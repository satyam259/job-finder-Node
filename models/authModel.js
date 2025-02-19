const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const Schema = mongoose.Schema;

// Define the user schema
const authSchema = new Schema({
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/.+\@.+\..+/, "Please enter a valid email address"],
  },
  role: {
    type: String,
    enum: ["Applicant", "Admin", "Employer"],
    default: "Applicant",
  },
  password: {
    type: String,
    minlength: [6, "Password must be at least 6 characters long"],
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpire: {
    type: Date,
  },
}, { timestamps: true },);

//JWT
authSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

authSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare Password
authSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generating Password Reset Token
authSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hashing and adding resetPasswordToken to userSchema
  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

const Auth = mongoose.model("Auth", authSchema);

module.exports = Auth;
