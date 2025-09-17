import axios from "axios";
import config from "./config";
import { backendStatusManager } from "./backend-status";

const api = axios.create({
  baseURL: config.API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
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

api.interceptors.response.use(
  (response) => {
    // Backend is responding, mark as online
    backendStatusManager.setStatus(true);
    return response;
  },
  (error) => {
    // Check if it's a network error (backend unreachable)
    if (!error.response) {
      // Network error - backend is offline
      backendStatusManager.setStatus(false);
    } else {
      // Backend responded with an error, but it's online
      backendStatusManager.setStatus(true);

      // Handle authentication errors
      if (error.response?.status === 401) {
        localStorage.removeItem("auth_token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
