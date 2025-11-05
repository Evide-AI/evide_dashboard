import { useState } from "react";
import { Plus, Filter } from "lucide-react";
import { useGetTrips } from "../hooks/useBuses";
import { useAppDispatch } from "../store/hooks";
import { openCreateTripModal } from "../store/slices/ui";
import type { TripData, TripFilters } from "../types";
import Loading from "../components/Loading";

const TripsPage = () => {
  const dispatch = useAppDispatch();
  const [filters, setFilters] = useState<TripFilters>({
    limit: 50,
    page: 1,
    orderby: "scheduled_start_time",
    order: "desc",
  });

  const { data: tripsResponse, isLoading, error } = useGetTrips(filters);

  const handleAddTrip = () => {
    dispatch(openCreateTripModal());
  };

  const formatDateTime = (timeString: string) => {
    const date = new Date(`1970-01-01T${timeString}`);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Trips</h1>
        <button
          onClick={handleAddTrip}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Trip
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex items-center gap-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <span className="font-medium text-gray-700">Filters:</span>

          <select
            value={filters.route_id || ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                route_id: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All Routes</option>
            {/* Add route options here */}
          </select>

          <select
            value={
              filters.is_active === undefined
                ? ""
                : filters.is_active.toString()
            }
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                is_active:
                  e.target.value === "" ? undefined : e.target.value === "true",
              }))
            }
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <Loading />
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600">
              Error loading trips: {error.message}
            </div>
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trip ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bus Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bus Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Point
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Point
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tripsResponse?.data.trips.map((trip: TripData) => (
                  <tr key={trip.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {trip.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {trip.bus_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {trip.bus_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {trip.start_point}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {trip.end_point}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(trip.route_start_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(trip.route_end_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          trip.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {trip.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {(!tripsResponse?.data.trips ||
              tripsResponse.data.trips.length === 0) && (
              <div className="text-center py-12">
                <p className="text-gray-500">No trips found.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Pagination */}
      {tripsResponse && tripsResponse.pagination.totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-500">
            Showing{" "}
            {(tripsResponse.pagination.page - 1) *
              tripsResponse.pagination.limit +
              1}{" "}
            to{" "}
            {Math.min(
              tripsResponse.pagination.page * tripsResponse.pagination.limit,
              tripsResponse.pagination.total
            )}{" "}
            of {tripsResponse.pagination.total} trips
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setFilters((prev) => ({ ...prev, page: prev.page! - 1 }))
              }
              disabled={tripsResponse.pagination.page <= 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setFilters((prev) => ({ ...prev, page: prev.page! + 1 }))
              }
              disabled={
                tripsResponse.pagination.page >=
                tripsResponse.pagination.totalPages
              }
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripsPage;
