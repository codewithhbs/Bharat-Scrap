const express = require("express");
const router = express.Router();

const { authenticateAccessToken } = require("../utils/jwtUtil");
const rateLimiter = require("../middleware/rateLimiter");
const contactController = require("../controllers/contactController");

router.post("/create-contact", contactController.createContactMessage);
router.post("/create-quote", contactController.createQuoteRequest);

module.exports = router;