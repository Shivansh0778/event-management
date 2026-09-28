const express = require("express");
const { getMyRegistrations } = require("../controllers/registrationController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/me/events", protect, getMyRegistrations);

module.exports = router;