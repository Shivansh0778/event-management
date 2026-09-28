const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title cannot be empty'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    date: {
      type: Date,
      required: [true, 'Event date and time is required'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    totalSeats: {
      type: Number,
      required: [true, 'Total seats must be specified'],
      min: [1, 'Total seats must be greater than zero'],
    },
    registeredCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Active', 'Cancelled', 'Completed'],
      default: 'Active',
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);