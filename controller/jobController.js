const catchAsyncError = require("../middleware/catchAsyncError.js");
const ErrorHandler = require("../utils/errorHandler.js");
const Auth = require("../models/authModel.js");
const Job = require("../models/jobModel.js");
const Employer = require("../models/employerModel.js");
const Jobs = require("../models/jobModel.js");

exports.createJob = catchAsyncError(async (req, res, next) => {
  const {
    employer_Id,
    job_title,
    job_description,
    location,
    job_type,
    salary_range,
    expiry ,
    vacancies,
    experience,
  } = req.body;
  if (
    !job_title ||
    !job_description ||
    !location ||
    !job_type ||
    !salary_range ||
    !expiry ||
    !vacancies ||
    !experience
  ) {
    return next(new ErrorHandler("Enter the all required fields", 400));
  }
  let expires_at;
  if (expiry === "3days") {
    expires_at = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); 
  } else if (expiry === "7days") {
    expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); 
  } else if (expiry === "1month") {
    expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); 
  } else {
    expires_at = null;
  }
  const employerId = await Employer.findById(employer_Id);
  if (!employerId) {
    return next(new ErrorHandler("Employer not found", 404));
  }
  const newjob = await Job.create({
    job_title,
    job_description,
    location,
    job_type,
    salary_range,
    expires_at,
    vacancies,
    experience,
    employer_id: employerId,
  });
  return res.status(200).json({
    success: true,
    newjob,
  });
});

exports.updateJob = catchAsyncError(async (req, res, next) => {
  const {
    job_title,
    job_description,
    location,
    job_type,
    salary_range,
    expiry ,
    vacancies,
    experience,
  } = req.body;

  let expires_at;
  if (expiry === "3days") {
    expires_at = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); 
  } else if (expiry === "7days") {
    expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); 
  } else if (expiry === "1month") {
    expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); 
  } else {
    expires_at = null;
  }
  let job_Id = await Job.findById(req.params.id);
  if (!job_Id) {
    return next(new ErrorHandler("Job not found", 404));
  }

  // Update only provided fields
  const updateFields = {};
  if (job_title !== undefined) updateFields.job_title = job_title;
  if (job_description !== undefined) updateFields.job_description = job_description;
  if (location !== undefined) updateFields.location = location;
  if (job_type !== undefined) updateFields.job_type = job_type;
  if (salary_range !== undefined) updateFields.salary_range = salary_range;
  if (expiry !== undefined) updateFields.expiry = expiry;
  if (vacancies !== undefined) updateFields.vacancies = vacancies;
  if (experience !== undefined) updateFields.experience = experience;

  job_Id = await Job.findByIdAndUpdate(req.params.id, updateFields, {
    new: true,
    runValidators: true,
  });

  return res.status(200).json({
    success: true,
    job_Id,
  });
});

exports.getJobPosts= catchAsyncError(async(req, res, next)=>{
  const { search, sort, location, jtype, exp } = req.query;
  const types = jtype?.split(","); 
  const experience = exp?.split("-"); //2-6
  let queryObject = {};

  if (location) {
    queryObject.location = { $regex: location, $options: "i" };  // match location and op- match both lower and upper letter
  }
  if (jtype) {
    queryObject.job_type = { $in: types };  //match the select type
  }
  if (exp) {
    queryObject.experience = {
      $gte: Number(experience[0]) - 1,
      $lte: Number(experience[1]) + 1,
    };
  }
  if (search) {
    const searchQuery = {
      $or: [
        { job_title: { $regex: search, $options: "i" } },
        { job_type: { $regex: search, $options: "i" } },
      ],
    };
    queryObject = { ...queryObject, ...searchQuery };
  }
  let queryResult = Jobs.find(queryObject).populate({
    path: "employer_id",
    select: "-password",
  });
  console.log(search,"sdaf")
  if (sort === "Newest") {
    queryResult = queryResult.sort("-createdAt");
  }
  if (sort === "Oldest") {
    queryResult = queryResult.sort("createdAt");
  }
  if (sort === "A-Z") {
    queryResult = queryResult.sort("job_title");
  }
  if (sort === "Z-A") {
    queryResult = queryResult.sort("-job_title");
  }

  const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const totalJobs = await Jobs.countDocuments(queryResult);
    const numOfPage = Math.ceil(totalJobs / limit);

    queryResult = queryResult.limit(limit * page);
      const jobs = await queryResult;

   return res.status(200).json({
      success: true,
      totalJobs,
      data: jobs,
      page,
      numOfPage,
    });
})