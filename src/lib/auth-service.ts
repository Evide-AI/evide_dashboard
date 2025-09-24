import api from "./api";
import type { AuthResponse } from "../types";

// Admin login function
export const adminLogin = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>(
      "/auth/login",
      {
        email,
        password,
        userType: "admin",
      },
      {
        headers: {
          "x-include-token": "true",
        },
      }
    );

    // Store user data in localStorage for session persistence
    if (response.data.success && response.data.user) {
      localStorage.setItem(
        "auth_user",
        JSON.stringify({
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.name,
          role: response.data.user.role,
          userType: response.data.userType || "admin",
        })
      );

      // Only store token if provided (for mobile/fallback)
      if (response.data.token) {
        localStorage.setItem("auth_token", response.data.token);
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

export const logoutUser = async (): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>("/auth/logout", {});

    // Clear all client-side auth data
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
