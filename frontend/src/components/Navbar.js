import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();
  const location = useLocation();
  const isDoctor = user.role === "doctor";

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`sticky top-0 z-50 flex justify-between items-center px-8 py-4 text-white shadow-lg ${isDoctor ? "bg-teal-600" : "bg-blue-600"}`}>
      <Link to={isDoctor ? "/dashboard" : "/"} className="text-2xl font-bold tracking-tight hover:opacity-90 transition">
        🩺 DocMeet
      </Link>

      <div className="flex items-center gap-6 text-sm font-medium">
        {/* Patient nav */}
        {token && !isDoctor && (
          <>
            <Link to="/" className={`hover:underline underline-offset-4 ${isActive("/") ? "underline" : ""}`}>
              Doctors
            </Link>
            <Link to="/my" className={`hover:underline underline-offset-4 ${isActive("/my") ? "underline" : ""}`}>
              My Appointments
            </Link>
          </>
        )}

        {/* Doctor nav */}
        {token && isDoctor && (
          <Link to="/dashboard" className={`hover:underline underline-offset-4 ${isActive("/dashboard") ? "underline" : ""}`}>
            My Dashboard
          </Link>
        )}

        {/* Not logged in */}
        {!token && (
          <>
            <Link to="/" className={`hover:underline underline-offset-4 ${isActive("/") ? "underline" : ""}`}>
              Doctors
            </Link>
            <Link to="/login" className="hover:underline underline-offset-4">Login</Link>
            <Link to="/register" className="bg-white text-blue-600 font-semibold px-4 py-1.5 rounded-full hover:bg-blue-50 transition">
              Register
            </Link>
          </>
        )}

        {/* Logged in user info */}
        {token && (
          <div className="flex items-center gap-3">
            <span className={`text-sm ${isDoctor ? "text-teal-100" : "text-blue-100"}`}>
              Hi, {user.name?.split(" ")[0] || "User"}
            </span>
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-full text-sm font-semibold transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;