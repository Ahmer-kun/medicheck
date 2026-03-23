import React, { useState } from "react";
import BackgroundFix from "../components/BackgroundFix";
import { THEMES } from "../data/themes";
import { validateLogin } from "../utils/validation";

function AnalyticsLoginPage({ onLogin, onBack }) {
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
      await onLogin(credentials.username, credentials.password, 'analytics');
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleContactSupport = () => {
    const subject = encodeURIComponent("Analytics Portal Access Request");
    const body = encodeURIComponent(
      `To: Medicheck Analytics Support\n\n` +
      `Subject: Analytics Data Portal Access Request\n\n` +
      `Analyst Information:\n` +
      `• Organization/Department: [Your Organization]\n` +
      `• Contact Person: [Your Name]\n` +
      `• Email: [Your Email]\n` +
      `• Phone: [Your Phone]\n\n` +
      `Purpose of Access:\n` +
      `• Data analysis and reporting\n` +
      `• Business intelligence\n` +
      `• Performance monitoring\n` +
      `• Compliance reporting\n\n` +
      `Data Access Required:\n` +
      `☐ Batch statistics and trends\n` +
      `☐ Manufacturer performance data\n` +
      `☐ Pharmacy distribution metrics\n` +
      `☐ Supply chain analytics\n\n` +
      `Data Protection Agreement:\n` +
      `I understand that all data accessed is confidential and proprietary.\n` +
      `I agree to comply with all data protection policies.\n\n` +
      `Best regards,\n` +
      `[Your Name]\n` +
      `[Your Title]\n` +
      `[Organization]`
    );
    
    window.location.href = `mailto:contact.medicheck@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <BackgroundFix theme={THEMES.blue}>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg w-full max-w-4xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-8 text-white">
            <button 
              onClick={onBack} 
              className="mb-6 text-white/90 hover:text-white transition-colors flex items-center gap-2 text-sm"
            >
              ← Back to Role Selection
            </button>
            
            <div className="flex items-center gap-6">
              <div className="text-5xl">📊</div>
              <div>
                <h1 className="text-3xl font-bold mb-2">Analytics Login</h1>
                <p className="text-teal-100">Data analysis and reporting</p>
                <p className="text-teal-200 text-sm mt-1">Insights • Trends • Intelligence • Reporting</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Login Form */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Analytics Portal Access</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={credentials.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      className={`w-full p-3 border-2 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition ${
                        errors.username ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50 focus:border-teal-500'
                      }`}
                      placeholder="Enter analytics username"
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
                      className={`w-full p-3 border-2 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition ${
                        errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50 focus:border-teal-500'
                      }`}
                      placeholder="Enter analytics password"
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
                    className="w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-semibold hover:from-teal-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="loading-spinner"></div>
                        Signing In...
                      </>
                    ) : (
                      'Access Analytics Portal'
                    )}
                  </button>
                </form>

                {/* Quick Access */}
                <div className="mt-6 p-4 bg-teal-50 rounded-xl border border-teal-200">
                  <p className="text-teal-800 text-sm mb-2">Need analytics access?</p>
                  <button
                    onClick={handleContactSupport}
                    className="w-full py-2 bg-white text-teal-600 border border-teal-300 rounded-lg font-semibold hover:bg-teal-50 transition-colors"
                  >
                    Request Analytics Access
                  </button>
                </div>
              </div>

              {/* Analytics Features */}
              <div>
                <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-2xl border border-teal-200">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">Analytics Capabilities</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-teal-200">
                      <div className="text-teal-600 text-lg">📈</div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">Real-time Dashboards</h4>
                        <p className="text-gray-600 text-sm">Interactive dashboards with real-time supply chain data</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-teal-200">
                      <div className="text-teal-600 text-lg">📊</div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">Advanced Reports</h4>
                        <p className="text-gray-600 text-sm">Customizable reports with export capabilities</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-teal-200">
                      <div className="text-teal-600 text-lg">🔍</div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">Trend Analysis</h4>
                        <p className="text-gray-600 text-sm">Predictive analytics and trend identification</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-teal-200">
                      <div className="text-teal-600 text-lg">📱</div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">Mobile Insights</h4>
                        <p className="text-gray-600 text-sm">Access analytics on mobile devices</p>
                      </div>
                    </div>
                  </div>

                  {/* Support Info */}
                  <div className="mt-6 pt-4 border-t border-teal-200">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-teal-600">📞</span>
                      <span className="font-medium text-gray-800">Analytics Support</span>
                    </div>
                    <p className="text-gray-700 text-sm mb-3">
                      For data access, reporting issues, or technical support:
                    </p>
                    <div className="text-center font-mono text-sm bg-white text-teal-800 p-2 rounded-lg border border-teal-300">
                      contact.medicheck@gmail.com
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Privacy Notice */}
            <div className="mt-8 p-4 bg-gradient-to-r from-teal-50 to-teal-100 rounded-xl border border-teal-200">
              <div className="flex items-center gap-3">
                <div className="text-teal-600 text-lg">🔒</div>
                <div>
                  <p className="font-semibold text-teal-800">Data Privacy & Compliance</p>
                  <p className="text-teal-700 text-sm">
                    All analytics data is confidential. Users must comply with data protection policies. 
                    Unauthorized data sharing or export is prohibited.
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

export default AnalyticsLoginPage;
