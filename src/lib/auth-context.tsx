"use client";

import { AuthState, User } from "@/types";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { MOCK_CREDENTIALS, MOCK_USERS } from "./mock-data";

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
      return initialState;

    case "LOGOUT":
      return initialState;

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
    const savedUser = localStorage.getItem("evide-dashboard-user");

    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        dispatch({ type: "RESTORE_SESSION", payload: user });
      } catch (error) {
        document.cookie =
          "evide-dashboard-session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        localStorage.removeItem("evide-dashboard-user");
      }
    } else {
      dispatch({ type: "INIT_COMPLETE" });
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: "LOGIN_START" });

    // Dummy API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const expectedPassword =
      MOCK_CREDENTIALS[email as keyof typeof MOCK_CREDENTIALS];

    if (expectedPassword && expectedPassword === password) {
      const user = MOCK_USERS.find((u) => u.email === email);

      if (user) {
        localStorage.setItem("evide-dashboard-user", JSON.stringify(user));
        document.cookie = `evide-dashboard-session=${
          user.id
        }; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days

        dispatch({ type: "LOGIN_SUCCESS", payload: user });
        return true;
      }
    }

    dispatch({ type: "LOGIN_FAILURE" });
    return false;
  };

  const logout = () => {
    localStorage.removeItem("evide-dashboard-user");
    document.cookie =
      "evide-dashboard-session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";

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
