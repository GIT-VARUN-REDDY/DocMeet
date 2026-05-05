import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();
  const location = useLocation();
  const isDoctor = user.role === "doctor";
  const active = (p) => location.pathname === p;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setMenuOpen(false);
    navigate("/login");
  };

  const closeMenu = () => setMenuOpen(false);

  const navBg = isDoctor ? "bg-teal-600" : "bg-blue-600";
  const activeCls = "underline underline-offset-4";

  return (
    <>
      {/* ── Main Navbar ── */}
      <nav className={`sticky top-0 z-50 ${navBg} text-white shadow-lg`}>
        <div className="flex justify-between items-center px-5 py-4 max-w-7xl mx-auto">

          {/* Logo */}
          <Link to={isDoctor ? "/dashboard" : "/"} onClick={closeMenu} className="text-xl font-extrabold tracking-tight flex items-center gap-2">
            🩺 DocMeet
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            {!isDoctor && <>
              <Link to="/"         className={active("/")        ? activeCls : "hover:underline underline-offset-4"}>Home</Link>
              <Link to="/doctors"  className={active("/doctors") ? activeCls : "hover:underline underline-offset-4"}>Doctors</Link>
              <Link to="/symptoms" className={active("/symptoms")? activeCls : "hover:underline underline-offset-4"}>Symptoms</Link>
            </>}
            {token && !isDoctor && (
              <Link to="/my" className={active("/my") ? activeCls : "hover:underline underline-offset-4"}>My Appointments</Link>
            )}
            {token && isDoctor && <>
              <Link to="/dashboard" className={active("/dashboard") ? activeCls : "hover:underline underline-offset-4"}>Dashboard</Link>
              <Link to="/profile"   className={active("/profile")   ? activeCls : "hover:underline underline-offset-4"}>My Profile</Link>
            </>}
            {!token ? <>
              <Link to="/login"    className="hover:underline underline-offset-4">Login</Link>
              <Link to="/register" className="bg-white text-blue-600 font-semibold px-4 py-1.5 rounded-full hover:bg-blue-50 transition">Register</Link>
            </> : <>
              <span className="opacity-80 text-sm">Hi, {user.name?.split(" ")[0]}</span>
              <button onClick={logout} className="bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-full text-sm font-semibold transition">Logout</button>
            </>}
          </div>

          {/* Mobile hamburger button */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5 rounded-lg hover:bg-white/20 transition"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>

        {/* ── Mobile Dropdown Menu ── */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"}`}>
          <div className={`${navBg} border-t border-white/20 px-5 pb-5 pt-3 flex flex-col gap-1`}>

            {/* User greeting */}
            {token && (
              <div className="flex items-center gap-3 py-3 border-b border-white/20 mb-2">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-sm">{user.name}</p>
                  <p className="text-xs opacity-70">{isDoctor ? "Doctor" : "Patient"}</p>
                </div>
              </div>
            )}

            {/* Nav links */}
            {!isDoctor && <>
              <MobileLink to="/"         label="🏠 Home"           active={active("/")}         onClick={closeMenu} />
              <MobileLink to="/doctors"  label="🩺 Doctors"        active={active("/doctors")}  onClick={closeMenu} />
              <MobileLink to="/symptoms" label="🔍 Symptom Checker" active={active("/symptoms")} onClick={closeMenu} />
            </>}

            {token && !isDoctor && (
              <MobileLink to="/my" label="📅 My Appointments" active={active("/my")} onClick={closeMenu} />
            )}

            {token && isDoctor && <>
              <MobileLink to="/dashboard" label="📊 Dashboard"  active={active("/dashboard")} onClick={closeMenu} />
              <MobileLink to="/profile"   label="👤 My Profile" active={active("/profile")}   onClick={closeMenu} />
            </>}

            {/* Auth buttons */}
            <div className="mt-3 pt-3 border-t border-white/20 flex flex-col gap-2">
              {!token ? <>
                <Link to="/login" onClick={closeMenu}
                  className="w-full py-3 rounded-xl text-center font-semibold bg-white/20 hover:bg-white/30 transition text-sm">
                  Login
                </Link>
                <Link to="/register" onClick={closeMenu}
                  className="w-full py-3 rounded-xl text-center font-semibold bg-white text-blue-600 hover:bg-blue-50 transition text-sm">
                  Register as Patient
                </Link>
                <Link to="/register/doctor" onClick={closeMenu}
                  className="w-full py-3 rounded-xl text-center font-semibold bg-white/10 border border-white/30 hover:bg-white/20 transition text-sm">
                  Register as Doctor
                </Link>
              </> : (
                <button onClick={logout}
                  className="w-full py-3 rounded-xl text-center font-semibold bg-red-500 hover:bg-red-600 transition text-sm">
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Overlay to close menu when clicking outside */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-black/20 md:hidden" onClick={closeMenu} />
      )}
    </>
  );
}

// Mobile nav link component
function MobileLink({ to, label, active, onClick }) {
  return (
    <Link to={to} onClick={onClick}
      className={`flex items-center px-3 py-3 rounded-xl text-sm font-medium transition ${
        active ? "bg-white/25 font-semibold" : "hover:bg-white/15"
      }`}
    >
      {label}
    </Link>
  );
}