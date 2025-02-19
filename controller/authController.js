const catchAsyncError = require("../middleware/catchAsyncError.js");
const ErrorHandler = require("../utils/errorHandler.js");
const sendToken = require("../utils/jwtToken.js");
const sendEmail = require("../utils/mailer.js");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const Auth = require("../models/authModel.js");

// `````````````````````````register`````````````````````
exports.registerUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  if ( !email || !password ) {
    return next(new ErrorHandler("Enter the all required fields", 400));
  }
  const existingUser = await Auth.findOne({ email });

  if (existingUser) {
    return next(new ErrorHandler("Email already exists", 400));
  } else {
    const newUser = await Auth.create({
      email,
      password,
    });
    return sendToken(newUser, 200, res);
  }
});

// ```````````````````````Login```````````````````
exports.loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  // checking if user has given password and email both

  if (!email || !password) {
    return next(new ErrorHandler("Please Enter Email & Password", 400));
  }

  const data = await Auth.findOne({ email }).select("+password");

  if (!data) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  const isPasswordMatched = await data.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

 return sendToken(data, 200, res, "Logged in successfully");
});

// ```````````````````````forget-Password```````````````````
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await Auth.findOne({ email: req.body.email });

    if (!user) {
      return res.status(200).json({
        message: "Email is not found",
      });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/password/reset/${resetToken}`;

    const message = ` Hi ${user.username}, \n\n You requested to reset your Password. \n\n Please, click the link below to reset your password \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;

    await sendEmail({
      email: user.email,
      subject: `Password Recovery`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    Auth.resetPasswordToken = undefined;
    Auth.resetPasswordExpire = undefined;

    await Auth.save({ validateBeforeSave: false });

    return res.status(500).json({
      success: false,
      message: "There was an error sending the email. Please try again later.",
    });
  }
};

// ```````````````````````logout```````````````````
exports.logout = catchAsyncError(async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
});

// ```````````````````````Reset-Password```````````````````
exports.resetPassword = async (req, res, next) => {
  const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await Auth.findOne({
    resetPasswordToken: resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Reset Password Token is invalid or has expired",
    });
  }

  const { newPassword } = req.body;
  if (!newPassword) {
    return res.status(400).json({
      success: false,
      message: "New password is required",
    });
  }

  user.password = await newPassword;

  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

 return  res.status(200).json({
    success: true,
    message: "Password reset successfully",
  });
};

// ```````````````````````changePassword```````````````````
exports.changePassword = async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  const user = await Auth.findById(req.user.id);
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: "Old password is incorrect",
    });
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  user.password = hashedPassword;
  await user.save({ validateBeforeSave: false });
  return res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
};

// ```````````````````````getAllUserDetails```````````````````
exports.getUserDetails = catchAsyncError(async (req, res, next) => {
  const data = await Auth.findById(req.params.id);

  if (!data) {
    return next(new ErrorHandler(`User does not exist with Id: ${req.params.id}`));
  }

  return res.status(200).json({
    success: true,
    data,
  });
});

// ```````````````````````````````````Admin`````````````````````````````````


// ```````````````````````register```````````````````
exports.registerAdmin = catchAsyncError(async (req, res, next) => {
  const {  email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("Email and Password is required", 400));
  }
  const existingUser = await Auth.findOne( {email});

  if (existingUser) {
    return next(new ErrorHandler("Email already exists", 400));
  }
  const data = await Auth.create({
    email,
    password,
    role: "Admin",
  });

 return sendToken(data, 201, res);
});

// ```````````````````````Login```````````````````
exports.loginAdmin = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  // checking if user has given password and email both

  if (!email || !password) {
    return next(new ErrorHandler("Please Enter Email & Password", 400));
  }

  const admin = await Auth.findOne({ email }).select("+password");

  if (!admin) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  const isPasswordMatched = await admin.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  return sendToken(admin, 200, res, "Logged in successfully");
});

// `````````````````````````````````````Employer`````````````````````````````````````


// `````````````````````````register`````````````````````

exports.registerEmployer = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("Email and Password is required", 400));
  }
  const existingUser = await Auth.findOne( {email});

  if (existingUser) {
    return next(new ErrorHandler("Email already exists", 400));
  }
  const data = await Auth.create({
    email,
    password,
    role: "Employer",
  });

  return sendToken(data, 201, res);
});

// ```````````````````````Login```````````````````
exports.loginEmployer = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  // checking if user has given password and email both

  if (!email || !password) {
    return next(new ErrorHandler("Please Enter Email & Password", 400));
  }

  const employer = await Auth.findOne({ email }).select("+password");

  if (!employer) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  const isPasswordMatched = await employer.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  return sendToken(employer, 200, res, "Logged in successfully");
});