import React, { useState } from "react";
import BackgroundFix from "../components/BackgroundFix";
import { THEMES } from "../data/themes";
import { validateLogin, validateUserRegistration } from "../utils/validation";
import { api } from "../utils/api";

function ViewerLoginPage({ onLogin, onBack }) {
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [credentials, setCredentials] = useState({ 
    username: '', 
    password: '',
    confirmPassword: ''
  });
  const [userDetails, setUserDetails] = useState({
    name: '',
    email: '',
    cnic: '',
    phone: '',
    address: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (field, value) => {
    if (field === 'cnic') {
      // Auto-format CNIC
      const formattedValue = formatCNIC(value);
      setUserDetails(prev => ({
        ...prev,
        [field]: formattedValue
      }));
    } else if (['username', 'password', 'confirmPassword'].includes(field)) {
      setCredentials(prev => ({
        ...prev,
        [field]: value
      }));
    } else {
      setUserDetails(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  // CNIC formatting function
  const formatCNIC = (value) => {
    // Remove all non-digits
    const numbers = value.replace(/\D/g, '');
    
    // Format as 12345-1234567-1
    if (numbers.length <= 5) {
      return numbers;
    } else if (numbers.length <= 12) {
      return `${numbers.slice(0, 5)}-${numbers.slice(5)}`;
    } else {
      return `${numbers.slice(0, 5)}-${numbers.slice(5, 12)}-${numbers.slice(12, 13)}`;
    }
  };

  const validateRegistration = () => {
    const newErrors = {};

    // Username validation
    if (!credentials.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (credentials.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(credentials.username.trim())) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    // Password validation
    if (!credentials.password) {
      newErrors.password = 'Password is required';
    } else if (credentials.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(credentials.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase letters and numbers';
    }

    // Confirm password validation
    if (!credentials.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (credentials.password !== credentials.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Name validation
    if (!userDetails.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (userDetails.name.trim().length < 2) {
      newErrors.name = 'Full name must be at least 2 characters';
    }

    // Email validation
    if (!userDetails.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userDetails.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    // CNIC validation
    if (!userDetails.cnic.trim()) {
      newErrors.cnic = 'CNIC is required';
    } else if (!/^\d{5}-\d{7}-\d{1}$/.test(userDetails.cnic.trim())) {
      newErrors.cnic = 'CNIC must be in format: 12345-1234567-1';
    }

    // Phone validation
    if (!userDetails.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\+]?[0-9\s\-\(\)]{10,15}$/.test(userDetails.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Address validation
    if (!userDetails.address.trim()) {
      newErrors.address = 'Address is required';
    } else if (userDetails.address.trim().length < 10) {
      newErrors.address = 'Address must be at least 10 characters';
    }

    return newErrors;
  };

  const handleCreateAccount = async (e) => {
  e.preventDefault();
  
  // Validate registration form
  const validationErrors = validateRegistration();
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  setErrors({});
  setLoading(true);

  try {
    // Prepare user data
    const userData = {
      username: credentials.username.trim(),
      password: credentials.password,
      name: userDetails.name.trim(),
      email: userDetails.email.trim().toLowerCase(),
      cnic: userDetails.cnic.trim(),
      phone: userDetails.phone.trim(),
      address: userDetails.address.trim()
    };

    console.log("📤 Creating viewer account:", userData.username);

    // Use the new public endpoint for viewer registration
    const response = await api.post("/auth/register-viewer", userData);
    
    if (response.success) {
      // Show success message
      setSuccessMessage(`✅ Account created successfully! ${response.emailSent ? '📧 Welcome email sent.' : ''}`);
      setShowSuccess(true);
      
      // Reset form
      setCredentials({ 
        username: '', 
        password: '',
        confirmPassword: ''
      });
      setUserDetails({
        name: '',
        email: '',
        cnic: '',
        phone: '',
        address: ''
      });
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccess(false);
        setSuccessMessage('');
        // Switch back to login view
        setIsCreatingAccount(false);
      }, 5000);
    } else {
      throw new Error(response.message || 'Failed to create account');
    }
  } catch (error) {
    console.error("❌ Error creating account:", error);
    setErrors({ 
      submit: error.message || 'Failed to create account. Please try again.' 
    });
  } finally {
    setLoading(false);
  }
};

  const handleLogin = async (e) => {
    e.preventDefault();
    
    const validation = validateLogin(credentials);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await onLogin(credentials.username, credentials.password, 'viewer');
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsCreatingAccount(!isCreatingAccount);
    setErrors({});
    setSuccessMessage('');
    setShowSuccess(false);
  };

  return (
    <BackgroundFix theme={THEMES.blue}>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg w-full max-w-md">
          <button onClick={onBack} className="mb-4 text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-2 text-sm">
            ← Back to Role Selection
          </button>
          
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">👁️</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {isCreatingAccount ? 'Create Viewer Account' : 'Viewer Login'}
            </h1>
            <p className="text-gray-600">
              {isCreatingAccount ? 'Create your quality checking account' : 'Quality Checking Portal'}
            </p>
          </div>

          {/* Success Message */}
          {showSuccess && successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="text-green-500 text-xl">✅</div>
                <div>
                  <p className="text-green-700 font-medium">{successMessage}</p>
                  <p className="text-green-600 text-sm mt-1">
                    You can now login with your credentials.
                  </p>
                </div>
              </div>
            </div>
          )}

          {isCreatingAccount ? (
            // CREATE ACCOUNT FORM
            <form onSubmit={handleCreateAccount} className="space-y-6">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className={`w-full p-3 border-2 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition ${
                    errors.username ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50 focus:border-blue-500'
                  }`}
                  placeholder="Choose a username (e.g., john_doe)"
                  disabled={loading}
                  maxLength={20}
                />
                {errors.username && (
                  <p className="text-red-600 text-sm mt-1">{errors.username}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full p-3 border-2 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition ${
                    errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50 focus:border-blue-500'
                  }`}
                  placeholder="Minimum 8 characters with uppercase, lowercase, and numbers"
                  disabled={loading}
                />
                {errors.password && (
                  <p className="text-red-600 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  value={credentials.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`w-full p-3 border-2 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition ${
                    errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50 focus:border-blue-500'
                  }`}
                  placeholder="Re-enter your password"
                  disabled={loading}
                />
                {errors.confirmPassword && (
                  <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={userDetails.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full p-3 border-2 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition ${
                    errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50 focus:border-blue-500'
                  }`}
                  placeholder="Enter your full name"
                  disabled={loading}
                />
                {errors.name && (
                  <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={userDetails.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full p-3 border-2 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition ${
                    errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50 focus:border-blue-500'
                  }`}
                  placeholder="Enter your email address"
                  disabled={loading}
                />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* CNIC */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CNIC *
                </label>
                <input
                  type="text"
                  value={userDetails.cnic}
                  onChange={(e) => handleInputChange('cnic', e.target.value)}
                  className={`w-full p-3 border-2 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition ${
                    errors.cnic ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50 focus:border-blue-500'
                  }`}
                  placeholder="Format: 12345-1234567-1"
                  disabled={loading}
                  maxLength={15}
                />
                {errors.cnic && (
                  <p className="text-red-600 text-sm mt-1">{errors.cnic}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={userDetails.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full p-3 border-2 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition ${
                    errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50 focus:border-blue-500'
                  }`}
                  placeholder="e.g., +92-300-1234567"
                  disabled={loading}
                />
                {errors.phone && (
                  <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <textarea
                  value={userDetails.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className={`w-full p-3 border-2 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition ${
                    errors.address ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50 focus:border-blue-500'
                  }`}
                  placeholder="Enter your complete address"
                  rows="3"
                  disabled={loading}
                />
                {errors.address && (
                  <p className="text-red-600 text-sm mt-1">{errors.address}</p>
                )}
              </div>

              {errors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {errors.submit}
                </div>
              )}

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner"></div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <span>✅</span>
                      Create Viewer Account
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={toggleMode}
                  className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300"
                >
                  Already have an account? Login
                </button>
              </div>
            </form>
          ) : (
            // LOGIN FORM
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className={`w-full p-3 border-2 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition ${
                    errors.username ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50 focus:border-blue-500'
                  }`}
                  placeholder="Enter viewer username"
                  disabled={loading}
                />
                {errors.username && (
                  <p className="text-red-600 text-sm mt-1">{errors.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full p-3 border-2 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition ${
                    errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50 focus:border-blue-500'
                  }`}
                  placeholder="Enter viewer password"
                  disabled={loading}
                />
                {errors.password && (
                  <p className="text-red-600 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {errors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {errors.submit}
                </div>
              )}

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner"></div>
                      Signing In...
                    </>
                  ) : (
                    'Access Viewer Portal'
                  )}
                </button>

                <button
                  type="button"
                  onClick={toggleMode}
                  className="w-full py-3 bg-blue-50 text-blue-600 rounded-xl font-semibold hover:bg-blue-100 transition-all duration-300"
                >
                  Don't have an account? Create one
                </button>
              </div>
            </form>
          )}

          {/* Information Note */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="text-blue-500 text-lg">ℹ️</div>
              <div>
                <p className="text-blue-700 font-medium">
                  {isCreatingAccount ? 'Account Creation Note' : 'Viewer Access'}
                </p>
                <p className="text-blue-600 text-sm mt-1">
                  {isCreatingAccount 
                    ? 'Your account will be created with viewer role. You will receive a welcome email with login details.'
                    : 'Viewer accounts have read-only access for quality checking and batch verification.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BackgroundFix>
  );
}

export default ViewerLoginPage;