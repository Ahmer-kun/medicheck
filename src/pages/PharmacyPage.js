import React, { useState, useEffect } from 'react';
import ProtectedRoute from "../components/ProtectedRoute";
import { api } from "../utils/api";

const PharmacyPage = ({ batches, onAccept, metamask, user, theme, onRefresh }) => {
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyBatchNo, setVerifyBatchNo] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [pharmacyCompanies, setPharmacyCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    batchNo: '',
    medicineName: '',
    manufactureDate: '',
    expiryDate: '',
    formulation: '',
    quantity: '',
    manufacturer: '',
    status: 'Active',
    pharmacyCompanyId: ''
  });

  // Fetch pharmacy companies and medicines
  useEffect(() => {
    fetchPharmacyCompanies();
    fetchMedicines();
  }, []);

  // Check URL parameters for pre-selected company
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const companyId = urlParams.get('company');
    if (companyId) {
      setSelectedCompany(companyId);
      setFormData(prev => ({ ...prev, pharmacyCompanyId: companyId }));
    }
  }, []);

  const fetchPharmacyCompanies = async () => {
    try {
      const response = await api.get("/pharmacy-companies");
      if (response.success) {
        setPharmacyCompanies(response.data);
        console.log("✅ Loaded pharmacy companies:", response.data.length);
        
        // Auto-select first company if none selected
        if (response.data.length > 0 && !selectedCompany) {
          setSelectedCompany(response.data[0]._id);
          setFormData(prev => ({ ...prev, pharmacyCompanyId: response.data[0]._id }));
        }
      }
    } catch (error) {
      console.error("Error fetching pharmacy companies:", error);
    }
  };

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const response = await api.get("/pharmacy/medicines");
      if (response.success) {
        setMedicines(response.data);
        console.log("✅ Loaded pharmacy medicines:", response.data.length);
      }
    } catch (error) {
      console.error("Error fetching medicines:", error);
      setMedicines(batches || []);
    } finally {
      setLoading(false);
    }
  };

  // Validation functions for medicine form
  const validateField = (name, value) => {
    const errors = { ...formErrors };

    switch (name) {
      case 'name':
        if (!value.trim()) {
          errors.name = 'Medicine name is required';
        } else if (value.trim().length < 2) {
          errors.name = 'Medicine name must be at least 2 characters';
        } else {
          delete errors.name;
        }
        break;

      case 'batchNo':
        if (!value.trim()) {
          errors.batchNo = 'Batch number is required';
        } else if (!/^[A-Za-z0-9\-_]+$/.test(value.trim())) {
          errors.batchNo = 'Batch number can only contain letters, numbers, hyphens, and underscores';
        } else if (value.trim().length < 3) {
          errors.batchNo = 'Batch number must be at least 3 characters';
        } else {
          delete errors.batchNo;
        }
        break;

      case 'medicineName':
        if (!value.trim()) {
          errors.medicineName = 'Scientific name is required';
        } else if (value.trim().length < 2) {
          errors.medicineName = 'Scientific name must be at least 2 characters';
        } else if (!/^[A-Za-z\s]+$/.test(value.trim())) {
          errors.medicineName = 'Scientific name can only contain letters and spaces';
        } else {
          delete errors.medicineName;
        }
        break;

      case 'manufacturer':
        if (!value.trim()) {
          errors.manufacturer = 'Manufacturer is required';
        } else if (value.trim().length < 2) {
          errors.manufacturer = 'Manufacturer must be at least 2 characters';
        } else {
          delete errors.manufacturer;
        }
        break;

      case 'manufactureDate':
        if (!value.trim()) {
          errors.manufactureDate = 'Manufacture date is required';
        } else if (new Date(value) > new Date()) {
          errors.manufactureDate = 'Manufacture date cannot be in the future';
        } else {
          delete errors.manufactureDate;
        }
        break;

      case 'expiryDate':
        if (!value.trim()) {
          errors.expiryDate = 'Expiry date is required';
        } else if (new Date(value) <= new Date()) {
          errors.expiryDate = 'Expiry date must be in the future';
        } else if (formData.manufactureDate && new Date(value) <= new Date(formData.manufactureDate)) {
          errors.expiryDate = 'Expiry date must be after manufacture date';
        } else {
          delete errors.expiryDate;
        }
        break;

      case 'quantity':
        if (!value.trim()) {
          errors.quantity = 'Quantity is required';
        } else if (isNaN(value) || parseInt(value) <= 0) {
          errors.quantity = 'Quantity must be a positive number';
        } else if (parseInt(value) > 1000000) {
          errors.quantity = 'Quantity cannot exceed 1,000,000';
        } else {
          delete errors.quantity;
        }
        break;

      case 'pharmacyCompanyId':
        if (!value.trim()) {
          errors.pharmacyCompanyId = 'Pharmacy company is required';
        } else {
          delete errors.pharmacyCompanyId;
        }
        break;

      default:
        break;
    }

    setFormErrors(errors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'pharmacyCompanyId') {
      setSelectedCompany(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    validateField(name, value);

    // Auto-fill medicineName if empty when name is filled
    if (name === 'name' && !formData.medicineName) {
      const scientificName = value.split(' ')[0];
      setFormData(prev => ({
        ...prev,
        medicineName: scientificName
      }));
      validateField('medicineName', scientificName);
    }
  };

  // ADD THIS FUNCTION - Delete Individual Medicine
  const handleDeleteMedicine = async (medicineId, medicineName) => {
    if (!window.confirm(`Are you sure you want to delete "${medicineName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleting(true);
      console.log(`🗑️ Deleting medicine: ${medicineName}`);
      
      const response = await api.delete(`/pharmacy/medicines/${medicineId}`);
      
      if (response.success) {
        await fetchMedicines();
        if (onRefresh) await onRefresh();
        alert(`✅ Medicine "${medicineName}" deleted successfully!`);
      } else {
        throw new Error(response.message || 'Failed to delete medicine');
      }
    } catch (error) {
      console.error("Error deleting medicine:", error);
      alert(`❌ Failed to delete medicine: ${error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const getMedicinesForSelectedCompany = () => {
    if (!selectedCompany) return medicines;
    return medicines.filter(medicine => medicine.pharmacyCompany?._id === selectedCompany);
  };

  const getSelectedCompanyName = () => {
    const company = pharmacyCompanies.find(c => c._id === selectedCompany);
    return company ? company.name : 'All Pharmacies';
  };

  const handleAcceptOnBlockchain = async (medicine) => {
    try {
      console.log('Accepting on blockchain:', medicine.batchNo);
      
      const response = await api.put(`/pharmacy/medicines/${medicine._id}`, {
        blockchainVerified: true,
        status: 'At Pharmacy'
      });
      
      if (response.success) {
        await fetchMedicines();
        if (onRefresh) await onRefresh();
        alert(`✅ Batch ${medicine.batchNo} accepted on blockchain successfully!`);
      }
    } catch (error) {
      console.error("Error accepting batch:", error);
      alert(`Failed to accept batch: ${error.message}`);
    }
  };

  const handleVerifyMedicine = async () => {
    if (!verifyBatchNo.trim()) {
      alert('Please enter a batch number');
      return;
    }

    try {
      setVerifying(true);
      const response = await api.get(`/batches/verify/${verifyBatchNo}`);
      
      if (response.exists) {
        if (response.authentic) {
          alert(`✅ ${response.message}\nMedicine: ${response.name}\nBatch: ${response.batchNo}\nStatus: ${response.status}\nPharmacy: ${response.pharmacy}`);
        } else {
          alert(`❌ ${response.message}\nMedicine: ${response.name}\nBatch: ${response.batchNo}`);
        }
      } else {
        alert('❌ Medicine not found in system');
      }
    } catch (error) {
      console.error("Verification error:", error);
      alert('Error verifying medicine. Please try again.');
    } finally {
      setVerifying(false);
      setShowVerifyModal(false);
      setVerifyBatchNo('');
    }
  };

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    
    // Validate all required fields before submission
    const requiredFields = [
      'name', 'batchNo', 'medicineName', 'manufacturer', 
      'manufactureDate', 'expiryDate', 'formulation', 'quantity', 'pharmacyCompanyId'
    ];

    const newErrors = {};
    requiredFields.forEach(field => {
      const value = formData[field];
      if (!value || !value.toString().trim()) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      alert('Please fill in all required fields correctly.');
      return;
    }

    if (Object.keys(formErrors).length > 0) {
      alert('Please fix the validation errors before submitting.');
      return;
    }

    try {
      setLoading(true);
      
      const medicineData = {
        ...formData,
        quantity: parseInt(formData.quantity)
      };

      console.log("📤 Sending medicine data:", medicineData);

      const response = await api.post("/pharmacy/medicines", medicineData);
      
      if (response.success) {
        await fetchMedicines();
        if (onRefresh) await onRefresh();
        
        resetForm();
        setShowAddForm(false);
        setFormErrors({});
        alert('✅ Medicine added successfully!');
      }
    } catch (error) {
      console.error("Error adding medicine:", error);
      alert(`❌ Failed to add medicine: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      batchNo: '',
      medicineName: '',
      manufactureDate: '',
      expiryDate: '',
      formulation: '',
      quantity: '',
      manufacturer: '',
      status: 'Active',
      pharmacyCompanyId: selectedCompany
    });
    setFormErrors({});
  };

  const displayedMedicines = getMedicinesForSelectedCompany();

  return (
    <ProtectedRoute user={user} requiredRole="pharmacy">
      <div className="p-4 md:p-6 max-w-full overflow-x-hidden">
        {/* Compact Header */}
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">Medicine Management</h1>
          <p className="text-gray-600 text-sm">Add and manage medicines for pharmacy companies</p>
        </div>

        {/* Pharmacy Company Selection */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h3 className="text-md font-semibold text-gray-800">Select Pharmacy Company</h3>
              <p className="text-gray-600 text-sm">Choose which pharmacy to manage medicines for</p>
            </div>
            
            <div className="flex gap-3">
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[180px] text-sm"
              >
                <option value="">All Pharmacies</option>
                {pharmacyCompanies.map(company => (
                  <option key={company._id} value={company._id}>
                    {company.name}
                  </option>
                ))}
              </select>
              
              <button
                onClick={() => window.location.href = '/pharmacy-dashboard'}
                className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-lg font-semibold transition-colors text-sm"
              >
                Manage Companies
              </button>
            </div>
          </div>
        </div>

        {/* Compact Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Total Medicines</h3>
            <p className="text-xl font-bold text-gray-800">{displayedMedicines.length}</p>
            <p className="text-xs text-gray-500 mt-1">{getSelectedCompanyName()}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Active</h3>
            <p className="text-xl font-bold text-gray-800">
              {displayedMedicines.filter(m => m.status === 'Active').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Verified</h3>
            <p className="text-xl font-bold text-gray-800">
              {displayedMedicines.filter(m => m.blockchainVerified).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Expired</h3>
            <p className="text-xl font-bold text-gray-800">
              {displayedMedicines.filter(m => m.status === 'Expired').length}
            </p>
          </div>
        </div>

        {/* Compact Action Buttons - WITHOUT DELETE ALL BUTTON */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setShowAddForm(true)}
            disabled={!selectedCompany}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ➕ Add Medicine
          </button>
          <button
            onClick={() => setShowVerifyModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 text-sm"
          >
            🔍 Verify
          </button>
          <button
            onClick={fetchMedicines}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 text-sm"
          >
            🔄 Refresh
          </button>
        </div>

        {!selectedCompany && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-yellow-600">⚠️</span>
              <div>
                <p className="font-semibold text-yellow-800 text-sm">No Pharmacy Selected</p>
                <p className="text-yellow-700 text-xs">Select a pharmacy company to add medicines.</p>
              </div>
            </div>
          </div>
        )}

        {/* Add Medicine Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-4 md:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg md:text-xl font-bold text-gray-800">Add New Medicine</h3>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleAddMedicine} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Pharmacy Selection */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Pharmacy Company *
                  </label>
                  <select
                    name="pharmacyCompanyId"
                    value={formData.pharmacyCompanyId}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                      formErrors.pharmacyCompanyId ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Select Pharmacy Company</option>
                    {pharmacyCompanies.map(company => (
                      <option key={company._id} value={company._id}>
                        {company.name} - {company.licenseNumber}
                      </option>
                    ))}
                  </select>
                  {formErrors.pharmacyCompanyId && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.pharmacyCompanyId}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Medicine Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                      formErrors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Paracetamol 500mg"
                    required
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Batch Number *
                  </label>
                  <input
                    type="text"
                    name="batchNo"
                    value={formData.batchNo}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                      formErrors.batchNo ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., PHARM-2024-001"
                    required
                  />
                  {formErrors.batchNo && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.batchNo}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Scientific Name *
                  </label>
                  <input
                    type="text"
                    name="medicineName"
                    value={formData.medicineName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                      formErrors.medicineName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Paracetamol"
                    required
                  />
                  {formErrors.medicineName && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.medicineName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Manufacturer *
                  </label>
                  <input
                    type="text"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                      formErrors.manufacturer ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., PharmaCorp Ltd."
                    required
                  />
                  {formErrors.manufacturer && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.manufacturer}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Manufacture Date *
                  </label>
                  <input
                    type="date"
                    name="manufactureDate"
                    value={formData.manufactureDate}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                      formErrors.manufactureDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  />
                  {formErrors.manufactureDate && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.manufactureDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                      formErrors.expiryDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  />
                  {formErrors.expiryDate && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.expiryDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Formulation *
                  </label>
                  <select
                    name="formulation"
                    value={formData.formulation}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  >
                    <option value="">Select Formulation</option>
                    <option value="Tablets">Tablets</option>
                    <option value="Capsules">Capsules</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Injection">Injection</option>
                    <option value="Ointment">Ointment</option>
                    <option value="Inhaler">Inhaler</option>
                    <option value="Drops">Drops</option>
                    <option value="Cream">Cream</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                      formErrors.quantity ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 1000"
                    min="1"
                    max="1000000"
                    required
                  />
                  {formErrors.quantity && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.quantity}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="Active">Active</option>
                    <option value="In Transit">In Transit</option>
                    <option value="At Pharmacy">At Pharmacy</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>

                <div className="md:col-span-2 flex gap-2 pt-4">
                  <button
                    type="submit"
                    disabled={loading || Object.keys(formErrors).length > 0}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                  >
                    {loading ? (
                      <>
                        <div className="loading-spinner-small"></div>
                        Adding...
                      </>
                    ) : (
                      'Add Medicine'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg font-semibold transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Compact Medicines Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Medicines</h2>
                <p className="text-gray-600 text-sm">
                  {selectedCompany ? `Showing medicines for ${getSelectedCompanyName()}` : 'Showing all medicines across all pharmacies'}
                </p>
              </div>
              <div className="mt-1 md:mt-0 text-xs text-gray-500">
                {displayedMedicines.length} medicines found
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="p-6 text-center">
              <div className="loading-spinner mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">Loading medicines...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
                    {!selectedCompany && (
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pharmacy</th>
                    )}
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch No</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manufacturer</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blockchain</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayedMedicines.map((medicine) => {
                    const isExpired = new Date(medicine.expiryDate) < new Date();
                    const statusColor = isExpired ? 'bg-red-100 text-red-800' :
                      medicine.status === 'Active' ? 'bg-green-100 text-green-800' :
                      medicine.status === 'In Transit' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800';
                    
                    const blockchainColor = medicine.blockchainVerified ? 
                      'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

                    return (
                      <tr key={medicine._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900 text-sm">{medicine.name}</div>
                          <div className="text-gray-500 text-xs">{medicine.medicineName}</div>
                          <div className="text-gray-400 text-xs">{medicine.formulation}</div>
                        </td>
                        
                        {!selectedCompany && (
                          <td className="px-4 py-3">
                            <div className="text-gray-900 text-sm">{medicine.pharmacyName}</div>
                            <div className="text-gray-500 text-xs">
                              {medicine.pharmacyCompany?.licenseNumber}
                            </div>
                          </td>
                        )}
                        
                        <td className="px-4 py-3">
                          <div className="text-gray-900 font-mono text-xs">{medicine.batchNo}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-gray-900 text-sm">{medicine.manufacturer}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className={`font-medium text-sm ${
                            isExpired ? 'text-red-600' : 'text-gray-900'
                          }`}>
                            {new Date(medicine.expiryDate).toLocaleDateString()}
                            {isExpired && <div className="text-red-500 text-xs">Expired</div>}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor}`}>
                            {medicine.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${blockchainColor}`}>
                            {medicine.blockchainVerified ? 'Verified' : 'Not Verified'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            {!medicine.blockchainVerified && (
                              <button
                                onClick={() => handleAcceptOnBlockchain(medicine)}
                                className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs transition-colors"
                              >
                                Verify
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setVerifyBatchNo(medicine.batchNo);
                                setShowVerifyModal(true);
                              }}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs transition-colors"
                            >
                              Check
                            </button>
                            {/* INDIVIDUAL DELETE BUTTON FOR EACH MEDICINE */}
                            <button
                              onClick={() => handleDeleteMedicine(medicine._id, medicine.name)}
                              className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition-colors"
                              title={`Delete ${medicine.name}`}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {displayedMedicines.length === 0 && (
                    <tr>
                      <td colSpan={selectedCompany ? "7" : "8"} className="px-4 py-6 text-center text-gray-500 text-sm">
                        {selectedCompany 
                          ? `No medicines found for ${getSelectedCompanyName()}. Add your first medicine to get started.`
                          : 'No medicines found across all pharmacies.'
                        }
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Fixed Verify Medicine Modal */}
        {showVerifyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-auto shadow-2xl border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Verify Medicine</h3>
                <button
                  onClick={() => setShowVerifyModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Batch Number
                  </label>
                  <input
                    type="text"
                    value={verifyBatchNo}
                    onChange={(e) => setVerifyBatchNo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter batch number (e.g., PHARM-2024-001)"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleVerifyMedicine}
                    disabled={verifying || !verifyBatchNo.trim()}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {verifying ? (
                      <>
                        <div className="loading-spinner-small"></div>
                        Verifying...
                      </>
                    ) : (
                      'Verify Medicine'
                    )}
                  </button>
                  <button
                    onClick={() => setShowVerifyModal(false)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default PharmacyPage;





//  GOT RID OF DELETE ALL


// import React, { useState, useEffect } from 'react';
// import ProtectedRoute from "../components/ProtectedRoute";
// import { api } from "../utils/api";

// const PharmacyPage = ({ batches, onAccept, metamask, user, theme, onRefresh }) => {
//   const [showVerifyModal, setShowVerifyModal] = useState(false);
//   const [verifyBatchNo, setVerifyBatchNo] = useState('');
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [medicines, setMedicines] = useState([]);
//   const [pharmacyCompanies, setPharmacyCompanies] = useState([]);
//   const [selectedCompany, setSelectedCompany] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [verifying, setVerifying] = useState(false);
//   const [deleting, setDeleting] = useState(false);

//   const [formData, setFormData] = useState({
//     name: '',
//     batchNo: '',
//     medicineName: '',
//     manufactureDate: '',
//     expiryDate: '',
//     formulation: '',
//     quantity: '',
//     manufacturer: '',
//     status: 'Active',
//     pharmacyCompanyId: ''
//   });

//   // Fetch pharmacy companies and medicines
//   useEffect(() => {
//     fetchPharmacyCompanies();
//     fetchMedicines();
//   }, []);

//   // Check URL parameters for pre-selected company
//   useEffect(() => {
//     const urlParams = new URLSearchParams(window.location.search);
//     const companyId = urlParams.get('company');
//     if (companyId) {
//       setSelectedCompany(companyId);
//       setFormData(prev => ({ ...prev, pharmacyCompanyId: companyId }));
//     }
//   }, []);

//   const fetchPharmacyCompanies = async () => {
//     try {
//       const response = await api.get("/pharmacy-companies");
//       if (response.success) {
//         setPharmacyCompanies(response.data);
//         console.log("✅ Loaded pharmacy companies:", response.data.length);
        
//         // Auto-select first company if none selected
//         if (response.data.length > 0 && !selectedCompany) {
//           setSelectedCompany(response.data[0]._id);
//           setFormData(prev => ({ ...prev, pharmacyCompanyId: response.data[0]._id }));
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching pharmacy companies:", error);
//     }
//   };

//   const fetchMedicines = async () => {
//     try {
//       setLoading(true);
//       const response = await api.get("/pharmacy/medicines");
//       if (response.success) {
//         setMedicines(response.data);
//         console.log("✅ Loaded pharmacy medicines:", response.data.length);
//       }
//     } catch (error) {
//       console.error("Error fetching medicines:", error);
//       setMedicines(batches || []);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ADD THIS FUNCTION - Delete Individual Medicine
//   const handleDeleteMedicine = async (medicineId, medicineName) => {
//     if (!window.confirm(`Are you sure you want to delete "${medicineName}"? This action cannot be undone.`)) {
//       return;
//     }

//     try {
//       setDeleting(true);
//       console.log(`🗑️ Deleting medicine: ${medicineName}`);
      
//       const response = await api.delete(`/pharmacy/medicines/${medicineId}`);
      
//       if (response.success) {
//         await fetchMedicines();
//         if (onRefresh) await onRefresh();
//         alert(`✅ Medicine "${medicineName}" deleted successfully!`);
//       } else {
//         throw new Error(response.message || 'Failed to delete medicine');
//       }
//     } catch (error) {
//       console.error("Error deleting medicine:", error);
//       alert(`❌ Failed to delete medicine: ${error.message}`);
//     } finally {
//       setDeleting(false);
//     }
//   };

//   const getMedicinesForSelectedCompany = () => {
//     if (!selectedCompany) return medicines;
//     return medicines.filter(medicine => medicine.pharmacyCompany?._id === selectedCompany);
//   };

//   const getSelectedCompanyName = () => {
//     const company = pharmacyCompanies.find(c => c._id === selectedCompany);
//     return company ? company.name : 'All Pharmacies';
//   };

//   const handleAcceptOnBlockchain = async (medicine) => {
//     try {
//       console.log('Accepting on blockchain:', medicine.batchNo);
      
//       const response = await api.put(`/pharmacy/medicines/${medicine._id}`, {
//         blockchainVerified: true,
//         status: 'At Pharmacy'
//       });
      
//       if (response.success) {
//         await fetchMedicines();
//         if (onRefresh) await onRefresh();
//         alert(`✅ Batch ${medicine.batchNo} accepted on blockchain successfully!`);
//       }
//     } catch (error) {
//       console.error("Error accepting batch:", error);
//       alert(`Failed to accept batch: ${error.message}`);
//     }
//   };

//   const handleVerifyMedicine = async () => {
//     if (!verifyBatchNo.trim()) {
//       alert('Please enter a batch number');
//       return;
//     }

//     try {
//       setVerifying(true);
//       const response = await api.get(`/batches/verify/${verifyBatchNo}`);
      
//       if (response.exists) {
//         if (response.authentic) {
//           alert(`✅ ${response.message}\nMedicine: ${response.name}\nBatch: ${response.batchNo}\nStatus: ${response.status}\nPharmacy: ${response.pharmacy}`);
//         } else {
//           alert(`❌ ${response.message}\nMedicine: ${response.name}\nBatch: ${response.batchNo}`);
//         }
//       } else {
//         alert('❌ Medicine not found in system');
//       }
//     } catch (error) {
//       console.error("Verification error:", error);
//       alert('Error verifying medicine. Please try again.');
//     } finally {
//       setVerifying(false);
//       setShowVerifyModal(false);
//       setVerifyBatchNo('');
//     }
//   };

//   const handleAddMedicine = async (e) => {
//     e.preventDefault();
    
//     if (!formData.pharmacyCompanyId) {
//       alert('Please select a pharmacy company');
//       return;
//     }
    
//     try {
//       setLoading(true);
      
//       const medicineData = {
//         ...formData,
//         quantity: parseInt(formData.quantity)
//       };

//       console.log("📤 Sending medicine data:", medicineData);

//       const response = await api.post("/pharmacy/medicines", medicineData);
      
//       if (response.success) {
//         await fetchMedicines();
//         if (onRefresh) await onRefresh();
        
//         resetForm();
//         setShowAddForm(false);
//         alert('✅ Medicine added successfully!');
//       }
//     } catch (error) {
//       console.error("Error adding medicine:", error);
//       alert(`❌ Failed to add medicine: ${error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
    
//     if (name === 'pharmacyCompanyId') {
//       setSelectedCompany(value);
//     }
    
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));

//     // Auto-fill medicineName if empty when name is filled
//     if (name === 'name' && !formData.medicineName) {
//       setFormData(prev => ({
//         ...prev,
//         medicineName: value.split(' ')[0]
//       }));
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       name: '',
//       batchNo: '',
//       medicineName: '',
//       manufactureDate: '',
//       expiryDate: '',
//       formulation: '',
//       quantity: '',
//       manufacturer: '',
//       status: 'Active',
//       pharmacyCompanyId: selectedCompany
//     });
//   };

//   const displayedMedicines = getMedicinesForSelectedCompany();

//   return (
//     <ProtectedRoute user={user} requiredRole="pharmacy">
//       <div className="p-4 md:p-6 max-w-full overflow-x-hidden">
//         {/* Compact Header */}
//         <div className="mb-6">
//           <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">Medicine Management</h1>
//           <p className="text-gray-600 text-sm">Add and manage medicines for pharmacy companies</p>
//         </div>

//         {/* Pharmacy Company Selection */}
//         <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
//             <div>
//               <h3 className="text-md font-semibold text-gray-800">Select Pharmacy Company</h3>
//               <p className="text-gray-600 text-sm">Choose which pharmacy to manage medicines for</p>
//             </div>
            
//             <div className="flex gap-3">
//               <select
//                 value={selectedCompany}
//                 onChange={(e) => setSelectedCompany(e.target.value)}
//                 className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[180px] text-sm"
//               >
//                 <option value="">All Pharmacies</option>
//                 {pharmacyCompanies.map(company => (
//                   <option key={company._id} value={company._id}>
//                     {company.name}
//                   </option>
//                 ))}
//               </select>
              
//               <button
//                 onClick={() => window.location.href = '/pharmacy-dashboard'}
//                 className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-lg font-semibold transition-colors text-sm"
//               >
//                 Manage Companies
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Compact Stats Cards */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//           <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
//             <h3 className="text-sm font-semibold text-gray-700 mb-1">Total Medicines</h3>
//             <p className="text-xl font-bold text-gray-800">{displayedMedicines.length}</p>
//             <p className="text-xs text-gray-500 mt-1">{getSelectedCompanyName()}</p>
//           </div>
//           <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
//             <h3 className="text-sm font-semibold text-gray-700 mb-1">Active</h3>
//             <p className="text-xl font-bold text-gray-800">
//               {displayedMedicines.filter(m => m.status === 'Active').length}
//             </p>
//           </div>
//           <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
//             <h3 className="text-sm font-semibold text-gray-700 mb-1">Verified</h3>
//             <p className="text-xl font-bold text-gray-800">
//               {displayedMedicines.filter(m => m.blockchainVerified).length}
//             </p>
//           </div>
//           <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
//             <h3 className="text-sm font-semibold text-gray-700 mb-1">Expired</h3>
//             <p className="text-xl font-bold text-gray-800">
//               {displayedMedicines.filter(m => m.status === 'Expired').length}
//             </p>
//           </div>
//         </div>

//         {/* Compact Action Buttons - WITHOUT DELETE ALL BUTTON */}
//         <div className="flex flex-wrap gap-3 mb-6">
//           <button
//             onClick={() => setShowAddForm(true)}
//             disabled={!selectedCompany}
//             className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             ➕ Add Medicine
//           </button>
//           <button
//             onClick={() => setShowVerifyModal(true)}
//             className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 text-sm"
//           >
//             🔍 Verify
//           </button>
//           <button
//             onClick={fetchMedicines}
//             className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 text-sm"
//           >
//             🔄 Refresh
//           </button>
//         </div>

//         {!selectedCompany && (
//           <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
//             <div className="flex items-center gap-2">
//               <span className="text-yellow-600">⚠️</span>
//               <div>
//                 <p className="font-semibold text-yellow-800 text-sm">No Pharmacy Selected</p>
//                 <p className="text-yellow-700 text-xs">Select a pharmacy company to add medicines.</p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Add Medicine Form Modal */}
//         {showAddForm && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-xl p-4 md:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-lg md:text-xl font-bold text-gray-800">Add New Medicine</h3>
//                 <button
//                   onClick={() => {
//                     setShowAddForm(false);
//                     resetForm();
//                   }}
//                   className="text-gray-500 hover:text-gray-700 text-xl"
//                 >
//                   ×
//                 </button>
//               </div>
              
//               <form onSubmit={handleAddMedicine} className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                 {/* Pharmacy Selection */}
//                 <div className="md:col-span-2">
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Pharmacy Company *
//                   </label>
//                   <select
//                     name="pharmacyCompanyId"
//                     value={formData.pharmacyCompanyId}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                     required
//                   >
//                     <option value="">Select Pharmacy Company</option>
//                     {pharmacyCompanies.map(company => (
//                       <option key={company._id} value={company._id}>
//                         {company.name} - {company.licenseNumber}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Medicine Name *
//                   </label>
//                   <input
//                     type="text"
//                     name="name"
//                     value={formData.name}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                     placeholder="e.g., Paracetamol 500mg"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Batch Number *
//                   </label>
//                   <input
//                     type="text"
//                     name="batchNo"
//                     value={formData.batchNo}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                     placeholder="e.g., PHARM-2024-001"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Scientific Name *
//                   </label>
//                   <input
//                     type="text"
//                     name="medicineName"
//                     value={formData.medicineName}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                     placeholder="e.g., Paracetamol"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Manufacturer *
//                   </label>
//                   <input
//                     type="text"
//                     name="manufacturer"
//                     value={formData.manufacturer}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                     placeholder="e.g., PharmaCorp Ltd."
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Manufacture Date *
//                   </label>
//                   <input
//                     type="date"
//                     name="manufactureDate"
//                     value={formData.manufactureDate}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Expiry Date *
//                   </label>
//                   <input
//                     type="date"
//                     name="expiryDate"
//                     value={formData.expiryDate}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Formulation *
//                   </label>
//                   <select
//                     name="formulation"
//                     value={formData.formulation}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                     required
//                   >
//                     <option value="">Select Formulation</option>
//                     <option value="Tablets">Tablets</option>
//                     <option value="Capsules">Capsules</option>
//                     <option value="Syrup">Syrup</option>
//                     <option value="Injection">Injection</option>
//                     <option value="Ointment">Ointment</option>
//                     <option value="Inhaler">Inhaler</option>
//                     <option value="Drops">Drops</option>
//                     <option value="Cream">Cream</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Quantity *
//                   </label>
//                   <input
//                     type="number"
//                     name="quantity"
//                     value={formData.quantity}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                     placeholder="e.g., 1000"
//                     min="1"
//                     required
//                   />
//                 </div>

//                 <div className="md:col-span-2">
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Status
//                   </label>
//                   <select
//                     name="status"
//                     value={formData.status}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                   >
//                     <option value="Active">Active</option>
//                     <option value="In Transit">In Transit</option>
//                     <option value="At Pharmacy">At Pharmacy</option>
//                     <option value="Expired">Expired</option>
//                   </select>
//                 </div>

//                 <div className="md:col-span-2 flex gap-2 pt-4">
//                   <button
//                     type="submit"
//                     disabled={loading}
//                     className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
//                   >
//                     {loading ? (
//                       <>
//                         <div className="loading-spinner-small"></div>
//                         Adding...
//                       </>
//                     ) : (
//                       'Add Medicine'
//                     )}
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setShowAddForm(false);
//                       resetForm();
//                     }}
//                     className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg font-semibold transition-colors text-sm"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}

//         {/* Compact Medicines Table */}
//         <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//           <div className="px-4 py-3 border-b border-gray-200">
//             <div className="flex flex-col md:flex-row md:items-center md:justify-between">
//               <div>
//                 <h2 className="text-lg font-bold text-gray-800">Medicines</h2>
//                 <p className="text-gray-600 text-sm">
//                   {selectedCompany ? `Showing medicines for ${getSelectedCompanyName()}` : 'Showing all medicines across all pharmacies'}
//                 </p>
//               </div>
//               <div className="mt-1 md:mt-0 text-xs text-gray-500">
//                 {displayedMedicines.length} medicines found
//               </div>
//             </div>
//           </div>
          
//           {loading ? (
//             <div className="p-6 text-center">
//               <div className="loading-spinner mx-auto mb-2"></div>
//               <p className="text-gray-600 text-sm">Loading medicines...</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
//                     {!selectedCompany && (
//                       <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pharmacy</th>
//                     )}
//                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch No</th>
//                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manufacturer</th>
//                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
//                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blockchain</th>
//                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {displayedMedicines.map((medicine) => {
//                     const isExpired = new Date(medicine.expiryDate) < new Date();
//                     const statusColor = isExpired ? 'bg-red-100 text-red-800' :
//                       medicine.status === 'Active' ? 'bg-green-100 text-green-800' :
//                       medicine.status === 'In Transit' ? 'bg-yellow-100 text-yellow-800' :
//                       'bg-blue-100 text-blue-800';
                    
//                     const blockchainColor = medicine.blockchainVerified ? 
//                       'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

//                     return (
//                       <tr key={medicine._id} className="hover:bg-gray-50">
//                         <td className="px-4 py-3">
//                           <div className="font-medium text-gray-900 text-sm">{medicine.name}</div>
//                           <div className="text-gray-500 text-xs">{medicine.medicineName}</div>
//                           <div className="text-gray-400 text-xs">{medicine.formulation}</div>
//                         </td>
                        
//                         {!selectedCompany && (
//                           <td className="px-4 py-3">
//                             <div className="text-gray-900 text-sm">{medicine.pharmacyName}</div>
//                             <div className="text-gray-500 text-xs">
//                               {medicine.pharmacyCompany?.licenseNumber}
//                             </div>
//                           </td>
//                         )}
                        
//                         <td className="px-4 py-3">
//                           <div className="text-gray-900 font-mono text-xs">{medicine.batchNo}</div>
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className="text-gray-900 text-sm">{medicine.manufacturer}</div>
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className={`font-medium text-sm ${
//                             isExpired ? 'text-red-600' : 'text-gray-900'
//                           }`}>
//                             {new Date(medicine.expiryDate).toLocaleDateString()}
//                             {isExpired && <div className="text-red-500 text-xs">Expired</div>}
//                           </div>
//                         </td>
//                         <td className="px-4 py-3">
//                           <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor}`}>
//                             {medicine.status}
//                           </span>
//                         </td>
//                         <td className="px-4 py-3">
//                           <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${blockchainColor}`}>
//                             {medicine.blockchainVerified ? 'Verified' : 'Not Verified'}
//                           </span>
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className="flex gap-1">
//                             {!medicine.blockchainVerified && (
//                               <button
//                                 onClick={() => handleAcceptOnBlockchain(medicine)}
//                                 className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs transition-colors"
//                               >
//                                 Verify
//                               </button>
//                             )}
//                             <button
//                               onClick={() => {
//                                 setVerifyBatchNo(medicine.batchNo);
//                                 setShowVerifyModal(true);
//                               }}
//                               className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs transition-colors"
//                             >
//                               Check
//                             </button>
//                             {/* INDIVIDUAL DELETE BUTTON FOR EACH MEDICINE */}
//                             <button
//                               onClick={() => handleDeleteMedicine(medicine._id, medicine.name)}
//                               className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition-colors"
//                               title={`Delete ${medicine.name}`}
//                             >
//                               🗑️
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                   {displayedMedicines.length === 0 && (
//                     <tr>
//                       <td colSpan={selectedCompany ? "7" : "8"} className="px-4 py-6 text-center text-gray-500 text-sm">
//                         {selectedCompany 
//                           ? `No medicines found for ${getSelectedCompanyName()}. Add your first medicine to get started.`
//                           : 'No medicines found across all pharmacies.'
//                         }
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>

//         {/* Fixed Verify Medicine Modal */}
//         {showVerifyModal && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-xl p-6 w-full max-w-md mx-auto shadow-2xl border border-gray-200">
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-xl font-bold text-gray-800">Verify Medicine</h3>
//                 <button
//                   onClick={() => setShowVerifyModal(false)}
//                   className="text-gray-500 hover:text-gray-700 text-2xl"
//                 >
//                   ×
//                 </button>
//               </div>
              
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Batch Number
//                   </label>
//                   <input
//                     type="text"
//                     value={verifyBatchNo}
//                     onChange={(e) => setVerifyBatchNo(e.target.value)}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     placeholder="Enter batch number (e.g., PHARM-2024-001)"
//                   />
//                 </div>
//                 <div className="flex gap-3 pt-2">
//                   <button
//                     onClick={handleVerifyMedicine}
//                     disabled={verifying || !verifyBatchNo.trim()}
//                     className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
//                   >
//                     {verifying ? (
//                       <>
//                         <div className="loading-spinner-small"></div>
//                         Verifying...
//                       </>
//                     ) : (
//                       'Verify Medicine'
//                     )}
//                   </button>
//                   <button
//                     onClick={() => setShowVerifyModal(false)}
//                     className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg font-semibold transition-colors"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </ProtectedRoute>
//   );
// };

// export default PharmacyPage;









//      HAS DELETE ALL

// import React, { useState, useEffect } from 'react';
// import ProtectedRoute from "../components/ProtectedRoute";
// import { api } from "../utils/api";

// const PharmacyPage = ({ batches, onAccept, metamask, user, theme, onRefresh }) => {
//   const [showVerifyModal, setShowVerifyModal] = useState(false);
//   const [verifyBatchNo, setVerifyBatchNo] = useState('');
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [medicines, setMedicines] = useState([]);
//   const [pharmacyCompanies, setPharmacyCompanies] = useState([]);
//   const [selectedCompany, setSelectedCompany] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [verifying, setVerifying] = useState(false);
//   const [deleting, setDeleting] = useState(false);

//   const [formData, setFormData] = useState({
//     name: '',
//     batchNo: '',
//     medicineName: '',
//     manufactureDate: '',
//     expiryDate: '',
//     formulation: '',
//     quantity: '',
//     manufacturer: '',
//     status: 'Active',
//     pharmacyCompanyId: ''
//   });

//   // Fetch pharmacy companies and medicines
//   useEffect(() => {
//     fetchPharmacyCompanies();
//     fetchMedicines();
//   }, []);

//   // Check URL parameters for pre-selected company
//   useEffect(() => {
//     const urlParams = new URLSearchParams(window.location.search);
//     const companyId = urlParams.get('company');
//     if (companyId) {
//       setSelectedCompany(companyId);
//       setFormData(prev => ({ ...prev, pharmacyCompanyId: companyId }));
//     }
//   }, []);

//   const fetchPharmacyCompanies = async () => {
//     try {
//       const response = await api.get("/pharmacy-companies");
//       if (response.success) {
//         setPharmacyCompanies(response.data);
//         console.log("✅ Loaded pharmacy companies:", response.data.length);
        
//         // Auto-select first company if none selected
//         if (response.data.length > 0 && !selectedCompany) {
//           setSelectedCompany(response.data[0]._id);
//           setFormData(prev => ({ ...prev, pharmacyCompanyId: response.data[0]._id }));
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching pharmacy companies:", error);
//     }
//   };

//   const fetchMedicines = async () => {
//     try {
//       setLoading(true);
//       const response = await api.get("/pharmacy/medicines");
//       if (response.success) {
//         setMedicines(response.data);
//         console.log("✅ Loaded pharmacy medicines:", response.data.length);
//       }
//     } catch (error) {
//       console.error("Error fetching medicines:", error);
//       setMedicines(batches || []);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ADD THIS FUNCTION - Delete Medicine
//   const handleDeleteMedicine = async (medicineId, medicineName) => {
//     if (!window.confirm(`Are you sure you want to delete "${medicineName}"? This action cannot be undone.`)) {
//       return;
//     }

//     try {
//       setDeleting(true);
//       console.log(`🗑️ Deleting medicine: ${medicineName}`);
      
//       const response = await api.delete(`/pharmacy/medicines/${medicineId}`);
      
//       if (response.success) {
//         await fetchMedicines();
//         if (onRefresh) await onRefresh();
//         alert(`✅ Medicine "${medicineName}" deleted successfully!`);
//       } else {
//         throw new Error(response.message || 'Failed to delete medicine');
//       }
//     } catch (error) {
//       console.error("Error deleting medicine:", error);
//       alert(`❌ Failed to delete medicine: ${error.message}`);
//     } finally {
//       setDeleting(false);
//     }
//   };

//   const getMedicinesForSelectedCompany = () => {
//     if (!selectedCompany) return medicines;
//     return medicines.filter(medicine => medicine.pharmacyCompany?._id === selectedCompany);
//   };

//   const getSelectedCompanyName = () => {
//     const company = pharmacyCompanies.find(c => c._id === selectedCompany);
//     return company ? company.name : 'All Pharmacies';
//   };

//   const handleAcceptOnBlockchain = async (medicine) => {
//     try {
//       console.log('Accepting on blockchain:', medicine.batchNo);
      
//       const response = await api.put(`/pharmacy/medicines/${medicine._id}`, {
//         blockchainVerified: true,
//         status: 'At Pharmacy'
//       });
      
//       if (response.success) {
//         await fetchMedicines();
//         if (onRefresh) await onRefresh();
//         alert(`✅ Batch ${medicine.batchNo} accepted on blockchain successfully!`);
//       }
//     } catch (error) {
//       console.error("Error accepting batch:", error);
//       alert(`Failed to accept batch: ${error.message}`);
//     }
//   };

//   const handleVerifyMedicine = async () => {
//     if (!verifyBatchNo.trim()) {
//       alert('Please enter a batch number');
//       return;
//     }

//     try {
//       setVerifying(true);
//       const response = await api.get(`/batches/verify/${verifyBatchNo}`);
      
//       if (response.exists) {
//         if (response.authentic) {
//           alert(`✅ ${response.message}\nMedicine: ${response.name}\nBatch: ${response.batchNo}\nStatus: ${response.status}\nPharmacy: ${response.pharmacy}`);
//         } else {
//           alert(`❌ ${response.message}\nMedicine: ${response.name}\nBatch: ${response.batchNo}`);
//         }
//       } else {
//         alert('❌ Medicine not found in system');
//       }
//     } catch (error) {
//       console.error("Verification error:", error);
//       alert('Error verifying medicine. Please try again.');
//     } finally {
//       setVerifying(false);
//       setShowVerifyModal(false);
//       setVerifyBatchNo('');
//     }
//   };

//   const handleAddMedicine = async (e) => {
//     e.preventDefault();
    
//     if (!formData.pharmacyCompanyId) {
//       alert('Please select a pharmacy company');
//       return;
//     }
    
//     try {
//       setLoading(true);
      
//       const medicineData = {
//         ...formData,
//         quantity: parseInt(formData.quantity)
//       };

//       console.log("📤 Sending medicine data:", medicineData);

//       const response = await api.post("/pharmacy/medicines", medicineData);
      
//       if (response.success) {
//         await fetchMedicines();
//         if (onRefresh) await onRefresh();
        
//         resetForm();
//         setShowAddForm(false);
//         alert('✅ Medicine added successfully!');
//       }
//     } catch (error) {
//       console.error("Error adding medicine:", error);
//       alert(`❌ Failed to add medicine: ${error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
    
//     if (name === 'pharmacyCompanyId') {
//       setSelectedCompany(value);
//     }
    
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));

//     // Auto-fill medicineName if empty when name is filled
//     if (name === 'name' && !formData.medicineName) {
//       setFormData(prev => ({
//         ...prev,
//         medicineName: value.split(' ')[0]
//       }));
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       name: '',
//       batchNo: '',
//       medicineName: '',
//       manufactureDate: '',
//       expiryDate: '',
//       formulation: '',
//       quantity: '',
//       manufacturer: '',
//       status: 'Active',
//       pharmacyCompanyId: selectedCompany
//     });
//   };

//   const displayedMedicines = getMedicinesForSelectedCompany();

//   return (
//     <ProtectedRoute user={user} requiredRole="pharmacy">
//       <div className="p-4 md:p-6 max-w-full overflow-x-hidden">
//         {/* Compact Header */}
//         <div className="mb-6">
//           <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">Medicine Management</h1>
//           <p className="text-gray-600 text-sm">Add and manage medicines for pharmacy companies</p>
//         </div>

//         {/* Pharmacy Company Selection */}
//         <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
//             <div>
//               <h3 className="text-md font-semibold text-gray-800">Select Pharmacy Company</h3>
//               <p className="text-gray-600 text-sm">Choose which pharmacy to manage medicines for</p>
//             </div>
            
//             <div className="flex gap-3">
//               <select
//                 value={selectedCompany}
//                 onChange={(e) => setSelectedCompany(e.target.value)}
//                 className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[180px] text-sm"
//               >
//                 <option value="">All Pharmacies</option>
//                 {pharmacyCompanies.map(company => (
//                   <option key={company._id} value={company._id}>
//                     {company.name}
//                   </option>
//                 ))}
//               </select>
              
//               <button
//                 onClick={() => window.location.href = '/pharmacy-dashboard'}
//                 className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-lg font-semibold transition-colors text-sm"
//               >
//                 Manage Companies
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Compact Stats Cards */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//           <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
//             <h3 className="text-sm font-semibold text-gray-700 mb-1">Total Medicines</h3>
//             <p className="text-xl font-bold text-gray-800">{displayedMedicines.length}</p>
//             <p className="text-xs text-gray-500 mt-1">{getSelectedCompanyName()}</p>
//           </div>
//           <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
//             <h3 className="text-sm font-semibold text-gray-700 mb-1">Active</h3>
//             <p className="text-xl font-bold text-gray-800">
//               {displayedMedicines.filter(m => m.status === 'Active').length}
//             </p>
//           </div>
//           <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
//             <h3 className="text-sm font-semibold text-gray-700 mb-1">Verified</h3>
//             <p className="text-xl font-bold text-gray-800">
//               {displayedMedicines.filter(m => m.blockchainVerified).length}
//             </p>
//           </div>
//           <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
//             <h3 className="text-sm font-semibold text-gray-700 mb-1">Expired</h3>
//             <p className="text-xl font-bold text-gray-800">
//               {displayedMedicines.filter(m => m.status === 'Expired').length}
//             </p>
//           </div>
//         </div>

//         {/* Compact Action Buttons - WITH DELETE BUTTON */}
//         <div className="flex flex-wrap gap-3 mb-6">
//           <button
//             onClick={() => setShowAddForm(true)}
//             disabled={!selectedCompany}
//             className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             ➕ Add Medicine
//           </button>
//           <button
//             onClick={() => setShowVerifyModal(true)}
//             className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 text-sm"
//           >
//             🔍 Verify
//           </button>
//           <button
//             onClick={fetchMedicines}
//             className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 text-sm"
//           >
//             🔄 Refresh
//           </button>
//           {/* ADDED DELETE BUTTON */}
//           <button
//             onClick={() => {
//               if (displayedMedicines.length === 0) {
//                 alert('No medicines to delete');
//                 return;
//               }
//               if (window.confirm(`Are you sure you want to delete ALL medicines${selectedCompany ? ` from ${getSelectedCompanyName()}` : ''}? This action cannot be undone.`)) {
//                 // You can implement bulk delete here if needed
//                 alert('Bulk delete feature would be implemented here');
//               }
//             }}
//             disabled={displayedMedicines.length === 0 || deleting}
//             className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {deleting ? (
//               <>
//                 <div className="loading-spinner-small"></div>
//                 Deleting...
//               </>
//             ) : (
//               <>
//                 🗑️ Delete All
//               </>
//             )}
//           </button>
//         </div>

//         {!selectedCompany && (
//           <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
//             <div className="flex items-center gap-2">
//               <span className="text-yellow-600">⚠️</span>
//               <div>
//                 <p className="font-semibold text-yellow-800 text-sm">No Pharmacy Selected</p>
//                 <p className="text-yellow-700 text-xs">Select a pharmacy company to add medicines.</p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Add Medicine Form Modal */}
//         {showAddForm && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-xl p-4 md:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-lg md:text-xl font-bold text-gray-800">Add New Medicine</h3>
//                 <button
//                   onClick={() => {
//                     setShowAddForm(false);
//                     resetForm();
//                   }}
//                   className="text-gray-500 hover:text-gray-700 text-xl"
//                 >
//                   ×
//                 </button>
//               </div>
              
//               <form onSubmit={handleAddMedicine} className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                 {/* Pharmacy Selection */}
//                 <div className="md:col-span-2">
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Pharmacy Company *
//                   </label>
//                   <select
//                     name="pharmacyCompanyId"
//                     value={formData.pharmacyCompanyId}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                     required
//                   >
//                     <option value="">Select Pharmacy Company</option>
//                     {pharmacyCompanies.map(company => (
//                       <option key={company._id} value={company._id}>
//                         {company.name} - {company.licenseNumber}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Medicine Name *
//                   </label>
//                   <input
//                     type="text"
//                     name="name"
//                     value={formData.name}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                     placeholder="e.g., Paracetamol 500mg"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Batch Number *
//                   </label>
//                   <input
//                     type="text"
//                     name="batchNo"
//                     value={formData.batchNo}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                     placeholder="e.g., PHARM-2024-001"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Scientific Name *
//                   </label>
//                   <input
//                     type="text"
//                     name="medicineName"
//                     value={formData.medicineName}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                     placeholder="e.g., Paracetamol"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Manufacturer *
//                   </label>
//                   <input
//                     type="text"
//                     name="manufacturer"
//                     value={formData.manufacturer}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                     placeholder="e.g., PharmaCorp Ltd."
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Manufacture Date *
//                   </label>
//                   <input
//                     type="date"
//                     name="manufactureDate"
//                     value={formData.manufactureDate}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Expiry Date *
//                   </label>
//                   <input
//                     type="date"
//                     name="expiryDate"
//                     value={formData.expiryDate}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Formulation *
//                   </label>
//                   <select
//                     name="formulation"
//                     value={formData.formulation}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                     required
//                   >
//                     <option value="">Select Formulation</option>
//                     <option value="Tablets">Tablets</option>
//                     <option value="Capsules">Capsules</option>
//                     <option value="Syrup">Syrup</option>
//                     <option value="Injection">Injection</option>
//                     <option value="Ointment">Ointment</option>
//                     <option value="Inhaler">Inhaler</option>
//                     <option value="Drops">Drops</option>
//                     <option value="Cream">Cream</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Quantity *
//                   </label>
//                   <input
//                     type="number"
//                     name="quantity"
//                     value={formData.quantity}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                     placeholder="e.g., 1000"
//                     min="1"
//                     required
//                   />
//                 </div>

//                 <div className="md:col-span-2">
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Status
//                   </label>
//                   <select
//                     name="status"
//                     value={formData.status}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                   >
//                     <option value="Active">Active</option>
//                     <option value="In Transit">In Transit</option>
//                     <option value="At Pharmacy">At Pharmacy</option>
//                     <option value="Expired">Expired</option>
//                   </select>
//                 </div>

//                 <div className="md:col-span-2 flex gap-2 pt-4">
//                   <button
//                     type="submit"
//                     disabled={loading}
//                     className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
//                   >
//                     {loading ? (
//                       <>
//                         <div className="loading-spinner-small"></div>
//                         Adding...
//                       </>
//                     ) : (
//                       'Add Medicine'
//                     )}
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setShowAddForm(false);
//                       resetForm();
//                     }}
//                     className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg font-semibold transition-colors text-sm"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}

//         {/* Compact Medicines Table */}
//         <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//           <div className="px-4 py-3 border-b border-gray-200">
//             <div className="flex flex-col md:flex-row md:items-center md:justify-between">
//               <div>
//                 <h2 className="text-lg font-bold text-gray-800">Medicines</h2>
//                 <p className="text-gray-600 text-sm">
//                   {selectedCompany ? `Showing medicines for ${getSelectedCompanyName()}` : 'Showing all medicines across all pharmacies'}
//                 </p>
//               </div>
//               <div className="mt-1 md:mt-0 text-xs text-gray-500">
//                 {displayedMedicines.length} medicines found
//               </div>
//             </div>
//           </div>
          
//           {loading ? (
//             <div className="p-6 text-center">
//               <div className="loading-spinner mx-auto mb-2"></div>
//               <p className="text-gray-600 text-sm">Loading medicines...</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
//                     {!selectedCompany && (
//                       <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pharmacy</th>
//                     )}
//                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch No</th>
//                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manufacturer</th>
//                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
//                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blockchain</th>
//                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {displayedMedicines.map((medicine) => {
//                     const isExpired = new Date(medicine.expiryDate) < new Date();
//                     const statusColor = isExpired ? 'bg-red-100 text-red-800' :
//                       medicine.status === 'Active' ? 'bg-green-100 text-green-800' :
//                       medicine.status === 'In Transit' ? 'bg-yellow-100 text-yellow-800' :
//                       'bg-blue-100 text-blue-800';
                    
//                     const blockchainColor = medicine.blockchainVerified ? 
//                       'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

//                     return (
//                       <tr key={medicine._id} className="hover:bg-gray-50">
//                         <td className="px-4 py-3">
//                           <div className="font-medium text-gray-900 text-sm">{medicine.name}</div>
//                           <div className="text-gray-500 text-xs">{medicine.medicineName}</div>
//                           <div className="text-gray-400 text-xs">{medicine.formulation}</div>
//                         </td>
                        
//                         {!selectedCompany && (
//                           <td className="px-4 py-3">
//                             <div className="text-gray-900 text-sm">{medicine.pharmacyName}</div>
//                             <div className="text-gray-500 text-xs">
//                               {medicine.pharmacyCompany?.licenseNumber}
//                             </div>
//                           </td>
//                         )}
                        
//                         <td className="px-4 py-3">
//                           <div className="text-gray-900 font-mono text-xs">{medicine.batchNo}</div>
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className="text-gray-900 text-sm">{medicine.manufacturer}</div>
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className={`font-medium text-sm ${
//                             isExpired ? 'text-red-600' : 'text-gray-900'
//                           }`}>
//                             {new Date(medicine.expiryDate).toLocaleDateString()}
//                             {isExpired && <div className="text-red-500 text-xs">Expired</div>}
//                           </div>
//                         </td>
//                         <td className="px-4 py-3">
//                           <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor}`}>
//                             {medicine.status}
//                           </span>
//                         </td>
//                         <td className="px-4 py-3">
//                           <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${blockchainColor}`}>
//                             {medicine.blockchainVerified ? 'Verified' : 'Not Verified'}
//                           </span>
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className="flex gap-1">
//                             {!medicine.blockchainVerified && (
//                               <button
//                                 onClick={() => handleAcceptOnBlockchain(medicine)}
//                                 className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs transition-colors"
//                               >
//                                 Verify
//                               </button>
//                             )}
//                             <button
//                               onClick={() => {
//                                 setVerifyBatchNo(medicine.batchNo);
//                                 setShowVerifyModal(true);
//                               }}
//                               className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs transition-colors"
//                             >
//                               Check
//                             </button>
//                             {/* ADDED DELETE BUTTON FOR EACH MEDICINE */}
//                             <button
//                               onClick={() => handleDeleteMedicine(medicine._id, medicine.name)}
//                               className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition-colors"
//                               title={`Delete ${medicine.name}`}
//                             >
//                               🗑️
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                   {displayedMedicines.length === 0 && (
//                     <tr>
//                       <td colSpan={selectedCompany ? "7" : "8"} className="px-4 py-6 text-center text-gray-500 text-sm">
//                         {selectedCompany 
//                           ? `No medicines found for ${getSelectedCompanyName()}. Add your first medicine to get started.`
//                           : 'No medicines found across all pharmacies.'
//                         }
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>

//         {/* Fixed Verify Medicine Modal */}
//         {showVerifyModal && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-xl p-6 w-full max-w-md mx-auto shadow-2xl border border-gray-200">
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-xl font-bold text-gray-800">Verify Medicine</h3>
//                 <button
//                   onClick={() => setShowVerifyModal(false)}
//                   className="text-gray-500 hover:text-gray-700 text-2xl"
//                 >
//                   ×
//                 </button>
//               </div>
              
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Batch Number
//                   </label>
//                   <input
//                     type="text"
//                     value={verifyBatchNo}
//                     onChange={(e) => setVerifyBatchNo(e.target.value)}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     placeholder="Enter batch number (e.g., PHARM-2024-001)"
//                   />
//                 </div>
//                 <div className="flex gap-3 pt-2">
//                   <button
//                     onClick={handleVerifyMedicine}
//                     disabled={verifying || !verifyBatchNo.trim()}
//                     className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
//                   >
//                     {verifying ? (
//                       <>
//                         <div className="loading-spinner-small"></div>
//                         Verifying...
//                       </>
//                     ) : (
//                       'Verify Medicine'
//                     )}
//                   </button>
//                   <button
//                     onClick={() => setShowVerifyModal(false)}
//                     className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg font-semibold transition-colors"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </ProtectedRoute>
//   );
// };

// export default PharmacyPage;






//                        DOESNT HAVE DELETE


// import React, { useState, useEffect } from 'react';
// import ProtectedRoute from "../components/ProtectedRoute";
// import { api } from "../utils/api";

// const PharmacyPage = ({ batches, onAccept, metamask, user, theme, onRefresh }) => {
//   const [showVerifyModal, setShowVerifyModal] = useState(false);
//   const [verifyBatchNo, setVerifyBatchNo] = useState('');
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [medicines, setMedicines] = useState([]);
//   const [pharmacyCompanies, setPharmacyCompanies] = useState([]);
//   const [selectedCompany, setSelectedCompany] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [verifying, setVerifying] = useState(false);

//   const [formData, setFormData] = useState({
//     name: '',
//     batchNo: '',
//     medicineName: '',
//     manufactureDate: '',
//     expiryDate: '',
//     formulation: '',
//     quantity: '',
//     manufacturer: '',
//     status: 'Active',
//     pharmacyCompanyId: ''
//   });

//   // Fetch pharmacy companies and medicines
//   useEffect(() => {
//     fetchPharmacyCompanies();
//     fetchMedicines();
//   }, []);

//   // Check URL parameters for pre-selected company
//   useEffect(() => {
//     const urlParams = new URLSearchParams(window.location.search);
//     const companyId = urlParams.get('company');
//     if (companyId) {
//       setSelectedCompany(companyId);
//       setFormData(prev => ({ ...prev, pharmacyCompanyId: companyId }));
//     }
//   }, []);

//   const fetchPharmacyCompanies = async () => {
//     try {
//       const response = await api.get("/pharmacy-companies");
//       if (response.success) {
//         setPharmacyCompanies(response.data);
//         console.log("✅ Loaded pharmacy companies:", response.data.length);
        
//         // Auto-select first company if none selected
//         if (response.data.length > 0 && !selectedCompany) {
//           setSelectedCompany(response.data[0]._id);
//           setFormData(prev => ({ ...prev, pharmacyCompanyId: response.data[0]._id }));
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching pharmacy companies:", error);
//     }
//   };

//   const fetchMedicines = async () => {
//     try {
//       setLoading(true);
//       const response = await api.get("/pharmacy/medicines");
//       if (response.success) {
//         setMedicines(response.data);
//         console.log("✅ Loaded pharmacy medicines:", response.data.length);
//       }
//     } catch (error) {
//       console.error("Error fetching medicines:", error);
//       setMedicines(batches || []);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getMedicinesForSelectedCompany = () => {
//     if (!selectedCompany) return medicines;
//     return medicines.filter(medicine => medicine.pharmacyCompany?._id === selectedCompany);
//   };

//   const getSelectedCompanyName = () => {
//     const company = pharmacyCompanies.find(c => c._id === selectedCompany);
//     return company ? company.name : 'All Pharmacies';
//   };

//   const handleAcceptOnBlockchain = async (medicine) => {
//     try {
//       console.log('Accepting on blockchain:', medicine.batchNo);
      
//       const response = await api.put(`/pharmacy/medicines/${medicine._id}`, {
//         blockchainVerified: true,
//         status: 'At Pharmacy'
//       });
      
//       if (response.success) {
//         await fetchMedicines();
//         if (onRefresh) await onRefresh();
//         alert(`✅ Batch ${medicine.batchNo} accepted on blockchain successfully!`);
//       }
//     } catch (error) {
//       console.error("Error accepting batch:", error);
//       alert(`Failed to accept batch: ${error.message}`);
//     }
//   };


//   // SPECIAL MODI

//   const handleVerifyMedicine = async () => {
//   if (!verifyBatchNo.trim()) {
//     alert('Please enter a batch number');
//     return;
//   }

//   try {
//     setVerifying(true);
//     const response = await api.get(`/batches/verify/${verifyBatchNo}`);
    
//     if (response.exists) {
//       if (response.authentic) {
//         alert(`✅ ${response.message}\nMedicine: ${response.name}\nBatch: ${response.batchNo}\nStatus: ${response.status}\nPharmacy: ${response.pharmacy}`);
//       } else {
//         alert(`❌ ${response.message}\nMedicine: ${response.name}\nBatch: ${response.batchNo}`);
//       }
//     } else {
//       alert('❌ Medicine not found in system');
//     }
//   } catch (error) {
//     console.error("Verification error:", error);
//     alert('Error verifying medicine. Please try again.');
//   } finally {
//     setVerifying(false);
//     setShowVerifyModal(false);
//     setVerifyBatchNo('');
//   }
// };

//   //                          ANIMATED

//   // const handleVerifyMedicine = async () => {
//   //   if (!verifyBatchNo.trim()) {
//   //     alert('Please enter a batch number');
//   //     return;
//   //   }

//   //   try {
//   //     setVerifying(true);
//   //     const response = await api.get(`/batches/verify/${verifyBatchNo}`);
      
//   //     if (response.exists) {
//   //       if (response.authentic) {
//   //         alert(`✅ ${response.message}\nMedicine: ${response.name}\nBatch: ${response.batchNo}\nStatus: ${response.status}\nPharmacy: ${response.pharmacy}`);
//   //       } else {
//   //         alert(`❌ ${response.message}\nMedicine: ${response.name}\nBatch: ${response.batchNo}`);
//   //       }
//   //     } else {
//   //       alert('❌ Medicine not found in system');
//   //     }
//   //   } catch (error) {
//   //     console.error("Verification error:", error);
//   //     alert('Error verifying medicine. Please try again.');
//   //   } finally {
//   //     setVerifying(false);
//   //     setShowVerifyModal(false);
//   //     setVerifyBatchNo('');
//   //   }
//   // };

//   const handleAddMedicine = async (e) => {
//     e.preventDefault();
    
//     if (!formData.pharmacyCompanyId) {
//       alert('Please select a pharmacy company');
//       return;
//     }
    
//     try {
//       setLoading(true);
      
//       const medicineData = {
//         ...formData,
//         quantity: parseInt(formData.quantity)
//       };

//       console.log("📤 Sending medicine data:", medicineData);

//       const response = await api.post("/pharmacy/medicines", medicineData);
      
//       if (response.success) {
//         await fetchMedicines();
//         if (onRefresh) await onRefresh();
        
//         resetForm();
//         setShowAddForm(false);
//         alert('✅ Medicine added successfully!');
//       }
//     } catch (error) {
//       console.error("Error adding medicine:", error);
//       alert(`❌ Failed to add medicine: ${error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
    
//     if (name === 'pharmacyCompanyId') {
//       setSelectedCompany(value);
//     }
    
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));

//     // Auto-fill medicineName if empty when name is filled
//     if (name === 'name' && !formData.medicineName) {
//       setFormData(prev => ({
//         ...prev,
//         medicineName: value.split(' ')[0]
//       }));
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       name: '',
//       batchNo: '',
//       medicineName: '',
//       manufactureDate: '',
//       expiryDate: '',
//       formulation: '',
//       quantity: '',
//       manufacturer: '',
//       status: 'Active',
//       pharmacyCompanyId: selectedCompany
//     });
//   };

//   const displayedMedicines = getMedicinesForSelectedCompany();

//   return (
//     <ProtectedRoute user={user} requiredRole="pharmacy">
//       {/* REMOVED BackgroundFix - App.js handles the layout */}
//       {/* SIMPLIFIED layout that fits within existing sidebar */}
//       <div className="p-4 md:p-6 max-w-full overflow-x-hidden">
//         {/* Compact Header */}
//         <div className="mb-6">
//           <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">Medicine Management</h1>
//           <p className="text-gray-600 text-sm">Add and manage medicines for pharmacy companies</p>
//         </div>

//         {/* Pharmacy Company Selection */}
//         <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
//             <div>
//               <h3 className="text-md font-semibold text-gray-800">Select Pharmacy Company</h3>
//               <p className="text-gray-600 text-sm">Choose which pharmacy to manage medicines for</p>
//             </div>
            
//             <div className="flex gap-3">
//               <select
//                 value={selectedCompany}
//                 onChange={(e) => setSelectedCompany(e.target.value)}
//                 className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[180px] text-sm"
//               >
//                 <option value="">All Pharmacies</option>
//                 {pharmacyCompanies.map(company => (
//                   <option key={company._id} value={company._id}>
//                     {company.name}
//                   </option>
//                 ))}
//               </select>
              
//               <button
//                 onClick={() => window.location.href = '/pharmacy-dashboard'}
//                 className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-lg font-semibold transition-colors text-sm"
//               >
//                 Manage Companies
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Compact Stats Cards */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//           <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
//             <h3 className="text-sm font-semibold text-gray-700 mb-1">Total Medicines</h3>
//             <p className="text-xl font-bold text-gray-800">{displayedMedicines.length}</p>
//             <p className="text-xs text-gray-500 mt-1">{getSelectedCompanyName()}</p>
//           </div>
//           <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
//             <h3 className="text-sm font-semibold text-gray-700 mb-1">Active</h3>
//             <p className="text-xl font-bold text-gray-800">
//               {displayedMedicines.filter(m => m.status === 'Active').length}
//             </p>
//           </div>
//           <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
//             <h3 className="text-sm font-semibold text-gray-700 mb-1">Verified</h3>
//             <p className="text-xl font-bold text-gray-800">
//               {displayedMedicines.filter(m => m.blockchainVerified).length}
//             </p>
//           </div>
//           <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
//             <h3 className="text-sm font-semibold text-gray-700 mb-1">Expired</h3>
//             <p className="text-xl font-bold text-gray-800">
//               {displayedMedicines.filter(m => m.status === 'Expired').length}
//             </p>
//           </div>
//         </div>

//         {/* Compact Action Buttons */}
//         <div className="flex flex-wrap gap-3 mb-6">
//           <button
//             onClick={() => setShowAddForm(true)}
//             disabled={!selectedCompany}
//             className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             ➕ Add Medicine
//           </button>
//           <button
//             onClick={() => setShowVerifyModal(true)}
//             className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 text-sm"
//           >
//             🔍 Verify
//           </button>
//           <button
//             onClick={fetchMedicines}
//             className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 text-sm"
//           >
//             🔄 Refresh
//           </button>
//         </div>

//         {!selectedCompany && (
//           <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
//             <div className="flex items-center gap-2">
//               <span className="text-yellow-600">⚠️</span>
//               <div>
//                 <p className="font-semibold text-yellow-800 text-sm">No Pharmacy Selected</p>
//                 <p className="text-yellow-700 text-xs">Select a pharmacy company to add medicines.</p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Add Medicine Form Modal */}
//         {showAddForm && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-xl p-4 md:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-lg md:text-xl font-bold text-gray-800">Add New Medicine</h3>
//                 <button
//                   onClick={() => {
//                     setShowAddForm(false);
//                     resetForm();
//                   }}
//                   className="text-gray-500 hover:text-gray-700 text-xl"
//                 >
//                   ×
//                 </button>
//               </div>
              
//               <form onSubmit={handleAddMedicine} className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                 {/* Pharmacy Selection */}
//                 <div className="md:col-span-2">
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Pharmacy Company *
//                   </label>
//                   <select
//                     name="pharmacyCompanyId"
//                     value={formData.pharmacyCompanyId}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                     required
//                   >
//                     <option value="">Select Pharmacy Company</option>
//                     {pharmacyCompanies.map(company => (
//                       <option key={company._id} value={company._id}>
//                         {company.name} - {company.licenseNumber}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Medicine Name *
//                   </label>
//                   <input
//                     type="text"
//                     name="name"
//                     value={formData.name}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                     placeholder="e.g., Paracetamol 500mg"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Batch Number *
//                   </label>
//                   <input
//                     type="text"
//                     name="batchNo"
//                     value={formData.batchNo}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                     placeholder="e.g., PHARM-2024-001"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Scientific Name *
//                   </label>
//                   <input
//                     type="text"
//                     name="medicineName"
//                     value={formData.medicineName}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                     placeholder="e.g., Paracetamol"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Manufacturer *
//                   </label>
//                   <input
//                     type="text"
//                     name="manufacturer"
//                     value={formData.manufacturer}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                     placeholder="e.g., PharmaCorp Ltd."
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Manufacture Date *
//                   </label>
//                   <input
//                     type="date"
//                     name="manufactureDate"
//                     value={formData.manufactureDate}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Expiry Date *
//                   </label>
//                   <input
//                     type="date"
//                     name="expiryDate"
//                     value={formData.expiryDate}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Formulation *
//                   </label>
//                   <select
//                     name="formulation"
//                     value={formData.formulation}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                     required
//                   >
//                     <option value="">Select Formulation</option>
//                     <option value="Tablets">Tablets</option>
//                     <option value="Capsules">Capsules</option>
//                     <option value="Syrup">Syrup</option>
//                     <option value="Injection">Injection</option>
//                     <option value="Ointment">Ointment</option>
//                     <option value="Inhaler">Inhaler</option>
//                     <option value="Drops">Drops</option>
//                     <option value="Cream">Cream</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Quantity *
//                   </label>
//                   <input
//                     type="number"
//                     name="quantity"
//                     value={formData.quantity}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                     placeholder="e.g., 1000"
//                     min="1"
//                     required
//                   />
//                 </div>

//                 <div className="md:col-span-2">
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Status
//                   </label>
//                   <select
//                     name="status"
//                     value={formData.status}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                   >
//                     <option value="Active">Active</option>
//                     <option value="In Transit">In Transit</option>
//                     <option value="At Pharmacy">At Pharmacy</option>
//                     <option value="Expired">Expired</option>
//                   </select>
//                 </div>

//                 <div className="md:col-span-2 flex gap-2 pt-4">
//                   <button
//                     type="submit"
//                     disabled={loading}
//                     className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
//                   >
//                     {loading ? (
//                       <>
//                         <div className="loading-spinner-small"></div>
//                         Adding...
//                       </>
//                     ) : (
//                       'Add Medicine'
//                     )}
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setShowAddForm(false);
//                       resetForm();
//                     }}
//                     className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg font-semibold transition-colors text-sm"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}

//         {/* Compact Medicines Table */}
//         <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//           <div className="px-4 py-3 border-b border-gray-200">
//             <div className="flex flex-col md:flex-row md:items-center md:justify-between">
//               <div>
//                 <h2 className="text-lg font-bold text-gray-800">Medicines</h2>
//                 <p className="text-gray-600 text-sm">
//                   {selectedCompany ? `Showing medicines for ${getSelectedCompanyName()}` : 'Showing all medicines across all pharmacies'}
//                 </p>
//               </div>
//               <div className="mt-1 md:mt-0 text-xs text-gray-500">
//                 {displayedMedicines.length} medicines found
//               </div>
//             </div>
//           </div>
          
//           {loading ? (
//             <div className="p-6 text-center">
//               <div className="loading-spinner mx-auto mb-2"></div>
//               <p className="text-gray-600 text-sm">Loading medicines...</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
//                     {!selectedCompany && (
//                       <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pharmacy</th>
//                     )}
//                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch No</th>
//                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manufacturer</th>
//                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
//                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blockchain</th>
//                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {displayedMedicines.map((medicine) => {
//                     const isExpired = new Date(medicine.expiryDate) < new Date();
//                     const statusColor = isExpired ? 'bg-red-100 text-red-800' :
//                       medicine.status === 'Active' ? 'bg-green-100 text-green-800' :
//                       medicine.status === 'In Transit' ? 'bg-yellow-100 text-yellow-800' :
//                       'bg-blue-100 text-blue-800';
                    
//                     const blockchainColor = medicine.blockchainVerified ? 
//                       'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

//                     return (
//                       <tr key={medicine._id} className="hover:bg-gray-50">
//                         <td className="px-4 py-3">
//                           <div className="font-medium text-gray-900 text-sm">{medicine.name}</div>
//                           <div className="text-gray-500 text-xs">{medicine.medicineName}</div>
//                           <div className="text-gray-400 text-xs">{medicine.formulation}</div>
//                         </td>
                        
//                         {!selectedCompany && (
//                           <td className="px-4 py-3">
//                             <div className="text-gray-900 text-sm">{medicine.pharmacyName}</div>
//                             <div className="text-gray-500 text-xs">
//                               {medicine.pharmacyCompany?.licenseNumber}
//                             </div>
//                           </td>
//                         )}
                        
//                         <td className="px-4 py-3">
//                           <div className="text-gray-900 font-mono text-xs">{medicine.batchNo}</div>
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className="text-gray-900 text-sm">{medicine.manufacturer}</div>
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className={`font-medium text-sm ${
//                             isExpired ? 'text-red-600' : 'text-gray-900'
//                           }`}>
//                             {new Date(medicine.expiryDate).toLocaleDateString()}
//                             {isExpired && <div className="text-red-500 text-xs">Expired</div>}
//                           </div>
//                         </td>
//                         <td className="px-4 py-3">
//                           <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor}`}>
//                             {medicine.status}
//                           </span>
//                         </td>
//                         <td className="px-4 py-3">
//                           <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${blockchainColor}`}>
//                             {medicine.blockchainVerified ? 'Verified' : 'Not Verified'}
//                           </span>
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className="flex gap-1">
//                             {!medicine.blockchainVerified && (
//                               <button
//                                 onClick={() => handleAcceptOnBlockchain(medicine)}
//                                 className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs transition-colors"
//                               >
//                                 Verify
//                               </button>
//                             )}
//                             <button
//                               onClick={() => {
//                                 setVerifyBatchNo(medicine.batchNo);
//                                 setShowVerifyModal(true);
//                               }}
//                               className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs transition-colors"
//                             >
//                               Check
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                   {displayedMedicines.length === 0 && (
//                     <tr>
//                       <td colSpan={selectedCompany ? "7" : "8"} className="px-4 py-6 text-center text-gray-500 text-sm">
//                         {selectedCompany 
//                           ? `No medicines found for ${getSelectedCompanyName()}. Add your first medicine to get started.`
//                           : 'No medicines found across all pharmacies.'
//                         }
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
        

// {/* Fixed Verify Medicine Modal */}
// {showVerifyModal && (
//   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//     <div className="bg-white rounded-xl p-6 w-full max-w-md mx-auto shadow-2xl border border-gray-200">
//       <div className="flex justify-between items-center mb-4">
//         <h3 className="text-xl font-bold text-gray-800">Verify Medicine</h3>
//         <button
//           onClick={() => setShowVerifyModal(false)}
//           className="text-gray-500 hover:text-gray-700 text-2xl"
//         >
//           ×
//         </button>
//       </div>
      
//       <div className="space-y-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Batch Number
//           </label>
//           <input
//             type="text"
//             value={verifyBatchNo}
//             onChange={(e) => setVerifyBatchNo(e.target.value)}
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             placeholder="Enter batch number (e.g., PHARM-2024-001)"
//           />
//         </div>
//         <div className="flex gap-3 pt-2">
//           <button
//             onClick={handleVerifyMedicine}
//             disabled={verifying || !verifyBatchNo.trim()}
//             className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
//           >
//             {verifying ? (
//               <>
//                 <div className="loading-spinner-small"></div>
//                 Verifying...
//               </>
//             ) : (
//               'Verify Medicine'
//             )}
//           </button>
//           <button
//             onClick={() => setShowVerifyModal(false)}
//             className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg font-semibold transition-colors"
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   </div>
// )}
//       </div>
//     </ProtectedRoute>
//   );
// };

// export default PharmacyPage;