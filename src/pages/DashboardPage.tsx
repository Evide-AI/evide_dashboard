import { BarChart3, Users, TrendingUp, Activity } from "lucide-react";

export default function DashboardPage() {
  const stats = [
    {
      name: "Total Users",
      value: "---",
      icon: Users,
      change: "---",
      changeType: "neutral" as const,
    },
    {
      name: "Active Sessions",
      value: "---",
      icon: Activity,
      change: "---",
      changeType: "neutral" as const,
    },
    {
      name: "Analytics",
      value: "---",
      icon: BarChart3,
      change: "---",
      changeType: "neutral" as const,
    },
    {
      name: "Growth",
      value: "---",
      icon: TrendingUp,
      change: "---",
      changeType: "neutral" as const,
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Dashboard
              </h1>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Welcome back!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.name}
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Icon className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      {stat.name}
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <span>Change: {stat.change}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart Placeholder */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Analytics Overview
            </h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Charts will appear here</p>
                <p className="text-xs text-gray-400 mt-2">
                  Connect your data source to see analytics
                </p>
              </div>
            </div>
          </div>

          {/* Activity Feed Placeholder */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Activity feed will appear here</p>
                <p className="text-xs text-gray-400 mt-2">
                  Real-time updates and notifications
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Content Area */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                disabled
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors cursor-not-allowed"
              >
                <div className="text-center">
                  <div className="h-8 w-8 bg-gray-200 rounded mx-auto mb-2"></div>
                  <p className="text-sm">Action 1</p>
                </div>
              </button>

              <button
                disabled
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors cursor-not-allowed"
              >
                <div className="text-center">
                  <div className="h-8 w-8 bg-gray-200 rounded mx-auto mb-2"></div>
                  <p className="text-sm">Action 2</p>
                </div>
              </button>

              <button
                disabled
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors cursor-not-allowed"
              >
                <div className="text-center">
                  <div className="h-8 w-8 bg-gray-200 rounded mx-auto mb-2"></div>
                  <p className="text-sm">Action 3</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
