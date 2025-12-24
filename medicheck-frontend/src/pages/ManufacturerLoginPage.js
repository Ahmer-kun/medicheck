// pages/ManufacturerLoginPage.js
import React, { useState } from "react";
import BackgroundFix from "../components/BackgroundFix";
import { THEMES } from "../data/themes";
import { validateLogin } from "../utils/validation";

function ManufacturerLoginPage({ onLogin, onBack }) {
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
      await onLogin(credentials.username, credentials.password, 'manufacturer');
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleContactAdmin = () => {
    const subject = encodeURIComponent("Manufacturer Portal Access Request");
    const body = encodeURIComponent(
      `To: Medicheck Manufacturing Support\n\n` +
      `Subject: Manufacturing Portal Access Request\n\n` +
      `Request Type: Manufacturer Portal Access\n\n` +
      `Manufacturer Information:\n` +
      `• Company Name: [Your Company Name]\n` +
      `• Manufacturer License No.: [If Applicable]\n` +
      `• Contact Person: [Your Name]\n` +
      `• Email: [Your Email]\n` +
      `• Phone: [Your Phone]\n\n` +
      `Purpose of Access:\n` +
      `• Medicine batch creation\n` +
      `• Production management\n` +
      `• Supply chain tracking\n` +
      `• Blockchain registration\n` +
      `• [Specify other purposes]\n\n` +
      `Required Access Levels:\n` +
      `☐ Batch creation and management\n` +
      `☐ Blockchain registration permissions\n` +
      `☐ Supply chain transfer capabilities\n` +
      `☐ Production analytics\n` +
      `☐ Quality control reporting\n` +
      `☐ API access for integration\n\n` +
      `Special Requirements:\n` +
      `• Number of manufacturing facilities: [Specify]\n` +
      `• Average batches per month: [Estimate]\n` +
      `• Integration needs: [Yes/No]\n` +
      `• Multi-location access: [Yes/No]\n\n` +
      `Urgency Level:\n` +
      `[ ] Normal (within 24 hours)\n` +
      `[ ] High Priority (production deadline - within 6 hours)\n` +
      `[ ] Urgent - Batch release needed (within 2 hours)\n\n` +
      `Additional Information:\n` +
      `[Provide any additional details about your manufacturing needs]\n\n` +
      `Certification:\n` +
      `I confirm that our company is a licensed pharmaceutical manufacturer.\n` +
      `We understand and agree to comply with all regulatory requirements.\n\n` +
      `Best regards,\n` +
      `[Your Name]\n` +
      `[Your Title]\n` +
      `[Manufacturer Name]`
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
            <div className="text-4xl mb-4">🏭</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Manufacturer Login</h1>
            <p className="text-gray-600">Production Management Portal</p>
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
                placeholder="Enter manufacturer username"
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
                placeholder="Enter manufacturer password"
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
              className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  Signing In...
                </>
              ) : (
                'Access Manufacturer Portal'
              )}
            </button>

            {/* Contact Admin Button */}
            <div className="pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowContactInfo(!showContactInfo)}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>{showContactInfo ? '▲ Hide' : '▼ Show'} Manufacturing Support</span>
              </button>
              
              {showContactInfo && (
                <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-2xl text-purple-600">🏭</div>
                    <div>
                      <h4 className="font-bold text-purple-800">Manufacturing Support Center</h4>
                      <p className="text-purple-700 text-sm">Request manufacturing access or report login issues</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-3 bg-white rounded-lg border border-purple-100">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-purple-600">📧</span>
                        <span className="font-medium text-purple-800">Email Support</span>
                      </div>
                      <p className="text-purple-700 text-sm mb-2">
                        For manufacturing access, batch permissions, or technical issues:
                      </p>
                      <div className="text-center font-mono text-sm bg-purple-100 p-2 rounded border border-purple-200 mb-2">
                        contact.medicheck@gmail.com
                      </div>
                      <button
                        onClick={handleContactAdmin}
                        className="w-full py-2.5 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                      >
                        <span>📧</span>
                        <span>Request Manufacturing Access</span>
                      </button>
                    </div>
                    
                    <div className="p-3 bg-white rounded-lg border border-purple-100">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-purple-600">⏱️</span>
                        <span className="font-medium text-purple-800">Processing Time</span>
                      </div>
                      <ul className="text-purple-700 text-sm space-y-1">
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                          <span><strong>Standard access:</strong> 1-2 business days</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                          <span><strong>Priority production:</strong> 6-12 hours</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          <span><strong>Emergency batch release:</strong> 2-4 hours</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                          <span><strong>Weekend requests:</strong> 48 hours</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="p-3 bg-white rounded-lg border border-purple-100">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-purple-600">🔒</span>
                        <span className="font-medium text-purple-800">Manufacturing Requirements</span>
                      </div>
                      <ul className="text-purple-700 text-sm space-y-1">
                        <li>• Valid manufacturing license</li>
                        <li>• Company registration documents</li>
                        <li>• Quality control certification</li>
                        <li>• Production facility details</li>
                        <li>• Contact person authorization</li>
                      </ul>
                    </div>
                    
                    <div className="p-3 bg-white rounded-lg border border-purple-100">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-purple-600">⚠️</span>
                        <span className="font-medium text-purple-800">Compliance Notice</span>
                      </div>
                      <p className="text-purple-700 text-xs">
                        All manufacturing activities must comply with regulatory requirements. 
                        Unauthorized production or batch manipulation is prohibited.
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-purple-200">
                    <p className="text-purple-600 text-xs text-center">
                      Manufacturing portal access requires verification. Please provide complete documentation for access requests.
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

export default ManufacturerLoginPage;