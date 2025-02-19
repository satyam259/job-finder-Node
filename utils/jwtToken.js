// Create Token and saving in cookie
const sendToken = (data, statusCode, res,message) => {
    const token = data.getJWTToken();
  
    res.status(statusCode).json({
      success: true,
      message:message,
      data,
      token
    });
  };
  
  module.exports = sendToken;
  