import React, { useState, useEffect } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import Card from "../components/Card";
import { api } from "../utils/api";

function PharmacyDashboardPage({ batches, metamask, user, theme, onRefresh }) {
  const [pharmacyCompanies, setPharmacyCompanies] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [statsLoading, setStatsLoading] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    licenseNumber: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "Pakistan",
      zipCode: ""
    },
    contact: {
      phone: "",
      email: ""
    },
    manager: "",
    establishedDate: new Date().toISOString().split('T')[0],
    specialties: []
  });

  const [newSpecialty, setNewSpecialty] = useState("");
  const [formErrors, setFormErrors] = useState({});

  // Fetch pharmacy companies with stats
  useEffect(() => {
    fetchPharmacyCompanies();
  }, []);

  const fetchPharmacyCompanies = async () => {
    try {
      setLoading(true);
      console.log("🔄 Fetching pharmacy companies with stats...");
      
      const response = await api.get("/pharmacy-companies");
      if (response.success) {
        setPharmacyCompanies(response.data);
        console.log("✅ Loaded pharmacy companies with stats:", response.data.length);
        
        // Pre-populate stats from the company data itself
        const initialStats = {};
        response.data.forEach(company => {
          initialStats[company._id] = {
            totalMedicines: company.totalMedicines || 0,
            verifiedMedicines: company.verifiedMedicines || 0,
            expiredMedicines: company.expiredMedicines || 0,
            activeMedicines: company.activeMedicines || 0,
            statusDistribution: []
          };
        });
        setStats(initialStats);
      }
    } catch (error) {
      console.error("Error fetching pharmacy companies:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch detailed stats for a specific company (when expanded)
  const fetchCompanyStats = async (companyId) => {
    try {
      setStatsLoading(prev => ({ ...prev, [companyId]: true }));
      console.log(`🔄 Fetching detailed stats for company: ${companyId}`);
      
      const response = await api.get(`/pharmacy-companies/${companyId}/stats`);
      if (response.success) {
        setStats(prev => ({
          ...prev,
          [companyId]: response.data
        }));
        console.log(`✅ Detailed stats loaded for company ${companyId}`);
      }
    } catch (error) {
      console.error(`❌ Error fetching stats for company ${companyId}:`, error);
    } finally {
      setStatsLoading(prev => ({ ...prev, [companyId]: false }));
    }
  };

  // Validation functions
  const validateField = (name, value) => {
    const errors = { ...formErrors };

    switch (name) {
      case 'name':
        if (!value.trim()) {
          errors.name = 'Company name is required';
        } else if (value.trim().length < 2) {
          errors.name = 'Company name must be at least 2 characters';
        } else {
          delete errors.name;
        }
        break;

      case 'licenseNumber':
        if (!value.trim()) {
          errors.licenseNumber = 'License number is required';
        } else if (!/^[A-Za-z0-9-]+$/.test(value.trim())) {
          errors.licenseNumber = 'License number can only contain letters, numbers, and hyphens';
        } else {
          delete errors.licenseNumber;
        }
        break;

      case 'manager':
        if (!value.trim()) {
          errors.manager = 'Manager name is required';
        } else if (value.trim().length < 2) {
          errors.manager = 'Manager name must be at least 2 characters';
        } else if (!/^[A-Za-z\s]+$/.test(value.trim())) {
          errors.manager = 'Manager name can only contain letters and spaces';
        } else {
          delete errors.manager;
        }
        break;

      case 'contact.phone':
        if (!value.trim()) {
          errors.phone = 'Phone number is required';
        } else if (!/^[\+]?[0-9\s\-\(\)]+$/.test(value.trim())) {
          errors.phone = 'Please enter a valid phone number';
        } else {
          delete errors.phone;
        }
        break;

      case 'contact.email':
        if (!value.trim()) {
          errors.email = 'Email address is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          errors.email = 'Please enter a valid email address';
        } else {
          delete errors.email;
        }
        break;

      case 'address.city':
        if (!value.trim()) {
          errors.city = 'City is required';
        } else if (value.trim().length < 2) {
          errors.city = 'City must be at least 2 characters';
        } else {
          delete errors.city;
        }
        break;

      case 'address.state':
        if (!value.trim()) {
          errors.state = 'State is required';
        } else if (value.trim().length < 2) {
          errors.state = 'State must be at least 2 characters';
        } else {
          delete errors.state;
        }
        break;

      case 'address.country':
        if (!value.trim()) {
          errors.country = 'Country is required';
        } else {
          delete errors.country;
        }
        break;

      case 'address.zipCode':
        if (value.trim() && !/^[A-Za-z0-9\-]+$/.test(value.trim())) {
          errors.zipCode = 'ZIP code can only contain letters, numbers, and hyphens';
        } else {
          delete errors.zipCode;
        }
        break;

      default:
        break;
    }

    setFormErrors(errors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
      validateField(name, value);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      validateField(name, value);
    }
  };

  const handleAddCompany = async (e) => {
    e.preventDefault();
    
    // Validate all required fields before submission
    const requiredFields = [
      'name', 'licenseNumber', 'manager', 
      'contact.phone', 'contact.email', 
      'address.city', 'address.state', 'address.country'
    ];

    const newErrors = {};
    requiredFields.forEach(field => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        const value = formData[parent][child];
        if (!value || !value.trim()) {
          newErrors[child] = `${child.charAt(0).toUpperCase() + child.slice(1)} is required`;
        }
      } else {
        const value = formData[field];
        if (!value || !value.trim()) {
          newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        }
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
      
      const companyData = {
        ...formData,
        specialties: formData.specialties.filter(s => s.trim() !== "")
      };

      console.log("📤 Adding pharmacy company:", companyData);

      const response = await api.post("/pharmacy-companies", companyData);
      
      if (response.success) {
        await fetchPharmacyCompanies();
        resetForm();
        setShowAddForm(false);
        setFormErrors({});
        alert("✅ Pharmacy company added successfully!");
      }
    } catch (error) {
      console.error("Error adding pharmacy company:", error);
      alert(`❌ Failed to add pharmacy company: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCompany = async (companyId, companyName) => {
    if (!window.confirm(`Are you sure you want to delete ${companyName}?`)) {
      return;
    }

    try {
      const response = await api.delete(`/pharmacy-companies/${companyId}`);
      if (response.success) {
        await fetchPharmacyCompanies();
        alert("✅ Pharmacy company deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting pharmacy company:", error);
      alert(`❌ Failed to delete pharmacy company: ${error.message}`);
    }
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !formData.specialties.includes(newSpecialty.trim())) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()]
      }));
      setNewSpecialty("");
    }
  };

  const removeSpecialty = (index) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      licenseNumber: "",
      address: {
        street: "",
        city: "",
        state: "",
        country: "Pakistan",
        zipCode: ""
      },
      contact: {
        phone: "",
        email: ""
      },
      manager: "",
      establishedDate: new Date().toISOString().split('T')[0],
      specialties: []
    });
    setNewSpecialty("");
    setFormErrors({});
  };

  const getCompanyStats = (companyId) => {
    return stats[companyId] || {
      totalMedicines: 0,
      verifiedMedicines: 0,
      expiredMedicines: 0,
      activeMedicines: 0
    };
  };

  // Calculate total medicines across all companies
  const totalMedicines = pharmacyCompanies.reduce((sum, company) => {
    return sum + (getCompanyStats(company._id).totalMedicines || 0);
  }, 0);

  return (
    <ProtectedRoute user={user} requiredRole="pharmacy">
      <div className="p-4 md:p-6 max-w-full overflow-x-hidden">
        {/* Compact Header */}
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">
            Pharmacy Companies Dashboard
          </h1>
          <p className="text-gray-600 text-sm">
            Manage pharmacy companies and their medicine inventories
          </p>
        </div>

        {/* Compact Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card 
            title="Total Companies" 
            value={pharmacyCompanies.length} 
            gradient="bg-gradient-to-br from-blue-50 to-blue-100"
            icon="🏪"
            compact={true}
          />
          <Card 
            title="Active Companies" 
            value={pharmacyCompanies.filter(c => c.isActive).length} 
            gradient="bg-gradient-to-br from-green-50 to-green-100"
            icon="✅"
            compact={true}
          />
          <Card 
            title="Total Medicines" 
            value={totalMedicines} 
            gradient="bg-gradient-to-br from-purple-50 to-purple-100"
            icon="💊"
            compact={true}
          />
        </div>

        {/* Compact Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 text-sm"
          >
            ➕ Add Pharmacy
          </button>
          <button
            onClick={fetchPharmacyCompanies}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 text-sm"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Add Pharmacy Company Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-4 md:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg md:text-xl font-bold text-gray-800">Add New Pharmacy</h3>
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
              
              <form onSubmit={handleAddCompany} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Basic Information */}
                <div className="md:col-span-2">
                  <h4 className="text-md font-semibold text-gray-800 mb-3 border-b pb-2">Basic Information</h4>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                      formErrors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Medico Plus Pharmacy"
                    required
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    License Number *
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                      formErrors.licenseNumber ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., PHARMA-PK-001"
                    required
                  />
                  {formErrors.licenseNumber && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.licenseNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Manager Name *
                  </label>
                  <input
                    type="text"
                    name="manager"
                    value={formData.manager}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                      formErrors.manager ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Ahmed Raza"
                    required
                  />
                  {formErrors.manager && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.manager}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Established Date
                  </label>
                  <input
                    type="date"
                    name="establishedDate"
                    value={formData.establishedDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* Contact Information */}
                <div className="md:col-span-2 mt-3">
                  <h4 className="text-md font-semibold text-gray-800 mb-3 border-b pb-2">Contact Information</h4>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="contact.phone"
                    value={formData.contact.phone}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                      formErrors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., +92-21-34567890"
                    required
                  />
                  {formErrors.phone && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="contact.email"
                    value={formData.contact.email}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                      formErrors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., info@company.com"
                    required
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                  )}
                </div>

                {/* Address Information */}
                <div className="md:col-span-2 mt-3">
                  <h4 className="text-md font-semibold text-gray-800 mb-3 border-b pb-2">Address Information</h4>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="e.g., 123 Main Boulevard"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                      formErrors.city ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Karachi"
                    required
                  />
                  {formErrors.city && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                      formErrors.state ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Sindh"
                    required
                  />
                  {formErrors.state && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.state}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                      formErrors.country ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  />
                  {formErrors.country && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.country}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    name="address.zipCode"
                    value={formData.address.zipCode}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                      formErrors.zipCode ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 75500"
                  />
                  {formErrors.zipCode && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.zipCode}</p>
                  )}
                </div>

                {/* Specialties */}
                <div className="md:col-span-2 mt-3">
                  <h4 className="text-md font-semibold text-gray-800 mb-3 border-b pb-2">Specialties</h4>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSpecialty}
                        onChange={(e) => setNewSpecialty(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Add specialty (e.g., General Medicine)"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
                      />
                      <button
                        type="button"
                        onClick={addSpecialty}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm"
                      >
                        Add
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {formData.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                        >
                          {specialty}
                          <button
                            type="button"
                            onClick={() => removeSpecialty(index)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      {formData.specialties.length === 0 && (
                        <span className="text-gray-500 text-xs">No specialties added</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="md:col-span-2 flex gap-2 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                  >
                    {loading ? (
                      <>
                        <div className="loading-spinner-small"></div>
                        Adding...
                      </>
                    ) : (
                      'Add Pharmacy'
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

        {/* Compact Pharmacy Companies Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800">Pharmacy Companies</h2>
            <p className="text-gray-600 text-sm">Manage all registered pharmacy companies</p>
          </div>
          
          {loading ? (
            <div className="p-6 text-center">
              <div className="loading-spinner mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">Loading pharmacy companies...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manager</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicines</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pharmacyCompanies.map((company) => {
                    const companyStats = getCompanyStats(company._id);
                    
                    return (
                      <tr 
                        key={company._id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setSelectedCompany(selectedCompany?._id === company._id ? null : company);
                          if (!stats[company._id] || !stats[company._id].statusDistribution) {
                            fetchCompanyStats(company._id);
                          }
                        }}
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900 text-sm">{company.name}</div>
                          <div className="text-gray-500 text-xs">
                            {company.specialties?.slice(0, 2).join(', ') || 'No specialties'}
                            {company.specialties?.length > 2 && '...'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-gray-900 font-mono text-xs">{company.licenseNumber}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-gray-900 text-sm">{company.contact?.phone}</div>
                          <div className="text-gray-500 text-xs">{company.contact?.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-gray-900 text-sm">{company.manager}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-gray-900 text-sm">{company.address?.city}, {company.address?.state}</div>
                          <div className="text-gray-500 text-xs">{company.address?.country}</div>
                        </td>
                        <td className="px-4 py-3">
                          {statsLoading[company._id] ? (
                            <div className="flex items-center gap-2">
                              <div className="loading-spinner-small"></div>
                              <span className="text-xs text-gray-500">Loading...</span>
                            </div>
                          ) : (
                            <>
                              <div className="font-semibold text-gray-900 text-sm">
                                {companyStats.totalMedicines} total
                              </div>
                              <div className="text-gray-500 text-xs">
                                {companyStats.verifiedMedicines} verified
                              </div>
                            </>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `/pharmacy?company=${company._id}`;
                              }}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs transition-colors"
                            >
                              Add Medicine
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCompany(company._id, company.name);
                              }}
                              className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {pharmacyCompanies.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-4 py-6 text-center text-gray-500 text-sm">
                        No pharmacy companies found. Add your first pharmacy company to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Selected Company Details */}
          {selectedCompany && stats[selectedCompany._id] && (
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-md font-semibold text-gray-800">
                  {selectedCompany.name} - Statistics
                </h3>
                <button
                  onClick={() => setSelectedCompany(null)}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="bg-white p-2 rounded border border-gray-200 text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {stats[selectedCompany._id].totalMedicines}
                  </div>
                  <div className="text-xs text-gray-600">Total</div>
                </div>
                <div className="bg-white p-2 rounded border border-gray-200 text-center">
                  <div className="text-lg font-bold text-green-600">
                    {stats[selectedCompany._id].verifiedMedicines}
                  </div>
                  <div className="text-xs text-gray-600">Verified</div>
                </div>
                <div className="bg-white p-2 rounded border border-gray-200 text-center">
                  <div className="text-lg font-bold text-red-600">
                    {stats[selectedCompany._id].expiredMedicines}
                  </div>
                  <div className="text-xs text-gray-600">Expired</div>
                </div>
                <div className="bg-white p-2 rounded border border-gray-200 text-center">
                  <div className="text-lg font-bold text-purple-600">
                    {stats[selectedCompany._id].activeMedicines || 
                     (stats[selectedCompany._id].totalMedicines - stats[selectedCompany._id].expiredMedicines)}
                  </div>
                  <div className="text-xs text-gray-600">Active</div>
                </div>
              </div>

              {/* Status Distribution */}
              {stats[selectedCompany._id].statusDistribution && stats[selectedCompany._id].statusDistribution.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">Status Distribution</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {stats[selectedCompany._id].statusDistribution.map((status, index) => (
                      <div key={index} className="bg-white p-2 rounded border border-gray-200">
                        <div className="font-semibold text-gray-800 text-sm capitalize">
                          {status._id || 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-600">
                          {status.count} medicines
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default PharmacyDashboardPage;

//          works good BUT DOESNT HAVE VALIDATION

// import React, { useState, useEffect } from "react";
// import ProtectedRoute from "../components/ProtectedRoute";
// import Card from "../components/Card";
// import { api } from "../utils/api";

// function PharmacyDashboardPage({ batches, metamask, user, theme, onRefresh }) {
//   const [pharmacyCompanies, setPharmacyCompanies] = useState([]);
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [stats, setStats] = useState({});
//   const [selectedCompany, setSelectedCompany] = useState(null);
//   const [statsLoading, setStatsLoading] = useState({});

//   // Add validation state
// const [formErrors, setFormErrors] = useState({});

//   const [formData, setFormData] = useState({
//     name: "",
//     licenseNumber: "",
//     address: {
//       street: "",
//       city: "",
//       state: "",
//       country: "Pakistan",
//       zipCode: ""
//     },
//     contact: {
//       phone: "",
//       email: ""
//     },
//     manager: "",
//     establishedDate: new Date().toISOString().split('T')[0],
//     specialties: []
//   });

//   const [newSpecialty, setNewSpecialty] = useState("");

//   // Fetch pharmacy companies with stats
//   useEffect(() => {
//     fetchPharmacyCompanies();
//   }, []);

//   const fetchPharmacyCompanies = async () => {
//     try {
//       setLoading(true);
//       console.log("🔄 Fetching pharmacy companies with stats...");
      
//       const response = await api.get("/pharmacy-companies");
//       if (response.success) {
//         setPharmacyCompanies(response.data);
//         console.log("✅ Loaded pharmacy companies with stats:", response.data.length);
        
//         // Pre-populate stats from the company data itself
//         const initialStats = {};
//         response.data.forEach(company => {
//           initialStats[company._id] = {
//             totalMedicines: company.totalMedicines || 0,
//             verifiedMedicines: company.verifiedMedicines || 0,
//             expiredMedicines: company.expiredMedicines || 0,
//             activeMedicines: company.activeMedicines || 0,
//             statusDistribution: []
//           };
//         });
//         setStats(initialStats);
//       }
//     } catch (error) {
//       console.error("Error fetching pharmacy companies:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch detailed stats for a specific company (when expanded)
//   const fetchCompanyStats = async (companyId) => {
//     try {
//       setStatsLoading(prev => ({ ...prev, [companyId]: true }));
//       console.log(`🔄 Fetching detailed stats for company: ${companyId}`);
      
//       const response = await api.get(`/pharmacy-companies/${companyId}/stats`);
//       if (response.success) {
//         setStats(prev => ({
//           ...prev,
//           [companyId]: response.data
//         }));
//         console.log(`✅ Detailed stats loaded for company ${companyId}`);
//       }
//     } catch (error) {
//       console.error(`❌ Error fetching stats for company ${companyId}:`, error);
//     } finally {
//       setStatsLoading(prev => ({ ...prev, [companyId]: false }));
//     }
//   };

//   const handleAddCompany = async (e) => {
//     e.preventDefault();
    
//     try {
//       setLoading(true);
      
//       const companyData = {
//         ...formData,
//         specialties: formData.specialties.filter(s => s.trim() !== "")
//       };

//       console.log("📤 Adding pharmacy company:", companyData);

//       const response = await api.post("/pharmacy-companies", companyData);
      
//       if (response.success) {
//         await fetchPharmacyCompanies();
//         resetForm();
//         setShowAddForm(false);
//         alert("✅ Pharmacy company added successfully!");
//       }
//     } catch (error) {
//       console.error("Error adding pharmacy company:", error);
//       alert(`❌ Failed to add pharmacy company: ${error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeleteCompany = async (companyId, companyName) => {
//     if (!window.confirm(`Are you sure you want to delete ${companyName}?`)) {
//       return;
//     }

//     try {
//       const response = await api.delete(`/pharmacy-companies/${companyId}`);
//       if (response.success) {
//         await fetchPharmacyCompanies();
//         alert("✅ Pharmacy company deleted successfully!");
//       }
//     } catch (error) {
//       console.error("Error deleting pharmacy company:", error);
//       alert(`❌ Failed to delete pharmacy company: ${error.message}`);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
    
//     if (name.includes('.')) {
//       const [parent, child] = name.split('.');
//       setFormData(prev => ({
//         ...prev,
//         [parent]: {
//           ...prev[parent],
//           [child]: value
//         }
//       }));
//     } else {
//       setFormData(prev => ({
//         ...prev,
//         [name]: value
//       }));
//     }
//   };

//   const addSpecialty = () => {
//     if (newSpecialty.trim() && !formData.specialties.includes(newSpecialty.trim())) {
//       setFormData(prev => ({
//         ...prev,
//         specialties: [...prev.specialties, newSpecialty.trim()]
//       }));
//       setNewSpecialty("");
//     }
//   };

//   const removeSpecialty = (index) => {
//     setFormData(prev => ({
//       ...prev,
//       specialties: prev.specialties.filter((_, i) => i !== index)
//     }));
//   };

//   const resetForm = () => {
//     setFormData({
//       name: "",
//       licenseNumber: "",
//       address: {
//         street: "",
//         city: "",
//         state: "",
//         country: "Pakistan",
//         zipCode: ""
//       },
//       contact: {
//         phone: "",
//         email: ""
//       },
//       manager: "",
//       establishedDate: new Date().toISOString().split('T')[0],
//       specialties: []
//     });
//     setNewSpecialty("");
//   };

//   const getCompanyStats = (companyId) => {
//     return stats[companyId] || {
//       totalMedicines: 0,
//       verifiedMedicines: 0,
//       expiredMedicines: 0,
//       activeMedicines: 0
//     };
//   };

//   // Calculate total medicines across all companies
//   const totalMedicines = pharmacyCompanies.reduce((sum, company) => {
//     return sum + (getCompanyStats(company._id).totalMedicines || 0);
//   }, 0);

//   return (
//     <ProtectedRoute user={user} requiredRole="pharmacy">
//       <div className="p-4 md:p-6 max-w-full overflow-x-hidden">
//         {/* Compact Header */}
//         <div className="mb-6">
//           <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">
//             Pharmacy Companies Dashboard
//           </h1>
//           <p className="text-gray-600 text-sm">
//             Manage pharmacy companies and their medicine inventories
//           </p>
//         </div>

//         {/* Compact Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//           <Card 
//             title="Total Companies" 
//             value={pharmacyCompanies.length} 
//             gradient="bg-gradient-to-br from-blue-50 to-blue-100"
//             icon="🏪"
//             compact={true}
//           />
//           <Card 
//             title="Active Companies" 
//             value={pharmacyCompanies.filter(c => c.isActive).length} 
//             gradient="bg-gradient-to-br from-green-50 to-green-100"
//             icon="✅"
//             compact={true}
//           />
//           <Card 
//             title="Total Medicines" 
//             value={totalMedicines} 
//             gradient="bg-gradient-to-br from-purple-50 to-purple-100"
//             icon="💊"
//             compact={true}
//           />
//         </div>

//         {/* Compact Action Buttons */}
//         <div className="flex flex-wrap gap-3 mb-6">
//           <button
//             onClick={() => setShowAddForm(true)}
//             className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 text-sm"
//           >
//             ➕ Add Pharmacy
//           </button>
//           <button
//             onClick={fetchPharmacyCompanies}
//             className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 text-sm"
//           >
//             🔄 Refresh
//           </button>
//         </div>

//         {/* Add Pharmacy Company Form Modal */}
//         {showAddForm && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-xl p-4 md:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-lg md:text-xl font-bold text-gray-800">Add New Pharmacy</h3>
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
              
//               <form onSubmit={handleAddCompany} className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                 {/* Basic Information */}
//                 <div className="md:col-span-2">
//                   <h4 className="text-md font-semibold text-gray-800 mb-3 border-b pb-2">Basic Information</h4>
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Company Name *
//                   </label>
//                   <input
//                     type="text"
//                     name="name"
//                     value={formData.name}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                     placeholder="e.g., Medico Plus Pharmacy"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     License Number *
//                   </label>
//                   <input
//                     type="text"
//                     name="licenseNumber"
//                     value={formData.licenseNumber}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                     placeholder="e.g., PHARMA-PK-001"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Manager Name *
//                   </label>
//                   <input
//                     type="text"
//                     name="manager"
//                     value={formData.manager}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                     placeholder="e.g., Ahmed Raza"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Established Date
//                   </label>
//                   <input
//                     type="date"
//                     name="establishedDate"
//                     value={formData.establishedDate}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                   />
//                 </div>

//                 {/* Contact Information */}
//                 <div className="md:col-span-2 mt-3">
//                   <h4 className="text-md font-semibold text-gray-800 mb-3 border-b pb-2">Contact Information</h4>
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Phone Number *
//                   </label>
//                   <input
//                     type="tel"
//                     name="contact.phone"
//                     value={formData.contact.phone}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                     placeholder="e.g., +92-21-34567890"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Email Address *
//                   </label>
//                   <input
//                     type="email"
//                     name="contact.email"
//                     value={formData.contact.email}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                     placeholder="e.g., info@company.com"
//                     required
//                   />
//                 </div>

//                 {/* Address Information */}
//                 <div className="md:col-span-2 mt-3">
//                   <h4 className="text-md font-semibold text-gray-800 mb-3 border-b pb-2">Address Information</h4>
//                 </div>

//                 <div className="md:col-span-2">
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Street Address
//                   </label>
//                   <input
//                     type="text"
//                     name="address.street"
//                     value={formData.address.street}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                     placeholder="e.g., 123 Main Boulevard"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     City *
//                   </label>
//                   <input
//                     type="text"
//                     name="address.city"
//                     value={formData.address.city}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                     placeholder="e.g., Karachi"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     State *
//                   </label>
//                   <input
//                     type="text"
//                     name="address.state"
//                     value={formData.address.state}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                     placeholder="e.g., Sindh"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Country *
//                   </label>
//                   <input
//                     type="text"
//                     name="address.country"
//                     value={formData.address.country}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     ZIP Code
//                   </label>
//                   <input
//                     type="text"
//                     name="address.zipCode"
//                     value={formData.address.zipCode}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                     placeholder="e.g., 75500"
//                   />
//                 </div>

//                 {/* Specialties */}
//                 <div className="md:col-span-2 mt-3">
//                   <h4 className="text-md font-semibold text-gray-800 mb-3 border-b pb-2">Specialties</h4>
//                   <div className="space-y-2">
//                     <div className="flex gap-2">
//                       <input
//                         type="text"
//                         value={newSpecialty}
//                         onChange={(e) => setNewSpecialty(e.target.value)}
//                         className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                         placeholder="Add specialty (e.g., General Medicine)"
//                         onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
//                       />
//                       <button
//                         type="button"
//                         onClick={addSpecialty}
//                         className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm"
//                       >
//                         Add
//                       </button>
//                     </div>
                    
//                     <div className="flex flex-wrap gap-1">
//                       {formData.specialties.map((specialty, index) => (
//                         <span
//                           key={index}
//                           className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
//                         >
//                           {specialty}
//                           <button
//                             type="button"
//                             onClick={() => removeSpecialty(index)}
//                             className="text-blue-600 hover:text-blue-800 text-sm"
//                           >
//                             ×
//                           </button>
//                         </span>
//                       ))}
//                       {formData.specialties.length === 0 && (
//                         <span className="text-gray-500 text-xs">No specialties added</span>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Action Buttons */}
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
//                       'Add Pharmacy'
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

//         {/* Compact Pharmacy Companies Table */}
//         <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//           <div className="px-4 py-3 border-b border-gray-200">
//             <h2 className="text-lg font-bold text-gray-800">Pharmacy Companies</h2>
//             <p className="text-gray-600 text-sm">Manage all registered pharmacy companies</p>
//           </div>
          
//           {loading ? (
//             <div className="p-6 text-center">
//               <div className="loading-spinner mx-auto mb-2"></div>
//               <p className="text-gray-600 text-sm">Loading pharmacy companies...</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
//                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License</th>
//                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
//                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manager</th>
//                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
//                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicines</th>
//                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {pharmacyCompanies.map((company) => {
//                     const companyStats = getCompanyStats(company._id);
                    
//                     return (
//                       <tr 
//                         key={company._id} 
//                         className="hover:bg-gray-50 cursor-pointer"
//                         onClick={() => {
//                           setSelectedCompany(selectedCompany?._id === company._id ? null : company);
//                           if (!stats[company._id] || !stats[company._id].statusDistribution) {
//                             fetchCompanyStats(company._id);
//                           }
//                         }}
//                       >
//                         <td className="px-4 py-3">
//                           <div className="font-medium text-gray-900 text-sm">{company.name}</div>
//                           <div className="text-gray-500 text-xs">
//                             {company.specialties?.slice(0, 2).join(', ') || 'No specialties'}
//                             {company.specialties?.length > 2 && '...'}
//                           </div>
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className="text-gray-900 font-mono text-xs">{company.licenseNumber}</div>
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className="text-gray-900 text-sm">{company.contact?.phone}</div>
//                           <div className="text-gray-500 text-xs">{company.contact?.email}</div>
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className="text-gray-900 text-sm">{company.manager}</div>
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className="text-gray-900 text-sm">{company.address?.city}, {company.address?.state}</div>
//                           <div className="text-gray-500 text-xs">{company.address?.country}</div>
//                         </td>
//                         <td className="px-4 py-3">
//                           {statsLoading[company._id] ? (
//                             <div className="flex items-center gap-2">
//                               <div className="loading-spinner-small"></div>
//                               <span className="text-xs text-gray-500">Loading...</span>
//                             </div>
//                           ) : (
//                             <>
//                               <div className="font-semibold text-gray-900 text-sm">
//                                 {companyStats.totalMedicines} total
//                               </div>
//                               <div className="text-gray-500 text-xs">
//                                 {companyStats.verifiedMedicines} verified
//                               </div>
//                             </>
//                           )}
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className="flex gap-1">
//                             <button
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 window.location.href = `/pharmacy?company=${company._id}`;
//                               }}
//                               className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs transition-colors"
//                             >
//                               Add Medicine
//                             </button>
//                             <button
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 handleDeleteCompany(company._id, company.name);
//                               }}
//                               className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition-colors"
//                             >
//                               Delete
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                   {pharmacyCompanies.length === 0 && (
//                     <tr>
//                       <td colSpan="7" className="px-4 py-6 text-center text-gray-500 text-sm">
//                         No pharmacy companies found. Add your first pharmacy company to get started.
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           )}

//           {/* Selected Company Details */}
//           {selectedCompany && stats[selectedCompany._id] && (
//             <div className="border-t border-gray-200 p-4 bg-gray-50">
//               <div className="flex justify-between items-center mb-3">
//                 <h3 className="text-md font-semibold text-gray-800">
//                   {selectedCompany.name} - Statistics
//                 </h3>
//                 <button
//                   onClick={() => setSelectedCompany(null)}
//                   className="text-gray-500 hover:text-gray-700 text-sm"
//                 >
//                   ×
//                 </button>
//               </div>
              
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
//                 <div className="bg-white p-2 rounded border border-gray-200 text-center">
//                   <div className="text-lg font-bold text-blue-600">
//                     {stats[selectedCompany._id].totalMedicines}
//                   </div>
//                   <div className="text-xs text-gray-600">Total</div>
//                 </div>
//                 <div className="bg-white p-2 rounded border border-gray-200 text-center">
//                   <div className="text-lg font-bold text-green-600">
//                     {stats[selectedCompany._id].verifiedMedicines}
//                   </div>
//                   <div className="text-xs text-gray-600">Verified</div>
//                 </div>
//                 <div className="bg-white p-2 rounded border border-gray-200 text-center">
//                   <div className="text-lg font-bold text-red-600">
//                     {stats[selectedCompany._id].expiredMedicines}
//                   </div>
//                   <div className="text-xs text-gray-600">Expired</div>
//                 </div>
//                 <div className="bg-white p-2 rounded border border-gray-200 text-center">
//                   <div className="text-lg font-bold text-purple-600">
//                     {stats[selectedCompany._id].activeMedicines || 
//                      (stats[selectedCompany._id].totalMedicines - stats[selectedCompany._id].expiredMedicines)}
//                   </div>
//                   <div className="text-xs text-gray-600">Active</div>
//                 </div>
//               </div>

//               {/* Status Distribution */}
//               {stats[selectedCompany._id].statusDistribution && stats[selectedCompany._id].statusDistribution.length > 0 && (
//                 <div className="mt-3">
//                   <h4 className="text-sm font-semibold text-gray-800 mb-2">Status Distribution</h4>
//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
//                     {stats[selectedCompany._id].statusDistribution.map((status, index) => (
//                       <div key={index} className="bg-white p-2 rounded border border-gray-200">
//                         <div className="font-semibold text-gray-800 text-sm capitalize">
//                           {status._id || 'Unknown'}
//                         </div>
//                         <div className="text-xs text-gray-600">
//                           {status.count} medicines
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </ProtectedRoute>
//   );
// }

// export default PharmacyDashboardPage;



//                ignore the code below



// import React, { useState, useEffect } from "react";
// import ProtectedRoute from "../components/ProtectedRoute";
// import Card from "../components/Card";
// import { api } from "../utils/api";

// function PharmacyDashboardPage({ batches, metamask, user, theme, onRefresh }) {
//   const [pharmacyCompanies, setPharmacyCompanies] = useState([]);
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [stats, setStats] = useState({});
//   const [selectedCompany, setSelectedCompany] = useState(null);
//   const [statsLoading, setStatsLoading] = useState({});
//   const [formData, setFormData] = useState({
//     name: "",
//     licenseNumber: "",
//     address: {
//       street: "",
//       city: "",
//       state: "",
//       country: "Pakistan",
//       zipCode: ""
//     },
//     contact: {
//       phone: "",
//       email: ""
//     },
//     manager: "",
//     establishedDate: new Date().toISOString().split('T')[0],
//     specialties: []
//   });

//   const [newSpecialty, setNewSpecialty] = useState("");

//   // Fetch pharmacy companies
//   useEffect(() => {
//     fetchPharmacyCompanies();
//   }, []);

//   const fetchPharmacyCompanies = async () => {
//     try {
//       setLoading(true);
//       const response = await api.get("/pharmacy-companies");
//       if (response.success) {
//         setPharmacyCompanies(response.data);
//         console.log("✅ Loaded pharmacy companies:", response.data.length);
//       }
//     } catch (error) {
//       console.error("Error fetching pharmacy companies:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

// //                  NEW FEATURE BELOW REMOVE IF ERROR


//   // Add this function to handle stats fetching with retries
// const fetchCompanyStatsWithRetry = async (companyId, retries = 3) => {
//   try {
//     const response = await api.get(`/pharmacy-companies/${companyId}/stats`);
//     if (response.success) {
//       return response.data;
//     }
//     throw new Error(response.message || 'Failed to fetch stats');
//   } catch (error) {
//     if (retries > 0) {
//       console.log(`Retrying stats fetch for company ${companyId}, ${retries} retries left`);
//       await new Promise(resolve => setTimeout(resolve, 1000));
//       return fetchCompanyStatsWithRetry(companyId, retries - 1);
//     }
//     throw error;
//   }
// };

// // Update the fetchCompanyStats function in your component
// const fetchCompanyStats = async (companyId) => {
//   try {
//     console.log(`🔄 Fetching stats for company: ${companyId}`);
    
//     const stats = await fetchCompanyStatsWithRetry(companyId);
    
//     setStats(prev => ({
//       ...prev,
//       [companyId]: stats
//     }));
    
//     console.log(`✅ Stats loaded for company ${companyId}:`, stats);
//   } catch (error) {
//     console.error(`❌ Error fetching stats for company ${companyId}:`, error);
    
//     // Set default stats on error
//     setStats(prev => ({
//       ...prev,
//       [companyId]: {
//         totalMedicines: 0,
//         verifiedMedicines: 0,
//         expiredMedicines: 0,
//         activeMedicines: 0,
//         statusDistribution: [],
//         error: error.message
//       }
//     }));
//   }
// };

//     //                            OPEN this in case FAILURE
//   // const fetchCompanyStats = async (companyId) => {
//   //   try {
//   //     const response = await api.get(`/pharmacy-companies/${companyId}/stats`);
//   //     if (response.success) {
//   //       setStats(prev => ({
//   //         ...prev,
//   //         [companyId]: response.data
//   //       }));
//   //     }
//   //   } catch (error) {
//   //     console.error("Error fetching company stats:", error);
//   //   }
//   // };

//   const handleAddCompany = async (e) => {
//     e.preventDefault();
    
//     try {
//       setLoading(true);
      
//       const companyData = {
//         ...formData,
//         specialties: formData.specialties.filter(s => s.trim() !== "")
//       };

//       console.log("📤 Adding pharmacy company:", companyData);

//       const response = await api.post("/pharmacy-companies", companyData);
      
//       if (response.success) {
//         await fetchPharmacyCompanies();
//         resetForm();
//         setShowAddForm(false);
//         alert("✅ Pharmacy company added successfully!");
//       }
//     } catch (error) {
//       console.error("Error adding pharmacy company:", error);
//       alert(`❌ Failed to add pharmacy company: ${error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeleteCompany = async (companyId, companyName) => {
//     if (!window.confirm(`Are you sure you want to delete ${companyName}?`)) {
//       return;
//     }

//     try {
//       const response = await api.delete(`/pharmacy-companies/${companyId}`);
//       if (response.success) {
//         await fetchPharmacyCompanies();
//         alert("✅ Pharmacy company deleted successfully!");
//       }
//     } catch (error) {
//       console.error("Error deleting pharmacy company:", error);
//       alert(`❌ Failed to delete pharmacy company: ${error.message}`);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
    
//     if (name.includes('.')) {
//       const [parent, child] = name.split('.');
//       setFormData(prev => ({
//         ...prev,
//         [parent]: {
//           ...prev[parent],
//           [child]: value
//         }
//       }));
//     } else {
//       setFormData(prev => ({
//         ...prev,
//         [name]: value
//       }));
//     }
//   };

//   const addSpecialty = () => {
//     if (newSpecialty.trim() && !formData.specialties.includes(newSpecialty.trim())) {
//       setFormData(prev => ({
//         ...prev,
//         specialties: [...prev.specialties, newSpecialty.trim()]
//       }));
//       setNewSpecialty("");
//     }
//   };

//   const removeSpecialty = (index) => {
//     setFormData(prev => ({
//       ...prev,
//       specialties: prev.specialties.filter((_, i) => i !== index)
//     }));
//   };

//   const resetForm = () => {
//     setFormData({
//       name: "",
//       licenseNumber: "",
//       address: {
//         street: "",
//         city: "",
//         state: "",
//         country: "Pakistan",
//         zipCode: ""
//       },
//       contact: {
//         phone: "",
//         email: ""
//       },
//       manager: "",
//       establishedDate: new Date().toISOString().split('T')[0],
//       specialties: []
//     });
//     setNewSpecialty("");
//   };

//   const getCompanyStats = (companyId) => {
//     return stats[companyId] || {
//       totalMedicines: 0,
//       verifiedMedicines: 0,
//       expiredMedicines: 0
//     };
//   };

//   return (
//     <ProtectedRoute user={user} requiredRole="pharmacy">
//       {/* REMOVED BackgroundFix - App.js handles the layout */}
//       {/* SIMPLIFIED layout that fits within existing sidebar */}
//       <div className="p-4 md:p-6 max-w-full overflow-x-hidden">
//         {/* Compact Header */}
//         <div className="mb-6">
//           <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">
//             Pharmacy Companies Dashboard
//           </h1>
//           <p className="text-gray-600 text-sm">
//             Manage pharmacy companies and their medicine inventories
//           </p>
//         </div>

//         {/* Compact Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//           <Card 
//             title="Total Companies" 
//             value={pharmacyCompanies.length} 
//             gradient="bg-gradient-to-br from-blue-50 to-blue-100"
//             icon="🏪"
//             compact={true}
//           />
//           <Card 
//             title="Active Companies" 
//             value={pharmacyCompanies.filter(c => c.isActive).length} 
//             gradient="bg-gradient-to-br from-green-50 to-green-100"
//             icon="✅"
//             compact={true}
//           />
//           <Card 
//             title="Total Medicines" 
//             value={Object.values(stats).reduce((sum, stat) => sum + stat.totalMedicines, 0)} 
//             gradient="bg-gradient-to-br from-purple-50 to-purple-100"
//             icon="💊"
//             compact={true}
//           />
//         </div>

//         {/* Compact Action Buttons */}
//         <div className="flex flex-wrap gap-3 mb-6">
//           <button
//             onClick={() => setShowAddForm(true)}
//             className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 text-sm"
//           >
//             ➕ Add Pharmacy
//           </button>
//           <button
//             onClick={fetchPharmacyCompanies}
//             className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 text-sm"
//           >
//             🔄 Refresh
//           </button>
//         </div>

//         {/* Add Pharmacy Company Form Modal */}
//         {showAddForm && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-xl p-4 md:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-lg md:text-xl font-bold text-gray-800">Add New Pharmacy</h3>
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
              
//               <form onSubmit={handleAddCompany} className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                 {/* Basic Information */}
//                 <div className="md:col-span-2">
//                   <h4 className="text-md font-semibold text-gray-800 mb-3 border-b pb-2">Basic Information</h4>
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Company Name *
//                   </label>
//                   <input
//                     type="text"
//                     name="name"
//                     value={formData.name}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                     placeholder="e.g., Medico Plus Pharmacy"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     License Number *
//                   </label>
//                   <input
//                     type="text"
//                     name="licenseNumber"
//                     value={formData.licenseNumber}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                     placeholder="e.g., PHARMA-PK-001"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Manager Name *
//                   </label>
//                   <input
//                     type="text"
//                     name="manager"
//                     value={formData.manager}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                     placeholder="e.g., Ahmed Raza"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Established Date
//                   </label>
//                   <input
//                     type="date"
//                     name="establishedDate"
//                     value={formData.establishedDate}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                   />
//                 </div>

//                 {/* Contact Information */}
//                 <div className="md:col-span-2 mt-3">
//                   <h4 className="text-md font-semibold text-gray-800 mb-3 border-b pb-2">Contact Information</h4>
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Phone Number *
//                   </label>
//                   <input
//                     type="tel"
//                     name="contact.phone"
//                     value={formData.contact.phone}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                     placeholder="e.g., +92-21-34567890"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Email Address *
//                   </label>
//                   <input
//                     type="email"
//                     name="contact.email"
//                     value={formData.contact.email}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                     placeholder="e.g., info@company.com"
//                     required
//                   />
//                 </div>

//                 {/* Address Information */}
//                 <div className="md:col-span-2 mt-3">
//                   <h4 className="text-md font-semibold text-gray-800 mb-3 border-b pb-2">Address Information</h4>
//                 </div>

//                 <div className="md:col-span-2">
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Street Address
//                   </label>
//                   <input
//                     type="text"
//                     name="address.street"
//                     value={formData.address.street}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                     placeholder="e.g., 123 Main Boulevard"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     City *
//                   </label>
//                   <input
//                     type="text"
//                     name="address.city"
//                     value={formData.address.city}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                     placeholder="e.g., Karachi"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     State *
//                   </label>
//                   <input
//                     type="text"
//                     name="address.state"
//                     value={formData.address.state}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                     placeholder="e.g., Sindh"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Country *
//                   </label>
//                   <input
//                     type="text"
//                     name="address.country"
//                     value={formData.address.country}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     ZIP Code
//                   </label>
//                   <input
//                     type="text"
//                     name="address.zipCode"
//                     value={formData.address.zipCode}
//                     onChange={handleChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                     placeholder="e.g., 75500"
//                   />
//                 </div>

//                 {/* Specialties */}
//                 <div className="md:col-span-2 mt-3">
//                   <h4 className="text-md font-semibold text-gray-800 mb-3 border-b pb-2">Specialties</h4>
//                   <div className="space-y-2">
//                     <div className="flex gap-2">
//                       <input
//                         type="text"
//                         value={newSpecialty}
//                         onChange={(e) => setNewSpecialty(e.target.value)}
//                         className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                         placeholder="Add specialty (e.g., General Medicine)"
//                         onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
//                       />
//                       <button
//                         type="button"
//                         onClick={addSpecialty}
//                         className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm"
//                       >
//                         Add
//                       </button>
//                     </div>
                    
//                     <div className="flex flex-wrap gap-1">
//                       {formData.specialties.map((specialty, index) => (
//                         <span
//                           key={index}
//                           className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
//                         >
//                           {specialty}
//                           <button
//                             type="button"
//                             onClick={() => removeSpecialty(index)}
//                             className="text-blue-600 hover:text-blue-800 text-sm"
//                           >
//                             ×
//                           </button>
//                         </span>
//                       ))}
//                       {formData.specialties.length === 0 && (
//                         <span className="text-gray-500 text-xs">No specialties added</span>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Action Buttons */}
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
//                       'Add Pharmacy'
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

//         {/* Compact Pharmacy Companies Table */}
//         <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//           <div className="px-4 py-3 border-b border-gray-200">
//             <h2 className="text-lg font-bold text-gray-800">Pharmacy Companies</h2>
//             <p className="text-gray-600 text-sm">Manage all registered pharmacy companies</p>
//           </div>
          
//           {loading ? (
//             <div className="p-6 text-center">
//               <div className="loading-spinner mx-auto mb-2"></div>
//               <p className="text-gray-600 text-sm">Loading pharmacy companies...</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
//                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License</th>
//                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
//                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manager</th>
//                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
//                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicines</th>
//                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {pharmacyCompanies.map((company) => {
//                     const companyStats = getCompanyStats(company._id);
                    
//                     return (
//                       <tr 
//                         key={company._id} 
//                         className="hover:bg-gray-50"
//                         onClick={() => {
//                           setSelectedCompany(selectedCompany?._id === company._id ? null : company);
//                           if (!stats[company._id]) {
//                             fetchCompanyStats(company._id);
//                           }
//                         }}
//                       >
//                         <td className="px-4 py-3">
//                           <div className="font-medium text-gray-900 text-sm">{company.name}</div>
//                           <div className="text-gray-500 text-xs">
//                             {company.specialties.slice(0, 2).join(', ')}
//                             {company.specialties.length > 2 && '...'}
//                           </div>
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className="text-gray-900 font-mono text-xs">{company.licenseNumber}</div>
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className="text-gray-900 text-sm">{company.contact.phone}</div>
//                           <div className="text-gray-500 text-xs">{company.contact.email}</div>
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className="text-gray-900 text-sm">{company.manager}</div>
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className="text-gray-900 text-sm">{company.address.city}, {company.address.state}</div>
//                           <div className="text-gray-500 text-xs">{company.address.country}</div>
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className="font-semibold text-gray-900 text-sm">
//                             {companyStats.totalMedicines} total
//                           </div>
//                           <div className="text-gray-500 text-xs">
//                             {companyStats.verifiedMedicines} verified
//                           </div>
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className="flex gap-1">
//                             <button
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 window.location.href = `/pharmacy?company=${company._id}`;
//                               }}
//                               className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs transition-colors"
//                             >
//                               Add Medicine
//                             </button>
//                             <button
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 handleDeleteCompany(company._id, company.name);
//                               }}
//                               className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition-colors"
//                             >
//                               Delete
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                   {pharmacyCompanies.length === 0 && (
//                     <tr>
//                       <td colSpan="7" className="px-4 py-6 text-center text-gray-500 text-sm">
//                         No pharmacy companies found. Add your first pharmacy company to get started.
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           )}

//           {/* Selected Company Details */}
//           {selectedCompany && stats[selectedCompany._id] && (
//             <div className="border-t border-gray-200 p-4 bg-gray-50">
//               <div className="flex justify-between items-center mb-3">
//                 <h3 className="text-md font-semibold text-gray-800">
//                   {selectedCompany.name} - Statistics
//                 </h3>
//                 <button
//                   onClick={() => setSelectedCompany(null)}
//                   className="text-gray-500 hover:text-gray-700 text-sm"
//                 >
//                   ×
//                 </button>
//               </div>
              
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
//                 <div className="bg-white p-2 rounded border border-gray-200 text-center">
//                   <div className="text-lg font-bold text-blue-600">
//                     {stats[selectedCompany._id].totalMedicines}
//                   </div>
//                   <div className="text-xs text-gray-600">Total</div>
//                 </div>
//                 <div className="bg-white p-2 rounded border border-gray-200 text-center">
//                   <div className="text-lg font-bold text-green-600">
//                     {stats[selectedCompany._id].verifiedMedicines}
//                   </div>
//                   <div className="text-xs text-gray-600">Verified</div>
//                 </div>
//                 <div className="bg-white p-2 rounded border border-gray-200 text-center">
//                   <div className="text-lg font-bold text-red-600">
//                     {stats[selectedCompany._id].expiredMedicines}
//                   </div>
//                   <div className="text-xs text-gray-600">Expired</div>
//                 </div>
//                 <div className="bg-white p-2 rounded border border-gray-200 text-center">
//                   <div className="text-lg font-bold text-purple-600">
//                     {stats[selectedCompany._id].totalMedicines - stats[selectedCompany._id].expiredMedicines}
//                   </div>
//                   <div className="text-xs text-gray-600">Active</div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </ProtectedRoute>
//   );
// }

// export default PharmacyDashboardPage;




