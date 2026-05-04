import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();
  const location = useLocation();
  const isDoctor = user.role === "doctor";
  const active = (p) => location.pathname === p ? "underline underline-offset-4" : "";

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className={`sticky top-0 z-50 flex justify-between items-center px-8 py-4 text-white shadow-lg ${isDoctor ? "bg-teal-600" : "bg-blue-600"}`}>
      <Link to={isDoctor ? "/dashboard" : "/"} className="text-2xl font-bold">🩺 DocMeet</Link>

      <div className="flex items-center gap-6 text-sm font-medium">
        {!isDoctor && <>
          <Link to="/"        className={active("/")}>Home</Link>
          <Link to="/doctors" className={active("/doctors")}>Doctors</Link>
          <Link to="/symptoms" className={active("/symptoms")}>Symptoms</Link>
        </>}

        {token && !isDoctor && <Link to="/my" className={active("/my")}>My Appointments</Link>}
        {token && isDoctor && <>
          <Link to="/dashboard" className={active("/dashboard")}>Dashboard</Link>
          <Link to="/profile"   className={active("/profile")}>My Profile</Link>
        </>}

        {!token ? <>
          <Link to="/login">Login</Link>
          <Link to="/register" className="bg-white text-blue-600 font-semibold px-4 py-1.5 rounded-full hover:bg-blue-50">Register</Link>
        </> : <>
          <span className="opacity-80">Hi, {user.name?.split(" ")[0]}</span>
          <button onClick={logout} className="bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-full font-semibold">Logout</button>
        </>}
      </div>
    </nav>
  );
}

export default Navbar;