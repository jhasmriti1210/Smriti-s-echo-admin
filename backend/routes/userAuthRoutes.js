const express = require("express");
const authController = require("../controllers/userAuthController");
const router = express.Router();
const passport = require("passport");

// Signup route
router.post("/api/user-signup", authController.user_signup);

// Login route
router.post("/api/user-login", authController.user_login);

router.post('/api/check-user', authController.check_user);

// Google login route - to initiate Google login
router.get("/auth/google", authController.user_google_login);

// Google callback route - where Google will redirect after successful login
router.get("/auth/google/callback", authController.user_google_callback);


module.exports = router;
