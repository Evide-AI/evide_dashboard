import { useState, useEffect } from "react";
import { X, Bus, Route, Calendar, Clock, Pencil, Save, RotateCcw } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  closeBusDetailsModal,
  openTripDetailsModal,
  enableEditMode,
  disableEditMode,
  setUnsavedChanges,
  setPendingNavigation,
  clearPendingNavigation,
} from "../store/slices/ui";
import { useGetBusDetails } from "../hooks/useBuses";
import Loading from "./Loading";
import UnsavedChangesDialog from "./UnsavedChangesDialog";
import type { BusDetailsTrip } from "../types";
import { formatTime, getRouteDisplayName } from "../lib/time-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface BusFormData {
  bus_number: string;
  imei_number: string;
  name: string;
  is_active: boolean;
}

export default function BusDetailsModal() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.modals.busDetails);
  const selectedBusId = useAppSelector((state) => state.ui.selectedBusId);
  const isEditMode = useAppSelector((state) => state.ui.editMode.busDetails);
  const hasUnsavedChanges = useAppSelector(
    (state) => state.ui.unsavedChanges.busDetails
  );
  const pendingNav = useAppSelector((state) => state.ui.pendingNavigation);

  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [formData, setFormData] = useState<BusFormData>({
    bus_number: "",
    imei_number: "",
    name: "",
    is_active: true,
  });
  const [originalData, setOriginalData] = useState<BusFormData>({
    bus_number: "",
    imei_number: "",
    name: "",
    is_active: true,
  });

  const {
    data: busDetails,
    isLoading,
    error,
  } = useGetBusDetails(selectedBusId);

  // Initialize form data when bus details load
  useEffect(() => {
    if (busDetails) {
      const initialData: BusFormData = {
        bus_number: busDetails.bus_number,
        imei_number: busDetails.imei_number,
        name: busDetails.name || "",
        is_active: busDetails.is_active,
      };
      setFormData(initialData);
      setOriginalData(initialData);
    }
  }, [busDetails]);

  // Check for unsaved changes
  useEffect(() => {
    if (!isEditMode) return;

    const hasChanges =
      formData.bus_number !== originalData.bus_number ||
      formData.imei_number !== originalData.imei_number ||
      formData.name !== originalData.name ||
      formData.is_active !== originalData.is_active;

    dispatch(
      setUnsavedChanges({ modal: "busDetails", hasChanges })
    );
  }, [formData, originalData, isEditMode, dispatch]);

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedDialog(true);
    } else {
      dispatch(closeBusDetailsModal());
      if (isEditMode) {
        dispatch(disableEditMode("busDetails"));
      }
    }
  };

  const handleTripClick = (trip: BusDetailsTrip) => {
    if (hasUnsavedChanges) {
      dispatch(setPendingNavigation({ from: "busDetails", to: "tripDetails" }));
      setShowUnsavedDialog(true);
    } else {
      dispatch(openTripDetailsModal(trip));
    }
  };

  const handleEnableEdit = () => {
    dispatch(enableEditMode("busDetails"));
  };

  const handleUndo = () => {
    setFormData(originalData);
    dispatch(setUnsavedChanges({ modal: "busDetails", hasChanges: false }));
  };

  const handleSave = async () => {
    // Mock save - just show success
    toast.success("Bus details updated successfully", {
      description: "Changes have been saved.",
    });

    // Update original data to match current
    setOriginalData(formData);
    dispatch(disableEditMode("busDetails"));
    dispatch(setUnsavedChanges({ modal: "busDetails", hasChanges: false }));
  };

  const handleDiscardChanges = () => {
    setFormData(originalData);
    dispatch(disableEditMode("busDetails"));
    dispatch(setUnsavedChanges({ modal: "busDetails", hasChanges: false }));
    setShowUnsavedDialog(false);

    // Handle pending navigation
    if (pendingNav.from === "busDetails" && pendingNav.to === "tripDetails") {
      // Close this modal (navigation will happen automatically)
      dispatch(closeBusDetailsModal());
      dispatch(clearPendingNavigation());
    } else {
      // Just close the modal
      dispatch(closeBusDetailsModal());
    }
  };

  const handleCancelDiscard = () => {
    setShowUnsavedDialog(false);
    dispatch(clearPendingNavigation());
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <Bus className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Bus Details</h2>
                {isEditMode && (
                  <p className="text-sm text-blue-600 font-medium">Edit Mode Active</p>
                )}
              </div>
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

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <Loading />
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">Error: {error.message}</p>
              </div>
            ) : busDetails ? (
              <div className="space-y-6">
                {/* Bus Info Card */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  {isEditMode ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="bus_number">Bus Number</Label>
                        <Input
                          id="bus_number"
                          value={formData.bus_number}
                          onChange={(e) =>
                            setFormData({ ...formData, bus_number: e.target.value })
                          }
                          placeholder="Enter bus number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="imei_number">IMEI Number</Label>
                        <Input
                          id="imei_number"
                          value={formData.imei_number}
                          onChange={(e) =>
                            setFormData({ ...formData, imei_number: e.target.value })
                          }
                          placeholder="Enter IMEI number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder="Enter bus name (optional)"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="is_active">Active Status</Label>
                        <div className="flex items-center gap-3 pt-2">
                          <Switch
                            id="is_active"
                            checked={formData.is_active}
                            onCheckedChange={(checked) =>
                              setFormData({ ...formData, is_active: checked })
                            }
                          />
                          <span className="text-sm font-medium">
                            {formData.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Bus Number</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {busDetails.bus_number}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">IMEI Number</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {busDetails.imei_number}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {busDetails.name || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            busDetails.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {busDetails.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Routes Section */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Route className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Assigned Routes
                    </h3>
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {busDetails.routes.length}
                    </span>
                  </div>
                  {busDetails.routes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {busDetails.routes.map((route) => (
                        <div
                          key={route.id}
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <p className="font-medium text-gray-900">
                            {getRouteDisplayName(route.route_stops)}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {route.total_distance_km} km
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No routes assigned</p>
                  )}
                </div>

                {/* Trips Section */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Scheduled Trips
                    </h3>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {busDetails.trips.length}
                    </span>
                  </div>
                  {busDetails.trips.length > 0 ? (
                    <div className="space-y-2">
                      {busDetails.trips.map((trip) => (
                        <div
                          key={trip.id}
                          onClick={() => handleTripClick(trip)}
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 cursor-pointer transition-all"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="font-semibold text-gray-900">
                                  {trip.route.route_stops
                                    ? getRouteDisplayName(trip.route.route_stops)
                                    : `Route #${trip.route_id}`}
                                </p>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                    trip.trip_type === "express"
                                      ? "bg-orange-100 text-orange-800"
                                      : trip.trip_type === "limited"
                                      ? "bg-purple-100 text-purple-800"
                                      : "bg-blue-100 text-blue-800"
                                  }`}
                                >
                                  {trip.trip_type}
                                </span>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                    trip.is_active
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {trip.is_active ? "Active" : "Inactive"}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>
                                    {formatTime(trip.scheduled_start_time)}
                                  </span>
                                </div>
                                <span>→</span>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>
                                    {formatTime(trip.scheduled_end_time)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No trips scheduled</p>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          {/* Save Button Footer */}
          {isEditMode && (
            <div className="border-t border-gray-200 p-4 bg-gray-50 flex items-center justify-end gap-3">
              <Button
                onClick={() => {
                  handleUndo();
                  dispatch(disableEditMode("busDetails"));
                }}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!hasUnsavedChanges}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Save Changes
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
      />
    </>
  );
}
