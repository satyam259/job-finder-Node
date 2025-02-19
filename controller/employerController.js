const catchAsyncError = require("../middleware/catchAsyncError.js");
const ErrorHandler = require("../utils/errorHandler.js");
const Auth = require("../models/authModel.js");
const Job = require("../models/jobModel.js");
const Employer = require("../models/employerModel.js");

exports.createEmployerProfile = catchAsyncError(async (req, res, next) => {
  const { company_name, company_website, company_logo, location, phone_number } = req.body;
  if (!company_name || !company_website || !location || !company_logo || !phone_number) {
    return next(new ErrorHandler("Enter the all required fields", 400));
  }
  const employerProfile = await Employer.create({
    company_name,
    company_website,
    company_logo,
    location,
    phone_number,
    employer_id: req.user._id,
  });
  return res.status(200).json({
    success: true,
    employerProfile,
  });
});
