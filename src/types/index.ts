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
  code:
    | "VALIDATION_ERROR"
    | "DUPLICATE_ERROR"
    | "FOREIGN_KEY_ERROR"
    | "INTERNAL_ERROR";
  // Optional fields that may or may not be present
  errors?: Array<{
    field: string;
    message: string;
    value?: any;
  }>;
  field?: string;
  value?: any;
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
  bus_id?: number;
  bus_ids?: number[];
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
    busLinking?: {
      totalBusesLinked: number;
      newlyLinked: number;
      alreadyLinked: number;
      details: Array<{
        bus_id: number;
        route_id: number;
        status: "newly_linked" | "already_linked";
        link_id: number;
      }>;
    };
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

export interface RouteData {
  id: number;
  route_name: string;
  first_stop: {
    id: number;
    name: string;
  };
  last_stop: {
    id: number;
    name: string;
  };
  link_info?: {
    id: number;
    is_active: boolean;
    linked_at: string;
  };
}

export interface RouteDataResponse {
  success: boolean;
  message: string;
  data: {
    routes: RouteData[];
  };
}

export interface RoutesByBusResponse {
  success: boolean;
  message: string;
  data: {
    bus: {
      id: number;
      bus_number: string;
      name: string;
    };
    routes: RouteData[];
    total: number;
  };
}

export interface RouteStopData {
  id: number;
  route_id: number;
  stop_id: number;
  sequence_order: number;
  travel_time_from_previous_stop_min: number;
  travel_distance_from_previous_stop: string;
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
  id?: number;
  stop_id: number;
  trip_id?: number;
  approx_arrival_time: string;
  approx_departure_time: string;
  stop?: {
    id: number;
    name: string;
    location?: any;
  };
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

export interface TripData {
  id: number;
  bus_name: string;
  bus_number: string;
  start_point: string;
  end_point: string;
  route_start_time: string;
  route_end_time: string;
  via_details: string;
  is_active: boolean;
  is_advertisement_available: boolean | null;
}

export interface TripListResponse {
  success: boolean;
  message: string;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  data: {
    trips: TripData[];
  };
}

export interface TripFilters {
  route_id?: number;
  is_active?: boolean;
  limit?: number;
  page?: number;
  orderby?: string;
  order?: "asc" | "desc";
  all?: boolean;
}

// BUS DETAILS TYPES (GET /api/buses/:bus_id) //

export interface BusDetailsRouteStop {
  id: number;
  sequence_order: number;
  travel_time_from_previous_stop_min: number | null;
  travel_distance_from_previous_stop: number | null;
  dwell_time_minutes: number;
  stop: {
    id: number;
    name: string;
    location: any;
  };
}

export interface BusDetailsRoute {
  id: number;
  route_name: string;
  total_distance_km: number;
  route_stops: BusDetailsRouteStop[]; // Ordered by sequence_order
}

export interface BusDetailsTrip {
  id: number;
  route_id: number;
  scheduled_start_time: string;
  scheduled_end_time: string;
  is_active: boolean;
  trip_type: "regular" | "express" | "limited";
  route: {
    id: number;
    route_name: string;
    total_distance_km: number;
    route_stops: BusDetailsRouteStop[];
  };
  trip_stop_times: TripStopTime[];
}

export interface BusDetails {
  id: number;
  bus_number: string;
  imei_number: string;
  name: string | null;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  routes: BusDetailsRoute[];
  trips: BusDetailsTrip[];
}

/**
 * API response for GET /api/buses/:bus_id
 */
export interface BusDetailsResponse {
  success: boolean;
  message: string;
  data: {
    bus: BusDetails;
  };
}

// UPDATE TRIP TYPES (PUT /api/trips/:id) //

export interface UpdateTripStop {
  // For existing stops: only stop_id is required, name/latitude/longitude will be ignored
  stop_id?: number;

  // For new stops: name, latitude, longitude are required, stop_id should not be provided
  name?: string;
  latitude?: number;
  longitude?: number;

  // Optional timing and travel data (for both existing and new stops)
  travel_time_from_previous_stop_min?: number;
  travel_distance_from_previous_stop?: number;
  dwell_time_minutes?: number;
  approx_arrival_time?: string; // HH:MM:SS format
  approx_departure_time?: string; // HH:MM:SS format
}

// Request body for updating trip, route, and stop times

export interface UpdateTripRequest {
  // Trip table updates
  trip?: {
    trip_type?: "regular" | "express" | "limited";
    scheduled_start_time?: string; // HH:MM:SS format
    scheduled_end_time?: string; // HH:MM:SS format
  };

  route?: {
    stops: UpdateTripStop[];
  };
}

export interface UpdateTripResponse {
  success: boolean;
  message: string;
}
