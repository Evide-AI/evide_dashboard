"use client";

import { AuthState, User } from "../types";
import { adminLogin, getUserProfile, logoutUser } from "./auth-service";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from "react";

type AuthAction =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: User }
  | { type: "LOGIN_FAILURE" }
  | { type: "LOGOUT" }
  | { type: "RESTORE_SESSION"; payload: User }
  | { type: "INIT_COMPLETE" };

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, isLoading: true };

    case "LOGIN_SUCCESS":
      return {
        user: action.payload,
        isLoading: false,
        isAuthenticated: true,
      };
    case "LOGIN_FAILURE":
      return {
        user: null,
        isLoading: false,
        isAuthenticated: false,
      };

    case "LOGOUT":
      return {
        user: null,
        isLoading: false,
        isAuthenticated: false,
      };

    case "RESTORE_SESSION":
      return {
        user: action.payload,
        isLoading: false,
        isAuthenticated: true,
      };

    case "INIT_COMPLETE":
      return {
        ...state,
        isLoading: false,
      };

    default:
      return state;
  }
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    checkExistingSession(); // restoring session if already logged in
  }, []);

  const checkExistingSession = async () => {
    try {
      const response = await getUserProfile();

      if (response.success && response.user) {
        dispatch({ type: "RESTORE_SESSION", payload: response.user });
        return;
      }

      dispatch({ type: "INIT_COMPLETE" });
    } catch (error) {
      console.error("Session check failed:", error);
      dispatch({ type: "INIT_COMPLETE" });
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: "LOGIN_START" });

    try {
      const response = await adminLogin(email, password);

      if (response.success && response.user) {
        if (response.token) {
          localStorage.setItem("auth_token", response.token);
        }

        dispatch({ type: "LOGIN_SUCCESS", payload: response.user });
        return true;
      } else {
        dispatch({ type: "LOGIN_FAILURE" });
        return false;
      }
    } catch (error) {
      console.error("Login failed:", error);
      dispatch({ type: "LOGIN_FAILURE" });
      return false;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();

      localStorage.removeItem("auth_token");
    } catch (error) {
      console.error("Logout failed:", error);
      localStorage.removeItem("auth_token");
    }

    dispatch({ type: "LOGOUT" });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
