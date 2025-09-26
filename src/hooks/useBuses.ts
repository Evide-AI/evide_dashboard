import { useMutation, useQuery } from "@tanstack/react-query";
import { createBus, getBuses, type CreateBusRequest } from "../store/buses-api";
import type { ApiErrorResponse, BusCreationResponse, BusData } from "../types";

export function useCreateBus() {
  return useMutation<BusCreationResponse, ApiErrorResponse, CreateBusRequest>({
    mutationFn: createBus,
    onSuccess: (data) => {
      console.log("Bus created successfully:", data);
    },
    onError: (error: ApiErrorResponse) => {
      console.error("Failed to create bus:", error.message);
    },
  });
}

export function useGetBuses() {
  return useQuery<BusData[], ApiErrorResponse>({
    queryKey: ["buses"],
    queryFn: getBuses,
  });
}
