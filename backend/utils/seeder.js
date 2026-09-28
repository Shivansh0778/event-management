const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const connectDB = require("../config/db");

dotenv.config();
connectDB();

const importData = async () => {
  try {
    await Registration.deleteMany();
    await Event.deleteMany();
    await User.deleteMany();

    const hashedPassword = await bcrypt.hash("password123", 10);

    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
      role: "Admin",
    });

    const regularUser = await User.create({
      name: "John Doe",
      email: "user@example.com",
      password: hashedPassword,
      role: "User",
    });

    await Event.create([
      {
        title: "React & Node Masterclass",
        description: "Learn full-stack web development from scratch.",
        date: new Date(Date.now() + 86400000 * 5),
        location: "Auditorium A",
        totalSeats: 50,
        createdBy: adminUser._id,
      },
      {
        title: "Advanced MongoDB Architecture",
        description:
          "Deep dive into indexing, aggregation, and atomic updates.",
        date: new Date(Date.now() + 86400000 * 10),
        location: "Lab 2",
        totalSeats: 2,
        createdBy: adminUser._id,
      },
    ]);

    console.log("Data Imported Successfully!");
    process.exit();
  } catch (error) {
    console.error(`Error with data import: ${error.message}`);
    process.exit(1);
  }
};

importData();
