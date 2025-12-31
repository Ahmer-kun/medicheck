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

// import React, { useState } from "react";
// import BackgroundFix from "../components/BackgroundFix";
// import { THEMES } from "../data/themes";
// import { validateLogin } from "../utils/validation";

// function AnalyticsLoginPage({ onLogin, onBack }) {
//   const [credentials, setCredentials] = useState({ username: '', password: '' });
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [showContactInfo, setShowContactInfo] = useState(false);

//   const handleInputChange = (field, value) => {
//     setCredentials(prev => ({
//       ...prev,
//       [field]: value
//     }));
    
//     if (errors[field]) {
//       setErrors(prev => ({
//         ...prev,
//         [field]: ""
//       }));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     const validation = validateLogin(credentials);
//     if (!validation.isValid) {
//       setErrors(validation.errors);
//       return;
//     }

//     setErrors({});
//     setLoading(true);

//     try {
//       await onLogin(credentials.username, credentials.password, 'analytics');
//     } catch (err) {
//       setErrors({ submit: err.message });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleContactAdmin = () => {
//     const subject = encodeURIComponent("Analytics Portal Access Request");
//     const body = encodeURIComponent(
//       `To: Medicheck Analytics Support\n\n` +
//       `Subject: Analytics Data Portal Access Request\n\n` +
//       `Request Type: Analytics Portal Access\n\n` +
//       `User Information:\n` +
//       `• Requested Role: Analytics/Data Analyst\n` +
//       `• Organization/Department: [Your Organization]\n` +
//       `• Contact Person: [Your Name]\n` +
//       `• Email: [Your Email]\n` +
//       `• Phone: [Your Phone]\n\n` +
//       `Purpose of Access:\n` +
//       `• Data analysis and reporting\n` +
//       `• Business intelligence\n` +
//       `• Performance monitoring\n` +
//       `• Compliance reporting\n` +
//       `• [Specify other purposes]\n\n` +
//       `Required Data Access:\n` +
//       `☐ Batch statistics and trends\n` +
//       `☐ Manufacturer performance data\n` +
//       `☐ Pharmacy distribution metrics\n` +
//       `☐ Supply chain analytics\n` +
//       `☐ Blockchain verification statistics\n` +
//       `☐ Custom reporting access\n\n` +
//       `Special Requirements:\n` +
//       `• Data export permissions: [Yes/No]\n` +
//       `• API access needed: [Yes/No]\n` +
//       `• Real-time data access: [Yes/No]\n` +
//       `• Historical data range: [Specify]\n\n` +
//       `Urgency Level:\n` +
//       `[ ] Normal (within 24 hours)\n` +
//       `[ ] High Priority (within 6 hours)\n` +
//       `[ ] Urgent - Project deadline (within 2 hours)\n\n` +
//       `Additional Information:\n` +
//       `[Provide any additional details about your analytics needs]\n\n` +
//       `Data Protection Agreement:\n` +
//       `I understand that all data accessed through the analytics portal is confidential and proprietary. \n` +
//       `I agree to comply with all data protection policies and usage guidelines.\n\n` +
//       `Best regards,\n` +
//       `[Your Name]\n` +
//       `[Your Title]\n` +
//       `[Organization]`
//     );
    
//     window.location.href = `mailto:contact.medicheck@gmail.com?subject=${subject}&body=${body}`;
//   };

//   return (
//     <BackgroundFix theme={THEMES.blue}>
//       <div className="min-h-screen flex items-center justify-center p-4">
//         <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg w-full max-w-md">
//           <button onClick={onBack} className="mb-4 text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-2 text-sm">
//             ← Back to Role Selection
//           </button>
          
//           <div className="text-center mb-8">
//             <div className="text-4xl mb-4">📊</div>
//             <h1 className="text-3xl font-bold text-gray-800 mb-2">Analytics Login</h1>
//             <p className="text-gray-600">Data Analysis Portal</p>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Username
//               </label>
//               <input
//                 type="text"
//                 value={credentials.username}
//                 onChange={(e) => handleInputChange('username', e.target.value)}
//                 className={`w-full p-3 border-2 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition ${
//                   errors.username ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50 focus:border-blue-500'
//                 }`}
//                 placeholder="Enter analytics username"
//                 disabled={loading}
//               />
//               {errors.username && (
//                 <p className="text-red-600 text-sm mt-1">{errors.username}</p>
//               )}
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Password
//               </label>
//               <input
//                 type="password"
//                 value={credentials.password}
//                 onChange={(e) => handleInputChange('password', e.target.value)}
//                 className={`w-full p-3 border-2 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition ${
//                   errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50 focus:border-blue-500'
//                 }`}
//                 placeholder="Enter analytics password"
//                 disabled={loading}
//               />
//               {errors.password && (
//                 <p className="text-red-600 text-sm mt-1">{errors.password}</p>
//               )}
//             </div>

