import React from "react";
import BackgroundFix from "../components/BackgroundFix";
import BlockchainVisualization from "../components/BlockchainVisualization";
import Card from "../components/Card";
import { analyticsData } from "../data/constants";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

function DashboardPage({ batches, metamask, user, theme }) {
  const today = "2025-10-19";
  const expiredCount = batches.filter(b => new Date(b.expiry) < new Date(today)).length;
  const activeCount = batches.length - expiredCount;

  const statusData = [
    { name: 'Active', value: activeCount },
    { name: 'Expired', value: expiredCount },
  ];

  const pieChartColors = ['#10B981', '#EF4444'];

  return (
    <BackgroundFix theme={theme}>
      <div className="p-6 min-h-screen">
        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">
            Here's your overview of the medicine tracking system
          </p>
        </div>

        {/* Blockchain Network Section */}
        <BlockchainVisualization />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card 
            title="Total Batches" 
            value={batches.length} 
            gradient="bg-gradient-to-br from-blue-50 to-blue-100"
            icon="📦"
          />
          <Card 
            title="Active Batches" 
            value={activeCount} 
            gradient="bg-gradient-to-br from-green-50 to-green-100"
            icon="✅"
          />
          <Card 
            title="Expired Batches" 
            value={expiredCount} 
            gradient="bg-gradient-to-br from-red-50 to-red-100"
            icon="❌"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <section className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-6 text-lg">
              Weekly Activity Trend
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analyticsData}>
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    color: '#374151',
                    borderRadius: '10px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Registered" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Verified" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-6 text-lg">Batch Status</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieChartColors[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </section>
        </div>

        {/* Recent Activity */}
        <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-6 text-lg">Recent Batches</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200 text-gray-700">
                  <th className="py-4 font-semibold">Batch No</th>
                  <th className="py-4 font-semibold">Medicine</th>
                  <th className="py-4 font-semibold">Manufacturer</th>
                  <th className="py-4 font-semibold">Status</th>
                  <th className="py-4 font-semibold">Blockchain</th>
                </tr>
              </thead>
              <tbody>
                {batches.slice(0, 5).map((b) => {
                  const isExpired = new Date(b.expiry) < new Date(today);
                  const status = isExpired ? "Expired" : "Active";
                  const statusColor = isExpired ? 
                    "text-red-600 bg-red-50 border border-red-200" : 
                    "text-green-600 bg-green-50 border border-green-200";
                  const blockchainStatus = b.blockchainVerified ? 
                    "text-green-600 bg-green-50 border border-green-200" : 
                    "text-red-600 bg-red-50 border border-red-200";

                  return (
                    <tr
                      key={b.batchNo}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 font-medium text-gray-800">{b.batchNo}</td>
                      <td className="py-4 text-gray-700">{b.name}</td>
                      <td className="py-4 text-gray-600">{b.manufacturer}</td>
                      <td className={`py-4 font-semibold ${statusColor} px-3 py-1 rounded-full text-xs`}>
                        {status}
                      </td>
                      <td className={`py-4 font-semibold ${blockchainStatus} px-3 py-1 rounded-full text-xs`}>
                        {b.blockchainVerified ? "Verified" : "Not Verified"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </BackgroundFix>
  );
}

export default DashboardPage;