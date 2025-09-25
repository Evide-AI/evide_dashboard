export interface User {
  id: string;
  email: string;
  role: "admin";
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
  token?: string;
  userType?: string;
  authMethod?: "cookie" | "token";
}

export interface BusData {
  id: number;
  bus_number: string;
  imei_number: string;
  name: string | null;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusCreationResponse {
  success: boolean;
  message: string;
  data: {
    bus: BusData;
  };
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  field?: string;
  stack?: string;
}
