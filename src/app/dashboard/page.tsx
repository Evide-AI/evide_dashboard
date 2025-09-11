"use client";

import { useAuth } from "@/lib/auth-context";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function DashboardPage() {
  const { isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome, {user?.email}!
          </h1>
          <p className="text-gray-600">
            You are logged in as{" "}
            <span className="font-medium capitalize">{user?.role}</span>
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
