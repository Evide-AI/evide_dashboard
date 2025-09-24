import { useAuth } from "../lib/auth-context";
import { Menu, X, Settings, Home, LogOut } from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
  const { logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

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
          <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {user?.name?.charAt(0).toUpperCase() || "A"}
            </span>
          </div>
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

            {/* Placeholder menu items */}
            <div className="mt-8">
              <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Future Features
              </p>

              <div className="space-y-1 mt-2">
                <div className="w-full flex items-center px-4 py-3 text-gray-400 cursor-not-allowed">
                  <div className="h-5 w-5 mr-3 bg-gray-200 rounded"></div>
                  <span className="text-sm">Feature 1</span>
                </div>

                <div className="w-full flex items-center px-4 py-3 text-gray-400 cursor-not-allowed">
                  <div className="h-5 w-5 mr-3 bg-gray-200 rounded"></div>
                  <span className="text-sm">Feature 2</span>
                </div>

                <div className="w-full flex items-center px-4 py-3 text-gray-400 cursor-not-allowed">
                  <div className="h-5 w-5 mr-3 bg-gray-200 rounded"></div>
                  <span className="text-sm">Feature 3</span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          {/* User Info */}
          <div className="mb-4 px-2">
            <p className="text-sm font-medium text-gray-800">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>

          {/* Actions */}
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
