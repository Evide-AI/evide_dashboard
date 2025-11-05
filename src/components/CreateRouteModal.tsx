import { useState } from "react";
import { X, Plus, MapPin, Clock, Route, Bus } from "lucide-react";
import { useProcessStops, useGetBuses } from "../hooks/useBuses";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { closeCreateRouteModal, openCreateTripModal } from "../store/slices/ui";
import type { Stop, ProcessStopsRequest, BusData } from "../types";
import { toast } from "sonner";

export default function CreateRouteModal() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.modals.createRoute);
  const routeFlow = useAppSelector((state) => state.ui.creationFlow.route);

  // Only fetch buses when modal is open
  const { data: buses, isLoading: busesLoading } = useGetBuses(isOpen);
  const [selectedBusIds, setSelectedBusIds] = useState<number[]>([]);

  const [stops, setStops] = useState<Stop[]>([
    {
      name: "",
      latitude: 0,
      longitude: 0,
      travel_time_from_previous_stop_min: 0,
      travel_distance_from_previous_stop: 0,
    },
    {
      name: "",
      latitude: 0,
      longitude: 0,
      travel_time_from_previous_stop_min: 0,
      travel_distance_from_previous_stop: 0,
    },
  ]);

  const processStopsMutation = useProcessStops();

  const addStop = (index: number) => {
    const newStop: Stop = {
      name: "",
      latitude: 0,
      longitude: 0,
      travel_time_from_previous_stop_min: 0,
      travel_distance_from_previous_stop: 0,
    };

    const updatedStops = [...stops];
    updatedStops.splice(index + 1, 0, newStop);
    setStops(updatedStops);
  };

  const removeStop = (index: number) => {
    if (stops.length > 2) {
      setStops(stops.filter((_, i) => i !== index));
    }
  };

  const updateStop = (
    index: number,
    field: keyof Stop,
    value: string | number
  ) => {
    const updatedStops = [...stops];
    updatedStops[index] = { ...updatedStops[index], [field]: value };
    setStops(updatedStops);
  };

  const validateStops = (): string | null => {
    if (stops.length < 2) return "At least 2 stops are required";

    for (let i = 0; i < stops.length; i++) {
      const stop = stops[i];
      if (!stop.name.trim()) return `Stop ${i + 1} name is required`;
      if (stop.latitude === 0 && stop.longitude === 0)
        return `Stop ${i + 1} coordinates are required`;
      if (
        i > 0 &&
        (stop.travel_time_from_previous_stop_min <= 0 ||
          stop.travel_distance_from_previous_stop <= 0)
      ) {
        return `Stop ${i + 1} must have valid travel time and distance`;
      }
    }

    return null;
  };

  const toggleBusSelection = (busId: number) => {
    setSelectedBusIds((prev) =>
      prev.includes(busId)
        ? prev.filter((id) => id !== busId)
        : [...prev, busId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateStops();
    if (validationError) {
      toast.error("Validation Error", {
        description: validationError,
        duration: 4000,
      });
      return;
    }

    const requestData: ProcessStopsRequest = { stops };

    // Add bus_id or bus_ids based on flow
    if (routeFlow.fromBusCreation && routeFlow.linkedBusId) {
      requestData.bus_id = routeFlow.linkedBusId;
    } else if (selectedBusIds.length > 0) {
      requestData.bus_ids = selectedBusIds;
    }

    processStopsMutation.mutate(requestData, {
      onSuccess: (data) => {
        const busLinkingMsg = data.data?.busLinking
          ? ` Linked to ${data.data.busLinking.totalBusesLinked} bus(es).`
          : "";

        toast.success("Route Created Successfully", {
          description: `Route with ${data.data?.stops.length} stops has been created.${busLinkingMsg}`,
          duration: 4000,
        });

        resetForm();
        dispatch(closeCreateRouteModal());

        // If from bus creation flow, continue to trip creation
        if (routeFlow.fromBusCreation && routeFlow.linkedBusId) {
          // Construct route name from first and last stop
          const firstStop = data.data?.stops[0]?.name || "Start";
          const lastStop =
            data.data?.stops[data.data?.stops.length - 1]?.name || "End";
          const routeName = `${firstStop} → ${lastStop}`;

          dispatch(
            openCreateTripModal({
              busId: routeFlow.linkedBusId,
              busNumber: routeFlow.linkedBusNumber || undefined,
              routeId: data.data.route.id,
              routeName: routeName,
            })
          );
        }
      },
      onError: (error) => {
        toast.error(error.message, {
          description:
            error.errors?.[0]?.message ||
            "Please check your input and try again.",
          duration: 5000,
        });
      },
    });
  };

  const resetForm = () => {
    setStops([
      {
        name: "",
        latitude: 0,
        longitude: 0,
        travel_time_from_previous_stop_min: 0,
        travel_distance_from_previous_stop: 0,
      },
      {
        name: "",
        latitude: 0,
        longitude: 0,
        travel_time_from_previous_stop_min: 0,
        travel_distance_from_previous_stop: 0,
      },
    ]);
  };

  const handleClose = () => {
    resetForm();
    dispatch(closeCreateRouteModal());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Route className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Process Route
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Bus Selection Section - Only show if NOT from bus creation */}
          {!routeFlow.fromBusCreation && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-3">
                <Bus className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-medium text-gray-900">
                  Link Buses (Optional)
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Select buses to link with this route
              </p>

              {busesLoading ? (
                <p className="text-sm text-gray-500">Loading buses...</p>
              ) : buses && buses.length > 0 ? (
                <div className="space-y-3">
                  {/* Dropdown for bus selection */}
                  <div className="relative">
                    <Bus className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
                    <select
                      onChange={(e) => {
                        const busId = Number(e.target.value);
                        if (busId && !selectedBusIds.includes(busId)) {
                          toggleBusSelection(busId);
                          e.target.value = ""; // Reset dropdown
                        }
                      }}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      disabled={selectedBusIds.length === buses.length}
                    >
                      <option value="">
                        {selectedBusIds.length === buses.length
                          ? "All buses selected"
                          : "Select a bus to add..."}
                      </option>
                      {buses
                        .filter(
                          (bus: BusData) => !selectedBusIds.includes(bus.id)
                        )
                        .map((bus: BusData) => (
                          <option key={bus.id} value={bus.id}>
                            {bus.bus_number} {bus.name && `(${bus.name})`}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Selected buses as tags */}
                  {selectedBusIds.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedBusIds.map((busId) => {
                        const bus = buses.find((b: BusData) => b.id === busId);
                        return bus ? (
                          <div
                            key={busId}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                          >
                            <span>
                              {bus.bus_number} {bus.name && `(${bus.name})`}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleBusSelection(busId)}
                              className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No buses available</p>
              )}
            </div>
          )}

          {/* Info Banner if from bus creation */}
          {routeFlow.fromBusCreation && routeFlow.linkedBusId && (
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <div className="flex items-center gap-2">
                <Bus className="h-5 w-5 text-blue-600" />
                <p className="text-sm text-blue-800">
                  This route will be automatically linked to Bus{" "}
                  {routeFlow.linkedBusNumber || `ID: ${routeFlow.linkedBusId}`}
                </p>
              </div>
            </div>
          )}

          {/* Stops Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Route Stops
            </h3>

            {stops.map((stop, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">
                    Stop {index + 1}{" "}
                    {index === 0
                      ? "(Starting Point)"
                      : index === stops.length - 1
                      ? "(End Point)"
                      : ""}
                  </h4>
                  {stops.length > 2 &&
                    index !== 0 &&
                    index !== stops.length - 1 && (
                      <button
                        type="button"
                        onClick={() => removeStop(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stop Name *
                    </label>
                    <input
                      type="text"
                      value={stop.name}
                      onChange={(e) =>
                        updateStop(index, "name", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter stop name"
                      required
                    />
                  </div>

                  <div className="md:col-span-2 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Latitude *
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={stop.latitude || ""}
                        onChange={(e) =>
                          updateStop(
                            index,
                            "latitude",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="12.9698"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Longitude *
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={stop.longitude || ""}
                        onChange={(e) =>
                          updateStop(
                            index,
                            "longitude",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="77.7500"
                        required
                      />
                    </div>
                  </div>

                  {index > 0 && (
                    <div className="md:col-span-2 grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Travel Time (minutes) *
                        </label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <input
                            type="number"
                            min="1"
                            value={
                              stop.travel_time_from_previous_stop_min || ""
                            }
                            onChange={(e) =>
                              updateStop(
                                index,
                                "travel_time_from_previous_stop_min",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="25"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Distance (km) *
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          value={stop.travel_distance_from_previous_stop || ""}
                          onChange={(e) =>
                            updateStop(
                              index,
                              "travel_distance_from_previous_stop",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="15.2"
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Add stop button between stops */}
                {index < stops.length - 1 && (
                  <div className="flex justify-center pt-2">
                    <button
                      type="button"
                      onClick={() => addStop(index)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Plus size={16} />
                      Add Stop
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

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
              disabled={processStopsMutation.isPending}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {processStopsMutation.isPending
                ? "Processing Route..."
                : "Process Route"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
