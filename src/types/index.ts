export interface User {
  id: string;
  email: string;
  role: "admin";
}

export interface BusScreen {
  id: string;
  busName: string;
  busNumber: string;
  imei: string;
  isOnline: boolean;
  lastSeen: Date;
  currentLocation?: string;
  nextStop?: string;
  nextStopETA?: string;
  createdAt: Date;
}

export interface ContentItem {
  id: string;
  title: string;
  type: "image" | "video";
  url: string;
  duration?: number; // duration stored in seconds
  isActive: boolean;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
