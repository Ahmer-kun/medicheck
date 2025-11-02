import React, { useState } from "react";
import BackgroundFix from "../components/BackgroundFix";
import BlockchainVisualization from "../components/BlockchainVisualization";
import ProtectedRoute from "../components/ProtectedRoute";

function AdminPage({ metamask, user, theme }) {
  const [users, setUsers] = useState([
    { id: 1, username: "admin", role: "Administrator" },
    { id: 2, username: "pharma01", role: "Pharmacist" },
    { id: 3, username: "qc_officer", role: "Quality Control" },
  ]);

  const [recallList, setRecallList] = useState([
    { id: 1, batchNo: "BCH102", reason: "Defective packaging", date: "2025-10-17" },
    { id: 2, batchNo: "BCH099", reason: "Expired medicine", date: "2025-10-14" },
  ]);

  const [logs, setLogs] = useState([
    { id: 1, message: "User pharma01 Verified 10 medicines", time: "10:05 AM" },
    { id: 2, message: "Batch BCH099 marked as Expired", time: "09:40 AM" },
    { id: 3, message: "Admin added new batch BCH120", time: "09:15 AM" },
  ]);

  const handleRecallRemove = (id) => {
    setRecallList(recallList.filter((r) => r.id !== id));
    setLogs([
      ...logs,
      {
        id: Date.now(),
        message: `Batch ${id} recall entry removed${metamask.isConnected ? ' on blockchain' : ''}`,
        time: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const handleRoleChange = (id, newRole) => {
    const updated = users.map((u) =>
      u.id === id ? { ...u, role: newRole } : u
    );
    setUsers(updated);
    setLogs([
      ...logs,
      {
        id: Date.now(),
        message: `User ${id} role updated to ${newRole}${metamask.isConnected ? ' on blockchain' : ''}`,
        time: new Date().toLocaleTimeString(),
      },
    ]);
  };

  return (
    <ProtectedRoute user={user} requiredRole="admin">
      <BackgroundFix theme={theme}>
        <div className="p-6 min-h-screen">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Admin Panel
            </h1>
            <p className="text-gray-600">
              Manage system users, batches, and blockchain network
            </p>
          </div>

          {/* Blockchain Network Visualization */}
          <BlockchainVisualization />

          {/* User Management */}
          <section className="bg-white p-6 rounded-2xl mb-6 border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-4">User Role Management</h3>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200 text-gray-700">
                  <th className="py-4 font-semibold text-left">Username</th>
                  <th className="py-4 font-semibold text-left">Current Role</th>
                  <th className="py-4 font-semibold text-left">Change Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 font-medium text-gray-800">{u.username}</td>
                    <td className="py-4 text-blue-600 font-semibold">{u.role}</td>
                    <td className="py-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="bg-gray-50 border-2 border-gray-200 rounded-lg px-3 py-2 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                      >
                        <option className="bg-white">Administrator</option>
                        <option className="bg-white">Pharmacist</option>
                        <option className="bg-white">Quality Control</option>
                        <option className="bg-white">Viewer</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* System Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recall Management */}
            <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Recall Management</h3>
              {recallList.length === 0 ? (
                <p className="text-gray-500 italic">No recalls pending.</p>
              ) : (
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-200 text-gray-700">
                      <th className="py-4 font-semibold text-left">Batch No</th>
                      <th className="py-4 font-semibold text-left">Reason</th>
                      <th className="py-4 font-semibold text-left">Date</th>
                      <th className="py-4 font-semibold text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recallList.map((r) => (
                      <tr
                        key={r.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 font-medium text-gray-800">{r.batchNo}</td>
                        <td className="py-4 text-gray-600">{r.reason}</td>
                        <td className="py-4 text-gray-600">{r.date}</td>
                        <td className="py-4">
                          <button
                            onClick={() => handleRecallRemove(r.id)}
                            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-all transform hover:scale-105 shadow border border-red-500"
                          >
                            Remove{metamask.isConnected ? ' from Chain' : ''}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            {/* System Activity Logs */}
            <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-4">System Activity Logs</h3>
              <div className="max-h-60 overflow-y-auto space-y-3">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 border-2 border-gray-100 rounded-xl bg-gray-50 flex justify-between items-center hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-gray-700 font-medium">{log.message}</span>
                    <span className="text-gray-500 text-sm bg-white px-3 py-1 rounded-full border border-gray-200">
                      {log.time}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </BackgroundFix>
    </ProtectedRoute>
  );
}

export default AdminPage;