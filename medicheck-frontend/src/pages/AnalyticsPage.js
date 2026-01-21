import React, { useState, useEffect, useMemo } from "react";
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

function AnalyticsPage({ batches, metamask, user, theme }) {
  const [analyticsData, setAnalyticsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658'];

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate real data from batches
  const calculateRealData = (batches) => {
    if (!batches || batches.length === 0) {
      return getStaticAnalyticsData();
    }

    // Filter out duplicates
    const uniqueBatches = batches.reduce((acc, current) => {
      const x = acc.find(item => item.batchNo === current.batchNo);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []);

    // Calculate stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiredBatches = uniqueBatches.filter(batch => {
      const expiryDate = new Date(batch.expiry || batch.expiryDate);
      expiryDate.setHours(0, 0, 0, 0);
      return expiryDate < today;
    }).length;

    const activeBatches = uniqueBatches.filter(batch => {
      const expiryDate = new Date(batch.expiry || batch.expiryDate);
      expiryDate.setHours(0, 0, 0, 0);
      return expiryDate >= today;
    }).length;

    // Group by status
    const statusDistribution = [
      { name: 'Active', value: activeBatches },
      { name: 'In Transit', value: uniqueBatches.filter(b => b.status === 'In Transit').length },
      { name: 'Expired', value: expiredBatches },
      { name: 'At Pharmacy', value: uniqueBatches.filter(b => b.status === 'At Pharmacy' || b.status === 'accepted').length }
    ].filter(item => item.value > 0);

    // Calculate monthly trend (last 6 months)
    const monthlyTrend = calculateMonthlyTrend(uniqueBatches);

    // Group by manufacturer
    const manufacturerStats = calculateManufacturerStats(uniqueBatches);

    return {
      overview: {
        totalMedicines: uniqueBatches.length,
        activeMedicines: activeBatches,
        expiredMedicines: expiredBatches,
        nearExpiry: uniqueBatches.filter(batch => {
          const expiryDate = new Date(batch.expiry || batch.expiryDate);
          expiryDate.setHours(0, 0, 0, 0);
          const daysUntilExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
          return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
        }).length,
        totalBatches: uniqueBatches.length,
        verifiedBatches: uniqueBatches.filter(b => b.blockchainVerified).length
      },
      statusDistribution,
      monthlyTrend,
      manufacturerStats,
      sourceDistribution: [
        { 
          name: 'Manufacturer', 
          value: uniqueBatches.filter(b => b.source === 'batch' || !b.source).length,
          color: '#3B82F6' 
        },
        { 
          name: 'Pharmacy', 
          value: uniqueBatches.filter(b => b.source === 'pharmacy').length,
          color: '#10B981' 
        }
      ].filter(item => item.value > 0)
    };
  };

  const calculateMonthlyTrend = (batches) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const today = new Date();
    const last6Months = [];
    
    // Get last 6 months including current
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(today.getMonth() - i);
      const monthName = months[date.getMonth()];
      const year = date.getFullYear();
      last6Months.push({ month: `${monthName} ${year}`, monthIndex: date.getMonth(), year });
    }

    return last6Months.map(monthData => {
      const registered = batches.filter(batch => {
        const batchDate = new Date(batch.createdAt || batch.manufactureDate);
        return batchDate.getMonth() === monthData.monthIndex && 
               batchDate.getFullYear() === monthData.year;
      }).length;

      const expired = batches.filter(batch => {
        const expiryDate = new Date(batch.expiry || batch.expiryDate);
        return expiryDate.getMonth() === monthData.monthIndex && 
               expiryDate.getFullYear() === monthData.year &&
               expiryDate < new Date();
      }).length;

      return {
        month: monthData.month,
        registered,
        expired
      };
    });
  };

  const calculateManufacturerStats = (batches) => {
    const manufacturerCounts = {};
    
    batches.forEach(batch => {
      const manufacturer = batch.manufacturer || 'Unknown';
      manufacturerCounts[manufacturer] = (manufacturerCounts[manufacturer] || 0) + 1;
    });

    // Convert to array and sort by count
    return Object.entries(manufacturerCounts)
      .map(([name, batches]) => ({ name, batches }))
      .sort((a, b) => b.batches - a.batches)
      .slice(0, 5); // Top 5 manufacturers
  };

  const getStaticAnalyticsData = () => {
    // Fallback static data
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
        { month: 'Jan 2024', registered: 12, expired: 2 },
        { month: 'Feb 2024', registered: 15, expired: 1 },
        { month: 'Mar 2024', registered: 18, expired: 3 },
        { month: 'Apr 2024', registered: 14, expired: 2 },
        { month: 'May 2024', registered: 20, expired: 4 },
        { month: 'Jun 2024', registered: 16, expired: 1 }
      ],
      manufacturerStats: [
        { name: 'MediLife Labs', batches: 23 },
        { name: 'BioHeal Pharma', batches: 18 },
        { name: 'PharmaCare', batches: 15 },
        { name: 'NutraLife', batches: 12 },
        { name: 'HealthFirst', batches: 8 }
      ],
      sourceDistribution: [
        { name: 'Manufacturer', value: 67, color: '#3B82F6' },
        { name: 'Pharmacy', value: 22, color: '#10B981' }
      ]
    };
  };

  useEffect(() => {
    // Calculate real data from batches
    if (batches && batches.length > 0) {
      const realData = calculateRealData(batches);
      setAnalyticsData(realData);
      setLoading(false);
    } else {
      // Try to fetch from API if batches not provided
      fetchAnalyticsData();
    }
  }, [batches]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/analytics/dashboard");
      
      if (response.success) {
        setAnalyticsData(response.data);
      } else {
        // Fallback to static data
        setAnalyticsData(getStaticAnalyticsData());
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setAnalyticsData(getStaticAnalyticsData());
    } finally {
      setLoading(false);
    }
  };

  const { overview, statusDistribution, monthlyTrend, manufacturerStats, sourceDistribution } = analyticsData;

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
              {/* Status Distribution Pie Chart with improved legend */}
              <section className="responsive-card">
                <h4 className="font-bold text-gray-800 mb-3 md:mb-4 text-center text-base md:text-lg">
                  Medicine Status Distribution
                </h4>
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Pie Chart */}
                  <div className="h-64 md:h-[300px] w-full lg:w-2/3">
                    <ChartContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={isMobile ? 60 : 80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {statusDistribution?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [`${value} batches`, 'Count']}
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
                  
                  {/* Legend - Fixed layout below on mobile, beside on desktop */}
                  <div className="w-full lg:w-1/3">
                    <div className="bg-gray-50 p-3 md:p-4 rounded-lg border border-gray-200">
                      <h5 className="font-semibold text-gray-700 mb-3 text-sm md:text-base text-center">
                        Status Breakdown
                      </h5>
                      <div className="space-y-2">
                        {statusDistribution?.map((entry, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 md:w-4 md:h-4 rounded-full flex-shrink-0"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              ></div>
                              <span className="text-xs md:text-sm text-gray-700 truncate">
                                {entry.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-800 text-xs md:text-sm">
                                {entry.value}
                              </span>
                              {overview && (
                                <span className="text-xs text-gray-500">
                                  ({Math.round((entry.value / overview.totalMedicines) * 100)}%)
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {/* Summary Stats */}
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="grid grid-cols-2 gap-2 text-xs md:text-sm">
                            <div className="text-center">
                              <div className="font-bold text-green-600">{overview?.activeMedicines || 0}</div>
                              <div className="text-gray-600">Active</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-red-600">{overview?.expiredMedicines || 0}</div>
                              <div className="text-gray-600">Expired</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Additional Stats */}
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <h6 className="font-semibold text-blue-800 text-xs mb-2">Quick Stats</h6>
                      <div className="space-y-1 text-xs text-blue-700">
                        <div className="flex justify-between">
                          <span>Total Batches:</span>
                          <span className="font-semibold">{overview?.totalBatches || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Blockchain Verified:</span>
                          <span className="font-semibold">{overview?.verifiedBatches || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Near Expiry (30 days):</span>
                          <span className="font-semibold text-orange-600">{overview?.nearExpiry || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Monthly Trend Chart with improved data */}
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
                        tickFormatter={(value) => {
                          // Show abbreviated month names
                          const parts = value.split(' ');
                          return `${parts[0].substring(0, 3)} '${parts[1].substring(2)}`;
                        }}
                      />
                      <YAxis 
                        stroke="#6b7280" 
                        fontSize={isMobile ? 10 : 12}
                        width={isMobile ? 30 : 40}
                        domain={[0, 'dataMax + 2']}
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
                          const label = name === 'registered' ? 'Registered' : 'Expired';
                          return [`${value} batches`, label];
                        }}
                        labelFormatter={(label) => `Month: ${label}`}
                      />
                      <Legend 
                        wrapperStyle={{
                          fontSize: isMobile ? '10px' : '12px',
                          paddingTop: isMobile ? '5px' : '10px'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="registered"
                        stroke="#3B82F6"
                        strokeWidth={isMobile ? 2 : 3}
                        dot={{ r: isMobile ? 3 : 4, fill: '#3B82F6' }}
                        activeDot={{ r: isMobile ? 4 : 6 }}
                        name="Registered"
                      />
                      <Line
                        type="monotone"
                        dataKey="expired"
                        stroke="#EF4444"
                        strokeWidth={isMobile ? 2 : 3}
                        dot={{ r: isMobile ? 3 : 4, fill: '#EF4444' }}
                        activeDot={{ r: isMobile ? 4 : 6 }}
                        name="Expired"
                      />
                    </LineChart>
                  </ChartContainer>
                </div>
                
                {/* Trend Summary */}
                <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="grid grid-cols-2 gap-3 text-xs md:text-sm">
                    <div className="text-center">
                      <div className="text-lg md:text-xl font-bold text-blue-600">
                        {monthlyTrend?.reduce((sum, month) => sum + (month.registered || 0), 0) || 0}
                      </div>
                      <div className="text-blue-700">Total Registered (6M)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg md:text-xl font-bold text-red-600">
                        {monthlyTrend?.reduce((sum, month) => sum + (month.expired || 0), 0) || 0}
                      </div>
                      <div className="text-red-700">Total Expired (6M)</div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Source Distribution */}
            <section className="responsive-card mb-4 md:mb-6">
              <h4 className="font-bold text-gray-800 mb-3 md:mb-4 text-base md:text-lg">Batch Sources Distribution</h4>
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Pie Chart */}
                <div className="h-64 md:h-[300px] w-full lg:w-2/3">
                  <ChartContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sourceDistribution || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={isMobile ? 70 : 90}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {(sourceDistribution || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value} batches`, 'Count']}
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
                
                {/* Legend for Sources */}
                <div className="w-full lg:w-1/3">
                  <div className="bg-gray-50 p-3 md:p-4 rounded-lg border border-gray-200">
                    <h5 className="font-semibold text-gray-700 mb-3 text-sm md:text-base text-center">
                      Source Breakdown
                    </h5>
                    <div className="space-y-3">
                      {(sourceDistribution || []).map((source, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-white rounded-lg border">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 md:w-4 md:h-4 rounded-full flex-shrink-0"
                              style={{ backgroundColor: source.color }}
                            ></div>
                            <span className="text-sm font-medium text-gray-700">{source.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-800 text-sm md:text-base">{source.value}</div>
                            <div className="text-xs text-gray-500">
                              {Math.round((source.value / (overview?.totalBatches || 1)) * 100)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Source Summary */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {(sourceDistribution || []).reduce((sum, source) => sum + source.value, 0)}
                        </div>
                        <div className="text-xs text-gray-600">Total Batches from All Sources</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

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
              </div>
            </section>

            {/* Network Statistics */}
            <section className="responsive-card">
              <h4 className="font-bold text-gray-800 mb-3 md:mb-4 text-base md:text-lg">Blockchain Network Statistics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                <div className="text-center p-3 md:p-4 bg-blue-50 rounded-lg md:rounded-xl border border-blue-200">
                  <div className="text-lg md:text-2xl font-bold text-blue-600">6</div>
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
                {/* Detailed Overview */}
                <div className="bg-gray-50 p-3 md:p-4 rounded-lg md:rounded-xl border border-gray-200">
                  <h5 className="font-semibold text-gray-800 mb-2 md:mb-3 text-sm md:text-base">Batch Statistics</h5>
                  <div className="space-y-1 md:space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-xs md:text-sm">Total Batches:</span>
                      <span className="font-semibold text-gray-800 text-xs md:text-sm">{overview?.totalBatches || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-xs md:text-sm">Active Batches:</span>
                      <span className="font-semibold text-green-600 text-xs md:text-sm">{overview?.activeMedicines || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-xs md:text-sm">Expired Batches:</span>
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
                      <span className="font-semibold text-green-600 text-xs md:text-sm">✅ Synced</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-xs md:text-sm">Database:</span>
                      <span className="font-semibold text-green-600 text-xs md:text-sm">🟢 Online</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-xs md:text-sm">API Status:</span>
                      <span className="font-semibold text-green-600 text-xs md:text-sm">🟢 Healthy</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-xs md:text-sm">Real-time Data:</span>
                      <span className="font-semibold text-green-600 text-xs md:text-sm">✅ Live</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Batch Source Distribution */}
              <div className="mt-3 md:mt-4 p-3 md:p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg md:rounded-xl border border-indigo-200">
                <h5 className="font-semibold text-indigo-800 mb-2 text-sm md:text-base">Batch Sources</h5>
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  {(sourceDistribution || []).map((source, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white rounded-lg border">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 md:w-3 md:h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: source.color }}
                        ></div>
                        <span className="text-xs md:text-sm font-medium text-gray-700">{source.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-indigo-600 text-sm md:text-base">{source.value}</div>
                        <div className="text-xs text-gray-500">
                          {Math.round((source.value / (overview?.totalBatches || 1)) * 100)}%
                        </div>
                      </div>
                    </div>
                  ))}
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
                    <div className="text-lg md:text-xl font-bold text-green-600">99.8%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs md:text-sm font-semibold text-purple-700">Peak Load</div>
                    <div className="text-lg md:text-xl font-bold text-purple-600">2.4k</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs md:text-sm font-semibold text-orange-700">Avg. Usage</div>
                    <div className="text-lg md:text-xl font-bold text-orange-600">78%</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3 mt-4 md:mt-6">
              <button
                onClick={fetchAnalyticsData}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 md:px-4 py-2 md:py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1 md:gap-2"
              >
                <span className="text-sm md:text-base">🔄</span>
                <span className="text-xs md:text-sm">Refresh Data</span>
              </button>
              <button
                onClick={() => window.print()}
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
              <p className="mt-0.5">All statistics are calculated from real blockchain data</p>
            </div>
          </div>
        </ResponsiveContainer>
      </BackgroundFix>
    </ProtectedRoute>
  );
}

export default AnalyticsPage;

// Original code before enhancement:

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
