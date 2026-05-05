import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Doctors from "./pages/Doctors";
import DoctorDetail from "./pages/DoctorDetail";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorProfile from "./pages/DoctorProfile";
import Symptoms from "./pages/Symptoms";
import Book from "./pages/Book";
import MyAppointments from "./pages/MyAppointments";
import Login from "./pages/Login";
import RegisterUser from "./pages/RegisterUser";
import RegisterDoctor from "./pages/RegisterDoctor";



function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"                element={<Home />} />
        <Route path="/doctors"         element={<Doctors />} />
        <Route path="/doctor/:id"      element={<DoctorDetail />} />
        <Route path="/symptoms"        element={<Symptoms />} />
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<RegisterUser />} />
        <Route path="/register/doctor" element={<RegisterDoctor />} />
        <Route path="/book/:id"        element={<ProtectedRoute allowedRole="user"><Book /></ProtectedRoute>} />
        <Route path="/my"              element={<ProtectedRoute allowedRole="user"><MyAppointments /></ProtectedRoute>} />
        <Route path="/dashboard"       element={<ProtectedRoute allowedRole="doctor"><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/profile"         element={<ProtectedRoute allowedRole="doctor"><DoctorProfile /></ProtectedRoute>} />
        <Route path="*"                element={<div className="flex justify-center items-center h-screen text-gray-400 flex-col gap-3"><p className="text-6xl">404</p><p>Page not found</p></div>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;