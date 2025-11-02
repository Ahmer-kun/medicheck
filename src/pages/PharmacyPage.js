import React, { useState } from "react";
import BackgroundFix from "../components/BackgroundFix";
import BlockchainVisualization from "../components/BlockchainVisualization";
import ProtectedRoute from "../components/ProtectedRoute";
import { PHARMACY_COMPANIES } from "../data/constants";

function PharmacyPage({ batches, onAccept, metamask, user, theme }) {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showCompanyDetail, setShowCompanyDetail] = useState(false);

  const filteredBatches = (batches || []).filter(batch => {
    const name = (batch?.name ?? "").toString().toLowerCase();
    const number = (batch?.batchNo ?? "").toString().toLowerCase();
    const search = (searchTerm ?? "").toLowerCase();

    const matchesSearch = name.includes(search) || number.includes(search);

    const status = (batch?.status ?? "").toLowerCase();

    if (filter === "all") return matchesSearch;
    if (filter === "active") return matchesSearch && status === "active";
    if (filter === "expired") return matchesSearch && status === "expired";
    return matchesSearch;
  });

  const handleReceive = async (batchNo) => {
    if (!metamask.isConnected) {
      alert("Please connect MetaMask to receive batches on blockchain.");
      return;
    }

    const success = await onAccept(batchNo);
    if (success) {
      alert(`✅ Received batch: ${batchNo} on blockchain!`);
    } else {
      alert("Failed to accept batch. Please try again.");
    }
  };

  const handleCompanyClick = (company) => {
    setSelectedCompany(company);
    setShowCompanyDetail(true);
  };

  const CompanyDetailModal = () => {
    if (!selectedCompany) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{selectedCompany.name}</h2>
              <p className="text-gray-600">{selectedCompany.location}</p>
            </div>
            <button
              onClick={() => setShowCompanyDetail(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Company Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="font-semibold text-gray-800 mb-3">Company Details</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Manager:</strong> {selectedCompany.manager}</div>
                <div><strong>Email:</strong> {selectedCompany.contact.email}</div>
                <div><strong>Phone:</strong> {selectedCompany.contact.phone}</div>
                <div><strong>Rating:</strong> ⭐ {selectedCompany.rating}/5</div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="font-semibold text-gray-800 mb-3">Statistics</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="text-center p-2 bg-blue-50 rounded-lg">
                  <div className="font-bold text-blue-600">{selectedCompany.stats.totalBatches}</div>
                  <div className="text-gray-600">Total</div>
                </div>
                <div className="text-center p-2 bg-green-50 rounded-lg">
                  <div className="font-bold text-green-600">{selectedCompany.stats.activeBatches}</div>
                  <div className="text-gray-600">Active</div>
                </div>
                <div className="text-center p-2 bg-red-50 rounded-lg">
                  <div className="font-bold text-red-600">{selectedCompany.stats.expiredBatches}</div>
                  <div className="text-gray-600">Expired</div>
                </div>
                <div className="text-center p-2 bg-purple-50 rounded-lg">
                  <div className="font-bold text-purple-600">{selectedCompany.stats.verifiedBatches}</div>
                  <div className="text-gray-600">Verified</div>
                </div>
              </div>
            </div>
          </div>

          {/* Company Batches */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Medicine Batches</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200 text-gray-700">
                    <th className="py-3 font-semibold text-left">Batch No</th>
                    <th className="py-3 font-semibold text-left">Medicine</th>
                    <th className="py-3 font-semibold text-left">Formulation</th>
                    <th className="py-3 font-semibold text-left">Expiry</th>
                    <th className="py-3 font-semibold text-left">Status</th>
                    <th className="py-3 font-semibold text-left">Blockchain</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCompany.batches.map((batch) => {
                    const isExpired = new Date(batch.expiry) < new Date("2025-10-19");
                    const statusColor = isExpired ? "text-red-600 bg-red-50" : "text-green-600 bg-green-50";
                    const blockchainColor = batch.blockchainVerified ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50";
                    
                    return (
                      <tr key={batch.batchNo} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 font-medium text-gray-800">{batch.batchNo}</td>
                        <td className="py-3 text-gray-700">{batch.name}</td>
                        <td className="py-3 text-gray-600">{batch.formulation}</td>
                        <td className="py-3 text-gray-600">{batch.expiry}</td>
                        <td className={`py-3 px-2 rounded text-xs font-semibold ${statusColor}`}>
                          {batch.status}
                        </td>
                        <td className={`py-3 px-2 rounded text-xs font-semibold ${blockchainColor}`}>
                          {batch.blockchainVerified ? "Verified" : "Not Verified"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={() => setShowCompanyDetail(false)}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute user={user} requiredRole="pharmacy">
      <BackgroundFix theme={theme}>
        <div className="p-6 min-h-screen">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Pharmacy Dashboard
            </h1>
            <p className="text-gray-600">
              Manage medicine batches and verify authenticity on blockchain
            </p>
          </div>

          {/* Blockchain Network Visualization */}
          <BlockchainVisualization />

          {/* Pharmacy Companies Section */}
          <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Partner Pharmacy Companies</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PHARMACY_COMPANIES.map(pharmacy => (
                <div 
                  key={pharmacy.id} 
                  className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:bg-gray-100 transition-all cursor-pointer hover:shadow-lg"
                  onClick={() => handleCompanyClick(pharmacy)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-800">{pharmacy.name}</h4>
                    <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded">
                      <span className="text-yellow-700 text-sm">⭐ {pharmacy.rating}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{pharmacy.location}</p>
                  <p className="text-blue-600 text-sm mb-2">Manager: {pharmacy.manager}</p>
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="text-green-600">Active: {pharmacy.stats.activeBatches}</span>
                    <span className="text-red-600">Expired: {pharmacy.stats.expiredBatches}</span>
                  </div>
                  <div className="text-center text-gray-700 text-sm bg-blue-100 rounded py-1">
                    Total: {pharmacy.stats.totalBatches} batches
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Rest of the code remains same for batches table */}
          {/* ... */}

          {/* Company Detail Modal */}
          {showCompanyDetail && <CompanyDetailModal />}
        </div>
      </BackgroundFix>
    </ProtectedRoute>
  );
}

export default PharmacyPage;