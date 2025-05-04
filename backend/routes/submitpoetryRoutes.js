const express = require("express");
const router = express.Router();
const poetryController = require("../controllers/submitpoetryController");

// Submit poetry
router.post("/api/submitpoetry", poetryController.submitPoetry);

// Get all submitted poetry
router.get("/api/getuserpoetry", poetryController.getAllUserPoetry);

router.get('/api/poetry/:id', poetryController.getSinglePoetry);

module.exports = router;
