import { useState, useEffect } from "react";
import {
  X,
  MapPin,
  Clock,
  Route as RouteIcon,
  Calendar,
  Pencil,
  Save,
  RotateCcw,
  Plus,
  Trash2,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  closeTripDetailsModal,
  enableEditMode,
  disableEditMode,
  setUnsavedChanges,
} from "../store/slices/ui";
import { getRouteDisplayName } from "../lib/time-utils";
import UnsavedChangesDialog from "./UnsavedChangesDialog";
import { useUpdateTrip } from "../hooks/useBuses";
import type { UpdateTripRequest } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface EditableStop {
  // Stop table fields
  id?: number; // Optional for new stops, required for existing stops
  name: string;
  latitude: number;
  longitude: number;

  // RouteStop table fields (used for UI calculations and display)
  sequence_order: number;
  travel_time_from_previous_stop_min: number;
  travel_distance_from_previous_stop: number;
  dwell_time_minutes: number;

  // TripStopTime fields
  approx_arrival_time: string; // HH:MM:SS
  approx_departure_time: string; // HH:MM:SS
}

interface TripFormData {
  // Trip fields
  trip_type: "regular" | "express" | "limited";
  scheduled_start_time: string; // HH:MM:SS
  scheduled_end_time: string; // HH:MM:SS
  // Note: is_active is NOT editable - it's managed by backend cron job

  // Route & stops data
  stops: EditableStop[];
}

