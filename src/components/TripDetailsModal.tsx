import { X, MapPin, Clock, Route as RouteIcon, Calendar } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { closeTripDetailsModal } from "../store/slices/ui";
import { formatTime, getRouteDisplayName } from "../lib/time-utils";

export default function TripDetailsModal() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.modals.tripDetails);
  const tripData = useAppSelector((state) => state.ui.selectedTripData);

  const handleClose = () => {
    dispatch(closeTripDetailsModal());
  };

  if (!isOpen || !tripData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-6 w-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Trip Details</h2>
            </div>
            <p className="text-sm text-gray-600">
              {tripData.route.route_stops
                ? getRouteDisplayName(tripData.route.route_stops)
                : `Route #${tripData.route_id}`}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Trip Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <p className="text-xs text-gray-600 mb-1">Trip Type</p>
                <p className="text-sm font-semibold text-gray-900 capitalize">
                  {tripData.trip_type}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                <p className="text-xs text-gray-600 mb-1">Start Time</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatTime(tripData.scheduled_start_time)}
                </p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                <p className="text-xs text-gray-600 mb-1">End Time</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatTime(tripData.scheduled_end_time)}
                </p>
              </div>
              <div
                className={`rounded-lg p-4 border ${
                  tripData.is_active
                    ? "bg-green-50 border-green-100"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <p className="text-xs text-gray-600 mb-1">Status</p>
                <p
                  className={`text-sm font-semibold ${
                    tripData.is_active ? "text-green-800" : "text-gray-600"
                  }`}
                >
                  {tripData.is_active ? "Active" : "Inactive"}
                </p>
              </div>
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
                    {tripData.route.route_stops
                      ? getRouteDisplayName(tripData.route.route_stops)
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Total Distance</p>
                  <p className="font-medium text-gray-900">
                    {tripData.route.total_distance_km} km
                  </p>
                </div>
              </div>
            </div>

            {/* Stops Timeline */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Trip Stops
                </h3>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {tripData.trip_stop_times.length} stops
                </span>
              </div>

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
                            {index === tripData.trip_stop_times.length - 1 && (
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
                              <p className="text-xs text-gray-500">Arrival</p>
                              <p className="font-medium text-gray-900">
                                {formatTime(stopTime.approx_arrival_time)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="h-4 w-4 text-orange-600" />
                            <div>
                              <p className="text-xs text-gray-500">Departure</p>
                              <p className="font-medium text-gray-900">
                                {formatTime(stopTime.approx_departure_time)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
