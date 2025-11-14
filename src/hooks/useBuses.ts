import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createBus,
  createTrip,
  getRoutesByBusId,
  getBuses,
  getRoutes,
  getRouteWithStops,
  getTrips,
  processStops,
  updateTrip,
  updateBus,
  type CreateBusRequest,
  type UpdateBusRequest,
  type BusUpdateResponse,
  getBusDetailsById,
} from "../store/buses-api";
import {
  type ProcessStopsRequest,
  type ProcessStopsResponse,
  type ApiErrorResponse,
  type BusCreationResponse,
  type BusData,
  type RouteWithStops,
  type RouteListResponse,
  type TripCreationResponse,
  type CreateTripRequest,
  type TripFilters,
  type TripListResponse,
  type RouteData,
  type BusDetails,
  type UpdateTripRequest,
  type UpdateTripResponse,
} from "../types";

export function useCreateBus() {
  return useMutation<BusCreationResponse, ApiErrorResponse, CreateBusRequest>({
    mutationFn: createBus,
  });
}

export function useGetBuses(enabled: boolean = true) {
  return useQuery<BusData[], ApiErrorResponse>({
    queryKey: ["buses"],
    queryFn: getBuses,
    enabled: enabled,
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

export function useGetRoutesByBusId(busId: number | null) {
  return useQuery<RouteData[], ApiErrorResponse>({
    queryKey: ["routes", "by-bus", busId],
    queryFn: () => getRoutesByBusId(busId!),
    enabled: !!busId, // Only call when busId is provided
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

export function useGetBusDetails(busId: number | null) {
  return useQuery<BusDetails, ApiErrorResponse>({
    queryKey: ["bus-details", busId],
    queryFn: () => getBusDetailsById(busId!),
    enabled: !!busId,
  });
}

export function useUpdateTrip() {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateTripResponse,
    ApiErrorResponse,
    { tripId: number; data: UpdateTripRequest }
  >({
    mutationFn: ({ tripId, data }) => updateTrip(tripId, data),
    onSuccess: () => {
      // Invalidate bus details to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["bus-details"] });
    },
  });
}

export function useUpdateBus() {
  const queryClient = useQueryClient();

  return useMutation<
    BusUpdateResponse,
    ApiErrorResponse,
    { busId: number; data: UpdateBusRequest }
  >({
    mutationFn: ({ busId, data }) => updateBus(busId, data),
    onSuccess: (response) => {
      // Invalidate bus details and buses list to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["bus-details"] });
      queryClient.invalidateQueries({ queryKey: ["buses"] });

      toast.success(response.message || "Bus updated successfully", {
        description: "Changes have been saved.",
      });
    },
    onError: (error) => {
      toast.error("Failed to update bus", {
        description:
          error.message || "An error occurred while updating the bus",
      });
    },
  });
}

export function useGetRoutes(page: number = 1, limit: number = 10) {
  return useQuery<RouteListResponse, ApiErrorResponse>({
    queryKey: ["routes-list", page, limit],
    queryFn: () => getRoutes(page, limit),
  });
}
