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

router.route("/").get(getEvents).post(protect, adminOnly, createEvent);

router
  .route("/:id")
  .get(getEventById)
  .put(protect, adminOnly, updateEvent)
  .delete(protect, adminOnly, deleteEvent);

router.get("/:id/registrations", protect, adminOnly, getEventRegistrations);

router
  .route("/:id/register")
  .post(protect, registerForEvent)
  .delete(protect, cancelRegistration);

module.exports = router;
