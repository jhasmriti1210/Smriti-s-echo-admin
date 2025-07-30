const router = require('express').Router();
const middleware = require('../middlewares/middleware');
const poetryController = require('../controllers/poetryController');
const usermiddleware = require('../middlewares/userAuthMiddleware');

// dashboard
router.post('/api/poetry/add', middleware.auth, poetryController.add_poetry);
router.put('/api/poetry/update/:poetry_id', middleware.auth, poetryController.update_poetry);
router.put('/api/poetry/status-update/:poetry_id', middleware.auth, poetryController.update_poetry_update);
router.delete('/api/poetry/delete/:poetry_id', middleware.auth, poetryController.delete_poetry);

router.get('/api/images', middleware.auth, poetryController.get_images);
router.post('/api/images/add', middleware.auth, poetryController.add_images);

router.get('/api/poetry', middleware.auth, poetryController.get_dashboard_poetry);
router.get('/api/poetry/:poetry_id', middleware.auth, poetryController.get_dashboard_single_poetry);

// Like/Unlike poetry
router.post('/api/poetry/like/:poetry_id', usermiddleware.auth, poetryController.toggle_like_poetry);

// website
router.get('/api/all/poetry', poetryController.get_all_poetry);
router.get('/api/popular/poetry', poetryController.get_popular_poetry);
router.get('/api/latest/poetry', poetryController.get_latest_poetry);
router.get('/api/images/poetry', poetryController.get_images);
router.get('/api/recent/poetry', poetryController.get_recent_poetry);
router.get("/api/featured/poetry", poetryController.get_featured_poetry);


router.get('/api/poetry/details/:slug', poetryController.get_poetry);
router.get('/api/category/all', poetryController.get_categories);

router.get('/api/category/poetry/:category', poetryController.get_category_poetry);
router.get('/api/search/poetry', poetryController.poetry_search);

router.post('/api/add-rating/:poetry_id', usermiddleware.auth, poetryController.add_rating);
router.post('/api/add-comment/:poetry_id', usermiddleware.auth, poetryController.add_comment);
router.get("/api/top-testimonials", poetryController.top_testimonials);





module.exports = router;
