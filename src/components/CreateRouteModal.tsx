import { useState, useEffect } from "react";
import {
  X,
  Plus,
  Route,
  Bus,
  ChevronDown,
  RotateCcw,
  Loader2,
} from "lucide-react";
import {
  useProcessStops,
  useGetBuses,
  useGetRoutes,
  useGetRouteWithStops,
} from "../hooks/useBuses";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { closeCreateRouteModal, openCreateTripModal } from "../store/slices/ui";
import type { Stop, ProcessStopsRequest, BusData } from "../types";
import { toast } from "sonner";
import StopInput from "./StopInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export default function CreateRouteModal() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.modals.createRoute);
  const routeFlow = useAppSelector((state) => state.ui.creationFlow.route);

  // Only fetch buses when modal is open
  const { data: buses, isLoading: busesLoading } = useGetBuses(isOpen);
  const [selectedBusIds, setSelectedBusIds] = useState<number[]>([]);
  const [lockedBusIds, setLockedBusIds] = useState<number[]>([]); // Buses linked to selected route

  // Route selection state
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);
  const [routePage, setRoutePage] = useState(1);
  const [isRouteMode, setIsRouteMode] = useState(false); // If true, stops are read-only
  const [accumulatedRoutes, setAccumulatedRoutes] = useState<
    Array<{ route_id: number; route_name: string }>
  >([]);

  // Fetch routes with pagination
  const { data: routesData } = useGetRoutes(routePage, 20);

  // Fetch selected route details
  const { data: routeDetails } = useGetRouteWithStops(selectedRouteId);

  // Accumulate routes when new page data arrives
  useEffect(() => {
    if (routesData?.data) {
      setAccumulatedRoutes((prev) => {
        const existingIds = new Set(prev.map((r) => r.route_id));
        const newRoutes = routesData.data.filter(
          (r) => !existingIds.has(r.route_id)
        );
        return [...prev, ...newRoutes];
      });
    }
  }, [routesData]);

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

  // Populate stops and buses when route details are loaded
  useEffect(() => {
    if (routeDetails && isRouteMode) {
      // Map route_stops to Stop format
      const mappedStops: Stop[] = routeDetails.route_stops.map((rs) => ({
        name: rs.stop.name,
        latitude:
          typeof rs.stop.location === "object" && rs.stop.location?.coordinates
            ? rs.stop.location.coordinates[1]
            : 0,
        longitude:
          typeof rs.stop.location === "object" && rs.stop.location?.coordinates
            ? rs.stop.location.coordinates[0]
            : 0,
        travel_time_from_previous_stop_min:
          parseFloat(rs.travel_time_from_previous_stop_min) || 0,
        travel_distance_from_previous_stop:
          parseFloat(rs.travel_distance_from_previous_stop) || 0,
        stop_id: rs.stop_id,
      }));

      setStops(mappedStops);

      // Set linked buses as locked
      if (routeDetails.linked_buses && routeDetails.linked_buses.length > 0) {
        const linkedIds = routeDetails.linked_buses.map((b) => b.bus_id);
        setLockedBusIds(linkedIds);
        setSelectedBusIds(linkedIds);
      } else {
        // Backend doesn't return linked_buses data yet
        setLockedBusIds([]);
        toast.info("Note: Linked buses data not available", {
          description: "You can still add buses to this route.",
          duration: 3000,
        });
      }
    }
  }, [routeDetails, isRouteMode]);

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

  const updateStopBulk = (index: number, updates: Partial<Stop>) => {
    const updatedStops = [...stops];
    updatedStops[index] = { ...updatedStops[index], ...updates };
    setStops(updatedStops);
  };

  const validateStops = (): string | null => {
    if (stops.length < 2) return "At least 2 stops are required";

    for (let i = 0; i < stops.length; i++) {
      const stop = stops[i];
      if (!stop.name.trim()) return `Stop ${i + 1} name is required`;
      if (stop.latitude === 0 && stop.longitude === 0)
        return `Stop ${i + 1} coordinates are required`;

      // Skip travel time/distance validation in route mode (data from DB)
      if (!isRouteMode && i > 0) {
        if (
          stop.travel_time_from_previous_stop_min <= 0 ||
          stop.travel_distance_from_previous_stop <= 0
        ) {
          return `Stop ${i + 1} must have valid travel time and distance`;
        }
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
    setSelectedBusIds([]);
    setLockedBusIds([]);
    setSelectedRouteId(null);
    setIsRouteMode(false);
    setRoutePage(1);
  };

  const handleClose = () => {
    resetForm();
    setAccumulatedRoutes([]);
    dispatch(closeCreateRouteModal());
  };

  const handleRouteSelect = (routeId: number) => {
    setSelectedRouteId(routeId);
    setIsRouteMode(true);
  };

  const handleClearRouteSelection = () => {
    setSelectedRouteId(null);
    setIsRouteMode(false);
    setLockedBusIds([]);
    setSelectedBusIds([]);
    // Reset to default empty stops
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

  const handleLoadMoreRoutes = () => {
    if (
      routesData?.pagination &&
      routePage < routesData.pagination.total_pages
    ) {
      setRoutePage((prev) => prev + 1);
    }
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
          {/* Route Selection - Only show if NOT from bus creation */}
          {!routeFlow.fromBusCreation && (
            <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Route className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-medium text-gray-900">
                    Select Existing Route (Optional)
                  </h3>
                </div>
                {isRouteMode && (
                  <button
                    type="button"
                    onClick={handleClearRouteSelection}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Clear & Create New
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Choose a route to link buses, or create a new route by entering
                stops below
              </p>

              {!isRouteMode ? (
                <Select
                  onValueChange={(value) => handleRouteSelect(Number(value))}
                >
                  <SelectTrigger className="w-full">
                    <div className="flex items-center gap-2">
                      <Route className="h-4 w-4 text-gray-500" />
                      <SelectValue placeholder="Select a route..." />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {accumulatedRoutes.map((route) => (
                      <SelectItem
                        key={route.route_id}
                        value={route.route_id.toString()}
                      >
                        {route.route_name}
                      </SelectItem>
                    ))}

                    {/* Load More Button inside dropdown */}
                    {routesData?.pagination &&
                      routePage < routesData.pagination.total_pages && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleLoadMoreRoutes();
                          }}
                          className="w-full px-2 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors flex items-center justify-center gap-1 border-t mt-1 pt-2"
                        >
                          <ChevronDown className="h-4 w-4" />
                          Load More (Page {routePage} of{" "}
                          {routesData.pagination.total_pages})
                        </button>
                      )}
                  </SelectContent>
                </Select>
              ) : (
                <div className="bg-white rounded-lg p-3 border border-blue-200">
                  <p className="text-sm font-medium text-gray-900">
                    Route selected:{" "}
                    {routeDetails?.route_name || `Route #${selectedRouteId}`}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Stop details are locked. You can only modify bus linking.
                  </p>
                </div>
              )}
            </div>
          )}

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
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading buses...
                </div>
              ) : buses && buses.length > 0 ? (
                <div className="space-y-3">
                  {/* Dropdown for bus selection using Radix UI */}
                  <Select
                    onValueChange={(value) => {
                      const busId = Number(value);
                      if (busId && !selectedBusIds.includes(busId)) {
                        toggleBusSelection(busId);
                      }
                    }}
                    disabled={selectedBusIds.length === buses.length}
                  >
                    <SelectTrigger className="w-full">
                      <div className="flex items-center gap-2">
                        <Bus className="h-4 w-4 text-gray-500" />
                        <SelectValue
                          placeholder={
                            selectedBusIds.length === buses.length
                              ? "All buses selected"
                              : "Select a bus to add..."
                          }
                        />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="max-h-[250px]">
                      {buses
                        .filter(
                          (bus: BusData) => !selectedBusIds.includes(bus.id)
                        )
                        .map((bus: BusData) => (
                          <SelectItem key={bus.id} value={bus.id.toString()}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {bus.bus_number}
                              </span>
                              {bus.name && (
                                <span className="text-gray-500">
                                  ({bus.name})
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  {/* Selected buses as tags */}
                  {selectedBusIds.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedBusIds.map((busId) => {
                        const bus = buses.find((b: BusData) => b.id === busId);
                        const isLocked = lockedBusIds.includes(busId);
                        return bus ? (
                          <div
                            key={busId}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                              isLocked
                                ? "bg-gray-200 text-gray-700"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            <span>
                              {bus.bus_number} {bus.name && `(${bus.name})`}
                              {isLocked && (
                                <span className="ml-1 text-xs">(Linked)</span>
                              )}
                            </span>
                            {!isLocked && (
                              <button
                                type="button"
                                onClick={() => toggleBusSelection(busId)}
                                className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                              >
                                <X size={14} />
                              </button>
                            )}
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
            <h3 className="text-lg font-medium text-gray-900">Route Stops</h3>

            {stops.map((stop, index) => (
              <div key={index}>
                <StopInput
                  stop={stop}
                  index={index}
                  onStopChange={updateStop}
                  onStopChangeBulk={updateStopBulk}
                  otherStops={stops}
                  isIntermediateStop={index > 0}
                  isReadOnly={isRouteMode}
                  onRemove={
                    stops.length > 2 &&
                    index !== 0 &&
                    index !== stops.length - 1
                      ? () => removeStop(index)
                      : undefined
                  }
                  canRemove={
                    stops.length > 2 &&
                    index !== 0 &&
                    index !== stops.length - 1
                  }
                />

                {/* Add stop button between stops - only if not in route mode */}
                {!isRouteMode && index < stops.length - 1 && (
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
