import api from "./api";
import { User } from "../types";

export interface LoginRequest {
  email: string;
  password: string;
  userType: "admin";
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
  token?: string;
}

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

    return response.data;
  } catch (error: any) {
    console.error("Login error:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Login failed",
    };
  }
};

export const getUserProfile = async (): Promise<AuthResponse> => {
  try {
    const response = await api.get<AuthResponse>("/auth/profile");
    return response.data;
  } catch (error: any) {
    console.error("Profile fetch error:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch profile",
    };
  }
};

export const refreshToken = async (): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>("/auth/refresh-token", {});
    return response.data;
  } catch (error: any) {
    console.error("Token refresh error:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Token refresh failed",
    };
  }
};

export const logoutUser = async (): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>("/auth/logout", {});
    return response.data;
  } catch (error: any) {
    console.error("Logout error:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Logout failed",
    };
  }
};

export const checkServerHealth = async () => {
  try {
    const response = await api.get("/health");
    return response.data;
  } catch (error) {
    console.error("Server health check failed:", error);
    throw error;
  }
};

export const checkDatabaseHealth = async () => {
  try {
    const response = await api.get("/health/db");
    return response.data;
  } catch (error) {
    console.error("Database health check failed:", error);
    throw error;
  }
};
