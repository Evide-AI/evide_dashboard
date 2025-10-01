import axios from "axios";
import type {
  ApiErrorResponse,
  BusCreationResponse,
  BusData,
  BusListResponse,
  CreateTripRequest,
  ProcessStopsRequest,
  ProcessStopsResponse,
  RouteData,
  RoutesByBusResponse,
  RouteWithStops,
  TripCreationResponse,
  TripFilters,
  TripListResponse,
} from "../types/index";
import api from "../lib/api";

export interface CreateBusRequest {
  bus_number: string;
  imei_number: string;
  name?: string;
}

export const createBus = async (
  data: CreateBusRequest
): Promise<BusCreationResponse> => {
  try {
    const response = await api.post<BusCreationResponse>("/buses", {
      name: data.name,
      bus_number: data.bus_number,
      imei_number: data.imei_number,
    });

    if (response.data.success) {
      return response.data;
    }
  } catch (err: any) {
    if (axios.isAxiosError(err) && err.response) {
      throw err.response.data as ApiErrorResponse;
    }
  }

  throw { success: false, message: "Unknown error" } as ApiErrorResponse;
};

export const getBuses = async (): Promise<BusData[]> => {
  try {
    // No pagination for now
    const response = await api.get<BusListResponse>("/buses?all=true");
    return response.data.data.buses;
  } catch (err: any) {
    if (axios.isAxiosError(err) && err.response)
      throw err.response.data as ApiErrorResponse;

    throw { success: false, message: "Unknown Error" } as ApiErrorResponse;
  }
};

export const processStops = async (
  data: ProcessStopsRequest
): Promise<ProcessStopsResponse> => {
  try {
    const payload: any = { stops: data.stops };
    if (data.bus_id) payload.bus_id = data.bus_id;
    if (data.bus_ids && data.bus_ids.length > 0) payload.bus_ids = data.bus_ids;

    const response = await api.post<ProcessStopsResponse>(
      "/routes/process-stops",
      payload
    );
    return response.data;
  } catch (err: any) {
    if (axios.isAxiosError(err) && err.response) {
      throw err.response.data as ApiErrorResponse;
    }
    throw { success: false, message: "Unknown error" } as ApiErrorResponse;
  }
};

// Route fetching based on route_id with its stops
export const getRouteWithStops = async (
  routeId: number
): Promise<RouteWithStops> => {
  try {
    const response = await api.get<{ success: boolean; data: RouteWithStops }>(
      `/routes/${routeId}`
    );
    return response.data.data;
  } catch (err: any) {
    if (axios.isAxiosError(err) && err.response) {
      throw err.response.data as ApiErrorResponse;
    }
    throw { success: false, message: "Unknown error" } as ApiErrorResponse;
  }
};

// Get all routes linked to a specific bus
export const getRoutesByBusId = async (busId: number): Promise<RouteData[]> => {
  try {
    const response = await api.get<RoutesByBusResponse>(
      `/routes/by-bus/${busId}`
    );
    return response.data.data.routes;
  } catch (err: any) {
    if (axios.isAxiosError(err) && err.response) {
      throw err.response.data as ApiErrorResponse;
    }
    throw { success: false, message: "Unknown error" } as ApiErrorResponse;
  }
};

// Trip creation
export const createTrip = async (
  data: CreateTripRequest
): Promise<TripCreationResponse> => {
  try {
    const response = await api.post<TripCreationResponse>(
      "/trips/create",
      data
    );
    return response.data;
  } catch (err: any) {
    if (axios.isAxiosError(err) && err.response) {
      throw err.response.data as ApiErrorResponse;
    }
    throw { success: false, message: "Unknown error" } as ApiErrorResponse;
  }
};

export const getTrips = async (
  filters: TripFilters = {}
): Promise<TripListResponse> => {
  try {
    const params = new URLSearchParams();

    if (filters.route_id)
      params.append("route_id", filters.route_id.toString());
    if (filters.is_active !== undefined)
      params.append("is_active", filters.is_active.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.orderby) params.append("orderby", filters.orderby);
    if (filters.order) params.append("order", filters.order);
    if (filters.all) params.append("all", "true");

    const response = await api.get<TripListResponse>(`/trips?${params}`);
    return response.data;
  } catch (err: any) {
    if (axios.isAxiosError(err) && err.response) {
      throw err.response.data as ApiErrorResponse;
    }
    throw { success: false, message: "Unknown error" } as ApiErrorResponse;
  }
};
