const express = require("express");
const authController = require("../controllers/userAuthController");
const router = express.Router();
const middleware = require("../middlewares/userAuthMiddleware");




router.post("/api/user-signup", authController.user_signup);


router.post("/api/user-login", authController.user_login);

router.post('/api/check-user', authController.check_user);
router.get("/api/verify-email", authController.verify_email);

router.get('/api/user-profile', middleware.auth, authController.get_user_profile);
router.put('/api/update-profile', middleware.auth, authController.update_user_profile);

router.post('/api/favorites/:poetry_id', middleware.auth, authController.toggle_favorite_poem);

router.get('/api/favorite-poetry', middleware.auth, authController.get_user_favorites);
router.delete('/api/favorites/:poetry_id', middleware.auth, authController.delete_favorite_poem);






module.exports = router;
