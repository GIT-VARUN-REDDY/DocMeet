import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import RegisterUser from "./pages/RegisterUser";
import RegisterDoctor from "./pages/RegisterDoctor";
import VerifyOtp from "./pages/VerifyOtp";
import Doctors from "./pages/Doctors";
import Book from "./pages/Book";
import MyAppointments from "./pages/MyAppointments";
import DoctorDashboard from "./pages/DoctorDashboard";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Doctors />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterUser />} />
        <Route path="/register/doctor" element={<RegisterDoctor />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />

        {/* Patient-only routes */}
        <Route path="/book/:id" element={
          <ProtectedRoute allowedRole="user">
            <Book />
          </ProtectedRoute>
        } />
        <Route path="/my" element={
          <ProtectedRoute allowedRole="user">
            <MyAppointments />
          </ProtectedRoute>
        } />

        {/* Doctor-only routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRole="doctor">
            <DoctorDashboard />
          </ProtectedRoute>
        } />

        {/* 404 */}
        <Route path="*" element={
          <div className="flex justify-center items-center h-screen text-gray-400 flex-col gap-3">
            <p className="text-6xl">404</p>
            <p className="text-lg">Page not found</p>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;