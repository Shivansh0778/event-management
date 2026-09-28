import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout, reset } from "../redux/authSlice";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate("/login");
  };

  const displayName = user?.name || user?.user?.name || "User";
  const userRole = user?.role || user?.user?.role || "";

  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-white border-b border-gray-200">
      <div className="text-xl font-semibold tracking-tight text-gray-900">
        <Link to="/">EventManage</Link>
      </div>
      <div className="flex items-center gap-6">
        <Link
          to="/"
          className="text-gray-600 hover:text-gray-900 text-sm font-medium"
        >
          Events
        </Link>
        {user ? (
          <>
            {userRole.toLowerCase() === "admin" && (
              <Link
                to="/admin"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                Dashboard
              </Link>
            )}
            <span className="text-sm font-medium text-gray-900">
              Hello, {displayName}
            </span>
            <button
              onClick={onLogout}
              className="border border-gray-300 px-4 py-1.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-gray-900 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-gray-800 transition"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
