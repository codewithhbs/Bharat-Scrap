const express = require("express");
const router = express.Router();
const { authenticateAccessToken } = require("../utils/jwtUtil");
const { getRoute } = require("../controllers/mapController");

router.get("/route", authenticateAccessToken, getRoute);

module.exports = router;
