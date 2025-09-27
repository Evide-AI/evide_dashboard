import axios from "axios";
import type {
  ApiErrorResponse,
  BusCreationResponse,
  BusData,
  BusListResponse,
  ProcessStopsRequest,
  ProcessStopsResponse,
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
    const response = await api.post<ProcessStopsResponse>(
      "/routes/process-stops",
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
