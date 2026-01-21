import React, { useState, useEffect } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import Card from "../components/Card";
import { api } from "../utils/api";
import CompanyMetaMaskConnector from "../components/CompanyMetaMaskConnector"; // Add this
import { useNavigate } from "react-router-dom";
function ManufacturerDashboardPage({ batches, metamask, user, theme, onRefresh }) {
  const [manufacturerCompanies, setManufacturerCompanies] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: "",
    licenseNumber: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "Pakistan",
      zipCode: ""
    },
    contactEmail: "",
    phone: "",
    specialties: []
  });

  const [newSpecialty, setNewSpecialty] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  // Fetch manufacturer companies with stats
  useEffect(() => {
    fetchManufacturerCompanies();
  }, []);


  // Our Fetch Manufacturer Companies Function
const fetchManufacturerCompanies = async () => {
  try {
    setLoading(true);
    console.log("🔄 Fetching manufacturer companies with stats...");
    
    const response = await api.get("/manufacturer-companies");
    
    if (response.success) {
      const companiesData = response.data || [];
      
      // Get ALL batches
      const batchesResponse = await api.get("/batches");
      const allBatches = batchesResponse.success ? batchesResponse.data : [];
      
      // Process each company
      const companiesWithStats = companiesData.map(company => {
        // Get manufacturer batches (NOT pharmacy medicines)
        const manufacturerBatches = allBatches.filter(batch => {
          const batchManufacturer = batch.manufacturer?.trim().toLowerCase();
          const companyName = company.companyName?.trim().toLowerCase();
          
          // Filtered by manufacturer name AND ensure it's not a pharmacy medicine duplicate
          // Original manufacturer batches (not pharmacy-accepted duplicates)
          return batchManufacturer === companyName && 
                 !batch.pharmacyCompanyId && // Not linked to pharmacy
                 batch.source !== 'pharmacy'; // Not from pharmacy collection
        });
        
        // Here We Get accepted batches (these are the original batches with status 'accepted')
        const acceptedBatches = manufacturerBatches.filter(batch => 
          batch.status === 'accepted'
        );
        
        // To Calculate stats
        const totalBatches = manufacturerBatches.length;
        const acceptedCount = acceptedBatches.length;
        const availableCount = totalBatches - acceptedCount;
        
        // The Additional stats
        const verifiedBatches = manufacturerBatches.filter(b => b.blockchainVerified).length;
        const expiredBatches = manufacturerBatches.filter(b => {
          const expiryDate = new Date(b.expiry || b.expiryDate);
          return expiryDate < new Date();
        }).length;
        const activeBatches = totalBatches - expiredBatches;
        
        return {
          ...company,
          batches: {
            all: manufacturerBatches,
            available: manufacturerBatches.filter(b => b.status !== 'accepted'),
            accepted: acceptedBatches
          },
          stats: {
            totalBatches,
            availableBatches: availableCount,
            acceptedBatches: acceptedCount,
            verifiedBatches,
            expiredBatches,
            activeBatches
          }
        };
      });
      
      setManufacturerCompanies(companiesWithStats);
    } else {
      setManufacturerCompanies([]);
    }
  } catch (error) {
    console.error("❌ Error fetching manufacturer companies:", error);
    setManufacturerCompanies([]);
  } finally {
    setLoading(false);
  }
};

  // The Enhanced validation function
  const validateField = (name, value) => {
    const errors = { ...formErrors };

    switch (name) {
      case 'companyName':
        if (!value.trim()) {
          errors.companyName = 'Company name is required';
        } else if (value.trim().length < 2) {
          errors.companyName = 'Company name must be at least 2 characters';
        } else if (value.trim().length > 100) {
          errors.companyName = 'Company name cannot exceed 100 characters';
        } else if (!/^[a-zA-Z0-9\s&.,()-]+$/.test(value.trim())) {
          errors.companyName = 'Company name can only contain letters, numbers, spaces, and basic punctuation';
        } else {
          delete errors.companyName;
        }
        break;

      case 'licenseNumber':
        if (!value.trim()) {
          errors.licenseNumber = 'License number is required';
        } else if (!/^[A-Za-z0-9-]+$/.test(value.trim())) {
          errors.licenseNumber = 'License number can only contain letters, numbers, and hyphens';
        } else if (value.trim().length < 3) {
          errors.licenseNumber = 'License number must be at least 3 characters';
        } else if (value.trim().length > 50) {
          errors.licenseNumber = 'License number cannot exceed 50 characters';
        } else {
          delete errors.licenseNumber;
        }
        break;

      case 'contactEmail':
        if (!value.trim()) {
          errors.contactEmail = 'Email address is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          errors.contactEmail = 'Please enter a valid email address (e.g., company@domain.com)';
        } else if (value.trim().length > 100) {
          errors.contactEmail = 'Email address cannot exceed 100 characters';
        } else {
          delete errors.contactEmail;
        }
        break;

      case 'phone':
        if (!value.trim()) {
          errors.phone = 'Phone number is required';
        } else if (!/^[\+]?[0-9\s\-\(\)]{10,15}$/.test(value.trim().replace(/\s/g, ''))) {
          errors.phone = 'Please enter a valid phone number (10-15 digits)';
        } else {
          delete errors.phone;
        }
        break;

      case 'address.street':
        if (value.trim() && value.trim().length > 200) {
          errors.street = 'Street address cannot exceed 200 characters';
        } else {
          delete errors.street;
        }
        break;

      case 'address.city':
        if (!value.trim()) {
          errors.city = 'City is required';
        } else if (value.trim().length < 2) {
          errors.city = 'City must be at least 2 characters';
        } else if (value.trim().length > 50) {
          errors.city = 'City cannot exceed 50 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          errors.city = 'City can only contain letters and spaces';
        } else {
          delete errors.city;
        }
        break;

      case 'address.state':
        if (!value.trim()) {
          errors.state = 'State is required';
        } else if (value.trim().length < 2) {
          errors.state = 'State must be at least 2 characters';
        } else if (value.trim().length > 50) {
          errors.state = 'State cannot exceed 50 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          errors.state = 'State can only contain letters and spaces';
        } else {
          delete errors.state;
        }
        break;

      case 'address.country':
        if (!value.trim()) {
          errors.country = 'Country is required';
        } else if (value.trim().length < 2) {
          errors.country = 'Country must be at least 2 characters';
        } else if (value.trim().length > 50) {
          errors.country = 'Country cannot exceed 50 characters';
        } else {
          delete errors.country;
        }
        break;

      case 'address.zipCode':
        if (value.trim() && !/^[A-Za-z0-9\-]{3,10}$/.test(value.trim())) {
          errors.zipCode = 'ZIP code must be 3-10 characters (letters, numbers, hyphens only)';
        } else {
          delete errors.zipCode;
        }
        break;

      default:
        break;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Strict Validation Errors on Submit
  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.companyName?.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.licenseNumber?.trim()) {
      newErrors.licenseNumber = 'License number is required';
    }

    if (!formData.contactEmail?.trim()) {
      newErrors.contactEmail = 'Email address is required';
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.address?.city?.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.address?.state?.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.address?.country?.trim()) {
      newErrors.country = 'Country is required';
    }

    // Email format validation
    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }

    // Phone format validation
    if (formData.phone && !/^[\+]?[0-9\s\-\(\)]{10,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Mark all fields as touched to show errors
    const allFields = [
      'companyName', 'licenseNumber', 'contactEmail', 'phone', 
      'address.city', 'address.state', 'address.country'
    ];
    const newTouched = { ...touchedFields };
    allFields.forEach(field => {
      newTouched[field] = true;
    });
    setTouchedFields(newTouched);

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Mark field as touched
    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }));
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
      
      // Validate the field immediately
      validateField(name, value);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Validate the field immediately
      validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }));
    validateField(name, value);
  };

  // Helper to validate specialty input
  const validateSpecialty = (specialty) => {
    if (!specialty.trim()) return 'Specialty cannot be empty';
    if (specialty.trim().length < 2) return 'Specialty must be at least 2 characters';
    if (specialty.trim().length > 50) return 'Specialty cannot exceed 50 characters';
    if (!/^[a-zA-Z\s&-]+$/.test(specialty.trim())) return 'Specialty can only contain letters, spaces, &, and -';
    return null;
  };

  const addSpecialty = () => {
    const validationError = validateSpecialty(newSpecialty);
    if (validationError) {
      alert(validationError);
      return;
    }

    const trimmedSpecialty = newSpecialty.trim();
    
    if (formData.specialties.includes(trimmedSpecialty)) {
      alert('This specialty has already been added.');
      return;
    }

    if (formData.specialties.length >= 10) {
      alert('Maximum 10 specialties allowed.');
      return;
    }

    setFormData(prev => ({
      ...prev,
      specialties: [...prev.specialties, trimmedSpecialty]
    }));
    setNewSpecialty("");
  };

  const removeSpecialty = (index) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index)
    }));
  };

  const handleAddCompany = async (e) => {
    e.preventDefault();
    
    console.log("🔄 Starting form validation...");

    // First, validate all fields
    const isFormValid = validateForm();
    
    if (!isFormValid) {
      const errorCount = Object.keys(formErrors).length;
      alert(`Please fix the ${errorCount} validation error${errorCount > 1 ? 's' : ''} before submitting.`);
      return;
    }

    // Additional validation for specialties
    if (formData.specialties.length === 0) {
      alert('Please add at least one specialty for the manufacturer.');
      return;
    }

    // Check for any remaining errors
    if (Object.keys(formErrors).length > 0) {
      console.log('❌ Form errors:', formErrors);
      alert('Please fix all validation errors before submitting.');
      return;
    }

    try {
      setLoading(true);
      
      const companyData = {
        ...formData,
        specialties: formData.specialties.filter(s => s.trim() !== "")
      };

      console.log("📤 Adding manufacturer company:", companyData);

      const response = await api.post("/manufacturer-companies", companyData);
      
      if (response.success) {
        await fetchManufacturerCompanies();
        resetForm();
        setShowAddForm(false);
        setFormErrors({});
        setTouchedFields({});
        alert("✅ Manufacturer company added successfully!");
      } else {
        throw new Error(response.message || 'Failed to add manufacturer company');
      }
    } catch (error) {
      console.error("Error adding manufacturer company:", error);
      
      // Handle specific error cases
      if (error.message.includes('duplicate') || error.message.includes('already exists')) {
        alert('❌ A manufacturer with this name or license number already exists.');
      } else if (error.message.includes('validation failed')) {
        alert('❌ Please check your input data and try again.');
      } else if (error.message.includes('network') || error.message.includes('connection')) {
        alert('❌ Network error. Please check your connection and try again.');
      } else {
        alert(`❌ Failed to add manufacturer company: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // SINGLE handle DeleteCompany function (remove any duplicates)
  const handleDeleteCompany = async (companyId, companyName) => {
    if (!window.confirm(`Are you sure you want to delete "${companyName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await api.delete(`/manufacturer-companies/${companyId}`);
      if (response.success) {
        await fetchManufacturerCompanies();
        alert("✅ Manufacturer company deleted successfully!");
      } else {
        throw new Error(response.message || 'Failed to delete manufacturer company');
      }
    } catch (error) {
      console.error("Error deleting manufacturer company:", error);
      alert(`❌ Failed to delete manufacturer company: ${error.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      companyName: "",
      licenseNumber: "",
      address: {
        street: "",
        city: "",
        state: "",
        country: "Pakistan",
        zipCode: ""
      },
      contactEmail: "",
      phone: "",
      specialties: []
    });
    setNewSpecialty("");
    setFormErrors({});
    setTouchedFields({});
    
    console.log("✅ Form reset successfully");
  };
  // Helper to get stats for a specific company
const getCompanyStats = (companyId) => {
  const company = manufacturerCompanies.find(c => c._id === companyId);
  
  if (company) {
    // Return detailed stats
    return company.stats || {
      totalBatches: 0,
      availableBatches: 0,
      acceptedBatches: 0,
      verifiedBatches: 0,
      expiredBatches: 0,
      activeBatches: 0
    };
  }
  
  return {
    totalBatches: 0,
    availableBatches: 0,
    acceptedBatches: 0,
    verifiedBatches: 0,
    expiredBatches: 0,
    activeBatches: 0
  };
};
  // Calculate total batches across all companies
const totalBatches = manufacturerCompanies.reduce((sum, company) => {
  return sum + (getCompanyStats(company._id).totalBatches || 0);
}, 0);

const totalAvailableBatches = manufacturerCompanies.reduce((sum, company) => {
  return sum + (getCompanyStats(company._id).availableBatches || 0);
}, 0);

const totalAcceptedBatches = manufacturerCompanies.reduce((sum, company) => {
  return sum + (getCompanyStats(company._id).acceptedBatches || 0);
}, 0);

  // Helper to check if field should show error
  const shouldShowError = (fieldName) => {
    return touchedFields[fieldName] && formErrors[fieldName];
  };

  return (
    <ProtectedRoute user={user} requiredRole="manufacturer">
      <div className="p-4 md:p-6 max-w-full overflow-x-hidden">
        {/* Compact Header */}
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">
            Manufacturer Companies Dashboard
          </h1>
          <p className="text-gray-600 text-sm">
            Manage manufacturer companies and their production batches
          </p>
        </div>

        {/* Compact Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
  <Card 
    title="Total Companies" 
    value={manufacturerCompanies.length} 
    gradient="bg-gradient-to-br from-blue-50 to-blue-100"
    icon="🏭"
    compact={true}
  />
  <Card 
    title="Available Batches" 
    value={totalAvailableBatches} 
    gradient="bg-gradient-to-br from-green-50 to-green-100"
    icon="📦"
    compact={true}
  />
  <Card 
    title="Accepted Batches" 
    value={totalAcceptedBatches} 
    gradient="bg-gradient-to-br from-purple-50 to-purple-100"
    icon="✅"
    compact={true}
  />
  <Card 
    title="Total Batches" 
    value={totalBatches} 
    gradient="bg-gradient-to-br from-gray-50 to-gray-100"
    icon="📊"
    compact={true}
  />
</div>

        {/* Compact Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 text-sm"
          >
            ➕ Add Manufacturer
          </button>
          <button
            onClick={fetchManufacturerCompanies}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 text-sm"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Add Manufacturer Company Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-4 md:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg md:text-xl font-bold text-gray-800">Add New Manufacturer</h3>
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
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors ${
                      shouldShowError('companyName') ? 'border-red-300 bg-red-50 text-red-900' : 'border-gray-300'
                    }`}
                    placeholder="e.g., MediLife Labs"
                    required
                    maxLength={100}
                  />
                  {shouldShowError('companyName') && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <span>⚠</span> {formErrors.companyName}
                    </p>
                  )}
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {formData.companyName.length}/100
                  </div>
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
                    onBlur={handleBlur}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors ${
                      shouldShowError('licenseNumber') ? 'border-red-300 bg-red-50 text-red-900' : 'border-gray-300'
                    }`}
                    placeholder="e.g., MANU-PK-001"
                    required
                    maxLength={50}
                  />
                  {shouldShowError('licenseNumber') && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <span>⚠</span> {formErrors.licenseNumber}
                    </p>
                  )}
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {formData.licenseNumber.length}/50
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors ${
                      shouldShowError('contactEmail') ? 'border-red-300 bg-red-50 text-red-900' : 'border-gray-300'
                    }`}
                    placeholder="e.g., info@company.com"
                    required
                    maxLength={100}
                  />
                  {shouldShowError('contactEmail') && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <span>⚠</span> {formErrors.contactEmail}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors ${
                      shouldShowError('phone') ? 'border-red-300 bg-red-50 text-red-900' : 'border-gray-300'
                    }`}
                    placeholder="e.g., +92-21-34567890"
                    required
                    maxLength={15}
                  />
                  {shouldShowError('phone') && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <span>⚠</span> {formErrors.phone}
                    </p>
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
                    onBlur={handleBlur}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors ${
                      shouldShowError('address.street') ? 'border-red-300 bg-red-50 text-red-900' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 123 Industrial Area"
                    maxLength={200}
                  />
                  {shouldShowError('address.street') && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <span>⚠</span> {formErrors.street}
                    </p>
                  )}
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {formData.address.street.length}/200
                  </div>
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
                    onBlur={handleBlur}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors ${
                      shouldShowError('address.city') ? 'border-red-300 bg-red-50 text-red-900' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Karachi"
                    required
                    maxLength={50}
                  />
                  {shouldShowError('address.city') && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <span>⚠</span> {formErrors.city}
                    </p>
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
                    onBlur={handleBlur}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors ${
                      shouldShowError('address.state') ? 'border-red-300 bg-red-50 text-red-900' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Sindh"
                    required
                    maxLength={50}
                  />
                  {shouldShowError('address.state') && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <span>⚠</span> {formErrors.state}
                    </p>
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
                    onBlur={handleBlur}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors ${
                      shouldShowError('address.country') ? 'border-red-300 bg-red-50 text-red-900' : 'border-gray-300'
                    }`}
                    required
                    maxLength={50}
                  />
                  {shouldShowError('address.country') && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <span>⚠</span> {formErrors.country}
                    </p>
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
                    onBlur={handleBlur}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors ${
                      shouldShowError('address.zipCode') ? 'border-red-300 bg-red-50 text-red-900' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 75500"
                    maxLength={10}
                  />
                  {shouldShowError('address.zipCode') && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <span>⚠</span> {formErrors.zipCode}
                    </p>
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
                        placeholder="Add specialty (e.g., Antibiotics)"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
                        maxLength={50}
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
                    <div className="text-xs text-gray-500">
                      {formData.specialties.length}/10 specialties added
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="md:col-span-2 flex gap-2 pt-4">
                  <button
                    type="submit"
                    disabled={loading || Object.keys(formErrors).length > 0}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                  >
                    {loading ? (
                      <>
                        <div className="loading-spinner-small"></div>
                        Adding...
                      </>
                    ) : (
                      'Add Manufacturer'
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

                {/* Form Status */}
                <div className="md:col-span-2 text-center">
                  {Object.keys(formErrors).length > 0 && (
                    <div className="text-red-500 text-xs mt-2">
                      {Object.keys(formErrors).length} error{Object.keys(formErrors).length > 1 ? 's' : ''} need to be fixed
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Compact Manufacturer Companies Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800">Manufacturer Companies</h2>
            <p className="text-gray-600 text-sm">Manage all registered manufacturer companies</p>
          </div>
          
          {loading ? (
            <div className="p-6 text-center">
              <div className="loading-spinner mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">Loading manufacturer companies...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batches</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {manufacturerCompanies.map((company) => {
                    const companyStats = getCompanyStats(company._id);
                    
                    return (
                      <tr 
                        key={company._id} 
                        className="hover:bg-gray-50"
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900 text-sm">{company.companyName}</div>
                          <div className="text-gray-500 text-xs">
                            {company.specialties?.slice(0, 2).join(', ') || 'No specialties'}
                            {company.specialties?.length > 2 && '...'}
                          </div>
                          <div className="mt-2">
                            <CompanyMetaMaskConnector
                            companyId={company._id}
                            companyName={company.companyName}
                            companyType="manufacturer"
                            currentAddress={company.blockchainAddress}
                            onConnectionChange={() => fetchManufacturerCompanies()}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-gray-900 font-mono text-xs">{company.licenseNumber}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-gray-900 text-sm">{company.contactEmail}</div>
                          <div className="text-gray-500 text-xs">{company.phone}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-gray-900 text-sm">{company.address?.city}, {company.address?.state}</div>
                          <div className="text-gray-500 text-xs">{company.address?.country}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900 text-sm">
                            {companyStats.totalBatches} total
                          </div>
                        <div className="text-gray-500 text-xs">
                          <span className="text-green-600">{companyStats.availableBatches} available</span>
                          <span className="mx-1">•</span>
                          <span className="text-purple-600">{companyStats.acceptedBatches} accepted</span>
                        </div>
                        <div className="text-gray-400 text-xs mt-0.5">
                          {companyStats.verifiedBatches} verified • {companyStats.activeBatches} active
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                              navigate(`/manufacturer?company=${company._id}`);
                              }}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs transition-colors"
                            >
                              Add Batch
                            </button>

                  {/* Only show delete button for admin users */}
                  {user?.role === 'admin' && (
                  <button
                  onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCompany(company._id, company.companyName);
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition-colors"
                  >
                    Delete
                  </button>
                  )}
                  </div>
                    </td>
                      </tr>
                    );
                  })}
                  {manufacturerCompanies.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-4 py-6 text-center text-gray-500 text-sm">
                        No manufacturer companies found. Add your first manufacturer company to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default ManufacturerDashboardPage;
