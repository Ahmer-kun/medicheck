import React, { useState } from "react";
import BackgroundFix from "../components/BackgroundFix";
import { THEMES } from "../data/themes";
import { validateLogin } from "../utils/validation";

function PharmacistLoginPage({ onLogin, onBack }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validation = validateLogin(credentials);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await onLogin(credentials.username, credentials.password, 'pharmacist');
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleContactSupport = () => {
    const subject = encodeURIComponent("Pharmacy Portal Access Request");
    const body = encodeURIComponent(
      `To: Medicheck Pharmacy Support\n\n` +
      `Subject: Pharmacy Portal Access Request\n\n` +
      `Pharmacy Information:\n` +
      `• Pharmacy Name: [Enter Pharmacy Name]\n` +
      `• Pharmacy License No.: [If Applicable]\n` +
      `• Contact Person: [Your Name]\n` +
      `• Email: [Your Email]\n` +
      `• Phone: [Your Phone Number]\n\n` +
      `Purpose of Access:\n` +
      `• Medicine verification and management\n` +
      `• Batch acceptance from manufacturers\n` +
      `• Inventory management\n` +
      `• Customer distribution tracking\n\n` +
      `Certification:\n` +
      `I confirm that we are a licensed pharmacy/pharmacist.\n` +
      `We understand and agree to comply with all pharmaceutical regulations.\n\n` +
      `Best regards,\n` +
      `[Your Name]\n` +
      `[Pharmacy Name]`
    );
    
    window.location.href = `mailto:contact.medicheck@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <BackgroundFix theme={THEMES.blue}>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg w-full max-w-4xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-white">
            <button 
              onClick={onBack} 
              className="mb-6 text-white/90 hover:text-white transition-colors flex items-center gap-2 text-sm"
            >
              ← Back to Role Selection
            </button>
            
            <div className="flex items-center gap-6">
              <div className="text-5xl">💊</div>
              <div>
                <h1 className="text-3xl font-bold mb-2">Pharmacist Login</h1>
                <p className="text-green-100">Pharmacy management and batch handling</p>
                <p className="text-green-200 text-sm mt-1">Verification • Inventory • Distribution</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Login Form */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Pharmacy Portal Access</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={credentials.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      className={`w-full p-3 border-2 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition ${
                        errors.username ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50 focus:border-green-500'
                      }`}
                      placeholder="Enter pharmacist username"
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
                      className={`w-full p-3 border-2 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition ${
                        errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50 focus:border-green-500'
                      }`}
                      placeholder="Enter pharmacist password"
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
                    className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="loading-spinner"></div>
                        Signing In...
                      </>
                    ) : (
                      'Access Pharmacy Portal'
                    )}
                  </button>
                </form>

                {/* Quick Support */}
                <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
                  <p className="text-green-800 text-sm mb-2">Need pharmacy access?</p>
                  <button
                    onClick={handleContactSupport}
                    className="w-full py-2 bg-white text-green-600 border border-green-300 rounded-lg font-semibold hover:bg-green-50 transition-colors"
                  >
                    Request Pharmacy Access
                  </button>
                </div>
              </div>

              {/* Pharmacy Features */}
              <div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">Pharmacy Capabilities</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-green-200">
                      <div className="text-green-600 text-lg">🔍</div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">Medicine Verification</h4>
                        <p className="text-gray-600 text-sm">Verify medicine authenticity using blockchain technology</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-green-200">
                      <div className="text-green-600 text-lg">📦</div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">Batch Management</h4>
                        <p className="text-gray-600 text-sm">Accept and manage manufacturer batches in inventory</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-green-200">
                      <div className="text-green-600 text-lg">📊</div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">Inventory Analytics</h4>
                        <p className="text-gray-600 text-sm">Track stock levels, expiry dates, and sales metrics</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-green-200">
                      <div className="text-green-600 text-lg">👥</div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">Multi-pharmacy Management</h4>
                        <p className="text-gray-600 text-sm">Manage multiple pharmacy locations from single dashboard</p>
                      </div>
                    </div>
                  </div>

                  {/* Support Info */}
                  <div className="mt-6 pt-4 border-t border-green-200">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-green-600">📞</span>
                      <span className="font-medium text-gray-800">Pharmacy Support</span>
                    </div>
                    <p className="text-gray-700 text-sm mb-3">
                      For pharmacy access, verification issues, or technical support:
                    </p>
                    <div className="text-center font-mono text-sm bg-white text-green-800 p-2 rounded-lg border border-green-300">
                      contact.medicheck@gmail.com
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-8 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
              <div className="flex items-center gap-3">
                <div className="text-green-600 text-lg">🔒</div>
                <div>
                  <p className="font-semibold text-green-800">Pharmacy Security</p>
                  <p className="text-green-700 text-sm">
                    This portal is for authorized pharmacy personnel only. All medicine transactions are logged and monitored.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BackgroundFix>
  );
}

export default PharmacistLoginPage;
