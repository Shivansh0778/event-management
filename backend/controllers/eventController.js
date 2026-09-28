const Event = require("../models/Event");
const Registration = require("../models/Registration");

const createEvent = async (req, res) => {
  try {
    const { title, description, date, location, totalSeats } = req.body;

    if (!title || !description || !date || !location || !totalSeats) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    if (totalSeats <= 0) {
      return res
        .status(400)
        .json({ message: "Total seats must be greater than zero" });
    }

    const eventDate = new Date(date);
    if (isNaN(eventDate.getTime())) {
      return res.status(400).json({ message: "Invalid event date" });
    }

    const event = await Event.create({
      title,
      description,
      date: eventDate,
      location,
      totalSeats,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      event,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getEvents = async (req, res) => {
  try {
    const { search, status, timing } = req.query;
    let query = {};

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (status) {
      query.status = status;
    }

    const now = new Date();
    if (timing === "upcoming") {
      query.date = { $gte: now };
    } else if (timing === "past") {
      query.date = { $lt: now };
    }

    const events = await Event.find(query).sort({ date: 1 });

    const formattedEvents = events.map((event) => {
      const availableSeats = event.totalSeats - event.registeredCount;
      return {
        ...event.toObject(),
        availableSeats,
        isFull: availableSeats <= 0,
        hasStarted: new Date(event.date) <= now,
      };
    });

    let filteredEvents = formattedEvents;
    if (timing === "available") {
      filteredEvents = formattedEvents.filter(
        (e) => e.availableSeats > 0 && !e.hasStarted,
      );
    } else if (timing === "full") {
      filteredEvents = formattedEvents.filter((e) => e.availableSeats <= 0);
    }

    return res.status(200).json({
      success: true,
      count: filteredEvents.length,
      events: filteredEvents,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const availableSeats = event.totalSeats - event.registeredCount;
    const now = new Date();

    return res.status(200).json({
      success: true,
      event: {
        ...event.toObject(),
        availableSeats,
        isFull: availableSeats <= 0,
        hasStarted: new Date(event.date) <= now,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const { totalSeats } = req.body;
    if (totalSeats !== undefined && totalSeats < event.registeredCount) {
      return res.status(400).json({
        message: "Total seats cannot be less than current registered users",
      });
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    // Permanently remove the event from MongoDB
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Clean up all associated registration documents
    await Registration.deleteMany({ event: req.params.id });

    return res.status(200).json({
      success: true,
      message: "Event deleted permanently",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getEventRegistrations = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const registrations = await Registration.find({
      event: req.params.id,
      status: "Registered",
    }).populate("user", "name email");

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
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventRegistrations,
};
