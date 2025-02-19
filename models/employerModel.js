const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const Schema = mongoose.Schema;

const EmployerSchema = new Schema(
  {
    employer_id: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    company_name: {
      type: String,
    },
    company_website: {
      type: String,
      lowercase: true,
      trim: true,
    },
    company_logo: {
      type: String,
      default:
        "https://static.vecteezy.com/system/resources/previews/000/574/512/original/vector-sign-of-user-icon.jpg",
    },
    location: {
      type: String,
    },
    phone_number: {
      type: String,
    }
  },
  { timestamps: true }
);

const Employer = mongoose.model("Employer", EmployerSchema);

module.exports = Employer;
