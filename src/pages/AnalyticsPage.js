import React, { useState, useEffect } from "react";
import BackgroundFix from "../components/BackgroundFix";
import BlockchainVisualization from "../components/BlockchainVisualization";
import Card from "../components/Card";
import ProtectedRoute from "../components/ProtectedRoute";
import { api } from "../utils/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";

function AnalyticsPage({ metamask, user, theme }) {
  const [analyticsData, setAnalyticsData] = useState({});
  const [loading, setLoading] = useState(true);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/analytics/dashboard");
      
      if (response.success) {
        setAnalyticsData(response.data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      // Fallback to static data if API fails
      setAnalyticsData(getStaticAnalyticsData());
    } finally {
      setLoading(false);
    }
  };

  const getStaticAnalyticsData = () => {
    return {
      overview: {
        totalMedicines: 156,
        activeMedicines: 128,
        expiredMedicines: 12,
        nearExpiry: 16,
        totalBatches: 89,
        verifiedBatches: 76
      },
      statusDistribution: [
        { name: 'Active', value: 128 },
        { name: 'In Transit', value: 18 },
        { name: 'Expired', value: 12 },
        { name: 'At Pharmacy', value: 45 }
      ],
      monthlyTrend: [
        { month: 'Jan', registered: 12, expired: 2 },
        { month: 'Feb', registered: 15, expired: 1 },
        { month: 'Mar', registered: 18, expired: 3 },
        { month: 'Apr', registered: 14, expired: 2 },
        { month: 'May', registered: 20, expired: 4 },
        { month: 'Jun', registered: 16, expired: 1 }
      ],
      manufacturerStats: [
        { name: 'MediLife Labs', batches: 23 },
        { name: 'BioHeal Pharma', batches: 18 },
        { name: 'PharmaCare', batches: 15 },
        { name: 'NutraLife', batches: 12 }
      ]
    };
  };

  const { overview, statusDistribution, monthlyTrend, manufacturerStats } = analyticsData;

  if (loading) {
    return (
      <ProtectedRoute user={user} requiredRole="analytics">
        <BackgroundFix theme={theme}>
          <div className="p-6 min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="loading-spinner mx-auto mb-4"></div>
              <p className="text-gray-600">Loading analytics data...</p>
            </div>
          </div>
        </BackgroundFix>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute user={user} requiredRole="analytics">
      <BackgroundFix theme={theme}>
        <div className="p-6 space-y-6 min-h-screen">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600">
              Comprehensive analytics and insights from blockchain network
            </p>
          </div>

          {/* Blockchain Network Visualization */}
          <BlockchainVisualization />

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card 
              title="Total Medicines" 
              value={overview?.totalMedicines || 0} 
              gradient="bg-gradient-to-br from-blue-50 to-blue-100"
              icon="💊"
            />
            <Card 
              title="Active Medicines" 
              value={overview?.activeMedicines || 0} 
              gradient="bg-gradient-to-br from-green-50 to-green-100"
              icon="✅"
            />
            <Card 
              title="Expired Medicines" 
              value={overview?.expiredMedicines || 0} 
              gradient="bg-gradient-to-br from-red-50 to-red-100"
              icon="❌"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution Pie Chart */}
            <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h4 className="font-bold text-gray-800 mb-4 text-center">Medicine Status Distribution</h4>
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusDistribution?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Monthly Trend Chart */}
            <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h4 className="font-bold text-gray-800 mb-4 text-center">Monthly Registration Trend</h4>
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        color: '#374151',
                        borderRadius: '10px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="registered"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#3B82F6' }}
                      name="Registered"
                    />
                    <Line
                      type="monotone"
                      dataKey="expired"
                      stroke="#EF4444"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#EF4444' }}
                      name="Expired"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          {/* Manufacturer Statistics */}
          <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h4 className="font-bold text-gray-800 mb-4">Manufacturer Performance</h4>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={manufacturerStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#6b7280"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      color: '#374151',
                      borderRadius: '10px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="batches" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Network Statistics */}
          <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h4 className="font-bold text-gray-800 mb-4">Blockchain Network Statistics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">6</div>
                <div className="text-sm text-gray-600">Active Nodes</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">99.9%</div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">1.2s</div>
                <div className="text-sm text-gray-600">Avg. Response</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{overview?.verifiedBatches || 0}</div>
                <div className="text-sm text-gray-600">Verified Batches</div>
              </div>
            </div>
          </section>
        </div>
      </BackgroundFix>
    </ProtectedRoute>
  );
}

export default AnalyticsPage;








// import React from "react";
// import BackgroundFix from "../components/BackgroundFix";
// import BlockchainVisualization from "../components/BlockchainVisualization";
// import Card from "../components/Card";
// import ProtectedRoute from "../components/ProtectedRoute";
// import { analyticsData } from "../data/constants";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   CartesianGrid,
//   Legend
// } from "recharts";

