import { Plus } from "lucide-react";
import { useGetBuses } from "../hooks/useBuses";
import { useAppDispatch } from "../store/hooks";
import { openBusDetailsModal, openCreateBusModal } from "../store/slices/ui";
import type { BusData } from "../types";
import Loading from "../components/Loading";

const BusesPage = () => {
  const dispatch = useAppDispatch();
  const { data: buses, isLoading, error } = useGetBuses();

  const handleAddBus = () => {
    dispatch(openCreateBusModal());
  };

  const handleBusClick = (busId: number) => {
    dispatch(openBusDetailsModal(busId));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Buses</h1>
        <button
          onClick={handleAddBus}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Bus
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <Loading />
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600">
              Error loading buses: {error.message}
            </div>
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bus Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IMEI Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {buses?.map((bus: BusData) => (
                  <tr
                    key={bus.id}
                    onClick={() => handleBusClick(bus.id)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {bus.bus_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {bus.imei_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {bus.name || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          bus.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {bus.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {(!buses || buses.length === 0) && (
              <div className="text-center py-12">
                <p className="text-gray-500">No buses found.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BusesPage;
