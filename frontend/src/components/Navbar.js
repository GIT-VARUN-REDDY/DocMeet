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
      
      <Link to={isDoctor ? "/dashboard" : "/"} className="text-2xl font-bold">
        🩺 DocMeet
      </Link>

      <div className="flex items-center gap-6 text-sm font-medium">

        {/* PUBLIC / PATIENT NAV */}
        {!isDoctor && (
          <>
           <Link to="/" className={`hover:underline ${isActive("/") ? "underline" : ""}`}>Home</Link>

          <Link to="/doctors" className={`hover:underline ${isActive("/doctors") ? "underline" : ""}`}>Doctors</Link>

          <Link to="/symptoms" className={`hover:underline ${isActive("/symptoms") ? "underline" : ""}`}>Symptoms</Link>
          </>
        )}

        {/* PATIENT */}
        {token && !isDoctor && (
          <Link to="/my" className={isActive("/my") ? "underline" : ""}>
            My Appointments
          </Link>
        )}

        {/* DOCTOR */}
        {token && isDoctor && (
          <Link to="/dashboard" className={isActive("/dashboard") ? "underline" : ""}>
            Dashboard
          </Link>
        )}

        {/* AUTH */}
        {!token ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="bg-white text-blue-600 px-3 py-1 rounded">
              Register
            </Link>
          </>
        ) : (
          <>
            <span>Hi, {user.name?.split(" ")[0]}</span>
            <button onClick={logout} className="bg-red-500 px-3 py-1 rounded">
              Logout
            </button>
          </>
        )}

      </div>
    </nav>
  );
}

export default Navbar;