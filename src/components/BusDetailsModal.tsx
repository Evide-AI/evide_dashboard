import { X, Bus, Route, Calendar, Clock } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { closeBusDetailsModal, openTripDetailsModal } from "../store/slices/ui";
import { useGetBusDetails } from "../hooks/useBuses";
import Loading from "./Loading";
import type { BusDetailsTrip } from "../types";
import { formatTime, getRouteDisplayName } from "../lib/time-utils";

export default function BusDetailsModal() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.modals.busDetails);
  const selectedBusId = useAppSelector((state) => state.ui.selectedBusId);

  const {
    data: busDetails,
    isLoading,
    error,
  } = useGetBusDetails(selectedBusId);

  const handleClose = () => {
    dispatch(closeBusDetailsModal());
  };

  const handleTripClick = (trip: BusDetailsTrip) => {
    dispatch(openTripDetailsModal(trip));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Bus className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Bus Details</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
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
                      className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                        busDetails.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {busDetails.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
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
                              <span className="text-gray-400">|</span>
                              <span>{trip.trip_stop_times.length} stops</span>
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
      </div>
    </div>
  );
}
