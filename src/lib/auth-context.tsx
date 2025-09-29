import { createContext, useContext, useEffect, useReducer } from "react";
import type { ReactNode } from "react";
import type { AuthState, User } from "../types";
import { adminLogin, logoutUser } from "./auth-service";

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
    checkExistingSession();

    // Listen for token expiration events from API interceptor
    const handleTokenExpired = () => {
      dispatch({ type: "LOGOUT" });
    };

    window.addEventListener("auth-token-expired", handleTokenExpired);

    return () => {
      window.removeEventListener("auth-token-expired", handleTokenExpired);
    };
  }, []);

  const checkExistingSession = async () => {
    try {
      // Check for existing user data and token in localStorage
      const storedUser = localStorage.getItem("auth_user");
      const storedToken = localStorage.getItem("auth_token");

      if (!storedUser || !storedToken) {
        dispatch({ type: "INIT_COMPLETE" });
        return;
      }

      let userData;
      try {
        userData = JSON.parse(storedUser);
      } catch {
        // Invalid stored data, clear it
        localStorage.removeItem("auth_user");
        localStorage.removeItem("auth_token");
        dispatch({ type: "INIT_COMPLETE" });
        return;
      }

      // Validate user data structure and role
      if (!userData || !userData.id || userData.role !== "admin") {
        localStorage.removeItem("auth_user");
        localStorage.removeItem("auth_token");
        dispatch({ type: "INIT_COMPLETE" });
        return;
      }

      // Restore session - both user data and token are present
      dispatch({ type: "RESTORE_SESSION", payload: userData });
    } catch (error) {
      console.error("Session check failed:", error);
      // Clean up on any session check failure
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      dispatch({ type: "INIT_COMPLETE" });
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: "LOGIN_START" });

    try {
      const response = await adminLogin(email, password);

      if (response.success && response.user) {
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
