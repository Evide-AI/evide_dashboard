"use client";

import { AuthState, User } from "../types";
import { MOCK_USERS, MOCK_CREDENTIALS } from "./mock-data";
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

  // Restore session on page mount(if already logged in)
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const storedUser = localStorage.getItem("auth_user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        dispatch({ type: "RESTORE_SESSION", payload: user });
        return;
      }
    } catch (error) {
      console.error("Session check failed:", error);
    }
    dispatch({ type: "INIT_COMPLETE" });
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: "LOGIN_START" });

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const expectedPassword =
        MOCK_CREDENTIALS[email as keyof typeof MOCK_CREDENTIALS];
      if (expectedPassword && expectedPassword === password) {
        const user = MOCK_USERS.find((u) => u.email === email);
        if (user) {
          localStorage.setItem("auth_user", JSON.stringify(user));
          dispatch({ type: "LOGIN_SUCCESS", payload: user });
          return true;
        }
      }

      dispatch({ type: "LOGIN_FAILURE" });
      return false;
    } catch (error) {
      console.error("Login failed:", error);
      dispatch({ type: "LOGIN_FAILURE" });
      return false;
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem("auth_user");
    } catch (error) {
      console.error("Logout failed:", error);
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
