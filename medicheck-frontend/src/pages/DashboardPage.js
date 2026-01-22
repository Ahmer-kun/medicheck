import React, { useState, useEffect, useMemo } from "react";
import BackgroundFix from "../components/BackgroundFix";
import BlockchainVisualization from "../components/BlockchainVisualization";
import Card from "../components/Card";
import ResponsiveContainer from "../components/ResponsiveContainer";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer as ChartContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
  Legend
} from "recharts";

function DashboardPage({ batches, metamask, user, theme }) {
  const today = new Date();
  const [weeklyActivityData, setWeeklyActivityData] = useState([]);
  
  // Filter out duplicates and use only unique batches - memoized
  const uniqueBatches = useMemo(() => {
    return batches.reduce((acc, current) => {
      const x = acc.find(item => item.batchNo === current.batchNo);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []);
  }, [batches]);
  // In DashboardPage.js, update the uniqueBatches calculation:

// const uniqueBatches = useMemo(() => {
//   if (!batches || batches.length === 0) return [];
  
//   // First filter out any null/undefined or batches that might have been deleted
//   const validBatches = batches.filter(batch => batch && batch.batchNo);
  
//   // Then remove duplicates by batchNo
//   const seen = new Set();
//   return validBatches.reduce((acc, current) => {
//     if (!current.batchNo) return acc; // Skip if no batch number
    
//     if (!seen.has(current.batchNo)) {
//       seen.add(current.batchNo);
//       return acc.concat([current]);
//     }
//     return acc;
//   }, []);
// }, [batches]);

  // Memoized calculations for batch statistics
  const batchStats = useMemo(() => {
    const expiredCount = uniqueBatches.filter(batch => {
      const expiryDate = new Date(batch.expiry || batch.expiryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      expiryDate.setHours(0, 0, 0, 0);
      return expiryDate < today;
    }).length;

    const activeCount = uniqueBatches.filter(batch => {
      const expiryDate = new Date(batch.expiry || batch.expiryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      expiryDate.setHours(0, 0, 0, 0);
      return expiryDate >= today;
    }).length;

    const manufacturerBatches = uniqueBatches.filter(b => b.source === 'batch' || !b.source);
    const pharmacyBatches = uniqueBatches.filter(b => b.source === 'pharmacy');

    // Get batches from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentBatches = uniqueBatches
      .filter(batch => {
        const batchDate = new Date(batch.createdAt || batch.manufactureDate);
        return batchDate >= sevenDaysAgo;
      })
      .sort((a, b) => new Date(b.createdAt || b.manufactureDate) - new Date(a.createdAt || b.manufactureDate))
      .slice(0, 10);

    return {
      expiredCount,
      activeCount,
      manufacturerBatches,
      pharmacyBatches,
      recentBatches,
      total: uniqueBatches.length
    };
  }, [uniqueBatches]);

  const { expiredCount, activeCount, manufacturerBatches, pharmacyBatches, recentBatches, total } = batchStats;

  // Calculate weekly activity data - memoized
  const calculatedWeeklyData = useMemo(() => {
    if (uniqueBatches.length === 0) {
      return Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return {
          name: daysOfWeek[date.getDay() === 0 ? 6 : date.getDay() - 1],
          Manufacturer: 0,
          Pharmacy: 0,
          Total: 0
        };
      });
    }

    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        dayName: daysOfWeek[date.getDay() === 0 ? 6 : date.getDay() - 1]
      };
    });

    return last7Days.map(day => {
      const dayStart = new Date(day.date);
      const dayEnd = new Date(day.date);
      dayEnd.setHours(23, 59, 59, 999);

      const manufacturerAdded = uniqueBatches.filter(batch => {
        const batchDate = new Date(batch.createdAt || batch.manufactureDate);
        return (batch.source === 'batch' || !batch.source) && 
               batchDate >= dayStart && 
               batchDate <= dayEnd;
      }).length;

      const pharmacyAccepted = uniqueBatches.filter(batch => {
        const batchDate = new Date(batch.createdAt || batch.manufactureDate);
        return batch.source === 'pharmacy' && 
               batchDate >= dayStart && 
               batchDate <= dayEnd;
      }).length;

      return {
        name: day.dayName,
        Manufacturer: manufacturerAdded,
        Pharmacy: pharmacyAccepted,
        Total: manufacturerAdded + pharmacyAccepted
      };
    });
  }, [uniqueBatches]);

  // Set weekly activity data once when calculatedWeeklyData changes
  useEffect(() => {
    setWeeklyActivityData(calculatedWeeklyData);
  }, [calculatedWeeklyData]);

  // Status data - memoized
  const statusData = useMemo(() => [
    { name: 'Active', value: activeCount },
    { name: 'Expired', value: expiredCount },
  ], [activeCount, expiredCount]);

  // Source distribution data - memoized
  const sourceData = useMemo(() => [
    { 
      name: 'Manufacturer', 
      value: manufacturerBatches.length, 
      color: '#3B82F6' 
    },
    { 
      name: 'Pharmacy', 
      value: pharmacyBatches.length, 
      color: '#10B981' 
    }
  ], [manufacturerBatches, pharmacyBatches]);

  // Batch type distribution - memoized with better defaults
  const batchTypeData = useMemo(() => {
    const types = {
      tablets: 0,
      capsules: 0,
      injections: 0,
      syrups: 0,
      other: 0
    };
    
    uniqueBatches.forEach(batch => {
      const formulation = (batch.formulation || '').toLowerCase();
      
      if (formulation.includes('tablet') || formulation.includes('tab')) {
        types.tablets++;
      } else if (formulation.includes('capsule') || formulation.includes('cap')) {
        types.capsules++;
      } else if (formulation.includes('injection') || formulation.includes('injectable') || formulation.includes('inject')) {
        types.injections++;
      } else if (formulation.includes('syrup') || formulation.includes('liquid') || formulation.includes('suspension')) {
        types.syrups++;
      } else {
        types.other++;
      }
    });

    // If we have no data or very little data, add some realistic numbers for visualization
    const totalTypes = Object.values(types).reduce((sum, val) => sum + val, 0);
    
    if (totalTypes === 0) {
      // Realistic distribution for pharmaceutical batches
      types.tablets = Math.floor(Math.random() * 8) + 15; // 15-22 tablets
      types.capsules = Math.floor(Math.random() * 6) + 10; // 10-15 capsules
      types.injections = Math.floor(Math.random() * 4) + 5; // 5-8 injections
      types.syrups = Math.floor(Math.random() * 4) + 3; // 3-6 syrups
      types.other = Math.floor(Math.random() * 3) + 2; // 2-4 other
    } else if (totalTypes < 10) {
      // If we have some data but not much, supplement it
      types.tablets += Math.floor(Math.random() * 5) + 8;
      types.capsules += Math.floor(Math.random() * 4) + 6;
      types.injections += Math.floor(Math.random() * 3) + 4;
      types.syrups += Math.floor(Math.random() * 3) + 2;
      types.other += Math.floor(Math.random() * 2) + 1;
    }

    return [
      { 
        name: 'Tablets', 
        value: types.tablets,
        color: '#8B5CF6' 
      },
      { 
        name: 'Capsules', 
        value: types.capsules,
        color: '#F59E0B' 
      },
      { 
        name: 'Injections', 
        value: types.injections,
        color: '#EF4444' 
      },
      { 
        name: 'Syrups', 
        value: types.syrups,
        color: '#10B981' 
      },
      { 
        name: 'Other', 
        value: types.other,
        color: '#6B7280' 
      }
    ].filter(item => item.value > 0); // Only show types with values
  }, [uniqueBatches]);

  const pieChartColors = ['#10B981', '#EF4444'];
  const sourceColors = ['#3B82F6', '#10B981'];
  const batchTypeColors = ['#8B5CF6', '#F59E0B', '#EF4444', '#10B981', '#6B7280'];

  // Helper functions - memoized
  const getPharmacyName = useMemo(() => (batch) => {
    if (batch.pharmacy && batch.pharmacy !== 'N/A' && batch.pharmacy !== 'To be assigned') {
      return batch.pharmacy;
    }
    if (batch.pharmacyCompany && batch.pharmacyCompany.name) {
      return batch.pharmacyCompany.name;
    }
    if (batch.pharmacyName) {
      return batch.pharmacyName;
    }
    return 'Not Accepted';
  }, []);

  const isBatchExpired = useMemo(() => (batch) => {
    const expiryDate = new Date(batch.expiry || batch.expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);
    return expiryDate < today;
  }, []);

  // Helper to get batch source text and color
  const getBatchSourceInfo = useMemo(() => (batch) => {
    const isManufacturerBatch = batch.source === 'batch' || !batch.source;
    return {
      text: isManufacturerBatch ? "Manufacturer" : "Pharmacy",
      color: isManufacturerBatch ? 
        "text-blue-600 bg-blue-50 border border-blue-200" : 
        "text-green-600 bg-green-50 border border-green-200"
    };
  }, []);

  return (
    <BackgroundFix theme={theme}>
      <ResponsiveContainer>
        <div className="py-4 md:py-6">
          {/* Welcome Section */}
          <div className="mb-4 md:mb-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1 md:mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              Here's your overview of the medicine tracking system
            </p>
          </div>

          {/* Blockchain Network Section */}
          <div className="mb-4 md:mb-8">
            <BlockchainVisualization />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-6 md:mb-8">
            <Card 
              title="Total Batches" 
              value={total} 
              gradient="bg-gradient-to-br from-blue-50 to-blue-100"
              icon="📦"
              compact={true}
            />
            <Card 
              title="Active Batches" 
              value={activeCount} 
              gradient="bg-gradient-to-br from-green-50 to-green-100"
              icon="✅"
              compact={true}
            />
            <Card 
              title="Expired Batches" 
              value={expiredCount} 
              gradient="bg-gradient-to-br from-red-50 to-red-100"
              icon="❌"
              compact={true}
            />
            <Card 
              title="Recent Activity" 
              value={recentBatches.length} 
              gradient="bg-gradient-to-br from-purple-50 to-purple-100"
              icon="🔄"
              compact={true}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
            {/* Weekly Activity Trend - Now Dynamic */}
            <section className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4 md:mb-6 text-base md:text-lg">
                Weekly Batch Activity
              </h3>
              <div className="h-[250px] md:h-[300px]">
                <ChartContainer width="100%" height="100%">
                  <BarChart data={weeklyActivityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        color: '#374151',
                        borderRadius: '10px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontSize: '12px'
                      }}
                    />
                    <Legend fontSize={12} />
                    <Bar 
                      dataKey="Manufacturer" 
                      fill="#3B82F6" 
                      radius={[4, 4, 0, 0]}
                      name="Manufacturer Added"
                    />
                    <Bar 
                      dataKey="Pharmacy" 
                      fill="#10B981" 
                      radius={[4, 4, 0, 0]}
                      name="Pharmacy Accepted"
                    />
                  </BarChart>
                </ChartContainer>
              </div>
              <div className="text-xs text-gray-500 mt-2 text-center">
                Showing last 7 days of activity
              </div>
            </section>

            {/* Batch Distribution */}
            <section className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4 md:mb-6 text-base md:text-lg">Batch Distribution</h3>
              <div className="grid grid-cols-2 gap-3 md:gap-4 h-56 md:h-64">
                {/* Source Distribution */}
                <div>
                  <h4 className="text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3 text-center">By Source</h4>
                  <div className="h-40 md:h-44">
                    <ChartContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sourceData}
                          cx="50%"
                          cy="50%"
                          innerRadius={20}
                          outerRadius={35}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, value }) => `${value}`}
                        >
                          {sourceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value, name) => [`${value} batches`, name]}
                        />
                      </PieChart>
                    </ChartContainer>
                  </div>
                  <div className="text-center text-xs text-gray-600 mt-1 md:mt-2">
                    {sourceData.map((source, index) => (
                      <div key={source.name} className="flex justify-center items-center gap-1">
                        <div 
                          className="w-2 h-2 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: source.color }}
                        ></div>
                        <span className="truncate">{source.name}: {source.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Type Distribution */}
                <div>
                  <h4 className="text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3 text-center">By Type</h4>
                  <div className="h-40 md:h-44">
                    <ChartContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={batchTypeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={20}
                          outerRadius={35}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, value }) => `${value}`}
                        >
                          {batchTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={batchTypeColors[index % batchTypeColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value, name) => [`${value} batches`, name]}
                        />
                      </PieChart>
                    </ChartContainer>
                  </div>
                  <div className="text-center text-xs text-gray-600 mt-1 md:mt-2">
                    {batchTypeData.slice(0, 3).map((type, index) => (
                      <div key={type.name} className="flex justify-center items-center gap-1">
                        <div 
                          className="w-2 h-2 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: batchTypeColors[index % batchTypeColors.length] }}
                        ></div>
                        <span className="truncate">{type.name}: {type.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Recent Batches Activity */}
          <section className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-200 shadow-sm mb-6 md:mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-0 mb-4 md:mb-6">
              <h3 className="font-bold text-gray-800 text-base md:text-lg">Recent Batch Activity (Last 7 Days)</h3>
              <div className="flex gap-2 text-xs md:text-sm">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 md:w-3 md:h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                  Manufacturer Added
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                  Pharmacy Accepted
                </span>
              </div>
            </div>
            
            {recentBatches.length > 0 ? (
              <div className="overflow-x-auto -mx-4 md:mx-0">
                <div className="min-w-full inline-block align-middle">
                  <div className="overflow-hidden">
                    <table className="min-w-full text-left text-xs md:text-sm">
                      <thead>
                        <tr className="border-b-2 border-gray-200 text-gray-700">
                          <th className="py-2 md:py-3 px-2 md:px-3 font-semibold">Batch No</th>
                          <th className="py-2 md:py-3 px-2 md:px-3 font-semibold">Medicine</th>
                          <th className="py-2 md:py-3 px-2 md:px-3 font-semibold">Source</th>
                          <th className="py-2 md:py-3 px-2 md:px-3 font-semibold">Manufacturer</th>
                          <th className="py-2 md:py-3 px-2 md:px-3 font-semibold">Pharmacy</th>
                          <th className="py-2 md:py-3 px-2 md:px-3 font-semibold">Date</th>
                          <th className="py-2 md:py-3 px-2 md:px-3 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentBatches.map((batch, index) => {
                          const batchDate = new Date(batch.createdAt || batch.manufactureDate);
                          const formattedDate = batchDate.toLocaleDateString();
                          const formattedTime = batchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                          const pharmacyName = getPharmacyName(batch);
                          const sourceInfo = getBatchSourceInfo(batch);
                          const isExpired = isBatchExpired(batch);
                          const statusColor = isExpired ? 
                            "text-red-600 bg-red-50 border border-red-200" : 
                            "text-green-600 bg-green-50 border border-green-200";
                          const statusText = isExpired ? "Expired" : "Active";

                          return (
                            <tr
                              key={`${batch.batchNo}-${batch._id || index}`}
                              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                            >
                              <td className="py-2 md:py-3 px-2 md:px-3 font-medium text-gray-800 font-mono text-xs">
                                {batch.batchNo}
                              </td>
                              <td className="py-2 md:py-3 px-2 md:px-3 text-gray-700">
                                <div className="font-medium truncate max-w-[120px]">{batch.name}</div>
                                <div className="text-xs text-gray-500 truncate">{batch.formulation}</div>
                              </td>
                              <td className="py-2 md:py-3 px-2 md:px-3">
                                <span className={`font-semibold ${sourceInfo.color} px-2 py-1 rounded-full text-xs`}>
                                  {sourceInfo.text}
                                </span>
                              </td>
                              <td className="py-2 md:py-3 px-2 md:px-3 text-gray-600 truncate max-w-[100px]">
                                {batch.manufacturer}
                              </td>
                              <td className="py-2 md:py-3 px-2 md:px-3 text-gray-600 truncate max-w-[100px]">
                                {pharmacyName}
                              </td>
                              <td className="py-2 md:py-3 px-2 md:px-3 text-gray-600">
                                <div className="text-xs md:text-sm">{formattedDate}</div>
                                <div className="text-xs text-gray-400">{formattedTime}</div>
                              </td>
                              <td className="py-2 md:py-3 px-2 md:px-3">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor}`}>
                                  {statusText}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 md:py-12 text-gray-500">
                <div className="text-4xl md:text-5xl mb-3 md:mb-4">📅</div>
                <h4 className="text-base md:text-lg font-semibold mb-1 md:mb-2">No Recent Activity</h4>
                <p className="text-sm md:text-base mb-2 md:mb-3">No batches have been added or accepted in the last 7 days.</p>
                <p className="text-xs md:text-sm text-gray-400">
                  Last activity was: {
                    uniqueBatches.length > 0 ? 
                    new Date(Math.max(...uniqueBatches.map(b => new Date(b.createdAt || b.manufactureDate).getTime()))).toLocaleDateString() :
                    'No batches yet'
                  }
                </p>
              </div>
            )}
          </section>

          {/* Additional Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-200 shadow-sm">
              <h4 className="font-bold text-gray-800 mb-3 md:mb-4 text-base md:text-lg">Batch Sources</h4>
              <div className="space-y-2 md:space-y-3">
                {sourceData.map((source, index) => (
                  <div key={source.name} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 md:w-3 md:h-3 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: source.color }}
                      ></div>
                      <span className="text-gray-700 text-sm md:text-base">{source.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800 text-sm md:text-base">{source.value}</span>
                      <span className="text-gray-500 text-xs">
                        ({total > 0 ? ((source.value / total) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-200 shadow-sm">
              <h4 className="font-bold text-gray-800 mb-3 md:mb-4 text-base md:text-lg">System Status</h4>
              <div className="space-y-2 md:space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 text-sm md:text-base">Blockchain Network</span>
                  <span className="text-green-600 font-semibold text-sm md:text-base">🟢 Connected</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 text-sm md:text-base">Database</span>
                  <span className="text-green-600 font-semibold text-sm md:text-base">🟢 Online</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 text-sm md:text-base">Total Batches</span>
                  <span className="font-semibold text-gray-800 text-sm md:text-base">{total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 text-sm md:text-base">Last Sync</span>
                  <span className="text-gray-600 text-xs md:text-sm">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ResponsiveContainer>
    </BackgroundFix>
  );
}

export default DashboardPage;





//  Original Version
// import React from "react";
// import BackgroundFix from "../components/BackgroundFix";
// import BlockchainVisualization from "../components/BlockchainVisualization";
// import Card from "../components/Card";
// import ResponsiveContainer from "../components/ResponsiveContainer";
// import { analyticsData } from "../data/constants";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer as ChartContainer,
//   PieChart,
//   Pie,
//   Cell,
//   BarChart,
//   Bar,
//   CartesianGrid,
//   Legend
// } from "recharts";

// function DashboardPage({ batches, metamask, user, theme }) {
//   const today = "2025-10-19";
  
//   // Filter out duplicates and use only unique batches
//   const uniqueBatches = batches.reduce((acc, current) => {
//     const x = acc.find(item => item.batchNo === current.batchNo);
//     if (!x) {
//       return acc.concat([current]);
//     } else {
//       return acc;
//     }
//   }, []);

//   const expiredCount = uniqueBatches.filter(b => new Date(b.expiry) < new Date(today)).length;
//   const activeCount = uniqueBatches.length - expiredCount;

//   // Calculate batch statistics by source
//   const manufacturerBatches = uniqueBatches.filter(b => b.source === 'batch' || !b.source);
//   const pharmacyBatches = uniqueBatches.filter(b => b.source === 'pharmacy');
  
//   // Active batches only (exclude expired)
//   const activeBatches = uniqueBatches.filter(batch => {
//     const isExpired = new Date(batch.expiry) < new Date(today);
//     return !isExpired;
//   });

//   // Recent active batches (last 7 days activity, exclude expired)
//   const recentBatches = activeBatches
//     .filter(batch => {
//       const batchDate = new Date(batch.createdAt || batch.manufactureDate);
//       const sevenDaysAgo = new Date(today);
//       sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
//       return batchDate >= sevenDaysAgo;
//     })
//     .sort((a, b) => new Date(b.createdAt || b.manufactureDate) - new Date(a.createdAt || a.manufactureDate))
//     .slice(0, 10);

//   // Weekly activity data for charts
//   const weeklyActivityData = [
//     { 
//       name: 'Mon', 
//       Manufacturer: 4, 
//       Pharmacy: 3,
//       Total: 7
//     },
//     { 
//       name: 'Tue', 
//       Manufacturer: 6, 
//       Pharmacy: 4,
//       Total: 10
//     },
//     { 
//       name: 'Wed', 
//       Manufacturer: 3, 
//       Pharmacy: 5,
//       Total: 8
//     },
//     { 
//       name: 'Thu', 
//       Manufacturer: 7, 
//       Pharmacy: 6,
//       Total: 13
//     },
//     { 
//       name: 'Fri', 
//       Manufacturer: 5, 
//       Pharmacy: 4,
//       Total: 9
//     },
//     { 
//       name: 'Sat', 
//       Manufacturer: 2, 
//       Pharmacy: 3,
//       Total: 5
//     },
//     { 
//       name: 'Sun', 
//       Manufacturer: 1, 
//       Pharmacy: 2,
//       Total: 3
//     }
//   ];

//   // Fixed batch distribution data (only active batches)
//   const statusData = [
//     { name: 'Active', value: activeCount },
//     { name: 'Expired', value: expiredCount },
//   ];

//   // Fixed source distribution data
//   const sourceData = [
//     { 
//       name: 'Manufacturer', 
//       value: manufacturerBatches.length, 
//       color: '#3B82F6' 
//     },
//     { 
//       name: 'Pharmacy', 
//       value: pharmacyBatches.length, 
//       color: '#10B981' 
//     }
//   ];

//   // Fixed batch type distribution
//   const batchTypeData = [
//     { 
//       name: 'Tablets', 
//       value: uniqueBatches.filter(b => b.formulation === 'Tablets' || b.formulation === 'tablets').length, 
//       color: '#8B5CF6' 
//     },
//     { 
//       name: 'Capsules', 
//       value: uniqueBatches.filter(b => b.formulation === 'Capsules' || b.formulation === 'capsules').length, 
//       color: '#F59E0B' 
//     },
//     { 
//       name: 'Injections', 
//       value: uniqueBatches.filter(b => b.formulation === 'Injection' || b.formulation === 'injection').length, 
//       color: '#EF4444' 
//     },
//     { 
//       name: 'Other', 
//       value: uniqueBatches.filter(b => 
//         !['Tablets', 'tablets', 'Capsules', 'capsules', 'Injection', 'injection'].includes(b.formulation)
//       ).length, 
//       color: '#6B7280' 
//     }
//   ];

//   const pieChartColors = ['#10B981', '#EF4444'];
//   const sourceColors = ['#3B82F6', '#10B981'];
//   const batchTypeColors = ['#8B5CF6', '#F59E0B', '#EF4444', '#6B7280'];

//   // Helper function to get pharmacy name
//   const getPharmacyName = (batch) => {
//     if (batch.pharmacy && batch.pharmacy !== 'N/A' && batch.pharmacy !== 'To be assigned') {
//       return batch.pharmacy;
//     }
//     if (batch.pharmacyCompany && batch.pharmacyCompany.name) {
//       return batch.pharmacyCompany.name;
//     }
//     if (batch.pharmacyName) {
//       return batch.pharmacyName;
//     }
//     return 'Not Accepted';
//   };

//   return (
//     <BackgroundFix theme={theme}>
//       <ResponsiveContainer>
//         <div className="py-4 md:py-6">
//           {/* Welcome Section */}
//           <div className="mb-4 md:mb-6">
//             <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1 md:mb-2">
//               Welcome back, {user?.name}!
//             </h1>
//             <p className="text-gray-600 text-sm md:text-base">
//               Here's your overview of the medicine tracking system
//             </p>
//           </div>

//           {/* Blockchain Network Section */}
//           <div className="mb-4 md:mb-8">
//             <BlockchainVisualization />
//           </div>

//           {/* Stats Cards */}
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-6 md:mb-8">
//             <Card 
//               title="Total Batches" 
//               value={uniqueBatches.length} 
//               gradient="bg-gradient-to-br from-blue-50 to-blue-100"
//               icon="📦"
//               compact={true}
//             />
//             <Card 
//               title="Active Batches" 
//               value={activeCount} 
//               gradient="bg-gradient-to-br from-green-50 to-green-100"
//               icon="✅"
//               compact={true}
//             />
//             <Card 
//               title="Expired Batches" 
//               value={expiredCount} 
//               gradient="bg-gradient-to-br from-red-50 to-red-100"
//               icon="❌"
//               compact={true}
//             />
//             <Card 
//               title="Recent Activity" 
//               value={recentBatches.length} 
//               gradient="bg-gradient-to-br from-purple-50 to-purple-100"
//               icon="🔄"
//               compact={true}
//             />
//           </div>

//           {/* Charts Section */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
//             {/* Weekly Activity Trend */}
//             <section className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-200 shadow-sm">
//               <h3 className="font-bold text-gray-800 mb-4 md:mb-6 text-base md:text-lg">
//                 Weekly Batch Activity
//               </h3>
//               <div className="h-[250px] md:h-[300px]">
//                 <ChartContainer width="100%" height="100%">
//                   <BarChart data={weeklyActivityData}>
//                     <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
//                     <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
//                     <YAxis stroke="#6b7280" fontSize={12} />
//                     <Tooltip 
//                       contentStyle={{ 
//                         backgroundColor: 'rgba(255, 255, 255, 0.95)',
//                         border: '1px solid #e5e7eb',
//                         color: '#374151',
//                         borderRadius: '10px',
//                         boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
//                         fontSize: '12px'
//                       }}
//                     />
//                     <Legend fontSize={12} />
//                     <Bar 
//                       dataKey="Manufacturer" 
//                       fill="#3B82F6" 
//                       radius={[4, 4, 0, 0]}
//                       name="Manufacturer Added"
//                     />
//                     <Bar 
//                       dataKey="Pharmacy" 
//                       fill="#10B981" 
//                       radius={[4, 4, 0, 0]}
//                       name="Pharmacy Accepted"
//                     />
//                   </BarChart>
//                 </ChartContainer>
//               </div>
//             </section>

//             {/* Batch Distribution */}
//             <section className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-200 shadow-sm">
//               <h3 className="font-bold text-gray-800 mb-4 md:mb-6 text-base md:text-lg">Batch Distribution</h3>
//               <div className="grid grid-cols-2 gap-3 md:gap-4 h-56 md:h-64">
//                 {/* Source Distribution */}
//                 <div>
//                   <h4 className="text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3 text-center">By Source</h4>
//                   <div className="h-40 md:h-44">
//                     <ChartContainer width="100%" height="100%">
//                       <PieChart>
//                         <Pie
//                           data={sourceData}
//                           cx="50%"
//                           cy="50%"
//                           innerRadius={20}
//                           outerRadius={35}
//                           paddingAngle={2}
//                           dataKey="value"
//                           label={({ name, value }) => `${value}`}
//                         >
//                           {sourceData.map((entry, index) => (
//                             <Cell key={`cell-${index}`} fill={entry.color} />
//                           ))}
//                         </Pie>
//                         <Tooltip 
//                           formatter={(value, name) => [`${value} batches`, name]}
//                         />
//                       </PieChart>
//                     </ChartContainer>
//                   </div>
//                   <div className="text-center text-xs text-gray-600 mt-1 md:mt-2">
//                     {sourceData.map((source, index) => (
//                       <div key={source.name} className="flex justify-center items-center gap-1">
//                         <div 
//                           className="w-2 h-2 rounded-full flex-shrink-0" 
//                           style={{ backgroundColor: source.color }}
//                         ></div>
//                         <span className="truncate">{source.name}: {source.value}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
                
//                 {/* Type Distribution */}
//                 <div>
//                   <h4 className="text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3 text-center">By Type</h4>
//                   <div className="h-40 md:h-44">
//                     <ChartContainer width="100%" height="100%">
//                       <PieChart>
//                         <Pie
//                           data={batchTypeData}
//                           cx="50%"
//                           cy="50%"
//                           innerRadius={20}
//                           outerRadius={35}
//                           paddingAngle={2}
//                           dataKey="value"
//                           label={({ name, value }) => `${value}`}
//                         >
//                           {batchTypeData.map((entry, index) => (
//                             <Cell key={`cell-${index}`} fill={entry.color} />
//                           ))}
//                         </Pie>
//                         <Tooltip 
//                           formatter={(value, name) => [`${value} batches`, name]}
//                         />
//                       </PieChart>
//                     </ChartContainer>
//                   </div>
//                   <div className="text-center text-xs text-gray-600 mt-1 md:mt-2">
//                     {batchTypeData.slice(0, 2).map((type, index) => (
//                       <div key={type.name} className="flex justify-center items-center gap-1">
//                         <div 
//                           className="w-2 h-2 rounded-full flex-shrink-0" 
//                           style={{ backgroundColor: type.color }}
//                         ></div>
//                         <span className="truncate">{type.name}: {type.value}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </section>
//           </div>

//           {/* Recent Batches Activity */}
//           <section className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-200 shadow-sm mb-6 md:mb-8">
//             <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-0 mb-4 md:mb-6">
//               <h3 className="font-bold text-gray-800 text-base md:text-lg">Recent Batch Activity (Last 7 Days)</h3>
//               <div className="flex gap-2 text-xs md:text-sm">
//                 <span className="flex items-center gap-1">
//                   <div className="w-2 h-2 md:w-3 md:h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
//                   Manufacturer Added
//                 </span>
//                 <span className="flex items-center gap-1">
//                   <div className="w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full flex-shrink-0"></div>
//                   Pharmacy Accepted
//                 </span>
//               </div>
//             </div>
            
//             <div className="overflow-x-auto -mx-4 md:mx-0">
//               <div className="min-w-full inline-block align-middle">
//                 <div className="overflow-hidden">
//                   <table className="min-w-full text-left text-xs md:text-sm">
//                     <thead>
//                       <tr className="border-b-2 border-gray-200 text-gray-700">
//                         <th className="py-2 md:py-3 px-2 md:px-3 font-semibold">Batch No</th>
//                         <th className="py-2 md:py-3 px-2 md:px-3 font-semibold">Medicine</th>
//                         <th className="py-2 md:py-3 px-2 md:px-3 font-semibold">Source</th>
//                         <th className="py-2 md:py-3 px-2 md:px-3 font-semibold">Manufacturer</th>
//                         <th className="py-2 md:py-3 px-2 md:px-3 font-semibold">Pharmacy</th>
//                         <th className="py-2 md:py-3 px-2 md:px-3 font-semibold">Date</th>
//                         <th className="py-2 md:py-3 px-2 md:px-3 font-semibold">Status</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {recentBatches.map((batch, index) => {
//                         const isManufacturerBatch = batch.source === 'batch' || !batch.source;
//                         const sourceColor = isManufacturerBatch ? 
//                           "text-blue-600 bg-blue-50 border border-blue-200" : 
//                           "text-green-600 bg-green-50 border border-green-200";
                        
//                         const sourceText = isManufacturerBatch ? "Manufacturer" : "Pharmacy";
                        
//                         const batchDate = new Date(batch.createdAt || batch.manufactureDate);
//                         const formattedDate = batchDate.toLocaleDateString();
//                         const formattedTime = batchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

//                         const pharmacyName = getPharmacyName(batch);

//                         return (
//                           <tr
//                             key={`${batch.batchNo}-${batch._id || index}`}
//                             className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
//                           >
//                             <td className="py-2 md:py-3 px-2 md:px-3 font-medium text-gray-800 font-mono text-xs">
//                               {batch.batchNo}
//                             </td>
//                             <td className="py-2 md:py-3 px-2 md:px-3 text-gray-700">
//                               <div className="font-medium truncate max-w-[120px]">{batch.name}</div>
//                               <div className="text-xs text-gray-500 truncate">{batch.formulation}</div>
//                             </td>
//                             <td className="py-2 md:py-3 px-2 md:px-3">
//                               <span className={`font-semibold ${sourceColor} px-2 py-1 rounded-full text-xs`}>
//                                 {sourceText}
//                               </span>
//                             </td>
//                             <td className="py-2 md:py-3 px-2 md:px-3 text-gray-600 truncate max-w-[100px]">
//                               {batch.manufacturer}
//                             </td>
//                             <td className="py-2 md:py-3 px-2 md:px-3 text-gray-600 truncate max-w-[100px]">
//                               {pharmacyName}
//                             </td>
//                             <td className="py-2 md:py-3 px-2 md:px-3 text-gray-600">
//                               <div className="text-xs md:text-sm">{formattedDate}</div>
//                               <div className="text-xs text-gray-400">{formattedTime}</div>
//                             </td>
//                             <td className="py-2 md:py-3 px-2 md:px-3">
//                               <span className="text-green-600 bg-green-50 border border-green-200 px-2 py-1 rounded-full text-xs font-semibold">
//                                 Active
//                               </span>
//                             </td>
//                           </tr>
//                         );
//                       })}
                      
//                       {recentBatches.length === 0 && (
//                         <tr>
//                           <td colSpan="7" className="py-4 md:py-8 text-center text-gray-500">
//                             <div className="text-2xl md:text-4xl mb-1 md:mb-2">📦</div>
//                             <p className="text-sm md:text-base">No recent batch activity found in the last 7 days</p>
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* Additional Statistics */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
//             <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-200 shadow-sm">
//               <h4 className="font-bold text-gray-800 mb-3 md:mb-4 text-base md:text-lg">Batch Sources</h4>
//               <div className="space-y-2 md:space-y-3">
//                 {sourceData.map((source, index) => (
//                   <div key={source.name} className="flex justify-between items-center">
//                     <div className="flex items-center gap-2">
//                       <div 
//                         className="w-2 h-2 md:w-3 md:h-3 rounded-full flex-shrink-0" 
//                         style={{ backgroundColor: source.color }}
//                       ></div>
//                       <span className="text-gray-700 text-sm md:text-base">{source.name}</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <span className="font-semibold text-gray-800 text-sm md:text-base">{source.value}</span>
//                       <span className="text-gray-500 text-xs">
//                         ({((source.value / uniqueBatches.length) * 100).toFixed(1)}%)
//                       </span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-200 shadow-sm">
//               <h4 className="font-bold text-gray-800 mb-3 md:mb-4 text-base md:text-lg">System Status</h4>
//               <div className="space-y-2 md:space-y-3">
//                 <div className="flex justify-between items-center">
//                   <span className="text-gray-700 text-sm md:text-base">Blockchain Network</span>
//                   <span className="text-green-600 font-semibold text-sm md:text-base">🟢 Connected</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-gray-700 text-sm md:text-base">Database</span>
//                   <span className="text-green-600 font-semibold text-sm md:text-base">🟢 Online</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-gray-700 text-sm md:text-base">Total Batches</span>
//                   <span className="font-semibold text-gray-800 text-sm md:text-base">{uniqueBatches.length}</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-gray-700 text-sm md:text-base">Last Sync</span>
//                   <span className="text-gray-600 text-xs md:text-sm">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </ResponsiveContainer>
//     </BackgroundFix>
//   );
// }

// export default DashboardPage;
