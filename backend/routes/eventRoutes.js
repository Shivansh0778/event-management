const express = require("express");
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventRegistrations,
} = require("../controllers/eventController");
const {
  registerForEvent,
  cancelRegistration,
} = require("../controllers/registrationController");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.get("/", getEvents);

router.get("/:id", getEventById);

router.post("/", protect, adminOnly, createEvent);

router.put("/:id", protect, adminOnly, updateEvent);

router.delete("/:id", protect, adminOnly, deleteEvent);

router.get("/:id/registrations", protect, adminOnly, getEventRegistrations);

router.post("/:id/register", protect, registerForEvent);

router.delete("/:id/register", protect, cancelRegistration);

module.exports = router;
