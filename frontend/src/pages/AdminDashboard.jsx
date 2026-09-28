import { useState, useEffect } from "react";
import API from "../services/api";

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [registrations, setRegistrations] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    totalSeats: 30,
  });
  const [message, setMessage] = useState("");

  const { title, description, date, location, totalSeats } = formData;

  const fetchAdminEvents = async () => {
    try {
      const response = await API.get("/events");
      const eventData = response.data.events || response.data;
      setEvents(Array.isArray(eventData) ? eventData : []);
    } catch (error) {
      console.error("Failed to fetch events", error);
      setEvents([]);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadEvents = async () => {
      try {
        const response = await API.get("/events");
        if (isMounted) {
          const eventData = response.data.events || response.data;
          setEvents(Array.isArray(eventData) ? eventData : []);
        }
      } catch (error) {
        console.error("Failed to fetch events", error);
        if (isMounted) {
          setEvents([]);
        }
      }
    };

    loadEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  const onChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/events", formData);
      setMessage("Event created successfully!");
      setFormData({
        title: "",
        description: "",
        date: "",
        location: "",
        totalSeats: 30,
      });
      fetchAdminEvents();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to create event");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await API.delete(`/events/${eventId}`);
      setMessage("Event deleted successfully!");

      setEvents((prevEvents) => prevEvents.filter((ev) => ev._id !== eventId));

      if (selectedEventId === eventId) {
        setSelectedEventId("");
        setRegistrations([]);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to delete event");
    }
  };

  const fetchRegistrations = async (eventId) => {
    setSelectedEventId(eventId);
    if (!eventId) {
      setRegistrations([]);
      return;
    }
    try {
      const response = await API.get(`/events/${eventId}/registrations`);
      const regData = response.data.registrations || response.data;
      setRegistrations(Array.isArray(regData) ? regData : []);
    } catch (error) {
      console.error("Failed to fetch registrations", error);
      setRegistrations([]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          Admin Dashboard
        </h1>

        {message && (
          <div className="mb-4 p-3 bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-md">
            {message}
          </div>
        )}

        <form
          onSubmit={onSubmit}
          className="p-8 bg-white border border-gray-200 rounded-lg shadow-sm space-y-4"
        >
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Create New Event
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Title
            </label>
            <input
              type="text"
              name="title"
              value={title}
              onChange={onChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={description}
              onChange={onChange}
              required
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date & Time
            </label>
            <input
              type="datetime-local"
              name="date"
              value={date}
              onChange={onChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={location}
              onChange={onChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Seats
            </label>
            <input
              type="number"
              name="totalSeats"
              value={totalSeats}
              onChange={onChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gray-900 text-white py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition"
          >
            Create Event
          </button>
        </form>
      </div>

      <div className="p-8 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Manage Existing Events
        </h2>
        {events.length === 0 ? (
          <p className="text-sm text-gray-500">No events found.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {events.map((ev) => (
              <li
                key={ev._id}
                className="py-3 flex justify-between items-center text-sm"
              >
                <div>
                  <span className="font-medium text-gray-900">{ev.title}</span>
                  <span className="ml-2 text-gray-500">
                    ({ev.availableSeats}/{ev.totalSeats} seats)
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteEvent(ev._id)}
                  className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-md text-xs font-medium hover:bg-red-100 transition"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="p-8 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          View Event Registrations
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Event
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => fetchRegistrations(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-gray-900"
            >
              <option value="">-- Choose an Event --</option>
              {events.map((ev) => (
                <option key={ev._id} value={ev._id}>
                  {ev.title} ({ev.availableSeats} seats left)
                </option>
              ))}
            </select>
          </div>

          {selectedEventId && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Registered Attendees:
              </h3>
              {registrations.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No users registered for this event yet.
                </p>
              ) : (
                <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md">
                  {registrations.map((reg, index) => {
                    const attendeeName =
                      reg.user?.name || reg.name || "Attendee";
                    const attendeeEmail = reg.user?.email || reg.email || "";
                    return (
                      <li
                        key={index}
                        className="px-4 py-3 text-sm text-gray-800 flex justify-between"
                      >
                        <span>{attendeeName}</span>
                        <span className="text-gray-500">{attendeeEmail}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