//             {errors.submit && (
//               <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
//                 {errors.submit}
//               </div>
//             )}

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
//             >
//               {loading ? (
//                 <>
//                   <div className="loading-spinner"></div>
//                   Signing In...
//                 </>
//               ) : (
//                 'Access Analytics Portal'
//               )}
//             </button>

//             {/* Contact Admin Button */}
//             <div className="pt-4 border-t border-gray-200">
//               <button
//                 type="button"
//                 onClick={() => setShowContactInfo(!showContactInfo)}
//                 className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-2"
//               >
//                 <span>{showContactInfo ? '▲ Hide' : '▼ Show'} Analytics Support</span>
//               </button>
              
//               {showContactInfo && (
//                 <div className="mt-4 p-4 bg-teal-50 border border-teal-200 rounded-xl">
//                   <div className="flex items-center gap-3 mb-3">
//                     <div className="text-2xl text-teal-600">📈</div>
//                     <div>
//                       <h4 className="font-bold text-teal-800">Analytics Data Access Center</h4>
//                       <p className="text-teal-700 text-sm">Request data access or report login issues</p>
//                     </div>
//                   </div>
                  
//                   <div className="space-y-3">
//                     <div className="p-3 bg-white rounded-lg border border-teal-100">
//                       <div className="flex items-center gap-2 mb-2">
//                         <span className="text-teal-600">🔍</span>
//                         <span className="font-medium text-teal-800">Data Access Types</span>
//                       </div>
//                       <div className="grid grid-cols-2 gap-2 text-sm">
//                         <div className="bg-teal-50 p-2 rounded border border-teal-100">
//                           <span className="text-teal-700">📦 Batch Analytics</span>
//                         </div>
//                         <div className="bg-teal-50 p-2 rounded border border-teal-100">
//                           <span className="text-teal-700">🏭 Manufacturer Stats</span>
//                         </div>
//                         <div className="bg-teal-50 p-2 rounded border border-teal-100">
//                           <span className="text-teal-700">💊 Pharmacy Metrics</span>
//                         </div>
//                         <div className="bg-teal-50 p-2 rounded border border-teal-100">
//                           <span className="text-teal-700">⛓️ Blockchain Data</span>
//                         </div>
//                       </div>
//                     </div>
                    
//                     <div className="p-3 bg-white rounded-lg border border-teal-100">
//                       <div className="flex items-center gap-2 mb-2">
//                         <span className="text-teal-600">📧</span>
//                         <span className="font-medium text-teal-800">Email Support</span>
//                       </div>
//                       <p className="text-teal-700 text-sm mb-2">
//                         For analytics access, data permissions, or technical issues:
//                       </p>
//                       <div className="text-center font-mono text-sm bg-teal-100 p-2 rounded border border-teal-200 mb-2">
//                         contact.medicheck@gmail.com
//                       </div>
//                       <button
//                         onClick={handleContactAdmin}
//                         className="w-full py-2.5 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
//                       >
//                         <span>📧</span>
//                         <span>Request Analytics Access</span>
//                       </button>
//                     </div>
                    
//                     <div className="p-3 bg-white rounded-lg border border-teal-100">
//                       <div className="flex items-center gap-2 mb-2">
//                         <span className="text-teal-600">⏱️</span>
//                         <span className="font-medium text-teal-800">Processing Time</span>
//                       </div>
//                       <ul className="text-teal-700 text-sm space-y-1">
//                         <li className="flex items-center gap-2">
//                           <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
//                           <span><strong>Standard access:</strong> 1-2 business days</span>
//                         </li>
//                         <li className="flex items-center gap-2">
//                           <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
//                           <span><strong>Priority access:</strong> 6-12 hours</span>
//                         </li>
//                         <li className="flex items-center gap-2">
//                           <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
//                           <span><strong>Emergency data access:</strong> 2-4 hours</span>
//                         </li>
//                         <li className="flex items-center gap-2">
//                           <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
//                           <span><strong>Weekend requests:</strong> 48 hours</span>
//                         </li>
//                       </ul>
//                     </div>
                    
//                     <div className="p-3 bg-white rounded-lg border border-teal-100">
//                       <div className="flex items-center gap-2 mb-2">
//                         <span className="text-teal-600">⚠️</span>
//                         <span className="font-medium text-teal-800">Data Security Notice</span>
//                       </div>
//                       <p className="text-teal-700 text-xs">
//                         All analytics data is confidential. Users must comply with data protection policies. 
//                         Unauthorized data sharing or export is prohibited.
//                       </p>
//                     </div>
//                   </div>
                  
//                   <div className="mt-4 pt-3 border-t border-teal-200">
//                     <p className="text-teal-600 text-xs text-center">
//                       Analytics portal access requires approval. Please provide detailed justification for data access requests.
//                     </p>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </form>
//         </div>
//       </div>
//     </BackgroundFix>
//   );
// }

// export default AnalyticsLoginPage;