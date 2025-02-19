const express = require("express");
const { registerUser, registerAdmin, loginAdmin, loginUser, getUserDetails, forgotPassword, resetPassword, changePassword, registerEmployer, loginEmployer } = require("../controller/authController");
const { isAuthenticatedUser } = require("../middleware/authMiddleware");
const { createJob, updateJob, getJobPosts } = require("../controller/jobController");
const { createEmployerProfile } = require("../controller/employerController");
const { applyJob } = require("../controller/applicantController");
const router = express.Router();

// `````````````````````````````user-routes`````````````````````````````
router.route("/register").post(registerUser);
router.route("/login").post(loginUser)
router.route("/user/:id").get(getUserDetails)
router.route("/forget").post(forgotPassword)
router.route("/reset/:token").put(resetPassword)
router.route("/change-password").post(changePassword)
// `````````````````````````````````admin`````````````````````````````````
router.route("/admin/register").post(registerAdmin);
router.route("/admin/login").post(loginAdmin);


// `````````````````````````````````company-routes`````````````````````````````````
router.route("/employer/register").post(registerEmployer);
router.route("/employer/login").post(loginEmployer);
router.route("/employer/create_profile").post(isAuthenticatedUser,createEmployerProfile)


// `````````````````````````````````job-routes`````````````````````````````````
router.route("/job/create").post(isAuthenticatedUser,createJob);
router.route("/job/apply").post(isAuthenticatedUser, applyJob)
router.route("/job/update/:id").post(isAuthenticatedUser,updateJob)
router.route("/job/find_jobs").get(isAuthenticatedUser, getJobPosts)
module.exports = router;