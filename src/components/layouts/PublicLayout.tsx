import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../lib/auth-context";
import Loading from "../Loading";

export default function PublicLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    <Loading />;
  }

  // Redirect authenticated users to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
