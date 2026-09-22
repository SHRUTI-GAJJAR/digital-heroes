import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RouteLoading from "./RouteLoading";

function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Wait until the saved session has been checked
  if (loading) {
    return <RouteLoading message="Loading your account…" />;
  }

  // User is not logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated
  return <Outlet />;
}

export default ProtectedRoute;
