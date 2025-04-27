const express = require("express");
const router = express.Router();
const { sendQuery, subscribeNewsletter } = require("../controllers/querySubscribeController");

router.post("/api/send-query", sendQuery);
router.post("/api/subscribe", subscribeNewsletter);

module.exports = router;
