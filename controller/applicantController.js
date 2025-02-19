const catchAsyncError = require("../middleware/catchAsyncError.js");
const ErrorHandler = require("../utils/errorHandler.js");
const Auth = require("../models/authModel.js");
const Job = require("../models/jobModel.js");
const Employer = require("../models/employerModel.js");
const Applicant = require("../models/applicantModel.js");

exports.applyJob = catchAsyncError(async (req, res, next) => {
  const { Job_id, first_name, last_name, profile_summary, phone_number, location, cover_letter } = req.body;
  if (!first_name || !last_name || !location || !profile_summary || !phone_number || !cover_letter) {
    return next(new ErrorHandler("Enter the all required fields", 400));
  }
  const jobID = await Job.findById(Job_id);
  if (!jobID) {
    return next(new ErrorHandler("Job not found", 404));
  }
  const JobApply = await Applicant.create({
    Job_id:jobID,
    first_name,
    last_name,
    profile_summary,
    phone_number,
    location,
    cover_letter,
    applicant_id: req.user._id,
  });
  return res.status(200).json({
    success: true,
    JobApply,
  });
});
