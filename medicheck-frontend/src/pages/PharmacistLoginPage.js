import React, { useState } from "react";
import BackgroundFix from "../components/BackgroundFix";
import { THEMES } from "../data/themes";
import { validateLogin } from "../utils/validation";

function PharmacistLoginPage({ onLogin, onBack }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);

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

  const handleContactAdmin = () => {
    const subject = encodeURIComponent("Pharmacy Portal Support - Login Issues");
    const body = encodeURIComponent(
      `To: Medicheck System Administrator\n\n` +
      `Subject: Pharmacy Portal Access Request\n\n` +
      `Issue Description:\n` +
      `I am having trouble accessing the Pharmacy Management Portal.\n\n` +
      `Details:\n` +
      `• Role: Pharmacist/Pharmacy Manager\n` +
      `• Portal: Pharmacy Management System\n` +
      `• Issue Type: Login/Access Problems\n\n` +
      `Pharmacy Information:\n` +
      `• Pharmacy Name: [Enter Pharmacy Name]\n` +
      `• Pharmacy License No.: [If Applicable]\n` +
      `• Contact Person: [Your Name]\n` +
      `• Contact Email: [Your Email]\n` +
      `• Phone: [Your Phone Number]\n\n` +
      `Requested Assistance:\n` +
      `1. Credential verification/reset\n` +
      `2. Pharmacy account activation\n` +
      `3. Permission for medicine verification\n` +
      `4. Access to batch management system\n` +
      `5. Blockchain verification permissions\n\n` +
      `Additional Information:\n` +
      `[Describe any specific issues or requirements]\n\n` +
      `Expected Response Time: Within 24 hours (urgent matters within 6 hours)\n\n` +
      `Best regards,\n` +
      `[Your Name]\n` +
      `[Pharmacy Name]`
    );

    window.location.href = `mailto:contact.medicheck@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <BackgroundFix theme={THEMES.blue}>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg w-full max-w-md">
          <button onClick={onBack} className="mb-4 text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-2 text-sm">
            ← Back to Role Selection
          </button>
          
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">💊</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Pharmacist Login</h1>
            <p className="text-gray-600">Pharmacy Management Portal</p>
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
                className={`w-full p-3 border-2 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition ${
                  errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50 focus:border-blue-500'
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
              className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
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

            {/* Contact Admin Button */}
            <div className="pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowContactInfo(!showContactInfo)}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>{showContactInfo ? '▲ Hide' : '▼ Show'} Contact Information</span>
              </button>
              
              {showContactInfo && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-2xl text-green-600">💊</div>
                    <div>
                      <h4 className="font-bold text-green-800">Pharmacy Support Center</h4>
                      <p className="text-green-700 text-sm">Need assistance with pharmacy portal access?</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-3 bg-white rounded-lg border border-green-100">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-green-600">📧</span>
                        <span className="font-medium text-green-800">Email Support</span>
                      </div>
                      <p className="text-green-700 text-sm mb-2">
                        For login issues, account access, or pharmacy management support:
                      </p>
                      <div className="text-center font-mono text-sm bg-green-100 p-2 rounded border border-green-200 mb-2">
                        contact.medicheck@gmail.com
                      </div>
                      <button
                        onClick={handleContactAdmin}
                        className="w-full py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                      >
                        <span>📧</span>
                        <span>Email Pharmacy Support</span>
                      </button>
                    </div>
                    
                    <div className="p-3 bg-white rounded-lg border border-green-100">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-green-600">⏱️</span>
                        <span className="font-medium text-green-800">Response Time</span>
                      </div>
                      <ul className="text-green-700 text-sm space-y-1">
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span><strong>Normal queries:</strong> Within 24 hours</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                          <span><strong>Urgent login issues:</strong> Within 6 hours</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          <span><strong>Account activation:</strong> Within 12 hours</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                          <span><strong>Weekend support:</strong> Within 48 hours</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="p-3 bg-white rounded-lg border border-green-100">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-green-600">ℹ️</span>
                        <span className="font-medium text-green-800">What to Include</span>
                      </div>
                      <ul className="text-green-700 text-sm space-y-1">
                        <li>• Pharmacy name and license number</li>
                        <li>• Contact person details</li>
                        <li>• Specific issue description</li>
                        <li>• Screenshots if applicable</li>
                        <li>• Preferred contact method</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-green-200">
                    <p className="text-green-600 text-xs text-center">
                      This portal is for authorized pharmacy personnel only. 
                      Unauthorized access is prohibited.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </BackgroundFix>
  );
}

export default PharmacistLoginPage;