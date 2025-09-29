import api from "./api";
import type { AuthResponse } from "../types";

// Admin login function
export const adminLogin = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>("/auth/login", {
      email,
      password,
      userType: "admin",
    });

    // Store user data and token for session persistence
    if (response.data.success && response.data.user) {
      localStorage.setItem(
        "auth_user",
        JSON.stringify({
          id: response.data.user.id,
          email: response.data.user.email,
          role: response.data.user.role,
        })
      );

      // Always store token - backend requires Bearer token authentication
      if (response.data.token) {
        localStorage.setItem("auth_token", response.data.token);
      } else {
        console.warn("No token received from login response");
      }
    }

    return response.data;
  } catch (error: any) {
    console.error("Login error:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Login failed",
    };
  }
};

// Logout function - comprehensive cleanup
export const logoutUser = async (): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>("/auth/logout", {});

    // Always clear client-side data regardless of server response
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");

    return response.data;
  } catch (error: any) {
    console.error("Logout error:", error);

    // Clear client-side data even if server call fails
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");

    return {
      success: false,
      message: error.response?.data?.message || "Logout failed",
    };
  }
};
