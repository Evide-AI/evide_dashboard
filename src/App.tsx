import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { store } from "./store";
import { AuthProvider } from "./lib/auth-context";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProtectedLayout from "./components/layouts/ProtectedLayout";
import PublicLayout from "./components/layouts/PublicLayout";
import { Toaster } from "sonner";
import BusesPage from "./pages/BusesPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public Routes*/}
              <Route path="/" element={<PublicLayout />}>
                <Route path="login" element={<LoginPage />} />
                <Route index element={<Navigate to="/dashboard" replace />} />
              </Route>

              {/* Protected Routes  */}
              <Route path="/" element={<ProtectedLayout />}>
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="/buses" element={<BusesPage />} />
              </Route>

              {/* Catch-all route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>

            {/* Sonner Toast Notifications */}
            <Toaster position="top-right" richColors closeButton />
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
