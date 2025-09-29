import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createBus,
  createTrip,
  getAllRoutes,
  getBuses,
  getRouteWithStops,
  getTrips,
  processStops,
  type CreateBusRequest,
} from "../store/buses-api";
import {
  type ProcessStopsRequest,
  type ProcessStopsResponse,
  type ApiErrorResponse,
  type BusCreationResponse,
  type BusData,
  type RouteWithStops,
  type TripCreationResponse,
  type CreateTripRequest,
  type TripFilters,
  type TripListResponse,
  type RouteData,
} from "../types";

export function useCreateBus() {
  return useMutation<BusCreationResponse, ApiErrorResponse, CreateBusRequest>({
    mutationFn: createBus,
  });
}

export function useGetBuses() {
  return useQuery<BusData[], ApiErrorResponse>({
    queryKey: ["buses"],
    queryFn: getBuses,
  });
}

export function useProcessStops() {
  return useMutation<
    ProcessStopsResponse,
    ApiErrorResponse,
    ProcessStopsRequest
  >({
    mutationFn: processStops,
  });
}

export function useGetRouteWithStops(routeId: number | null) {
  return useQuery<RouteWithStops, ApiErrorResponse>({
    queryKey: ["routes", routeId],
    queryFn: () => getRouteWithStops(routeId!),
    enabled: !!routeId, // this will ensure our function is only called when routeId is provided
  });
}

export function useGetAllRoutes() {
  return useQuery<RouteData[], ApiErrorResponse>({
    queryKey: ["routes"],
    queryFn: getAllRoutes,
  });
}

export function useCreateTrip() {
  return useMutation<TripCreationResponse, ApiErrorResponse, CreateTripRequest>(
    {
      mutationFn: createTrip,
    }
  );
}

export function useGetTrips(filters: TripFilters = {}) {
  return useQuery<TripListResponse, ApiErrorResponse>({
    queryKey: ["trips", filters],
    queryFn: () => getTrips(filters),
  });
}
