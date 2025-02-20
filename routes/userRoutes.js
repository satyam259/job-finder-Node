const express = require("express");
const { registerUser, registerAdmin, loginAdmin, loginUser, getUserDetails, forgotPassword, resetPassword, changePassword, registerEmployer, loginEmployer } = require("../controller/authController");
const { isAuthenticatedUser } = require("../middleware/authMiddleware");
const { createJob, updateJob, getJobPosts } = require("../controller/jobController");
const { createEmployerProfile, updateEmployerProfile, deleteAllEmployerDetails, deleteEmployerProfile } = require("../controller/employerController");
const { applyJob } = require("../controller/applicantController");
const { createUserProfile, updateUserProfile, getAllUsers } = require("../controller/userController");
const router = express.Router();

// `````````````````````````````user-routes`````````````````````````````
router.route("/register").post(registerUser);
router.route("/login").post(loginUser)
router.route("/user/:id").get(getUserDetails)
router.route("/forget").post(forgotPassword)
router.route("/reset/:token").put(resetPassword)
router.route("/change-password").post(changePassword)
router.route("/create_profile").post(isAuthenticatedUser, createUserProfile)
router.route("/update_profile/:id").post(isAuthenticatedUser, updateUserProfile)

// `````````````````````````````````admin`````````````````````````````````
router.route("/admin/register").post(registerAdmin);
router.route("/admin/login").post(loginAdmin);
router.route("/admin/get_all_users").get(isAuthenticatedUser,getAllUsers)
router.route("/admin/employer/:id").delete(isAuthenticatedUser, deleteAllEmployerDetails)
router.route("/admin/employer_profile/:id").delete(isAuthenticatedUser, deleteEmployerProfile)

// `````````````````````````````````company-routes`````````````````````````````````
router.route("/employer/register").post(registerEmployer);
router.route("/employer/login").post(loginEmployer);
router.route("/employer/create_profile").post(isAuthenticatedUser,createEmployerProfile)
router.route("/employer/update/:id").post(isAuthenticatedUser,updateEmployerProfile)


// `````````````````````````````````job-routes`````````````````````````````````
router.route("/job/create").post(isAuthenticatedUser,createJob);
router.route("/job/apply").post(isAuthenticatedUser, applyJob)
router.route("/job/update/:id").post(isAuthenticatedUser,updateJob)
router.route("/job/find_jobs").get(isAuthenticatedUser, getJobPosts)
module.exports = router;