export default function TripDetailsModal() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.modals.tripDetails);
  const tripData = useAppSelector((state) => state.ui.selectedTripData);
  const isEditMode = useAppSelector((state) => state.ui.editMode.tripDetails);
  const hasUnsavedChanges = useAppSelector(
    (state) => state.ui.unsavedChanges.tripDetails
  );

  // Mutation hook for updating trip
  const { mutate: updateTripMutation, isPending: isUpdating } = useUpdateTrip();

  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [formData, setFormData] = useState<TripFormData>({
    trip_type: "regular",
    scheduled_start_time: "",
    scheduled_end_time: "",
    stops: [],
  });
  const [originalData, setOriginalData] = useState<TripFormData>({
    trip_type: "regular",
    scheduled_start_time: "",
    scheduled_end_time: "",
    stops: [],
  });

  // Initialize form data when trip data loads
  useEffect(() => {
    if (tripData && tripData.route.route_stops && tripData.trip_stop_times) {
      // Merge route_stops with trip_stop_times to create editable stops
      const mergedStops: EditableStop[] = tripData.route.route_stops.map(
        (routeStop) => {
          const tripStopTime = tripData.trip_stop_times.find(
            (tst) => tst.stop_id === routeStop.stop.id
          );

          // Extract coordinates from PostGIS location
          // location.coordinates = [longitude, latitude]
          const coordinates = routeStop.stop.location?.coordinates || [0, 0];
          const longitude = coordinates[0] || 0;
          const latitude = coordinates[1] || 0;

          return {
            id: routeStop.stop.id,
            name: routeStop.stop.name,
            latitude,
            longitude,
            sequence_order: routeStop.sequence_order,
            travel_time_from_previous_stop_min:
              routeStop.travel_time_from_previous_stop_min || 0,
            travel_distance_from_previous_stop:
              typeof routeStop.travel_distance_from_previous_stop === "number"
                ? routeStop.travel_distance_from_previous_stop
                : parseFloat(
                    routeStop.travel_distance_from_previous_stop || "0"
                  ),
            dwell_time_minutes: routeStop.dwell_time_minutes,
            approx_arrival_time:
              tripStopTime?.approx_arrival_time || "00:00:00",
            approx_departure_time:
              tripStopTime?.approx_departure_time || "00:00:00",
          };
        }
      );

      const initialData: TripFormData = {
        trip_type: tripData.trip_type,
        scheduled_start_time: tripData.scheduled_start_time,
        scheduled_end_time: tripData.scheduled_end_time,
        stops: mergedStops,
      };

      setFormData(initialData);
      setOriginalData(JSON.parse(JSON.stringify(initialData))); // Deep copy
    }
  }, [tripData]);

  // Check for unsaved changes
  useEffect(() => {
    if (!isEditMode) return;

    const hasChanges =
      JSON.stringify(formData) !== JSON.stringify(originalData);

    dispatch(setUnsavedChanges({ modal: "tripDetails", hasChanges }));
  }, [formData, originalData, isEditMode, dispatch]);

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedDialog(true);
    } else {
      dispatch(closeTripDetailsModal());
      if (isEditMode) {
        dispatch(disableEditMode("tripDetails"));
      }
    }
  };

  const handleEnableEdit = () => {
    dispatch(enableEditMode("tripDetails"));
  };

  const handleUndo = () => {
    setFormData(JSON.parse(JSON.stringify(originalData))); // Deep copy
    dispatch(setUnsavedChanges({ modal: "tripDetails", hasChanges: false }));
  };

  const handleSave = async () => {
    if (!tripData) return;

    const validationError = validateFormData();
    if (validationError) {
      toast.error("Validation Error", {
        description: validationError,
      });
      return;
    }

    // Build request payload
    const payload: UpdateTripRequest = {
      trip: {
        trip_type: formData.trip_type,
        scheduled_start_time: formData.scheduled_start_time,
        scheduled_end_time: formData.scheduled_end_time,
      },
      route: {
        stops: formData.stops.map((stop, index) => {
          const baseStop = {
            travel_time_from_previous_stop_min:
              stop.travel_time_from_previous_stop_min,
            travel_distance_from_previous_stop:
              stop.travel_distance_from_previous_stop,
            dwell_time_minutes: stop.dwell_time_minutes,
            approx_arrival_time: stop.approx_arrival_time,
            approx_departure_time: stop.approx_departure_time,
          };

          // Check if this stop has been modified from its original state
          const originalStop = originalData.stops[index];
          const isStopModified =
            originalStop &&
            stop.id &&
            (stop.name !== originalStop.name ||
              stop.latitude !== originalStop.latitude ||
              stop.longitude !== originalStop.longitude);

          // If stop has no ID or has been modified, create new stop
          if (!stop.id || isStopModified) {
            return {
              name: stop.name,
              latitude: stop.latitude,
              longitude: stop.longitude,
              ...baseStop,
            };
          } else {
            // If stop has ID and hasn't been modified, use existing stop
            return {
              stop_id: stop.id,
              ...baseStop,
            };
          }
        }),
      },
    };

    // Call the mutation
    updateTripMutation(
      { tripId: tripData.id, data: payload },
      {
        onSuccess: () => {
          // Update original data to match current (prevent unsaved changes warning)
          setOriginalData(JSON.parse(JSON.stringify(formData)));
          dispatch(disableEditMode("tripDetails"));
          dispatch(
            setUnsavedChanges({ modal: "tripDetails", hasChanges: false })
          );
          toast.success("Trip updated successfully", {
            description: "All changes have been saved.",
          });
        },
        onError: (error) => {
          toast.error("Failed to update trip", {
            description:
              error.message || "An error occurred while updating the trip",
          });
        },
      }
    );
  };

  const validateFormData = (): string | null => {
    if (formData.stops.length < 2) {
      return "At least 2 stops are required";
    }

    for (let i = 0; i < formData.stops.length; i++) {
      const stop = formData.stops[i];

      // Check if this stop will be treated as a new stop (no ID or modified)
      const originalStop = originalData.stops[i];
      const isStopModified =
        originalStop &&
        stop.id &&
        (stop.name !== originalStop.name ||
          stop.latitude !== originalStop.latitude ||
          stop.longitude !== originalStop.longitude);

      const treatAsNewStop = !stop.id || isStopModified;

      // For new stops or modified existing stops, validate required fields
      if (treatAsNewStop) {
        if (!stop.name.trim()) {
          return `Stop ${i + 1} name is required`;
        }
        if (stop.latitude < -90 || stop.latitude > 90) {
          return `Stop ${i + 1} latitude must be between -90 and 90`;
        }
        if (stop.longitude < -180 || stop.longitude > 180) {
          return `Stop ${i + 1} longitude must be between -180 and 180`;
        }
        if (stop.latitude === 0 && stop.longitude === 0) {
          return `Stop ${i + 1} coordinates are required`;
        }
      }

      // Validate timing and travel data for all stops
      if (i > 0) {
        if (stop.travel_time_from_previous_stop_min <= 0) {
          return `Stop ${i + 1} must have valid travel time from previous stop`;
        }
        if (stop.travel_distance_from_previous_stop <= 0) {
          return `Stop ${i + 1} must have valid distance from previous stop`;
        }
      }
      if (!stop.approx_arrival_time || !stop.approx_departure_time) {
        return `Stop ${i + 1} must have arrival and departure times`;
      }
    }

    return null;
  };

  const handleDiscardChanges = () => {
    setFormData(JSON.parse(JSON.stringify(originalData)));
    dispatch(disableEditMode("tripDetails"));
    dispatch(setUnsavedChanges({ modal: "tripDetails", hasChanges: false }));
    setShowUnsavedDialog(false);
    dispatch(closeTripDetailsModal());
  };

  const handleCancelDiscard = () => {
    setShowUnsavedDialog(false);
  };

  // Stop management functions
  const updateStop = (
    index: number,
    field: keyof EditableStop,
    value: string | number
  ) => {
    const updatedStops = [...formData.stops];
    updatedStops[index] = { ...updatedStops[index], [field]: value };
    setFormData({ ...formData, stops: updatedStops });
  };

  const addStop = (index: number) => {
    const newStop: EditableStop = {
      name: "",
      latitude: 0,
      longitude: 0,
      sequence_order: index + 2, // Will be recalculated
      travel_time_from_previous_stop_min: 0,
      travel_distance_from_previous_stop: 0,
      dwell_time_minutes: 5,
      approx_arrival_time: "00:00:00",
      approx_departure_time: "00:00:00",
    };

    const updatedStops = [...formData.stops];
    updatedStops.splice(index + 1, 0, newStop);

    // Recalculate sequence orders
    updatedStops.forEach((stop, idx) => {
      stop.sequence_order = idx + 1;
    });

    setFormData({ ...formData, stops: updatedStops });
  };

  const removeStop = (index: number) => {
    if (formData.stops.length > 2) {
      const updatedStops = formData.stops.filter((_, i) => i !== index);

      // Recalculate sequence orders
      updatedStops.forEach((stop, idx) => {
        stop.sequence_order = idx + 1;
      });

      setFormData({ ...formData, stops: updatedStops });
    }
  };

  if (!isOpen || !tripData) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl my-8 flex flex-col max-h-[95vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50 shrink-0">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-6 w-6 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  {isEditMode ? "Edit Trip & Route Details" : "Trip Details"}
                </h2>
              </div>
              {isEditMode && (
                <p className="text-sm text-green-600 font-medium">
                  Edit Mode Active
                </p>
              )}
              {!isEditMode && (
                <p className="text-sm text-gray-600">
                  {tripData.route.route_stops
                    ? getRouteDisplayName(tripData.route.route_stops)
                    : `Route #${tripData.route_id}`}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isEditMode && (
                <Button
                  onClick={handleUndo}
                  variant="outline"
                  size="sm"
                  disabled={!hasUnsavedChanges}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Undo
                </Button>
              )}
              {!isEditMode && (
                <Button
                  onClick={handleEnableEdit}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
              )}
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 relative">
            <div className="space-y-6">
              {/* Trip Info Section */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 relative z-10">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Trip Information
                </h3>

                {isEditMode ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-20">
                    <div className="space-y-2">
                      <Label htmlFor="trip_type">Trip Type</Label>
                      <Select
                        value={formData.trip_type}
                        onValueChange={(
                          value: "regular" | "express" | "limited"
                        ) => setFormData({ ...formData, trip_type: value })}
                      >
                        <SelectTrigger
                          id="trip_type"
                          className="relative z-[70]"
                        >
                          <SelectValue placeholder="Select trip type" />
                        </SelectTrigger>
                        <SelectContent className="z-[70]">
                          <SelectItem value="regular">Regular</SelectItem>
                          <SelectItem value="express">Express</SelectItem>
                          <SelectItem value="limited">Limited</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Active Status</Label>
                      <div className="flex items-center gap-3 pt-2">
                        <div
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                            tripData.is_active
                              ? "bg-green-50 border-green-200"
                              : "bg-red-50 border-red-200"
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              tripData.is_active
                                ? "bg-green-500 animate-pulse"
                                : "bg-red-500"
                            }`}
                          />
                          <span
                            className={`text-sm font-medium ${
                              tripData.is_active
                                ? "text-green-700"
                                : "text-red-700"
                            }`}
                          >
                            {tripData.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 italic">
                          (Auto-managed by system)
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="start_time">
                        Scheduled Start Time (HH:MM:SS)
                      </Label>
                      <Input
                        id="start_time"
                        type="time"
                        step="1"
                        value={formData.scheduled_start_time}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            scheduled_start_time: e.target.value + ":00",
                          })
                        }
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="end_time">
                        Scheduled End Time (HH:MM:SS)
                      </Label>
                      <Input
                        id="end_time"
                        type="time"
                        step="1"
                        value={formData.scheduled_end_time}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            scheduled_end_time: e.target.value + ":00",
                          })
                        }
                        className="w-full"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <p className="text-xs text-gray-600 mb-1">Trip Type</p>
                      <p className="text-sm font-semibold text-gray-900 capitalize">
                        {tripData.trip_type}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-green-100">
                      <p className="text-xs text-gray-600 mb-1">Start Time</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {tripData.scheduled_start_time}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-orange-100">
                      <p className="text-xs text-gray-600 mb-1">End Time</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {tripData.scheduled_end_time}
                      </p>
                    </div>
                    <div
                      className={`rounded-lg p-4 border ${
                        tripData.is_active
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                      }`}
                    >
                      <p className="text-xs text-gray-600 mb-1">Status</p>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            tripData.is_active
                              ? "bg-green-500 animate-pulse"
                              : "bg-red-500"
                          }`}
                        />
                        <p
                          className={`text-sm font-semibold ${
                            tripData.is_active
                              ? "text-green-700"
                              : "text-red-700"
                          }`}
                        >
                          {tripData.is_active ? "Active" : "Inactive"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Route Info */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <RouteIcon className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">
                    Route Information
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Route</p>
                    <p className="font-medium text-gray-900">
                      {isEditMode
                        ? formData.stops.length >= 2
                          ? `${formData.stops[0].name} → ${
                              formData.stops[formData.stops.length - 1].name
                            }`
                          : "Need at least 2 stops"
                        : tripData.route.route_stops
                        ? getRouteDisplayName(tripData.route.route_stops)
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Distance</p>
                    <p className="font-medium text-gray-900">
                      {isEditMode
                        ? formData.stops
                            .reduce(
                              (sum, stop) =>
                                sum + stop.travel_distance_from_previous_stop,
                              0
                            )
                            .toFixed(2)
                        : tripData.route.total_distance_km}{" "}
                      km
                    </p>
                  </div>
                </div>
              </div>

              {/* Stops Timeline - Editable */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {isEditMode
                        ? "Route & Trip Stops (Editable)"
                        : "Trip Stops"}
                    </h3>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {isEditMode
                        ? formData.stops.length
                        : tripData.trip_stop_times.length}{" "}
                      stops
                    </span>
                  </div>
                </div>

                {isEditMode ? (
                  // EDIT MODE: Full editable stops
                  <div className="space-y-4">
                    {formData.stops.map((stop, index) => (
                      <div key={index}>
                        <div className="border border-gray-200 rounded-lg p-6 space-y-4 bg-white shadow-sm">
                          {/* Stop Header */}
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900 text-lg">
                              Stop {index + 1}{" "}
                              <span className="text-sm font-normal text-gray-500">
                                {index === 0
                                  ? "(Starting Point)"
                                  : index === formData.stops.length - 1
                                  ? "(Destination)"
                                  : "(Intermediate Stop)"}
                              </span>
                            </h4>
                            {formData.stops.length > 2 &&
                              index !== 0 &&
                              index !== formData.stops.length - 1 && (
                                <Button
                                  type="button"
                                  onClick={() => removeStop(index)}
                                  variant="destructive"
                                  size="sm"
                                  className="gap-2"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Remove
                                </Button>
                              )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Stop Name */}
                            <div className="md:col-span-2">
                              <Label>Stop Name *</Label>
                              <Input
                                value={stop.name}
                                onChange={(e) =>
                                  updateStop(index, "name", e.target.value)
                                }
                                placeholder="Enter stop name"
                                required
                              />
                            </div>

                            {/* Coordinates */}
                            <div>
                              <Label>Latitude *</Label>
                              <Input
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
                                placeholder="12.9698"
                                required
                              />
                            </div>
                            <div>
                              <Label>Longitude *</Label>
                              <Input
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
                                placeholder="77.7500"
                                required
                              />
                            </div>

                            {/* Travel time and distance from previous stop (not for first stop) */}
                            {index > 0 && (
                              <>
                                <div>
                                  <Label>
                                    Travel Time from Previous (min) *
                                  </Label>
                                  <Input
                                    type="number"
                                    min="1"
                                    value={
                                      stop.travel_time_from_previous_stop_min ||
                                      ""
                                    }
                                    onChange={(e) =>
                                      updateStop(
                                        index,
                                        "travel_time_from_previous_stop_min",
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                    placeholder="25"
                                    required
                                  />
                                </div>
                                <div>
                                  <Label>Distance from Previous (km) *</Label>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    min="0.1"
                                    value={
                                      stop.travel_distance_from_previous_stop ||
                                      ""
                                    }
                                    onChange={(e) =>
                                      updateStop(
                                        index,
                                        "travel_distance_from_previous_stop",
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                    placeholder="15.2"
                                    required
                                  />
                                </div>
                              </>
                            )}

                            {/* Dwell Time */}
                            <div>
                              <Label>Dwell Time (min) *</Label>
                              <Input
                                type="number"
                                min="0"
                                value={stop.dwell_time_minutes || ""}
                                onChange={(e) =>
                                  updateStop(
                                    index,
                                    "dwell_time_minutes",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                placeholder="5"
                                required
                              />
                            </div>

                            {/* Trip Stop Times */}
                            <div>
                              <Label>Arrival Time (HH:MM:SS) *</Label>
                              <Input
                                type="time"
                                step="1"
                                value={stop.approx_arrival_time.substring(0, 8)}
                                onChange={(e) =>
                                  updateStop(
                                    index,
                                    "approx_arrival_time",
                                    e.target.value + ":00"
                                  )
                                }
                                required
                              />
                            </div>
                            <div>
                              <Label>Departure Time (HH:MM:SS) *</Label>
                              <Input
                                type="time"
                                step="1"
                                value={stop.approx_departure_time.substring(
                                  0,
                                  8
                                )}
                                onChange={(e) =>
                                  updateStop(
                                    index,
                                    "approx_departure_time",
                                    e.target.value + ":00"
                                  )
                                }
                                required
                              />
                            </div>
                          </div>
                        </div>

                        {/* Add stop button between stops */}
                        {index < formData.stops.length - 1 && (
                          <div className="flex justify-center py-3">
                            <Button
                              type="button"
                              onClick={() => addStop(index)}
                              variant="outline"
                              className="gap-2 border-2 border-dashed border-green-300 hover:border-green-500 hover:bg-green-50"
                            >
                              <Plus className="h-4 w-4" />
                              Add Stop Between
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  // VIEW MODE: Read-only timeline
                  <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-blue-300 via-green-300 to-purple-300"></div>

                    {/* Stops */}
                    <div className="space-y-4">
                      {tripData.trip_stop_times.map((stopTime, index) => (
                        <div
                          key={stopTime.id || index}
                          className="relative flex gap-4 items-start"
                        >
                          {/* Timeline Dot */}
                          <div
                            className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                              index === 0
                                ? "bg-green-500 shadow-lg shadow-green-200"
                                : index === tripData.trip_stop_times.length - 1
                                ? "bg-purple-500 shadow-lg shadow-purple-200"
                                : "bg-blue-500 shadow-md shadow-blue-200"
                            }`}
                          >
                            <span className="text-white font-bold text-sm">
                              {index + 1}
                            </span>
                          </div>

                          {/* Stop Card */}
                          <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  {stopTime.stop?.name}
                                </h4>
                                {index === 0 && (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">
                                    Starting Point
                                  </span>
                                )}
                                {index ===
                                  tripData.trip_stop_times.length - 1 && (
                                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-medium">
                                    Destination
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Clock className="h-4 w-4 text-green-600" />
                                <div>
                                  <p className="text-xs text-gray-500">
                                    Arrival
                                  </p>
                                  <p className="font-medium text-gray-900">
                                    {stopTime.approx_arrival_time}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Clock className="h-4 w-4 text-orange-600" />
                                <div>
                                  <p className="text-xs text-gray-500">
                                    Departure
                                  </p>
                                  <p className="font-medium text-gray-900">
                                    {stopTime.approx_departure_time}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Save Button Footer */}
          {isEditMode && (
            <div className="border-t border-gray-200 p-4 bg-gray-50 flex items-center justify-end gap-3 shrink-0">
              <Button
                onClick={() => {
                  handleUndo();
                  dispatch(disableEditMode("tripDetails"));
                }}
                variant="outline"
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!hasUnsavedChanges || isUpdating}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {isUpdating ? "Saving..." : "Save All Changes"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Unsaved Changes Dialog */}
      <UnsavedChangesDialog
        open={showUnsavedDialog}
        onConfirm={handleDiscardChanges}
        onCancel={handleCancelDiscard}
        zIndex={60} // TripDetailsModal is at z-60, so dialog will be z-70 (overlay) and z-80 (content)
      />
    </>
  );
}
