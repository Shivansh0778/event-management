import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import API from "../services/api";

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [timing, setTiming] = useState("");

  const { user } = useSelector((state) => state.auth);

  const fetchEvents = async () => {
    try {
      const response = await API.get("/events", {
        params: { search, timing },
      });
      const eventData = response.data.events || response.data;
      setEvents(Array.isArray(eventData) ? eventData : []);
    } catch (error) {
      console.error("Failed to fetch events", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchEvents();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, timing]);

  const handleRegister = async (eventId) => {
    try {
      await API.post(`/events/${eventId}/register`);
      setMessage("Successfully registered for event!");
      fetchEvents();
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed");
    }
  };

  const handleCancel = async (eventId) => {
    try {
      await API.delete(`/events/${eventId}/register`);
      setMessage("Registration cancelled successfully.");
      fetchEvents();
    } catch (error) {
      setMessage(error.response?.data?.message || "Cancellation failed");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">
          Upcoming Events
        </h1>

        {/* Search Bar */}
        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder="Search events by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 text-sm">
        <button
          onClick={() => setTiming("")}
          className={`px-3 py-1.5 rounded-md border text-xs font-medium transition ${timing === "" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
        >
          All
        </button>
        <button
          onClick={() => setTiming("upcoming")}
          className={`px-3 py-1.5 rounded-md border text-xs font-medium transition ${timing === "upcoming" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setTiming("available")}
          className={`px-3 py-1.5 rounded-md border text-xs font-medium transition ${timing === "available" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
        >
          Available Seats
        </button>
        <button
          onClick={() => setTiming("full")}
          className={`px-3 py-1.5 rounded-md border text-xs font-medium transition ${timing === "full" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
        >
          Full Events
        </button>
        <button
          onClick={() => setTiming("past")}
          className={`px-3 py-1.5 rounded-md border text-xs font-medium transition ${timing === "past" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
        >
          Past
        </button>
      </div>

      {message && (
        <div className="mb-6 p-3 bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-md">
          {message}
        </div>
      )}

      {loading ? (
        <div className="text-center mt-12 text-gray-500 text-sm">
          Loading events...
        </div>
      ) : events.length === 0 ? (
        <p className="text-sm text-gray-500 text-center mt-8">
          No events match your search or filter.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {events.map((event) => (
            <div
              key={event._id}
              className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {event.title}
                  </h3>
                  {event.availableSeats === 0 && (
                    <span className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-200 text-[10px] font-semibold rounded">
                      FULL
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {event.description}
                </p>
                <div className="text-xs text-gray-500 space-y-1 mb-6">
                  <p>
                    <span className="font-medium text-gray-700">Date:</span>{" "}
                    {new Date(event.date).toLocaleString()}
                  </p>
                  <p>
                    <span className="font-medium text-gray-700">Location:</span>{" "}
                    {event.location}
                  </p>
                  <p>
                    <span className="font-medium text-gray-700">
                      Available Seats:
                    </span>{" "}
                    {event.availableSeats} / {event.totalSeats}
                  </p>
                </div>
              </div>

              {user && user.role?.toLowerCase() === "user" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRegister(event._id)}
                    disabled={event.availableSeats === 0 || event.hasStarted}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
                      event.availableSeats === 0 || event.hasStarted
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-900 text-white hover:bg-gray-800"
                    }`}
                  >
                    {event.availableSeats === 0
                      ? "Event Full"
                      : event.hasStarted
                        ? "Started"
                        : "Register"}
                  </button>
                  <button
                    onClick={() => handleCancel(event._id)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
