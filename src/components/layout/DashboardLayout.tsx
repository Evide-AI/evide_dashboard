"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  HomeIcon,
  PlusIcon,
  PlayIcon,
  UserCircleIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();

    // Clear browser history and force fresh navigation
    window.history.replaceState(null, "", "/login");
    window.location.href = "/login";
  };

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
    { name: "Add Screen", href: "/dashboard/screens/add", icon: PlusIcon },
    { name: "Content Library", href: "/dashboard/content", icon: PlayIcon },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link
                  href="/dashboard"
                  className="text-xl font-bold bg-gradient-to-r from-purple-600 to-red-600 bg-clip-text text-transparent cursor-pointer"
                >
                  Evide Dashboard
                </Link>
              </div>

              <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center px-3 py-2 text-sm font-medium text-slate-700 hover:text-purple-600 hover:bg-slate-50 rounded-lg transition-all duration-200 cursor-pointer"
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors duration-200 cursor-pointer rounded-lg hover:bg-slate-50">
                <BellIcon className="w-5 h-5" />
              </button>

              <div className="hidden sm:flex sm:items-center sm:space-x-3">
                <div className="text-sm">
                  <p className="font-medium text-slate-900">{user?.email}</p>
                  <p className="text-slate-500 capitalize">{user?.role}</p>
                </div>
                <UserCircleIcon className="w-8 h-8 text-slate-400" />
              </div>

              <button
                onClick={handleLogout}
                className="hidden sm:block px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer"
              >
                Logout
              </button>

              <button
                className="sm:hidden p-2 text-slate-400 hover:text-slate-600 transition-colors duration-200 cursor-pointer rounded-lg hover:bg-slate-50"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {isMobileMenuOpen && (
            <div className="sm:hidden">
              <div className="pt-2 pb-3 space-y-1 border-t border-slate-200">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center px-3 py-2 text-base font-medium text-slate-700 hover:text-purple-600 hover:bg-slate-50 rounded-lg transition-all duration-200 cursor-pointer"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                ))}
                <div className="border-t border-slate-200 pt-3 mt-3">
                  <div className="px-3 py-2">
                    <p className="text-base font-medium text-slate-900">
                      {user?.email}
                    </p>
                    <p className="text-sm text-slate-500 capitalize">
                      {user?.role}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
