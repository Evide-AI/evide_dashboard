import { useState } from "react";
import { X } from "lucide-react";
import { useCreateBus } from "../hooks/useBuses";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { closeCreateBusModal } from "../store/slices/ui";
import type { CreateBusRequest } from "../store/buses-api";
import { toast } from "sonner";

export default function CreateBusModal() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.modals.createBus);

  const [busData, setBusData] = useState<CreateBusRequest>({
    bus_number: "",
    imei_number: "",
    name: "",
  });

  const createBusMutation = useCreateBus();

  const handleInputChange =
    (field: keyof CreateBusRequest) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setBusData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const resetForm = () =>
    setBusData({ bus_number: "", imei_number: "", name: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createBusMutation.mutate(busData, {
      onSuccess: (data) => {
        toast.success(data.message, {
          description: `Bus "${data.data.bus.bus_number}" has been added.`,
          duration: 4000,
        });

        resetForm();
        dispatch(closeCreateBusModal());
      },
      onError: (error) => {
        toast.error("Failed to create bus", {
          description:
            error.message || "Please check your input and try again.",
          duration: 5000,
        });
      },
    });
  };

  const handleClose = () => {
    resetForm();
    dispatch(closeCreateBusModal());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-slate-900">Create New Bus</h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <p className="text-slate-600 mb-6">Add a new bus to the system</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Bus Number Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Bus Number *
              </label>
              <input
                type="text"
                required
                aria-required="true"
                value={busData.bus_number}
                onChange={handleInputChange("bus_number")}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-slate-900 placeholder:text-slate-500"
                placeholder="Enter bus number (e.g., EVD-001)"
              />
            </div>

            {/* IMEI Number Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                IMEI Number *
              </label>
              <input
                type="text"
                required
                aria-required="true"
                value={busData.imei_number}
                onChange={handleInputChange("imei_number")}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-slate-900 placeholder:text-slate-500"
                placeholder="Enter IMEI number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Bus Name
              </label>
              <input
                type="text"
                value={busData.name}
                onChange={handleInputChange("name")}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-slate-900 placeholder:text-slate-500"
                placeholder="Enter bus name (optional)"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createBusMutation.isPending}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {createBusMutation.isPending ? "Creating..." : "Create Bus"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
