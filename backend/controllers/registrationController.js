const Event = require("../models/Event");
const Registration = require("../models/Registration");

const registerForEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user._id || req.user.id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.status !== "Active") {
      return res
        .status(400)
        .json({ message: "Event is not active for registration" });
    }

    if (new Date(event.date) <= new Date()) {
      return res
        .status(400)
        .json({ message: "Event has already started or passed" });
    }

    const updatedEvent = await Event.findOneAndUpdate(
      { _id: eventId, registeredCount: { $lt: event.totalSeats } },
      { $inc: { registeredCount: 1 } },
      { new: true },
    );

    if (!updatedEvent) {
      return res.status(400).json({ message: "Event is full" });
    }

    let registration = await Registration.findOne({
      event: eventId,
      user: userId,
    });

    if (registration) {
      if (registration.status === "Registered") {
        await Event.findByIdAndUpdate(eventId, {
          $inc: { registeredCount: -1 },
        });
        return res
          .status(400)
          .json({ message: "You are already registered for this event" });
      }

      registration.status = "Registered";
      await registration.save();
    } else {
      try {
        registration = await Registration.create({
          event: eventId,
          user: userId,
          status: "Registered",
        });
      } catch (createError) {
        if (createError.code === 11000) {
          await Event.findByIdAndUpdate(eventId, {
            $inc: { registeredCount: -1 },
          });
          return res
            .status(400)
            .json({ message: "You are already registered for this event" });
        }
        throw createError;
      }
    }

    return res.status(200).json({
      success: true,
      message: "Successfully registered for event",
      registration,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const cancelRegistration = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user._id || req.user.id;

    const registration = await Registration.findOneAndUpdate(
      { event: eventId, user: userId, status: "Registered" },
      { status: "Cancelled" },
      { new: true },
    );

    if (!registration) {
      return res
        .status(404)
        .json({ message: "Active registration not found for this event" });
    }

    await Event.findOneAndUpdate(
      { _id: eventId, registeredCount: { $gt: 0 } },
      { $inc: { registeredCount: -1 } },
    );

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
    const userId = req.user._id || req.user.id;
    const registrations = await Registration.find({
      user: userId,
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
  getMyRegistrations,
};