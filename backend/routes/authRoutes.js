const router = require("express").Router();
const authController = require("../controllers/authControllers");
const middleware = require("../middlewares/middleware");

// Existing routes
router.post('/api/login', authController.login);
router.post('/api/news/writer/add', middleware.auth, middleware.role, authController.add_writer);
router.get('/api/news/writers', middleware.auth, middleware.role, authController.get_writers);

// Add the new password change route
router.put('/api/change-password', middleware.auth, authController.change_password);



module.exports = router;
