import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createBus,
  getBuses,
  processStops,
  type CreateBusRequest,
} from "../store/buses-api";
import {
  type ProcessStopsRequest,
  type ProcessStopsResponse,
  type ApiErrorResponse,
  type BusCreationResponse,
  type BusData,
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
