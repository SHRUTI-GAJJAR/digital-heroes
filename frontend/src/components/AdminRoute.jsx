import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RouteLoading from "./RouteLoading";

function AdminRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <RouteLoading message="Loading your account…" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;
