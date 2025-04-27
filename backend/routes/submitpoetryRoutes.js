const express = require("express");
const router = express.Router();
const poetryController = require("../controllers/submitpoetryController");

// Define the route for submitting poetry with audio
router.post("/api/submitpoetry", poetryController.submitPoetry);

module.exports = router;