// function AnalyticsPage({ metamask, user, theme }) {
//   const totalRegistered = analyticsData.reduce((sum, d) => sum + d.Registered, 0);
//   const totalVerified = analyticsData.reduce((sum, d) => sum + d.Verified, 0);
//   const totalExpired = analyticsData.reduce((sum, d) => sum + d.Expired, 0);

//   return (
//     <ProtectedRoute user={user} requiredRole="analytics">
//       <BackgroundFix theme={theme}>
//         <div className="p-6 space-y-6 min-h-screen">
//           <div className="mb-6">
//             <h1 className="text-3xl font-bold text-gray-800 mb-2">
//               Analytics Dashboard
//             </h1>
//             <p className="text-gray-600">
//               Comprehensive analytics and insights from blockchain network
//             </p>
//           </div>

//           {/* Blockchain Network Visualization */}
//           <BlockchainVisualization />

//           {/* Stats Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <Card 
//               title="Total Registered" 
//               value={totalRegistered} 
//               gradient="bg-gradient-to-br from-blue-50 to-blue-100"
//               icon="📥"
//             />
//             <Card 
//               title="Total Verified" 
//               value={totalVerified} 
//               gradient="bg-gradient-to-br from-purple-50 to-purple-100"
//               icon="✅"
//             />
//             <Card 
//               title="Total Expired" 
//               value={totalExpired} 
//               gradient="bg-gradient-to-br from-red-50 to-red-100"
//               icon="❌"
//             />
//           </div>

//           {/* Charts Section */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
//               <h4 className="font-bold text-gray-800 mb-4 text-center">Weekly Activity Trend</h4>
//               <div className="w-full h-[300px]">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <LineChart data={analyticsData}>
//                     <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
//                     <XAxis dataKey="name" stroke="#6b7280" />
//                     <YAxis stroke="#6b7280" />
//                     <Tooltip 
//                       contentStyle={{ 
//                         backgroundColor: 'rgba(255, 255, 255, 0.95)',
//                         border: '1px solid #e5e7eb',
//                         color: '#374151',
//                         borderRadius: '10px',
//                         boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
//                       }}
//                     />
//                     <Line
//                       type="monotone"
//                       dataKey="Registered"
//                       stroke="#3B82F6"
//                       strokeWidth={3}
//                       dot={{ r: 4, fill: '#3B82F6' }}
//                     />
//                     <Line
//                       type="monotone"
//                       dataKey="Verified"
//                       stroke="#10B981"
//                       strokeWidth={3}
//                       dot={{ r: 4, fill: '#10B981' }}
//                     />
//                   </LineChart>
//                 </ResponsiveContainer>
//               </div>
//             </section>

//             <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
//               <h4 className="font-bold text-gray-800 mb-4 text-center">Weekly Statistics</h4>
//               <div className="w-full h-[300px]">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <BarChart data={analyticsData}>
//                     <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
//                     <XAxis dataKey="name" stroke="#6b7280" />
//                     <YAxis stroke="#6b7280" />
//                     <Tooltip 
//                       contentStyle={{ 
//                         backgroundColor: 'rgba(255, 255, 255, 0.95)',
//                         border: '1px solid #e5e7eb',
//                         color: '#374151',
//                         borderRadius: '10px',
//                         boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
//                       }}
//                     />
//                     <Legend />
//                     <Bar dataKey="Verified" fill="#10B981" radius={[4, 4, 0, 0]} />
//                     <Bar dataKey="Expired" fill="#EF4444" radius={[4, 4, 0, 0]} />
//                     <Bar dataKey="Registered" fill="#3B82F6" radius={[4, 4, 0, 0]} />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>
//             </section>
//           </div>

//           {/* Network Statistics */}
//           <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
//             <h4 className="font-bold text-gray-800 mb-4">Blockchain Network Statistics</h4>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               <div className="text-center p-4 bg-blue-50 rounded-lg">
//                 <div className="text-2xl font-bold text-blue-600">6</div>
//                 <div className="text-sm text-gray-600">Active Nodes</div>
//               </div>
//               <div className="text-center p-4 bg-green-50 rounded-lg">
//                 <div className="text-2xl font-bold text-green-600">99.9%</div>
//                 <div className="text-sm text-gray-600">Uptime</div>
//               </div>
//               <div className="text-center p-4 bg-purple-50 rounded-lg">
//                 <div className="text-2xl font-bold text-purple-600">1.2s</div>
//                 <div className="text-sm text-gray-600">Avg. Response</div>
//               </div>
//               <div className="text-center p-4 bg-orange-50 rounded-lg">
//                 <div className="text-2xl font-bold text-orange-600">256</div>
//                 <div className="text-sm text-gray-600">Total Blocks</div>
//               </div>
//             </div>
//           </section>
//         </div>
//       </BackgroundFix>
//     </ProtectedRoute>
//   );
// }

// export default AnalyticsPage;