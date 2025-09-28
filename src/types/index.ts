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

export interface BusListResponse {
  success: boolean;
  message: string;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  data: {
    buses: BusData[];
  };
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

export interface Stop {
  name: string;
  latitude: number;
  longitude: number;
  travel_time_from_previous_stop_min: number;
  travel_distance_from_previous_stop: number;
}

export interface ProcessStopsRequest {
  stops: Stop[];
}

export interface ProcessStopsResponse {
  success: boolean;
  message: string;
  data: {
    route: {
      id: number;
      route_name: string | null;
      total_distance_km: number | null;
      matchType: string;
      isExisting: boolean;
    };
    stops: {
      id: number;
      name: string;
    }[];
    routeStops: {
      id: number;
      route_id: number;
      stop_id: number;
      sequence_order: number;
    }[];
    processing: {
      stopProcessingResults: {
        name: string;
        id: number;
        status: string;
      }[];
      totalStops: number;
      newStopsCreated: number;
      existingStopsUsed: number;
      routeStatus: string;
    };
  };
}

export interface RouteStopData {
  id: number;
  route_id: number;
  stop_id: number;
  sequence_order: number;
  travel_time_from_previous_stop_min: number;
  travel_distance_from_previous_stop: number;
  dwell_time_minutes: number;
  stop: {
    id: number;
    name: string;
    location: any;
  };
}

export interface RouteWithStops {
  id: number;
  route_name: string | null;
  total_distance_km: number | null;
  route_stops: RouteStopData[];
}

export interface TripStopTime {
  stop_id: number;
  approx_arrival_time: string;
  approx_departure_time: string;
}

export interface CreateTripRequest {
  route_id: number;
  bus_id: number;
  scheduled_start_time: string;
  scheduled_end_time: string;
  trip_type?: "regular" | "express" | "limited";
  stops: TripStopTime[];
}

export interface TripCreationResponse {
  success: boolean;
  message: string;
  data: {
    trip: {
      id: number;
      route_id: number;
      bus_id: number;
      scheduled_start_time: string;
      scheduled_end_time: string;
      trip_type: string;
      is_active: boolean;
    };
    tripStopTimes: TripStopTime[];
  };
}
