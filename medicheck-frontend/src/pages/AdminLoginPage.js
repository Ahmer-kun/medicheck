import React, { useState } from "react";
import BackgroundFix from "../components/BackgroundFix";
import { THEMES } from "../data/themes";
import { validateLogin } from "../utils/validation";

function AdminLoginPage({ onLogin, onBack }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateLogin(credentials);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await onLogin(credentials.username, credentials.password, 'admin');
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackgroundFix theme={THEMES.blue}>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg w-full max-w-md">
          <button 
            onClick={onBack} 
            className="mb-4 text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-2 text-sm"
          >
            ← Back to Role Selection
          </button>
          
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">⚙️</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Administrator Login</h1>
            <p className="text-gray-600">System Management Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="Enter admin username"
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
                placeholder="Enter admin password"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  Signing In...
                </>
              ) : (
                'Access Admin Portal'
              )}
            </button>
          </form>


        </div>
      </div>
    </BackgroundFix>
  );
}

export default AdminLoginPage;