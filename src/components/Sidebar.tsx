import { useAuth } from "../lib/auth-context";
import {
  Menu,
  X,
  Settings,
  Home,
  LogOut,
  Bus,
  ChevronDown,
  ChevronRight,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { useAppDispatch } from "../store/hooks";
import { openCreateBusModal } from "../store/slices/ui";

export default function Sidebar() {
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [busMenuOpen, setBusMenuOpen] = useState(false);
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-lg hover:bg-gray-50"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-40 transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:translate-x-0 lg:z-auto
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">EvideAI</h2>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {/* Dashboard Home */}
            <button
              className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Home className="h-5 w-5 mr-3" />
              Dashboard
            </button>

            {/* Bus Management Section */}
            <div className="mt-8">
              <button
                onClick={() => setBusMenuOpen(!busMenuOpen)}
                className="w-full flex items-center justify-between px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="flex items-center">
                  <Bus className="h-5 w-5 mr-3" />
                  <span>Bus Management</span>
                </div>
                {busMenuOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>

              {/* Bus Submenu */}
              {busMenuOpen && (
                <div className="ml-6 mt-2 space-y-1">
                  <button
                    onClick={() => {
                      dispatch(openCreateBusModal());
                      setIsOpen(false); // Close mobile sidebar
                    }}
                    className="w-full flex items-center px-4 py-2 text-left text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-3" />
                    <span className="text-sm">Create Bus</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <div className="space-y-2">
            <button
              className="w-full flex items-center px-4 py-2 text-left text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              disabled
            >
              <Settings className="h-4 w-4 mr-3" />
              <span className="text-sm">Settings</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4 mr-3" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
