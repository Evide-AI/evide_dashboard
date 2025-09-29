import axios from "axios";
import config from "./config";

// API client for /api routes
const api = axios.create({
  baseURL: `${config.API_BASE_URL}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - ensure token is always sent
api.interceptors.request.use(
  (config) => {
    // Always add x-include-token header for login requests
    if (config.url?.includes("/auth/login")) {
      config.headers["x-include-token"] = "true";
    }

    // Always try to send Bearer token if available
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear any stored auth data
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");

      // Emit custom event for React components to handle
      window.dispatchEvent(new CustomEvent("auth-token-expired"));
    }
    return Promise.reject(error);
  }
);

export default api;
