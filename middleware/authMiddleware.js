const ErrorHandler = require("../utils/errorHandler.js");
const catchAsyncError = require("./catchAsyncError.js");
const jwt = require("jsonwebtoken");
const auth = require("../models/authModel.js");
exports.isAuthenticatedUser = catchAsyncError(async (req, res, next) => {

  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) {
    return next(new ErrorHandler("Please Login to access this resource", 401));
  }

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await auth.findById(decodedData.id);
  next();
});


exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role: ${req.user.role} is not allowed to access this resouce `,
          403
        )
      );
    }

    next();
  };
};


// export const verifyJWT = asyncHandler(async (req, _, next) => {
//   try {
//     //req.cookies==> se accessToken==> token access
//     //(in mobile) if not toh header se token lenge
//     const token =
//       req.cookies?.accessToken ||
//       // replace krenge agar ("Bearer ") isme space mile toh hum empty string bhejenge jisse sirf token milega
//       //
//       req.header("Authorization")?.replace("Bearer ", "");

//     // console.log(token);
//     if (!token) {
//       throw new ApiError(401, "Unauthorized request");
//     }
//     // verify kr rha hai token
//     const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

//     const user = await User.findById(decodedToken?._id).select(
//       "-password -refreshToken"
//     );

//     if (!user) {
//       throw new ApiError(401, "Invalid Access Token");
//     }
//     //user anne ke baad user ka acces dena
//     req.user = user;
//     //
//     next();
//   } catch (error) {
//     throw new ApiError(401, error?.message || "Invalid access token");
//   }
// });
