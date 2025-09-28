import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createBus,
  createTrip,
  getBuses,
  getRouteWithStops,
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
    queryKey: ["route", routeId, "stops"],
    queryFn: () => getRouteWithStops(routeId!),
    enabled: !!routeId, // this will ensure our function is only called when routeId is provided
  });
}

export function useCreateTrip() {
  return useMutation<TripCreationResponse, ApiErrorResponse, CreateTripRequest>(
    {
      mutationFn: createTrip,
    }
  );
}
