const router = require("express").Router();
const authController = require("../controllers/authControllers");
const middleware = require("../middlewares/middleware");

// Existing routes
router.post('/api/login', authController.login);
router.post('/api/poetry/writer/add', middleware.auth, middleware.role, authController.add_writer);
router.get('/api/poetry/writers', middleware.auth, middleware.role, authController.get_writers);

router.delete('/api/poetry/writer/delete', middleware.auth, middleware.role, authController.delete_writer);



router.put('/api/change-password', middleware.auth, authController.change_password);



module.exports = router;
