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




// const generateAccessAndRefereshTokens = async (userId) => {
//   try {
//     const user = await User.findById(userId);
//     const accessToken = user.generateAccessToken();
//     const refreshToken = user.generateRefreshToken();
//     user.refreshToken = refreshToken;
//     await user.save({ validateBeforeSave: false });
//     return { accessToken, refreshToken };
//   } catch (error) {
//     throw new ApiError(
//       500,
//       "Something went wrong while generating referesh and access token"
//     );
//   }
// };

// const registerUser = asyncHandler(async (req, res) => {
//   const { fullName, email, username, password } = req.body;
//   if (
//     [fullName, email, username, password].some((field) => field?.trim() === "")
//   ) {
//     throw new ApiError(400, "All fields are required");
//   }

//   const existedUser = await User.findOne({
//     $or: [{ username }, { email }],
//   });

//   if (existedUser) {
//     throw new ApiError(409, "User with email or username already exists");
//   }
//   const avatarLocalPath = req.files?.avatar[0]?.path;
//   let coverImageLocalPath;
//   if (
//     req.files &&
//     Array.isArray(req.files.coverImage) &&
//     req.files.coverImage.length > 0
//   ) {
//     coverImageLocalPath = req.files.coverImage[0].path;
//   }

//   if (!avatarLocalPath) {
//     throw new ApiError(400, "Avatar file is required");
//   }
//   const user = await User.create({
//     fullName,
//     avatar: avatarLocalPath || "",
//     //coverImage==> not url then null
//     coverImage: coverImageLocalPath || "",
//     email,
//     password,
//     username: username.toLowerCase(),
//   });

//   const createdUser = await User.findById(user._id)
//     // select ==> ( - ) jo nahi chahiye or hume ye chije nhi bhejni jab user create ho jaye
//     .select("-password -refreshToken");

//   if (!createdUser) {
//     throw new ApiError(500, "Something went wrong while registering the user");
//   }

//   return res
//     .status(201)
//     .json(new ApiResponse(200, createdUser, "User registered Successfully"));
// });

// const loginUser = asyncHandler(async (req, res) => {
//   const { email, username, password } = req.body;
//   console.log(email);

//   if (!username && !email) {
//     throw new ApiError(400, "username or email is required");
//   }

//   const user = await User.findOne({
//     $or: [{ username }, { email }],
//   });

//   if (!user) {
//     throw new ApiError(404, "User does not exist");
//   }
//   const isPasswordValid = await user.isPasswordCorrect(password);

//   if (!isPasswordValid) {
//     throw new ApiError(401, "Invalid user credentials");
//   }

//   const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
//     user._id
//   );

//   const loggedInUser = await User.findById(user._id).select(
//     "-password -refreshToken"
//   );

//   const options = {
//     httpOnly: true,
//     secure: true,
//   };

//   return res
//     .status(200)
//     .cookie("accessToken", accessToken, options)
//     .cookie("refreshToken", refreshToken, options)
//     .json(
//       new ApiResponse(
//         200,
//         {
//           user: loggedInUser,
//           accessToken,
//           refreshToken,
//         },
//         "User logged In Successfully"
//       )
//     );
// });

// const logoutUser = asyncHandler(async (req, res) => {
//   await User.findByIdAndUpdate(
//     req.user._id,
//     {
//       $unset: {
//         refreshToken: 1,
//       },
//       //
//     },
//     {
//       new: true,
//     }
//   );

//   const options = {
//     httpOnly: true,
//     secure: true,
//   };
//   return res
//     .status(200)
//     .clearCookie("accessToken", options)
//     .clearCookie("refreshToken", options)
//     .json(new ApiResponse(200, {}, "User logged Out"));
// });

// const refreshAccessToken = asyncHandler(async (req, res) => {
//   const incomingRefreshToken =
//     // cookies se token acces
//     // req.body mobile user hai toh body mein bhejega
//     // to vahan se acess krna
//     req.cookies.refreshToken || req.body.refreshToken;

//   if (!incomingRefreshToken) {
//     throw new ApiError(401, "unauthorized request");
//   }

//   try {
//     const decodedToken = jwt.verify(
//       incomingRefreshToken,
//       process.env.REFRESH_TOKEN_SECRET
//     );
//     const user = await User.findById(decodedToken?._id);

//     if (!user) {
//       throw new ApiError(401, "Invalid refresh token");
//     }
//     if (incomingRefreshToken !== user?.refreshToken) {
//       throw new ApiError(401, "Refresh token is expired or used");
//     }

//     const options = {
//       httpOnly: true,
//       secure: true,
//     };

//     const { accessToken, newRefreshToken } =
//       await generateAccessAndRefereshTokens(user._id);
//     return res
//       .status(200)
//       .cookie("accessToken", accessToken, options)
//       .cookie("refreshToken", newRefreshToken, options)
//       .json(
//         new ApiResponse(
//           200,
//           { accessToken, refreshToken: newRefreshToken },
//           "Access token refreshed"
//         )
//       );
//   } catch (error) {
//     throw new ApiError(401, error?.message || "Invalid refresh token");
//   }
// });
