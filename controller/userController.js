const catchAsyncError = require("../middleware/catchAsyncError.js");
const ErrorHandler = require("../utils/errorHandler.js");
const Auth = require("../models/authModel.js");
const Job = require("../models/jobModel.js");
const User = require("../models/userTable.js");

exports.createUserProfile = catchAsyncError(async (req, res, next) => {
  const { first_name, last_name, profile_summary, phone_number, location,cover_letter } = req.body;
  if (!first_name || !last_name || !profile_summary || !phone_number || !location || !cover_letter ) {
    return next(new ErrorHandler("Enter the all required fields", 400));
  }
  const userProfile = await User.create({
    first_name,
    last_name,
    profile_summary,
    location,
    phone_number,
    cover_letter,
    user_id: req.user._id,
  });
  return res.status(200).json({
    success: true,
    userProfile,
  });
});

exports.updateUserProfile= catchAsyncError(async (req, res, next)=>{
    const { first_name, last_name, profile_summary, phone_number, location,cover_letter } = req.body;

  let UserProfileUpdate = await User.findById(req.params.id);
  if (!User) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Update only provided fields
  const updateFields = {};
  if (first_name !== undefined) updateFields.first_name = first_name;
  if (last_name !== undefined) updateFields.last_name = last_name;
  if (profile_summary !== undefined) updateFields.profile_summary = profile_summary;
  if (phone_number !== undefined) updateFields.phone_number = phone_number;
  if (location !== undefined) updateFields.location = location;
  if (cover_letter !== undefined) updateFields.cover_letter = cover_letter;

  UserProfileUpdate = await User.findByIdAndUpdate(req.params.id, updateFields, {
    new: true,
    runValidators: true,
  });

  return res.status(200).json({
    success: true,
    UserProfileUpdate,
  });
})

exports.getAllUsers = catchAsyncError(async (req, res, next) => {
    const { search, sort, location, page = 1, limit = 20 } = req.query;
    let queryObject = {};
  
    if (location) {
      queryObject.location = { $regex: location, $options: "i" };
    }
  
    if (search) {
      if (["Applicant", "Admin", "Employer"].includes(search)) {
        queryObject.role = search;
      }
    }
  
    let queryResult = Auth.find(queryObject).select("-password");
  
    // Sorting logic
    if (sort === "Newest") queryResult = queryResult.sort("-createdAt");
    if (sort === "Oldest") queryResult = queryResult.sort("createdAt");
    if (sort === "A-Z") queryResult = queryResult.sort("role");
    if (sort === "Z-A") queryResult = queryResult.sort("-role");
  
    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    queryResult = queryResult.skip(skip).limit(Number(limit));
  
    // Get total users count
    const totalUser = await Auth.countDocuments(queryObject);
    const numOfPage = Math.ceil(totalUser / limit);
  
    // Fetch users
    const allUsers = await queryResult;
  
    return res.status(200).json({
      success: true,
      totalUser,
      data: allUsers,
      page: Number(page),
      numOfPage,
    });
  });
  