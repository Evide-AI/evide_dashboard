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

// Request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    // Only add Bearer token if available (fallback for mobile/special cases)
    const token = localStorage.getItem("auth_token");
    if (token) {
      const hasValidUser = localStorage.getItem("auth_user");
      if (hasValidUser) {
        try {
          const user = JSON.parse(hasValidUser);
          if (user.role === "admin" && token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (e) {
          // If auth_user is corrupted, use token as fallback
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear all auth data on 401
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");

      // Only redirect if not already on login page
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
