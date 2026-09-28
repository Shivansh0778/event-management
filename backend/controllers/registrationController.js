const Event = require("../models/Event");
const Registration = require("../models/Registration");

const registerForEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.status !== "Active") {
      return res.status(400).json({ message: "Event is not active for registration" });
    }

    const now = new Date();
    if (new Date(event.date) <= now) {
      return res.status(400).json({ message: "Event has already started or passed" });
    }

    const existingRegistration = await Registration.findOne({
      event: eventId,
      user: userId,
    });

    if (existingRegistration) {
      if (existingRegistration.status === "Registered") {
        return res.status(400).json({ message: "You are already registered for this event" });
      } else {
        existingRegistration.status = "Registered";
        await existingRegistration.save();

        const updatedEvent = await Event.findOneAndUpdate(
          { _id: eventId, registeredCount: { $lt: event.totalSeats } },
          { $inc: { registeredCount: 1 } },
          { new: true }
        );

        if (!updatedEvent) {
          existingRegistration.status = "Cancelled";
          await existingRegistration.save();
          return res.status(400).json({ message: "Event is full" });
        }

        return res.status(200).json({
          success: true,
          message: "Successfully registered for event",
          registration: existingRegistration,
        });
      }
    }

    const updatedEvent = await Event.findOneAndUpdate(
      { _id: eventId, registeredCount: { $lt: event.totalSeats } },
      { $inc: { registeredCount: 1 } },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(400).json({ message: "Event is full" });
    }

    const registration = await Registration.create({
      event: eventId,
      user: userId,
      status: "Registered",
    });

    return res.status(201).json({
      success: true,
      message: "Successfully registered for event",
      registration,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "You are already registered for this event" });
    }
    return res.status(500).json({ message: error.message });
  }
};

const cancelRegistration = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user._id;

    const registration = await Registration.findOne({
      event: eventId,
      user: userId,
      status: "Registered",
    });

    if (!registration) {
      return res.status(404).json({ message: "Active registration not found for this event" });
    }

    registration.status = "Cancelled";
    await registration.save();

    await Event.findByIdAndUpdate(eventId, {
      $inc: { registeredCount: -1 },
    });

    return res.status(200).json({
      success: true,
      message: "Registration cancelled successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({
      user: req.user._id,
      status: "Registered",
    }).populate("event");

    return res.status(200).json({
      success: true,
      count: registrations.length,
      registrations,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations
};