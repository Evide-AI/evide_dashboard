import { useState, useEffect } from "react";
import { X, MapPin, Clock, Route, Bus, Calendar, Info } from "lucide-react";
import {
  useCreateTrip,
  useGetRoutesByBusId,
  useGetBuses,
  useGetRouteWithStops,
} from "../hooks/useBuses";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { closeCreateTripModal } from "../store/slices/ui";
import type {
  CreateTripRequest,
  TripStopTime,
  BusData,
  RouteData,
} from "../types";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function CreateTripModal() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.modals.createTrip);
  const tripFlow = useAppSelector((state) => state.ui.creationFlow.trip);

  const [selectedBusId, setSelectedBusId] = useState<number | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);
  const [scheduledStartTime, setScheduledStartTime] = useState("");
  const [scheduledEndTime, setScheduledEndTime] = useState("");
  const [tripType, setTripType] = useState<"regular" | "express" | "limited">(
    "regular"
  );
  const [stopTimes, setStopTimes] = useState<TripStopTime[]>([]);

  const { data: buses } = useGetBuses();

  // Fetch routes for selected bus (only when in standalone mode and bus is selected)
  const {
    data: routes,
    isLoading: routesLoading,
    error: routesError,
  } = useGetRoutesByBusId(!tripFlow.fromRouteCreation ? selectedBusId : null);

  // Only fetch route details if in standalone mode
  const { data: selectedRoute } = useGetRouteWithStops(
    tripFlow.fromRouteCreation ? tripFlow.linkedRouteId : selectedRouteId
  );
  const createTripMutation = useCreateTrip();

  const queryClient = useQueryClient();

  // Initialize data from flow context
  useEffect(() => {
    if (isOpen && tripFlow.fromRouteCreation) {
      setSelectedBusId(tripFlow.linkedBusId);
      setSelectedRouteId(tripFlow.linkedRouteId);
    }
  }, [isOpen, tripFlow]);

  // Reset selected route when bus changes (only in standalone mode)
  useEffect(() => {
    if (!tripFlow.fromRouteCreation && selectedBusId) {
      setSelectedRouteId(null);
    }
  }, [selectedBusId, tripFlow.fromRouteCreation]);

  // Initialize stop times when route is selected
  useEffect(() => {
    if (selectedRoute?.route_stops) {
      const initialStopTimes: TripStopTime[] = selectedRoute.route_stops
        .sort((a, b) => a.sequence_order - b.sequence_order)
        .map((routeStop) => ({
          stop_id: routeStop.stop_id,
          approx_arrival_time: "",
          approx_departure_time: "",
        }));
      setStopTimes(initialStopTimes);
    }
  }, [selectedRoute]);

  // Helper function for time comparison:
  const timeToMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const updateStopTime = (
    stopIndex: number,
    field: "approx_arrival_time" | "approx_departure_time",
    value: string
  ) => {
    const updatedStopTimes = [...stopTimes];
    updatedStopTimes[stopIndex] = {
      ...updatedStopTimes[stopIndex],
      [field]: value,
    };
    setStopTimes(updatedStopTimes);
  };

  const validateForm = (): string | null => {
    if (!selectedBusId) return "Please select a bus";
    if (!selectedRouteId) return "Please select a route";
    if (!scheduledStartTime) return "Please select start time";
    if (!scheduledEndTime) return "Please select end time";

    // Simple time comparison (convert to minutes for comparison)
    const startMinutes = timeToMinutes(scheduledStartTime);
    const endMinutes = timeToMinutes(scheduledEndTime);
    if (endMinutes <= startMinutes) return "End time must be after start time";

    // Validate stop times
    for (let i = 0; i < stopTimes.length; i++) {
      const stop = stopTimes[i];
      if (!stop.approx_arrival_time || !stop.approx_departure_time) {
        return `Stop ${i + 1}: Both arrival and departure times are required`;
      }
    }

    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      toast.error("Validation Error", {
        description: validationError,
        duration: 4000,
      });
      return;
    }

    const tripData: CreateTripRequest = {
      route_id: selectedRouteId!,
      bus_id: selectedBusId!,
      scheduled_start_time: scheduledStartTime,
      scheduled_end_time: scheduledEndTime,
      trip_type: tripType,
      stops: stopTimes,
    };

    createTripMutation.mutate(tripData, {
      onSuccess: () => {
        toast.success("Trip Created Successfully", {
          description: `Trip has been scheduled successfully.`,
          duration: 4000,
        });
        // this is invalidate and refetch trips
        queryClient.invalidateQueries({ queryKey: ["trips"] });

        resetForm();
        dispatch(closeCreateTripModal());
      },
      onError: (error) => {
        toast.error("Failed to create trip", {
          description:
            error.message || "Please check your input and try again.",
          duration: 5000,
        });
      },
    });
  };

  const resetForm = () => {
    setSelectedBusId(null);
    setSelectedRouteId(null);
    setScheduledStartTime("");
    setScheduledEndTime("");
    setTripType("regular");
    setStopTimes([]);
  };

  const handleClose = () => {
    resetForm();
    dispatch(closeCreateTripModal());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Create Trip</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Context Info Banner - Show if from route creation flow */}
          {tripFlow.fromRouteCreation && (
            <div className="border border-green-200 rounded-lg p-4 bg-green-50">
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-green-600" />
                <div className="text-sm text-green-800">
                  <p className="font-medium">Creating trip for:</p>
                  <p>
                    Bus:{" "}
                    {tripFlow.linkedBusNumber || `ID: ${tripFlow.linkedBusId}`}{" "}
                    | Route:{" "}
                    {tripFlow.linkedRouteName ||
                      `ID: ${tripFlow.linkedRouteId}`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Trip Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bus Selection - Only show if NOT from flow */}
            {!tripFlow.fromRouteCreation && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Bus *
                </label>
                <div className="relative">
                  <Bus className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <select
                    value={selectedBusId || ""}
                    onChange={(e) =>
                      setSelectedBusId(
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Choose a bus...</option>
                    {buses?.map((bus: BusData) => (
                      <option key={bus.id} value={bus.id}>
                        {bus.bus_number} {bus.name && `- ${bus.name}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Trip Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trip Type
              </label>
              <select
                value={tripType}
                onChange={(e) =>
                  setTripType(
                    e.target.value as "regular" | "express" | "limited"
                  )
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="regular">Regular</option>
                <option value="express">Express</option>
                <option value="limited">Limited</option>
              </select>
            </div>
          </div>

          {/* Route Selection Section - Only show if NOT from flow */}
          {!tripFlow.fromRouteCreation && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Route *
              </label>

              {/* Route Dropdown */}
              <div className="relative">
                <Route className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select
                  value={selectedRouteId || ""}
                  onChange={(e) =>
                    setSelectedRouteId(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={routesLoading || !selectedBusId}
                >
                  <option value="">
                    {!selectedBusId
                      ? "Select a bus first..."
                      : routesLoading
                      ? "Loading routes..."
                      : routesError
                      ? "Error loading routes"
                      : routes && routes.length === 0
                      ? "No routes found for this bus"
                      : "Choose a route..."}
                  </option>
                  {!routesLoading &&
                    !routesError &&
                    routes &&
                    routes?.map((route: RouteData) => (
                      <option key={route.id} value={route.id}>
                        {route.first_stop.name} → {route.last_stop.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          )}

          {/* Schedule Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scheduled Start Time *
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="time"
                  value={scheduledStartTime}
                  onChange={(e) => setScheduledStartTime(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scheduled End Time *
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="time"
                  value={scheduledEndTime}
                  onChange={(e) => setScheduledEndTime(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Stop Times Section */}
          {selectedRoute && stopTimes.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Stop Timings
              </h3>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {selectedRoute.route_stops
                  .sort((a, b) => a.sequence_order - b.sequence_order)
                  .map((routeStop, index) => (
                    <div
                      key={routeStop.stop_id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">
                          Stop {routeStop.sequence_order}: {routeStop.stop.name}
                        </h4>
                        <span className="text-sm text-gray-500">
                          {index === 0
                            ? "Starting Point"
                            : index === selectedRoute.route_stops.length - 1
                            ? "End Point"
                            : "Intermediate"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Arrival Time *
                          </label>
                          <input
                            type="time" // Changed from datetime-local
                            value={stopTimes[index]?.approx_arrival_time || ""}
                            onChange={(e) =>
                              updateStopTime(
                                index,
                                "approx_arrival_time",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Departure Time *
                          </label>
                          <input
                            type="time" // Changed from datetime-local
                            value={
                              stopTimes[index]?.approx_departure_time || ""
                            }
                            onChange={(e) =>
                              updateStopTime(
                                index,
                                "approx_departure_time",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createTripMutation.isPending}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {createTripMutation.isPending
                ? "Creating Trip..."
                : "Create Trip"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
