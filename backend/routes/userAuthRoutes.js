const express = require("express");
const authController = require("../controllers/userAuthController");
const router = express.Router();
const middleware = require("../middlewares/userAuthMiddleware");




router.post("/api/user-signup", authController.user_signup);


router.post("/api/user-login", authController.user_login);

router.post('/api/check-user', authController.check_user);




router.get("/api/verify-email", authController.verify_email);
router.put("/api/update-profile", middleware.auth, authController.update_profile);

// // Google login route - to initiate Google login
// router.get("/auth/google", authController.user_google_login);

// // Google callback route - where Google will redirect after successful login
// router.get("/auth/google/callback", authController.user_google_callback);

// // Add this to the routes file to handle the password setting
// router.post("/api/set-password", authController.user_set_password);



module.exports = router;
