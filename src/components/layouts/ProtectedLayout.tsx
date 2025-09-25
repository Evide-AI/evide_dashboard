import { useAuth } from "../../lib/auth-context";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Sidebar from "../Sidebar";
import CreateBusModal from "../CreateBusModal";
import Loading from "../Loading";

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
      {/* Global modals available to all protected routes */}
      <CreateBusModal />
    </div>
  );
}
