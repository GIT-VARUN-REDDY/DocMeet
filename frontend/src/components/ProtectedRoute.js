import { Navigate, useLocation } from "react-router-dom";

// allowedRole: "user" | "doctor" | undefined (any logged-in user)
function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const location = useLocation();

  // Not logged in → redirect to login, remember where they came from
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but wrong role → redirect appropriately
  if (allowedRole && user.role !== allowedRole) {
    if (user.role === "doctor") {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;