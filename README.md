# Event Registration & Seat Management System

A full-stack MERN (MongoDB, Express.js, React.js, Node.js) application designed to manage workshops and corporate events with robust concurrency handling, seat limits, role-based access control, and real-time filtering.

---

## Tech Stack

* **Frontend:** React.js, Tailwind CSS, Redux Toolkit, Axios
* **Backend:** Node.js, Express.js
* **Database:** MongoDB, Mongoose ODM
* **Authentication:** JSON Web Tokens (JWT), bcryptjs

---

## Features

* **Role-Based Access Control (RBAC):** Separate permissions and dashboards for **Admins** and **Users**.
* **Event Management (Admin):** Create, update, view, and permanently delete events with seat restrictions and date validations.
* **Attendee Monitoring (Admin):** Dedicated viewer to see registered users and emails for any given event.
* **User Registrations:** Browse upcoming events, search by title, filter by timing/status, register for seats, and cancel bookings dynamically.
* **Robust Edge Case Handling:** Prevents over-booking, duplicate sign-ups, registrations past event start times, and handles cascade cleanups on event deletion.

---

## Project Structure

```text
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
└── README.md
```

## Setup Instructions
Prerequisites
Node.js installed locally

MongoDB running locally or via MongoDB Atlas connection URI

1. Backend Setup
Bash
cd backend
npm install
Create a .env file inside the backend/ folder based on .env.example:

Code snippet
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=your_jwt_secret_here
Start the backend server:

Bash
npm run dev
2. Frontend Setup
Bash
cd frontend
npm install
Create a .env file inside the frontend/ folder if needed:

Code snippet
VITE_API_URL=http://localhost:5000/api
Start the frontend development server:

Bash
npm run dev
Environment Variables (.env.example)
Backend (backend/.env.example)
Code snippet
PORT=5000
MONGO_URI=mongodb://localhost:27017/event-management
JWT_SECRET=supersecretjwtkey
Frontend (frontend/.env.example)
Code snippet
VITE_API_URL=http://localhost:5000/api
API Documentation
Authentication
POST /api/auth/register - Register a new user (name, email, password, role)

POST /api/auth/login - Authenticate user and return JWT token

Events
GET /api/events - Retrieve all events (supports query params: search, timing)

GET /api/events/:id - Get single event details by ID

POST /api/events - Create a new event (Admin only)

PUT /api/events/:id - Update event details (Admin only)

DELETE /api/events/:id - Permanently delete event and cascade cleanups (Admin only)

Registrations
POST /api/events/:id/register - Register current user for an event

DELETE /api/events/:id/register - Cancel user registration for an event

GET /api/events/:id/registrations - View all registered attendees for an event (Admin only)

Business Logic & Edge Cases
Scenario 1 & 2 – Event Capacity & Concurrency Protection: The system tracks registeredCount against totalSeats. Backend validations ensure registration requests are rejected immediately if available seats drop to zero, ensuring registrations never exceed event capacity.

Scenario 3 – Duplicate Registration Prevention: Enforced at the database layer via a compound unique index on { user, event }, ensuring a user can never register twice for the same event regardless of frontend clicks.

Scenario 4 – Event Already Started: Backend controllers compare the current timestamp against the event date. Registrations are automatically blocked if the event has already started.

Scenario 5 – Seat Restoration on Cancellation: When a user cancels their registration, the booking status updates and the available seat count increments cleanly, allowing other users to book instantly.

Scenario 6 – Event Deletion Cascade: When an admin deletes an event, the event document is permanently removed from MongoDB, and all associated registration documents are wiped out to prevent orphaned records.

Scenario 7 – Invalid Data Validation: Backend validation checks ensure required fields are present, event titles are non-empty, dates are valid, and total seats are greater than zero.