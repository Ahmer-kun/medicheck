import React, { useState, useEffect } from "react";
import BackgroundFix from "../components/BackgroundFix";
import BlockchainVisualization from "../components/BlockchainVisualization";
import Card from "../components/Card";
import ProtectedRoute from "../components/ProtectedRoute";
import ResponsiveContainer from "../components/ResponsiveContainer";
import { api } from "../utils/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer as ChartContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";

function AnalyticsPage({ metamask, user, theme }) {
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalMedicines: 0,
      activeMedicines: 0,
      expiredMedicines: 0,
      nearExpiry: 0,
      totalBatches: 0,
      verifiedBatches: 0
    },
    statusDistribution: [],
    monthlyTrend: [],
    manufacturerStats: []
  });
  
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchRealAnalyticsData();
  }, []);

  // Helper function to normalize date (set time to 00:00:00)
  const normalizeDate = (date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  };

  // FIXED: Calculate active and expired medicines (same logic as DashboardPage)
  const calculateMedicineStats = (batches) => {
    const today = normalizeDate(new Date());
    
    const expiredCount = batches.filter(batch => {
      const expiryDate = normalizeDate(new Date(batch.expiry || batch.expiryDate));
      return expiryDate < today;
    }).length;

    const activeCount = batches.filter(batch => {
      const expiryDate = normalizeDate(new Date(batch.expiry || batch.expiryDate));
      return expiryDate >= today;
    }).length;

    // Calculate near expiry (within 30 days)
    const next30Days = new Date(today);
    next30Days.setDate(next30Days.getDate() + 30);
    
    const nearExpiry = batches.filter(batch => {
      const expiryDate = normalizeDate(new Date(batch.expiry || batch.expiryDate));
      return expiryDate > today && expiryDate <= next30Days;
    }).length;

    return { expiredCount, activeCount, nearExpiry };
  };

  // FIXED: Calculate monthly trends using manufactureDate
  const calculateMonthlyTrend = (batches) => {
    const months = [];
    const now = new Date();
    
    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = month.toLocaleDateString('en-US', { month: 'short' });
      
      const monthStart = normalizeDate(new Date(month.getFullYear(), month.getMonth(), 1));
      const monthEnd = normalizeDate(new Date(month.getFullYear(), month.getMonth() + 1, 0));
      
      // Count batches registered in this month using manufactureDate
      const registered = batches.filter(batch => {
        const batchDate = normalizeDate(new Date(batch.manufactureDate));
        return batchDate >= monthStart && batchDate <= monthEnd;
      }).length;
      
      // Count batches that expire in this month
      const expired = batches.filter(batch => {
        const expiryDate = normalizeDate(new Date(batch.expiry || batch.expiryDate));
        return expiryDate >= monthStart && expiryDate <= monthEnd;
      }).length;
      
      months.push({
        month: monthName,
        registered,
        expired
      });
    }
    
    return months;
  };

  // Calculate manufacturer statistics
  const calculateManufacturerStats = (batches) => {
    const manufacturerCounts = {};
    
    batches.forEach(batch => {
      const manufacturer = batch.manufacturer || 'Unknown';
      manufacturerCounts[manufacturer] = (manufacturerCounts[manufacturer] || 0) + 1;
    });
    
    return Object.entries(manufacturerCounts)
      .map(([name, batches]) => ({ name, batches }))
      .sort((a, b) => b.batches - a.batches)
      .slice(0, 4);
  };

  // Calculate status distribution
  const calculateStatusDistribution = (batches) => {
    const statusCounts = {};
    
    batches.forEach(batch => {
      // Determine status based on expiry date
      const today = normalizeDate(new Date());
      const expiryDate = normalizeDate(new Date(batch.expiry || batch.expiryDate));
      
      let status = '';
      if (expiryDate < today) {
        status = 'Expired';
      } else if (batch.status?.toLowerCase() === 'accepted' || batch.source === 'pharmacy') {
        status = 'At Pharmacy';
      } else if (batch.source === 'batch' || !batch.source) {
        status = 'Manufactured';
      } else {
        status = batch.status?.charAt(0).toUpperCase() + batch.status?.slice(1) || 'Active';
      }
      
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    return Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value
    }));
  };

  // Main function to fetch and calculate analytics data
  const fetchRealAnalyticsData = async () => {
    try {
      setLoading(true);
      console.log("🔄 Fetching analytics data from batches...");
      
      // Get all batches from the system
      const batchesResponse = await api.get("/batches");
      
      if (batchesResponse.success) {
        const allBatches = batchesResponse.data || [];
        console.log(`📊 Processing ${allBatches.length} batches...`);
        
        // Calculate medicine stats (FIXED: using same logic as DashboardPage)
        const { expiredCount, activeCount, nearExpiry } = calculateMedicineStats(allBatches);
        
        // Calculate status distribution
        const statusDistribution = calculateStatusDistribution(allBatches);
        
        // Calculate monthly trends (FIXED: using manufactureDate)
        const monthlyTrend = calculateMonthlyTrend(allBatches);
        
        // Calculate manufacturer statistics
        const manufacturerStats = calculateManufacturerStats(allBatches);
        
        // Set the analytics data
        setAnalyticsData({
          overview: {
            totalMedicines: allBatches.length,
            activeMedicines: activeCount,
            expiredMedicines: expiredCount,
            nearExpiry,
            totalBatches: allBatches.length,
            verifiedBatches: allBatches.filter(b => b.blockchainVerified).length
          },
          statusDistribution,
          monthlyTrend,
          manufacturerStats
        });
        
        console.log("✅ Analytics data calculated:", {
          totalBatches: allBatches.length,
          activeMedicines: activeCount,
          expiredMedicines: expiredCount,
          nearExpiry,
          statusDistribution,
          monthlyTrend
        });
      } else {
        console.error("❌ Failed to fetch batches");
        // Fallback to empty data
        setAnalyticsData({
          overview: {
            totalMedicines: 0,
            activeMedicines: 0,
            expiredMedicines: 0,
            nearExpiry: 0,
            totalBatches: 0,
            verifiedBatches: 0
          },
          statusDistribution: [],
          monthlyTrend: [],
          manufacturerStats: []
        });
      }
    } catch (error) {
      console.error("❌ Error calculating analytics:", error);
      // Fallback to empty data
      setAnalyticsData({
        overview: {
          totalMedicines: 0,
          activeMedicines: 0,
          expiredMedicines: 0,
          nearExpiry: 0,
          totalBatches: 0,
          verifiedBatches: 0
        },
        statusDistribution: [],
        monthlyTrend: [],
        manufacturerStats: []
      });
    } finally {
      setLoading(false);
    }
  };

  const { overview, statusDistribution, monthlyTrend, manufacturerStats } = analyticsData;

  if (loading) {
    return (
      <ProtectedRoute user={user} requiredRole="analytics">
        <BackgroundFix theme={theme}>
          <ResponsiveContainer>
            <div className="py-4 md:py-6 min-h-screen flex items-center justify-center">
              <div className="text-center">
                <div className="loading-spinner mx-auto mb-3 md:mb-4"></div>
                <p className="text-gray-600 text-sm md:text-base">Loading analytics data...</p>
              </div>
            </div>
          </ResponsiveContainer>
        </BackgroundFix>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute user={user} requiredRole="analytics">
      <BackgroundFix theme={theme}>
        <ResponsiveContainer>
          <div className="py-4 md:py-6 space-y-4 md:space-y-6 min-h-screen">
            {/* Header */}
            <div className="mb-3 md:mb-6">
              <h1 className="heading-1 mb-1 md:mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-body">
                Comprehensive analytics and insights from blockchain network
              </p>
            </div>

            {/* Blockchain Network Visualization */}
            <div className="mb-4 md:mb-6">
              <BlockchainVisualization />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 lg:gap-6 mb-4 md:mb-6">
               <Card 
                 title="Total Medicines" 
                 value={overview?.totalMedicines || 0} 
                 gradient="bg-gradient-to-br from-blue-50 to-blue-100"
                 icon="💊"
                 compact={true}
               />
              
              <Card 
                title="Active Medicines" 
                value={overview?.activeMedicines || 0} 
                gradient="bg-gradient-to-br from-green-50 to-green-100"
                icon="✅"
                compact={true}
              />
              <Card 
                title="Expired Medicines" 
                value={overview?.expiredMedicines || 0} 
                gradient="bg-gradient-to-br from-red-50 to-red-100"
                icon="❌"
                compact={true}
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
              {/* Status Distribution Pie Chart */}
              <section className="responsive-card">
                <h4 className="font-bold text-gray-800 mb-3 md:mb-4 text-center text-base md:text-lg">
                  Medicine Status Distribution
                </h4>
                <div className="h-64 md:h-[300px]">
                  <ChartContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                        outerRadius={isMobile ? 60 : 80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusDistribution?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value} medicines`, 'Count']}
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e5e7eb',
                          color: '#374151',
                          borderRadius: '10px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          fontSize: isMobile ? '12px' : '14px'
                        }}
                      />
                    </PieChart>
                  </ChartContainer>
                </div>
                
                {/* Legend moved BELOW the chart */}
                {statusDistribution && statusDistribution.length > 0 && (
                  <div className="mt-3 md:mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                    {statusDistribution.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-gray-700 truncate">
                            {entry.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {entry.value} ({overview?.totalMedicines > 0 ? 
                              ((entry.value / overview.totalMedicines) * 100).toFixed(1) : 0}%)
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Monthly Trend Chart */}
              <section className="responsive-card">
                <h4 className="font-bold text-gray-800 mb-3 md:mb-4 text-center text-base md:text-lg">
                  Monthly Registration Trend
                </h4>
                <div className="h-64 md:h-[300px]">
                  <ChartContainer width="100%" height="100%">
                    <LineChart data={monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="month" 
                        stroke="#6b7280" 
                        fontSize={isMobile ? 10 : 12}
                        tickMargin={5}
                      />
                      <YAxis 
                        stroke="#6b7280" 
                        fontSize={isMobile ? 10 : 12}
                        width={isMobile ? 30 : 40}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e5e7eb',
                          color: '#374151',
                          borderRadius: '10px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          fontSize: isMobile ? '12px' : '14px'
                        }}
                        formatter={(value, name) => {
                          const displayName = name === 'registered' ? 'Registered' : 'Expired';
                          return [`${value} batches`, displayName];
                        }}
                      />
                      <Legend 
                        wrapperStyle={{
                          fontSize: isMobile ? '10px' : '12px',
                          paddingTop: isMobile ? '5px' : '10px'
                        }}
                        formatter={(value) => {
                          return value === 'registered' ? 'Registered' : 'Expired';
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="registered"
                        stroke="#3B82F6"
                        strokeWidth={isMobile ? 2 : 3}
                        dot={{ r: isMobile ? 3 : 4, fill: '#3B82F6' }}
                        activeDot={{ r: isMobile ? 4 : 6 }}
                        name="registered"
                      />
                      <Line
                        type="monotone"
                        dataKey="expired"
                        stroke="#EF4444"
                        strokeWidth={isMobile ? 2 : 3}
                        dot={{ r: isMobile ? 3 : 4, fill: '#EF4444' }}
                        activeDot={{ r: isMobile ? 4 : 6 }}
                        name="expired"
                      />
                    </LineChart>
                  </ChartContainer>
                </div>
                <div className="mt-2 text-center text-xs text-gray-500">
                  Based on actual batch registration and expiry dates
                </div>
              </section>
            </div>

            {/* Manufacturer Statistics */}
            <section className="responsive-card mb-4 md:mb-6">
              <h4 className="font-bold text-gray-800 mb-3 md:mb-4 text-base md:text-lg">Manufacturer Performance</h4>
              <div className="h-64 md:h-[300px]">
                <ChartContainer width="100%" height="100%">
                  <BarChart 
                    data={manufacturerStats}
                    margin={isMobile ? { top: 10, right: 10, left: 0, bottom: 60 } : { top: 20, right: 30, left: 20, bottom: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#6b7280"
                      angle={isMobile ? -45 : -45}
                      textAnchor="end"
                      height={isMobile ? 50 : 80}
                      fontSize={isMobile ? 9 : 11}
                      interval={0}
                    />
                    <YAxis 
                      stroke="#6b7280" 
                      fontSize={isMobile ? 10 : 12}
                      width={isMobile ? 30 : 40}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        color: '#374151',
                        borderRadius: '10px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontSize: isMobile ? '12px' : '14px'
                      }}
                      formatter={(value) => [`${value} batches`, 'Count']}
                    />
                    <Bar 
                      dataKey="batches" 
                      fill="#10B981" 
                      radius={[3, 3, 0, 0]}
                      name="Batches"
                    />
                  </BarChart>
                </ChartContainer>
              </div>
              <div className="mt-2 md:mt-3 text-center text-xs md:text-sm text-gray-500">
                <p>Top manufacturers by number of registered batches</p>
                {manufacturerStats.length === 0 && (
                  <p className="text-yellow-600">No manufacturer data available</p>
                )}
              </div>
            </section>

            {/* Network Statistics */}
            <section className="responsive-card">
              <h4 className="font-bold text-gray-800 mb-3 md:mb-4 text-base md:text-lg">Blockchain Network Statistics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                <div className="text-center p-3 md:p-4 bg-blue-50 rounded-lg md:rounded-xl border border-blue-200">
                  <div className="text-lg md:text-2xl font-bold text-blue-600">5</div>
                  <div className="text-xs md:text-sm text-gray-600">Active Nodes</div>
                </div>
                <div className="text-center p-3 md:p-4 bg-green-50 rounded-lg md:rounded-xl border border-green-200">
                  <div className="text-lg md:text-2xl font-bold text-green-600">99.9%</div>
                  <div className="text-xs md:text-sm text-gray-600">Uptime</div>
                </div>
                <div className="text-center p-3 md:p-4 bg-purple-50 rounded-lg md:rounded-xl border border-purple-200">
                  <div className="text-lg md:text-2xl font-bold text-purple-600">1.2s</div>
                  <div className="text-xs md:text-sm text-gray-600">Avg. Response</div>
                </div>
                <div className="text-center p-3 md:p-4 bg-orange-50 rounded-lg md:rounded-xl border border-orange-200">
                  <div className="text-lg md:text-2xl font-bold text-orange-600">{overview?.verifiedBatches || 0}</div>
                  <div className="text-xs md:text-sm text-gray-600">Verified Batches</div>
                </div>
              </div>

              {/* Additional Stats Grid */}
              <div className="mt-4 md:mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {/* Detailed Overview - FIXED: Shows real data */}
                <div className="bg-gray-50 p-3 md:p-4 rounded-lg md:rounded-xl border border-gray-200">
                  <h5 className="font-semibold text-gray-800 mb-2 md:mb-3 text-sm md:text-base">Detailed Overview</h5>
                  <div className="space-y-1 md:space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-xs md:text-sm">Total Batches:</span>
                      <span className="font-semibold text-gray-800 text-xs md:text-sm">{overview?.totalBatches || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-xs md:text-sm">Active Medicines:</span>
                      <span className="font-semibold text-green-600 text-xs md:text-sm">{overview?.activeMedicines || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-xs md:text-sm">Expired Medicines:</span>
                      <span className="font-semibold text-red-600 text-xs md:text-sm">{overview?.expiredMedicines || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-xs md:text-sm">Near Expiry:</span>
                      <span className="font-semibold text-yellow-600 text-xs md:text-sm">{overview?.nearExpiry || 0}</span>
                    </div>
                  </div>
                </div>

                {/* System Health */}
                <div className="bg-gray-50 p-3 md:p-4 rounded-lg md:rounded-xl border border-gray-200">
                  <h5 className="font-semibold text-gray-800 mb-2 md:mb-3 text-sm md:text-base">System Health</h5>
                  <div className="space-y-1 md:space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-xs md:text-sm">Blockchain Sync:</span>
                      <span className="font-semibold text-green-600 text-xs md:text-sm">
                        {metamask.isConnected ? '✅ Synced' : '⚠️ Disconnected'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-xs md:text-sm">Database:</span>
                      <span className="font-semibold text-green-600 text-xs md:text-sm">
                        {overview?.totalBatches > 0 ? '🟢 Online' : '⚪ No Data'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-xs md:text-sm">API Status:</span>
                      <span className="font-semibold text-green-600 text-xs md:text-sm">🟢 Healthy</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-xs md:text-sm">Last Update:</span>
                      <span className="font-semibold text-gray-800 text-xs md:text-sm">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="mt-3 md:mt-4 p-3 md:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg md:rounded-xl border border-blue-200">
                <h5 className="font-semibold text-blue-800 mb-2 text-sm md:text-base">Performance Metrics</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                  <div className="text-center">
                    <div className="text-xs md:text-sm font-semibold text-blue-700">Response Time</div>
                    <div className="text-lg md:text-xl font-bold text-blue-600">1.2s</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs md:text-sm font-semibold text-green-700">Success Rate</div>
                    <div className="text-lg md:text-xl font-bold text-green-600">
                      {overview?.totalBatches > 0 ? 
                        `${Math.round((overview.verifiedBatches / overview.totalBatches) * 100)}%` : 
                        '0%'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs md:text-sm font-semibold text-purple-700">Total Batches</div>
                    <div className="text-lg md:text-xl font-bold text-purple-600">{overview?.totalBatches || 0}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs md:text-sm font-semibold text-orange-700">Verification %</div>
                    <div className="text-lg md:text-xl font-bold text-orange-600">
                      {overview?.totalBatches > 0 ? 
                        `${Math.round((overview.verifiedBatches / overview.totalBatches) * 100)}%` : 
                        '0%'}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3 mt-4 md:mt-6">
              <button
                onClick={fetchRealAnalyticsData}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 md:px-4 py-2 md:py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1 md:gap-2"
              >
                <span className="text-sm md:text-base">🔄</span>
                <span className="text-xs md:text-sm">Refresh Data</span>
              </button>
              <button
                onClick={() => {
                  // Export functionality
                  const exportData = {
                    overview,
                    statusDistribution,
                    monthlyTrend,
                    manufacturerStats,
                    exportedAt: new Date().toISOString()
                  };
                  const dataStr = JSON.stringify(exportData, null, 2);
                  const dataBlob = new Blob([dataStr], { type: 'application/json' });
                  const url = URL.createObjectURL(dataBlob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `medicheck-analytics-${new Date().toISOString().split('T')[0]}.json`;
                  link.click();
                }}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 md:px-4 py-2 md:py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1 md:gap-2"
              >
                <span className="text-sm md:text-base">📄</span>
                <span className="text-xs md:text-sm">Export Report</span>
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-3 md:px-4 py-2 md:py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1 md:gap-2"
              >
                <span className="text-sm md:text-base">📊</span>
                <span className="text-xs md:text-sm">View Dashboard</span>
              </button>
            </div>

            {/* Data Last Updated */}
            <div className="text-center text-xs md:text-sm text-gray-500 mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-200">
              <p>Data last updated: {new Date().toLocaleString()}</p>
              <p className="mt-0.5">
                Showing data from {overview?.totalBatches || 0} batches • 
                {overview?.totalBatches > 0 ? 
                  ` ${Math.round((overview.verifiedBatches / overview.totalBatches) * 100)}% verified on blockchain` : 
                  ' No data available'}
              </p>
            </div>
          </div>
        </ResponsiveContainer>
      </BackgroundFix>
    </ProtectedRoute>
  );
}

export default AnalyticsPage;







// import React, { useState, useEffect } from "react";
// import BackgroundFix from "../components/BackgroundFix";
// import BlockchainVisualization from "../components/BlockchainVisualization";
// import Card from "../components/Card";
// import ProtectedRoute from "../components/ProtectedRoute";
// import ResponsiveContainer from "../components/ResponsiveContainer";
// import { api } from "../utils/api";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer as ChartContainer,
//   BarChart,
//   Bar,
//   CartesianGrid,
//   Legend,
//   PieChart,
//   Pie,
//   Cell
// } from "recharts";

// function AnalyticsPage({ metamask, user, theme }) {
//   const [analyticsData, setAnalyticsData] = useState({
//     overview: {
//       totalMedicines: 0,
//       activeMedicines: 0,
//       expiredMedicines: 0,
//       nearExpiry: 0,
//       totalBatches: 0,
//       verifiedBatches: 0
//     },
//     statusDistribution: [],
//     monthlyTrend: [],
//     manufacturerStats: []
//   });
  
//   const [loading, setLoading] = useState(true);
//   const [isMobile, setIsMobile] = useState(false);

//   const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

//   // Check if mobile
//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 768);
//     };
    
//     checkMobile();
//     window.addEventListener('resize', checkMobile);
//     return () => window.removeEventListener('resize', checkMobile);
//   }, []);

//   useEffect(() => {
//     fetchAnalyticsData();
//   }, []);

//   const fetchAnalyticsData = async () => {
//     try {
//       setLoading(true);
//       console.log("🔄 Fetching analytics data...");
      
//       const response = await api.get("/analytics/dashboard");
      
//       if (response.success && response.data) {
//         console.log("✅ Using analytics dashboard data");
//         setAnalyticsData(response.data);
//       } else {
//         console.log("⚠️ No dashboard data, fetching real data...");
//         await fetchRealAnalyticsData();
//       }
//     } catch (error) {
//       console.error("Error fetching analytics:", error);
//       await fetchRealAnalyticsData();
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Helper function to calculate near expiry (within 30 days)
//   const calculateNearExpiry = (batches) => {
//     const now = new Date();
//     const next30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
//     return batches.filter(batch => {
//       const expiryDate = new Date(batch.expiry || batch.expiryDate);
//       return expiryDate > now && expiryDate <= next30Days;
//     }).length;
//   };

//   // Calculate monthly trends from actual data
//   const calculateMonthlyTrend = (batches) => {
//     const months = [];
//     const now = new Date();
    
//     // Get last 6 months
//     for (let i = 5; i >= 0; i--) {
//       const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
//       const monthName = month.toLocaleDateString('en-US', { month: 'short' });
      
//       const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
//       const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      
//       // Count batches registered in this month
//       const registered = batches.filter(batch => {
//         const createdDate = new Date(batch.createdAt || batch.manufactureDate || batch.registeredAt);
//         return createdDate >= monthStart && createdDate <= monthEnd;
//       }).length;
      
//       // Count batches that expire in this month
//       const expired = batches.filter(batch => {
//         const expiryDate = new Date(batch.expiry || batch.expiryDate);
//         return expiryDate >= monthStart && expiryDate <= monthEnd;
//       }).length;
      
//       months.push({
//         month: monthName,
//         registered,
//         expired
//       });
//     }
    
//     return months;
//   };

//   // Calculate manufacturer statistics
//   const calculateManufacturerStats = (batches) => {
//     const manufacturerCounts = {};
    
//     batches.forEach(batch => {
//       const manufacturer = batch.manufacturer || 'Unknown';
//       manufacturerCounts[manufacturer] = (manufacturerCounts[manufacturer] || 0) + 1;
//     });
    
//     return Object.entries(manufacturerCounts)
//       .map(([name, batches]) => ({ name, batches }))
//       .sort((a, b) => b.batches - a.batches)
//       .slice(0, 4); // Top 4 manufacturers
//   };

//   // Main function to fetch and calculate real analytics data
//   const fetchRealAnalyticsData = async () => {
//     try {
//       console.log("🔄 Fetching real analytics data from batches...");
      
//       // Get all batches from the system
//       const batchesResponse = await api.get("/batches");
      
//       if (batchesResponse.success) {
//         const allBatches = batchesResponse.data || [];
//         const now = new Date();
        
//         console.log(`📊 Processing ${allBatches.length} batches...`);
        
//         // Calculate active and expired medicines
//         const activeMedicines = allBatches.filter(batch => {
//           const expiryDate = new Date(batch.expiry || batch.expiryDate);
//           return expiryDate > now;
//         }).length;
        
//         const expiredMedicines = allBatches.filter(batch => {
//           const expiryDate = new Date(batch.expiry || batch.expiryDate);
//           return expiryDate <= now;
//         }).length;
        
//         // Calculate near expiry (within 30 days)
//         const nearExpiry = calculateNearExpiry(allBatches);
        
//         // Calculate status distribution from real data
//         const statusCounts = {};
//         allBatches.forEach(batch => {
//           const status = batch.status?.toLowerCase() || 'unknown';
          
//           // Normalize status names for display
//           let displayStatus = status;
//           if (status.includes('active') || status === 'manufactured') displayStatus = 'Active';
//           else if (status.includes('pharmacy') || status === 'at_pharmacy') displayStatus = 'At Pharmacy';
//           else if (status.includes('expired')) displayStatus = 'Expired';
//           else if (status.includes('transit')) displayStatus = 'In Transit';
//           else displayStatus = status.charAt(0).toUpperCase() + status.slice(1);
          
//           statusCounts[displayStatus] = (statusCounts[displayStatus] || 0) + 1;
//         });
        
//         const statusDistribution = Object.entries(statusCounts).map(([name, value]) => ({
//           name,
//           value
//         }));
        
//         // Calculate monthly trends
//         const monthlyTrend = calculateMonthlyTrend(allBatches);
        
//         // Calculate manufacturer statistics
//         const manufacturerStats = calculateManufacturerStats(allBatches);
        
//         // Set the analytics data
//         setAnalyticsData({
//           overview: {
//             totalMedicines: allBatches.length,
//             activeMedicines,
//             expiredMedicines,
//             nearExpiry,
//             totalBatches: allBatches.length,
//             verifiedBatches: allBatches.filter(b => b.blockchainVerified).length
//           },
//           statusDistribution,
//           monthlyTrend,
//           manufacturerStats
//         });
        
//         console.log("✅ Real analytics data calculated:", {
//           totalBatches: allBatches.length,
//           activeMedicines,
//           expiredMedicines,
//           nearExpiry,
//           statusDistribution,
//           monthlyTrend
//         });
//       } else {
//         throw new Error("Failed to fetch batches");
//       }
//     } catch (error) {
//       console.error("❌ Error calculating real analytics:", error);
//       // Fallback to empty data rather than static data
//       setAnalyticsData({
//         overview: {
//           totalMedicines: 0,
//           activeMedicines: 0,
//           expiredMedicines: 0,
//           nearExpiry: 0,
//           totalBatches: 0,
//           verifiedBatches: 0
//         },
//         statusDistribution: [],
//         monthlyTrend: [],
//         manufacturerStats: []
//       });
//     }
//   };

//   const { overview, statusDistribution, monthlyTrend, manufacturerStats } = analyticsData;

//   if (loading) {
//     return (
//       <ProtectedRoute user={user} requiredRole="analytics">
//         <BackgroundFix theme={theme}>
//           <ResponsiveContainer>
//             <div className="py-4 md:py-6 min-h-screen flex items-center justify-center">
//               <div className="text-center">
//                 <div className="loading-spinner mx-auto mb-3 md:mb-4"></div>
//                 <p className="text-gray-600 text-sm md:text-base">Loading analytics data...</p>
//               </div>
//             </div>
//           </ResponsiveContainer>
//         </BackgroundFix>
//       </ProtectedRoute>
//     );
//   }

//   return (
//     <ProtectedRoute user={user} requiredRole="analytics">
//       <BackgroundFix theme={theme}>
//         <ResponsiveContainer>
//           <div className="py-4 md:py-6 space-y-4 md:space-y-6 min-h-screen">
//             {/* Header */}
//             <div className="mb-3 md:mb-6">
//               <h1 className="heading-1 mb-1 md:mb-2">
//                 Analytics Dashboard
//               </h1>
//               <p className="text-body">
//                 Comprehensive analytics and insights from blockchain network
//               </p>
//             </div>

//             {/* Blockchain Network Visualization */}
//             <div className="mb-4 md:mb-6">
//               <BlockchainVisualization />
//             </div>

//             {/* Stats Cards */}
//             <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 lg:gap-6 mb-4 md:mb-6">
//               <Card 
//                 title="Total Medicines" 
//                 value={overview?.totalMedicines || 0} 
//                 gradient="bg-gradient-to-br from-blue-50 to-blue-100"
//                 icon="💊"
//                 compact={true}
//               />
//               <Card 
//                 title="Active Medicines" 
//                 value={overview?.activeMedicines || 0} 
//                 gradient="bg-gradient-to-br from-green-50 to-green-100"
//                 icon="✅"
//                 compact={true}
//               />
//               <Card 
//                 title="Expired Medicines" 
//                 value={overview?.expiredMedicines || 0} 
//                 gradient="bg-gradient-to-br from-red-50 to-red-100"
//                 icon="❌"
//                 compact={true}
//               />
//             </div>

//             {/* Charts Section */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
//               {/* Status Distribution Pie Chart */}
//               <section className="responsive-card">
//                 <h4 className="font-bold text-gray-800 mb-3 md:mb-4 text-center text-base md:text-lg">
//                   Medicine Status Distribution
//                 </h4>
//                 <div className="h-64 md:h-[300px]">
//                   <ChartContainer width="100%" height="100%">
//                     <PieChart>
//                       <Pie
//                         data={statusDistribution}
//                         cx="50%"
//                         cy="50%"
//                         labelLine={false}
//                         label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
//                         outerRadius={isMobile ? 60 : 80}
//                         fill="#8884d8"
//                         dataKey="value"
//                       >
//                         {statusDistribution?.map((entry, index) => (
//                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                         ))}
//                       </Pie>
//                       <Tooltip 
//                         formatter={(value) => [`${value} medicines`, 'Count']}
//                         contentStyle={{ 
//                           backgroundColor: 'rgba(255, 255, 255, 0.95)',
//                           border: '1px solid #e5e7eb',
//                           color: '#374151',
//                           borderRadius: '10px',
//                           boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
//                           fontSize: isMobile ? '12px' : '14px'
//                         }}
//                       />
//                     </PieChart>
//                   </ChartContainer>
//                 </div>
                
//                 {/* Legend moved BELOW the chart */}
//                 {statusDistribution && statusDistribution.length > 0 && (
//                   <div className="mt-3 md:mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
//                     {statusDistribution.map((entry, index) => (
//                       <div key={index} className="flex items-center gap-2">
//                         <div 
//                           className="w-3 h-3 rounded-full flex-shrink-0"
//                           style={{ backgroundColor: COLORS[index % COLORS.length] }}
//                         ></div>
//                         <div className="flex-1 min-w-0">
//                           <div className="text-xs font-medium text-gray-700 truncate">
//                             {entry.name}
//                           </div>
//                           <div className="text-xs text-gray-500">
//                             {entry.value} ({overview?.totalMedicines > 0 ? 
//                               ((entry.value / overview.totalMedicines) * 100).toFixed(1) : 0}%)
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </section>

//               {/* Monthly Trend Chart */}
//               <section className="responsive-card">
//                 <h4 className="font-bold text-gray-800 mb-3 md:mb-4 text-center text-base md:text-lg">
//                   Monthly Registration Trend
//                 </h4>
//                 <div className="h-64 md:h-[300px]">
//                   <ChartContainer width="100%" height="100%">
//                     <LineChart data={monthlyTrend}>
//                       <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
//                       <XAxis 
//                         dataKey="month" 
//                         stroke="#6b7280" 
//                         fontSize={isMobile ? 10 : 12}
//                         tickMargin={5}
//                       />
//                       <YAxis 
//                         stroke="#6b7280" 
//                         fontSize={isMobile ? 10 : 12}
//                         width={isMobile ? 30 : 40}
//                       />
//                       <Tooltip 
//                         contentStyle={{ 
//                           backgroundColor: 'rgba(255, 255, 255, 0.95)',
//                           border: '1px solid #e5e7eb',
//                           color: '#374151',
//                           borderRadius: '10px',
//                           boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
//                           fontSize: isMobile ? '12px' : '14px'
//                         }}
//                         formatter={(value, name) => {
//                           const displayName = name === 'registered' ? 'Registered' : 'Expired';
//                           return [`${value} batches`, displayName];
//                         }}
//                       />
//                       <Legend 
//                         wrapperStyle={{
//                           fontSize: isMobile ? '10px' : '12px',
//                           paddingTop: isMobile ? '5px' : '10px'
//                         }}
//                         formatter={(value) => {
//                           return value === 'registered' ? 'Registered' : 'Expired';
//                         }}
//                       />
//                       <Line
//                         type="monotone"
//                         dataKey="registered"
//                         stroke="#3B82F6"
//                         strokeWidth={isMobile ? 2 : 3}
//                         dot={{ r: isMobile ? 3 : 4, fill: '#3B82F6' }}
//                         activeDot={{ r: isMobile ? 4 : 6 }}
//                         name="registered"
//                       />
//                       <Line
//                         type="monotone"
//                         dataKey="expired"
//                         stroke="#EF4444"
//                         strokeWidth={isMobile ? 2 : 3}
//                         dot={{ r: isMobile ? 3 : 4, fill: '#EF4444' }}
//                         activeDot={{ r: isMobile ? 4 : 6 }}
//                         name="expired"
//                       />
//                     </LineChart>
//                   </ChartContainer>
//                 </div>
//                 <div className="mt-2 text-center text-xs text-gray-500">
//                   Based on actual batch registration and expiry dates
//                 </div>
//               </section>
//             </div>

//             {/* Manufacturer Statistics */}
//             <section className="responsive-card mb-4 md:mb-6">
//               <h4 className="font-bold text-gray-800 mb-3 md:mb-4 text-base md:text-lg">Manufacturer Performance</h4>
//               <div className="h-64 md:h-[300px]">
//                 <ChartContainer width="100%" height="100%">
//                   <BarChart 
//                     data={manufacturerStats}
//                     margin={isMobile ? { top: 10, right: 10, left: 0, bottom: 60 } : { top: 20, right: 30, left: 20, bottom: 80 }}
//                   >
//                     <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
//                     <XAxis 
//                       dataKey="name" 
//                       stroke="#6b7280"
//                       angle={isMobile ? -45 : -45}
//                       textAnchor="end"
//                       height={isMobile ? 50 : 80}
//                       fontSize={isMobile ? 9 : 11}
//                       interval={0}
//                     />
//                     <YAxis 
//                       stroke="#6b7280" 
//                       fontSize={isMobile ? 10 : 12}
//                       width={isMobile ? 30 : 40}
//                     />
//                     <Tooltip 
//                       contentStyle={{ 
//                         backgroundColor: 'rgba(255, 255, 255, 0.95)',
//                         border: '1px solid #e5e7eb',
//                         color: '#374151',
//                         borderRadius: '10px',
//                         boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
//                         fontSize: isMobile ? '12px' : '14px'
//                       }}
//                       formatter={(value) => [`${value} batches`, 'Count']}
//                     />
//                     <Bar 
//                       dataKey="batches" 
//                       fill="#10B981" 
//                       radius={[3, 3, 0, 0]}
//                       name="Batches"
//                     />
//                   </BarChart>
//                 </ChartContainer>
//               </div>
//               <div className="mt-2 md:mt-3 text-center text-xs md:text-sm text-gray-500">
//                 <p>Top manufacturers by number of registered batches</p>
//                 {manufacturerStats.length === 0 && (
//                   <p className="text-yellow-600">No manufacturer data available</p>
//                 )}
//               </div>
//             </section>

//             {/* Network Statistics */}
//             <section className="responsive-card">
//               <h4 className="font-bold text-gray-800 mb-3 md:mb-4 text-base md:text-lg">Blockchain Network Statistics</h4>
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
//                 <div className="text-center p-3 md:p-4 bg-blue-50 rounded-lg md:rounded-xl border border-blue-200">
//                   <div className="text-lg md:text-2xl font-bold text-blue-600">5</div>
//                   <div className="text-xs md:text-sm text-gray-600">Active Nodes</div>
//                 </div>
//                 <div className="text-center p-3 md:p-4 bg-green-50 rounded-lg md:rounded-xl border border-green-200">
//                   <div className="text-lg md:text-2xl font-bold text-green-600">99.9%</div>
//                   <div className="text-xs md:text-sm text-gray-600">Uptime</div>
//                 </div>
//                 <div className="text-center p-3 md:p-4 bg-purple-50 rounded-lg md:rounded-xl border border-purple-200">
//                   <div className="text-lg md:text-2xl font-bold text-purple-600">1.2s</div>
//                   <div className="text-xs md:text-sm text-gray-600">Avg. Response</div>
//                 </div>
//                 <div className="text-center p-3 md:p-4 bg-orange-50 rounded-lg md:rounded-xl border border-orange-200">
//                   <div className="text-lg md:text-2xl font-bold text-orange-600">{overview?.verifiedBatches || 0}</div>
//                   <div className="text-xs md:text-sm text-gray-600">Verified Batches</div>
//                 </div>
//               </div>

//               {/* Additional Stats Grid */}
//               <div className="mt-4 md:mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
//                 {/* Detailed Overview */}
//                 <div className="bg-gray-50 p-3 md:p-4 rounded-lg md:rounded-xl border border-gray-200">
//                   <h5 className="font-semibold text-gray-800 mb-2 md:mb-3 text-sm md:text-base">Detailed Overview</h5>
//                   <div className="space-y-1 md:space-y-2">
//                     <div className="flex justify-between items-center">
//                       <span className="text-gray-600 text-xs md:text-sm">Total Batches:</span>
//                       <span className="font-semibold text-gray-800 text-xs md:text-sm">{overview?.totalBatches || 0}</span>
//                     </div>
//                     <div className="flex justify-between items-center">
//                       <span className="text-gray-600 text-xs md:text-sm">Active Medicines:</span>
//                       <span className="font-semibold text-green-600 text-xs md:text-sm">{overview?.activeMedicines || 0}</span>
//                     </div>
//                     <div className="flex justify-between items-center">
//                       <span className="text-gray-600 text-xs md:text-sm">Expired Medicines:</span>
//                       <span className="font-semibold text-red-600 text-xs md:text-sm">{overview?.expiredMedicines || 0}</span>
//                     </div>
//                     <div className="flex justify-between items-center">
//                       <span className="text-gray-600 text-xs md:text-sm">Near Expiry:</span>
//                       <span className="font-semibold text-yellow-600 text-xs md:text-sm">{overview?.nearExpiry || 0}</span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* System Health */}
//                 <div className="bg-gray-50 p-3 md:p-4 rounded-lg md:rounded-xl border border-gray-200">
//                   <h5 className="font-semibold text-gray-800 mb-2 md:mb-3 text-sm md:text-base">System Health</h5>
//                   <div className="space-y-1 md:space-y-2">
//                     <div className="flex justify-between items-center">
//                       <span className="text-gray-600 text-xs md:text-sm">Blockchain Sync:</span>
//                       <span className="font-semibold text-green-600 text-xs md:text-sm">
//                         {metamask.isConnected ? '✅ Synced' : '⚠️ Disconnected'}
//                       </span>
//                     </div>
//                     <div className="flex justify-between items-center">
//                       <span className="text-gray-600 text-xs md:text-sm">Database:</span>
//                       <span className="font-semibold text-green-600 text-xs md:text-sm">
//                         {overview?.totalBatches > 0 ? '🟢 Online' : '⚪ No Data'}
//                       </span>
//                     </div>
//                     <div className="flex justify-between items-center">
//                       <span className="text-gray-600 text-xs md:text-sm">API Status:</span>
//                       <span className="font-semibold text-green-600 text-xs md:text-sm">🟢 Healthy</span>
//                     </div>
//                     <div className="flex justify-between items-center">
//                       <span className="text-gray-600 text-xs md:text-sm">Last Update:</span>
//                       <span className="font-semibold text-gray-800 text-xs md:text-sm">
//                         {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Performance Metrics */}
//               <div className="mt-3 md:mt-4 p-3 md:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg md:rounded-xl border border-blue-200">
//                 <h5 className="font-semibold text-blue-800 mb-2 text-sm md:text-base">Performance Metrics</h5>
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
//                   <div className="text-center">
//                     <div className="text-xs md:text-sm font-semibold text-blue-700">Response Time</div>
//                     <div className="text-lg md:text-xl font-bold text-blue-600">1.2s</div>
//                   </div>
//                   <div className="text-center">
//                     <div className="text-xs md:text-sm font-semibold text-green-700">Success Rate</div>
//                     <div className="text-lg md:text-xl font-bold text-green-600">
//                       {overview?.totalBatches > 0 ? 
//                         `${Math.round((overview.verifiedBatches / overview.totalBatches) * 100)}%` : 
//                         '0%'}
//                     </div>
//                   </div>
//                   <div className="text-center">
//                     <div className="text-xs md:text-sm font-semibold text-purple-700">Total Batches</div>
//                     <div className="text-lg md:text-xl font-bold text-purple-600">{overview?.totalBatches || 0}</div>
//                   </div>
//                   <div className="text-center">
//                     <div className="text-xs md:text-sm font-semibold text-orange-700">Verification %</div>
//                     <div className="text-lg md:text-xl font-bold text-orange-600">
//                       {overview?.totalBatches > 0 ? 
//                         `${Math.round((overview.verifiedBatches / overview.totalBatches) * 100)}%` : 
//                         '0%'}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </section>

//             {/* Quick Actions */}
//             <div className="flex flex-col sm:flex-row gap-2 md:gap-3 mt-4 md:mt-6">
//               <button
//                 onClick={fetchAnalyticsData}
//                 className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 md:px-4 py-2 md:py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1 md:gap-2"
//               >
//                 <span className="text-sm md:text-base">🔄</span>
//                 <span className="text-xs md:text-sm">Refresh Data</span>
//               </button>
//               <button
//                 onClick={() => {
//                   // Export functionality
//                   const exportData = {
//                     overview,
//                     statusDistribution,
//                     monthlyTrend,
//                     manufacturerStats,
//                     exportedAt: new Date().toISOString()
//                   };
//                   const dataStr = JSON.stringify(exportData, null, 2);
//                   const dataBlob = new Blob([dataStr], { type: 'application/json' });
//                   const url = URL.createObjectURL(dataBlob);
//                   const link = document.createElement('a');
//                   link.href = url;
//                   link.download = `medicheck-analytics-${new Date().toISOString().split('T')[0]}.json`;
//                   link.click();
//                 }}
//                 className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 md:px-4 py-2 md:py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1 md:gap-2"
//               >
//                 <span className="text-sm md:text-base">📄</span>
//                 <span className="text-xs md:text-sm">Export Report</span>
//               </button>
//               <button
//                 onClick={() => window.location.href = '/dashboard'}
//                 className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-3 md:px-4 py-2 md:py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1 md:gap-2"
//               >
//                 <span className="text-sm md:text-base">📊</span>
//                 <span className="text-xs md:text-sm">View Dashboard</span>
//               </button>
//             </div>

//             {/* Data Last Updated */}
//             <div className="text-center text-xs md:text-sm text-gray-500 mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-200">
//               <p>Data last updated: {new Date().toLocaleString()}</p>
//               <p className="mt-0.5">
//                 Showing data from {overview?.totalBatches || 0} batches • 
//                 {overview?.totalBatches > 0 ? 
//                   ` ${Math.round((overview.verifiedBatches / overview.totalBatches) * 100)}% verified on blockchain` : 
//                   ' No data available'}
//               </p>
//             </div>
//           </div>
//         </ResponsiveContainer>
//       </BackgroundFix>
//     </ProtectedRoute>
//   );
// }

// export default AnalyticsPage;


//  Previous version with static data fallback

// Original code commented out for reference



// import React, { useState, useEffect } from "react";
// import BackgroundFix from "../components/BackgroundFix";
// import BlockchainVisualization from "../components/BlockchainVisualization";
// import Card from "../components/Card";
// import ProtectedRoute from "../components/ProtectedRoute";
// import ResponsiveContainer from "../components/ResponsiveContainer";
// import { api } from "../utils/api";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer as ChartContainer,
//   BarChart,
//   Bar,
//   CartesianGrid,
//   Legend,
//   PieChart,
//   Pie,
//   Cell
// } from "recharts";

// function AnalyticsPage({ metamask, user, theme }) {
//   const [analyticsData, setAnalyticsData] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [isMobile, setIsMobile] = useState(false);

//   // Check if mobile
//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 768);
//     };
    
//     checkMobile();
//     window.addEventListener('resize', checkMobile);
//     return () => window.removeEventListener('resize', checkMobile);
//   }, []);

//   const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

//   useEffect(() => {
//     fetchAnalyticsData();
//   }, []);

//   const fetchAnalyticsData = async () => {
//     try {
//       setLoading(true);
//       const response = await api.get("/analytics/dashboard");
      
//       if (response.success) {
//         setAnalyticsData(response.data);
//       } else {
//         setAnalyticsData(getStaticAnalyticsData());
//       }
//     } catch (error) {
//       console.error("Error fetching analytics:", error);
//       setAnalyticsData(getStaticAnalyticsData());
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStaticAnalyticsData = () => {
//     return {
//       overview: {
//         totalMedicines: 156,
//         activeMedicines: 128,
//         expiredMedicines: 12,
//         nearExpiry: 16,
//         totalBatches: 89,
//         verifiedBatches: 76
//       },
//       statusDistribution: [
//         { name: 'Active', value: 128 },
//         { name: 'In Transit', value: 18 },
//         { name: 'Expired', value: 12 },
//         { name: 'At Pharmacy', value: 45 }
//       ],
//       monthlyTrend: [
//         { month: 'Jan', registered: 12, expired: 2 },
//         { month: 'Feb', registered: 15, expired: 1 },
//         { month: 'Mar', registered: 18, expired: 3 },
//         { month: 'Apr', registered: 14, expired: 2 },
//         { month: 'May', registered: 20, expired: 4 },
//         { month: 'Jun', registered: 16, expired: 1 }
//       ],
//       manufacturerStats: [
//         { name: 'MediLife Labs', batches: 23 },
//         { name: 'BioHeal Pharma', batches: 18 },
//         { name: 'PharmaCare', batches: 15 },
//         { name: 'NutraLife', batches: 12 }
//       ]
//     };
//   };

//   const { overview, statusDistribution, monthlyTrend, manufacturerStats } = analyticsData;

//   if (loading) {
//     return (
//       <ProtectedRoute user={user} requiredRole="analytics">
//         <BackgroundFix theme={theme}>
//           <ResponsiveContainer>
//             <div className="py-4 md:py-6 min-h-screen flex items-center justify-center">
//               <div className="text-center">
//                 <div className="loading-spinner mx-auto mb-3 md:mb-4"></div>
//                 <p className="text-gray-600 text-sm md:text-base">Loading analytics data...</p>
//               </div>
//             </div>
//           </ResponsiveContainer>
//         </BackgroundFix>
//       </ProtectedRoute>
//     );
//   }

//   return (
//     <ProtectedRoute user={user} requiredRole="analytics">
//       <BackgroundFix theme={theme}>
//         <ResponsiveContainer>
//           <div className="py-4 md:py-6 space-y-4 md:space-y-6 min-h-screen">
//             {/* Header */}
//             <div className="mb-3 md:mb-6">
//               <h1 className="heading-1 mb-1 md:mb-2">
//                 Analytics Dashboard
//               </h1>
//               <p className="text-body">
//                 Comprehensive analytics and insights from blockchain network
//               </p>
//             </div>

//             {/* Blockchain Network Visualization */}
//             <div className="mb-4 md:mb-6">
//               <BlockchainVisualization />
//             </div>

//             {/* Stats Cards */}
//             <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 lg:gap-6 mb-4 md:mb-6">
//               <Card 
//                 title="Total Medicines" 
//                 value={overview?.totalMedicines || 0} 
//                 gradient="bg-gradient-to-br from-blue-50 to-blue-100"
//                 icon="💊"
//                 compact={true}
//               />
//               <Card 
//                 title="Active Medicines" 
//                 value={overview?.activeMedicines || 0} 
//                 gradient="bg-gradient-to-br from-green-50 to-green-100"
//                 icon="✅"
//                 compact={true}
//               />
//               <Card 
//                 title="Expired Medicines" 
//                 value={overview?.expiredMedicines || 0} 
//                 gradient="bg-gradient-to-br from-red-50 to-red-100"
//                 icon="❌"
//                 compact={true}
//               />
//             </div>

//             {/* Charts Section */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
//               {/* Status Distribution Pie Chart */}
//               <section className="responsive-card">
//                 <h4 className="font-bold text-gray-800 mb-3 md:mb-4 text-center text-base md:text-lg">
//                   Medicine Status Distribution
//                 </h4>
//                 <div className="h-64 md:h-[300px]">
//                   <ChartContainer width="100%" height="100%">
//                     <PieChart>
//                       <Pie
//                         data={statusDistribution}
//                         cx="50%"
//                         cy="50%"
//                         labelLine={false}
//                         label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                         outerRadius={isMobile ? 60 : 80}
//                         fill="#8884d8"
//                         dataKey="value"
//                       >
//                         {statusDistribution?.map((entry, index) => (
//                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                         ))}
//                       </Pie>
//                       <Tooltip 
//                         formatter={(value) => [`${value} medicines`, 'Count']}
//                         contentStyle={{ 
//                           backgroundColor: 'rgba(255, 255, 255, 0.95)',
//                           border: '1px solid #e5e7eb',
//                           color: '#374151',
//                           borderRadius: '10px',
//                           boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
//                           fontSize: isMobile ? '12px' : '14px'
//                         }}
//                       />
//                     </PieChart>
//                   </ChartContainer>
//                 </div>
//                 {/* Legend for mobile */}
//                 {isMobile && statusDistribution && (
//                   <div className="mt-3 grid grid-cols-2 gap-1">
//                     {statusDistribution.map((entry, index) => (
//                       <div key={index} className="flex items-center gap-1">
//                         <div 
//                           className="w-2 h-2 md:w-3 md:h-3 rounded-full flex-shrink-0"
//                           style={{ backgroundColor: COLORS[index % COLORS.length] }}
//                         ></div>
//                         <span className="text-xs text-gray-600 truncate">{entry.name}</span>
//                         <span className="text-xs font-semibold ml-auto">{entry.value}</span>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </section>

//               {/* Monthly Trend Chart */}
//               <section className="responsive-card">
//                 <h4 className="font-bold text-gray-800 mb-3 md:mb-4 text-center text-base md:text-lg">
//                   Monthly Registration Trend
//                 </h4>
//                 <div className="h-64 md:h-[300px]">
//                   <ChartContainer width="100%" height="100%">
//                     <LineChart data={monthlyTrend}>
//                       <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
//                       <XAxis 
//                         dataKey="month" 
//                         stroke="#6b7280" 
//                         fontSize={isMobile ? 10 : 12}
//                         tickMargin={5}
//                       />
//                       <YAxis 
//                         stroke="#6b7280" 
//                         fontSize={isMobile ? 10 : 12}
//                         width={isMobile ? 30 : 40}
//                       />
//                       <Tooltip 
//                         contentStyle={{ 
//                           backgroundColor: 'rgba(255, 255, 255, 0.95)',
//                           border: '1px solid #e5e7eb',
//                           color: '#374151',
//                           borderRadius: '10px',
//                           boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
//                           fontSize: isMobile ? '12px' : '14px'
//                         }}
//                       />
//                       <Legend 
//                         wrapperStyle={{
//                           fontSize: isMobile ? '10px' : '12px',
//                           paddingTop: isMobile ? '5px' : '10px'
//                         }}
//                       />
//                       <Line
//                         type="monotone"
//                         dataKey="registered"
//                         stroke="#3B82F6"
//                         strokeWidth={isMobile ? 2 : 3}
//                         dot={{ r: isMobile ? 3 : 4, fill: '#3B82F6' }}
//                         activeDot={{ r: isMobile ? 4 : 6 }}
//                         name="Registered"
//                       />
//                       <Line
//                         type="monotone"
//                         dataKey="expired"
//                         stroke="#EF4444"
//                         strokeWidth={isMobile ? 2 : 3}
//                         dot={{ r: isMobile ? 3 : 4, fill: '#EF4444' }}
//                         activeDot={{ r: isMobile ? 4 : 6 }}
//                         name="Expired"
//                       />
//                     </LineChart>
//                   </ChartContainer>
//                 </div>
//               </section>
//             </div>

//             {/* Manufacturer Statistics */}
//             <section className="responsive-card mb-4 md:mb-6">
//               <h4 className="font-bold text-gray-800 mb-3 md:mb-4 text-base md:text-lg">Manufacturer Performance</h4>
//               <div className="h-64 md:h-[300px]">
//                 <ChartContainer width="100%" height="100%">
//                   <BarChart 
//                     data={manufacturerStats}
//                     margin={isMobile ? { top: 10, right: 10, left: 0, bottom: 60 } : { top: 20, right: 30, left: 20, bottom: 80 }}
//                   >
//                     <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
//                     <XAxis 
//                       dataKey="name" 
//                       stroke="#6b7280"
//                       angle={isMobile ? -45 : -45}
//                       textAnchor="end"
//                       height={isMobile ? 50 : 80}
//                       fontSize={isMobile ? 9 : 11}
//                       interval={0}
//                     />
//                     <YAxis 
//                       stroke="#6b7280" 
//                       fontSize={isMobile ? 10 : 12}
//                       width={isMobile ? 30 : 40}
//                     />
//                     <Tooltip 
//                       contentStyle={{ 
//                         backgroundColor: 'rgba(255, 255, 255, 0.95)',
//                         border: '1px solid #e5e7eb',
//                         color: '#374151',
//                         borderRadius: '10px',
//                         boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
//                         fontSize: isMobile ? '12px' : '14px'
//                       }}
//                       formatter={(value) => [`${value} batches`, 'Count']}
//                     />
//                     <Bar 
//                       dataKey="batches" 
//                       fill="#10B981" 
//                       radius={[3, 3, 0, 0]}
//                       name="Batches"
//                     />
//                   </BarChart>
//                 </ChartContainer>
//               </div>
//               <div className="mt-2 md:mt-3 text-center text-xs md:text-sm text-gray-500">
//                 <p>Top manufacturers by number of registered batches</p>
//               </div>
//             </section>

//             {/* Network Statistics */}
//             <section className="responsive-card">
//               <h4 className="font-bold text-gray-800 mb-3 md:mb-4 text-base md:text-lg">Blockchain Network Statistics</h4>
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
//                 <div className="text-center p-3 md:p-4 bg-blue-50 rounded-lg md:rounded-xl border border-blue-200">
//                   <div className="text-lg md:text-2xl font-bold text-blue-600">6</div>
//                   <div className="text-xs md:text-sm text-gray-600">Active Nodes</div>
//                 </div>
//                 <div className="text-center p-3 md:p-4 bg-green-50 rounded-lg md:rounded-xl border border-green-200">
//                   <div className="text-lg md:text-2xl font-bold text-green-600">99.9%</div>
//                   <div className="text-xs md:text-sm text-gray-600">Uptime</div>
//                 </div>
//                 <div className="text-center p-3 md:p-4 bg-purple-50 rounded-lg md:rounded-xl border border-purple-200">
//                   <div className="text-lg md:text-2xl font-bold text-purple-600">1.2s</div>
//                   <div className="text-xs md:text-sm text-gray-600">Avg. Response</div>
//                 </div>
//                 <div className="text-center p-3 md:p-4 bg-orange-50 rounded-lg md:rounded-xl border border-orange-200">
//                   <div className="text-lg md:text-2xl font-bold text-orange-600">{overview?.verifiedBatches || 0}</div>
//                   <div className="text-xs md:text-sm text-gray-600">Verified Batches</div>
//                 </div>
//               </div>

//               {/* Additional Stats Grid */}
//               <div className="mt-4 md:mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
//                 {/* Detailed Overview */}
//                 <div className="bg-gray-50 p-3 md:p-4 rounded-lg md:rounded-xl border border-gray-200">
//                   <h5 className="font-semibold text-gray-800 mb-2 md:mb-3 text-sm md:text-base">Detailed Overview</h5>
//                   <div className="space-y-1 md:space-y-2">
//                     <div className="flex justify-between items-center">
//                       <span className="text-gray-600 text-xs md:text-sm">Total Batches:</span>
//                       <span className="font-semibold text-gray-800 text-xs md:text-sm">{overview?.totalBatches || 0}</span>
//                     </div>
//                     <div className="flex justify-between items-center">
//                       <span className="text-gray-600 text-xs md:text-sm">Active Medicines:</span>
//                       <span className="font-semibold text-green-600 text-xs md:text-sm">{overview?.activeMedicines || 0}</span>
//                     </div>
//                     <div className="flex justify-between items-center">
//                       <span className="text-gray-600 text-xs md:text-sm">Expired Medicines:</span>
//                       <span className="font-semibold text-red-600 text-xs md:text-sm">{overview?.expiredMedicines || 0}</span>
//                     </div>
//                     <div className="flex justify-between items-center">
//                       <span className="text-gray-600 text-xs md:text-sm">Near Expiry:</span>
//                       <span className="font-semibold text-yellow-600 text-xs md:text-sm">{overview?.nearExpiry || 0}</span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* System Health */}
//                 <div className="bg-gray-50 p-3 md:p-4 rounded-lg md:rounded-xl border border-gray-200">
//                   <h5 className="font-semibold text-gray-800 mb-2 md:mb-3 text-sm md:text-base">System Health</h5>
//                   <div className="space-y-1 md:space-y-2">
//                     <div className="flex justify-between items-center">
//                       <span className="text-gray-600 text-xs md:text-sm">Blockchain Sync:</span>
//                       <span className="font-semibold text-green-600 text-xs md:text-sm">✅ Synced</span>
//                     </div>
//                     <div className="flex justify-between items-center">
//                       <span className="text-gray-600 text-xs md:text-sm">Database:</span>
//                       <span className="font-semibold text-green-600 text-xs md:text-sm">🟢 Online</span>
//                     </div>
//                     <div className="flex justify-between items-center">
//                       <span className="text-gray-600 text-xs md:text-sm">API Status:</span>
//                       <span className="font-semibold text-green-600 text-xs md:text-sm">🟢 Healthy</span>
//                     </div>
//                     <div className="flex justify-between items-center">
//                       <span className="text-gray-600 text-xs md:text-sm">Last Update:</span>
//                       <span className="font-semibold text-gray-800 text-xs md:text-sm">
//                         {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Performance Metrics */}
//               <div className="mt-3 md:mt-4 p-3 md:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg md:rounded-xl border border-blue-200">
//                 <h5 className="font-semibold text-blue-800 mb-2 text-sm md:text-base">Performance Metrics</h5>
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
//                   <div className="text-center">
//                     <div className="text-xs md:text-sm font-semibold text-blue-700">Response Time</div>
//                     <div className="text-lg md:text-xl font-bold text-blue-600">1.2s</div>
//                   </div>
//                   <div className="text-center">
//                     <div className="text-xs md:text-sm font-semibold text-green-700">Success Rate</div>
//                     <div className="text-lg md:text-xl font-bold text-green-600">99.8%</div>
//                   </div>
//                   <div className="text-center">
//                     <div className="text-xs md:text-sm font-semibold text-purple-700">Peak Load</div>
//                     <div className="text-lg md:text-xl font-bold text-purple-600">2.4k</div>
//                   </div>
//                   <div className="text-center">
//                     <div className="text-xs md:text-sm font-semibold text-orange-700">Avg. Usage</div>
//                     <div className="text-lg md:text-xl font-bold text-orange-600">78%</div>
//                   </div>
//                 </div>
//               </div>
//             </section>

//             {/* Quick Actions */}
//             <div className="flex flex-col sm:flex-row gap-2 md:gap-3 mt-4 md:mt-6">
//               <button
//                 onClick={fetchAnalyticsData}
//                 className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 md:px-4 py-2 md:py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1 md:gap-2"
//               >
//                 <span className="text-sm md:text-base">🔄</span>
//                 <span className="text-xs md:text-sm">Refresh Data</span>
//               </button>
//               <button
//                 onClick={() => window.print()}
//                 className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 md:px-4 py-2 md:py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1 md:gap-2"
//               >
//                 <span className="text-sm md:text-base">📄</span>
//                 <span className="text-xs md:text-sm">Export Report</span>
//               </button>
//               <button
//                 onClick={() => window.location.href = '/dashboard'}
//                 className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-3 md:px-4 py-2 md:py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1 md:gap-2"
//               >
//                 <span className="text-sm md:text-base">📊</span>
//                 <span className="text-xs md:text-sm">View Dashboard</span>
//               </button>
//             </div>

//             {/* Data Last Updated */}
//             <div className="text-center text-xs md:text-sm text-gray-500 mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-200">
//               <p>Data last updated: {new Date().toLocaleString()}</p>
//               <p className="mt-0.5">All statistics are updated in real-time from blockchain</p>
//             </div>
//           </div>
//         </ResponsiveContainer>
//       </BackgroundFix>
//     </ProtectedRoute>
//   );
// }

// export default AnalyticsPage;
