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

exports.updateEmployerProfile = catchAsyncError(async (req, res, next) => {
  const { company_name, company_website, company_logo, location, phone_number } = req.body;

  let EmployerProfileUpdate = await Employer.findById(req.params.id);
  if (!EmployerProfileUpdate) {
    return next(new ErrorHandler("Employer not found", 404));
  }

  // Update only provided fields
  const updateFields = {};
  if (company_name !== undefined) updateFields.company_name = company_name;
  if (company_website !== undefined) updateFields.company_website = company_website;
  if (company_logo !== undefined) updateFields.company_logo = company_logo;
  if (location !== undefined) updateFields.location = location;
  if (phone_number !== undefined) updateFields.phone_number = phone_number;

  EmployerProfileUpdate = await Employer.findByIdAndUpdate(req.params.id, updateFields, {
    new: true,
    runValidators: true,
  });

  return res.status(200).json({
    success: true,
    EmployerProfileUpdate,
  });
});

exports.deleteAllEmployerDetails = catchAsyncError(async (req, res, next) => {
  const employerId = req.params.id;
  const EmployerProfileDelete = await Auth.findByIdAndDelete(req.params.id);
  if (!EmployerProfileDelete) {
    return next(new ErrorHandler("Employer not found", 404));
  }
  await Employer.deleteOne({ employer_id: employerId });
  await Job.deleteMany({ employer_id: employerId });
  return res.status(200).json({
    success: true,
    message: "Employer deleted successfully",
  });
});

exports.deleteEmployerProfile= catchAsyncError(async(req, res, next)=>{
  const employerId = req.params.id;
  const EmployerProfileDelete = await Employer.findByIdAndDelete(req.params.id);
  if (!EmployerProfileDelete) {
    return next(new ErrorHandler("Employer not found", 404));
    }
    await Job.deleteMany({ employer_id: employerId });
    return res.status(200).json({
      success: true,
      message: "Employer Profile deleted successfully",
      });
})