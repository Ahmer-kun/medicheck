import React, { useState } from "react";
import BackgroundFix from "../components/BackgroundFix";
import { THEMES } from "../data/themes";
import { validateLogin } from "../utils/validation";

function AdminLoginPage({ onLogin, onBack }) {
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
      await onLogin(credentials.username, credentials.password, 'admin');
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleContactAdmin = () => {
    const subject = encodeURIComponent("Administrator Portal Access Request");
    const body = encodeURIComponent(
      `To: Medicheck System Administrator\n\n` +
      `Subject: Admin Portal Access Request\n\n` +
      `Request Type: Administrator Portal Access\n\n` +
      `Administrator Information:\n` +
      `• Company/Organization: [Your Organization]\n` +
      `• Contact Person: [Your Name]\n` +
      `• Email: [Your Email]\n` +
      `• Phone: [Your Phone]\n\n` +
      `Purpose of Access:\n` +
      `• Full system administration\n` +
      `• User management\n` +
      `• System configuration\n` +
      `• Security oversight\n` +
      `• [Specify other purposes]\n\n` +
      `Required Access Levels:\n` +
      `☐ Full system control\n` +
      `☐ User account management\n` +
      `☐ Database administration\n` +
      `☐ Blockchain contract management\n` +
      `☐ Audit log access\n` +
      `☐ System monitoring\n\n` +
      `Special Requirements:\n` +
      `• Multi-factor authentication: [Yes/No]\n` +
      `• API access needed: [Yes/No]\n` +
      `• Integration permissions: [Yes/No]\n` +
      `• Emergency access: [Yes/No]\n\n` +
      `Urgency Level:\n` +
      `[ ] Normal (within 24 hours)\n` +
      `[ ] High Priority (within 6 hours)\n` +
      `[ ] Urgent - System issue (within 2 hours)\n\n` +
      `Additional Information:\n` +
      `[Provide any additional details about your admin needs]\n\n` +
      `Security Agreement:\n` +
      `I understand that administrator access provides full control over the system.\n` +
      `I agree to comply with all security policies and confidentiality requirements.\n\n` +
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
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-8 text-white">
            <button 
              onClick={onBack} 
              className="mb-6 text-white/90 hover:text-white transition-colors flex items-center gap-2 text-sm"
            >
              ← Back to Role Selection
            </button>
            
            <div className="flex items-center gap-6">
              <div className="text-5xl">⚙️</div>
              <div>
                <h1 className="text-3xl font-bold mb-2">Administrator Login</h1>
                <p className="text-blue-100">Full system access and management</p>
                <p className="text-blue-200 text-sm mt-1">Secure • Authorized • Comprehensive Control</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Login Form */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">System Access</h2>
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
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
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

              {/* Admin Support Section */}
              <div>
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-2xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-2xl text-blue-600">🔧</div>
                    <div>
                      <h3 className="font-bold text-gray-800">Admin Support Center</h3>
                      <p className="text-gray-600 text-sm">Need administrator access or facing issues?</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-white rounded-xl border border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-blue-600">📧</span>
                        <span className="font-medium text-gray-800">Email Support</span>
                      </div>
                      <p className="text-gray-700 text-sm mb-3">
                        For admin access, system issues, or security concerns:
                      </p>
                      <div className="text-center font-mono text-sm bg-blue-100 text-blue-800 p-3 rounded-lg border border-blue-200 mb-3">
                        contact.medicheck@gmail.com
                      </div>
                      <button
                        onClick={handleContactAdmin}
                        className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <span>📧</span>
                        <span>Request Admin Access</span>
                      </button>
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-blue-600">⏱️</span>
                        <span className="font-medium text-gray-800">Response Time</span>
                      </div>
                      <ul className="text-gray-700 text-sm space-y-2">
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          <span><strong>Normal requests:</strong> 24 hours</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                          <span><strong>Priority access:</strong> 6 hours</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          <span><strong>Emergency system access:</strong> 2 hours</span>
                        </li>
                      </ul>
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-blue-600">🔒</span>
                        <span className="font-medium text-gray-800">Security Notice</span>
                      </div>
                      <p className="text-gray-700 text-sm">
                        Admin access provides full system control. All activities are logged and monitored for security compliance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Features */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Administrator Capabilities</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                  <div className="text-blue-600 text-lg mb-2">👥</div>
                  <h4 className="font-semibold text-gray-800 mb-1">User Management</h4>
                  <p className="text-gray-600 text-sm">Full control over all user accounts and permissions</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                  <div className="text-blue-600 text-lg mb-2">📊</div>
                  <h4 className="font-semibold text-gray-800 mb-1">System Analytics</h4>
                  <p className="text-gray-600 text-sm">Complete system monitoring and analytics dashboard</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                  <div className="text-blue-600 text-lg mb-2">🔐</div>
                  <h4 className="font-semibold text-gray-800 mb-1">Security Control</h4>
                  <p className="text-gray-600 text-sm">Advanced security settings and audit logging</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BackgroundFix>
  );
}

export default AdminLoginPage;

// import React, { useState } from "react";
// import BackgroundFix from "../components/BackgroundFix";
// import { THEMES } from "../data/themes";
// import { validateLogin } from "../utils/validation";

// function AdminLoginPage({ onLogin, onBack }) {
//   const [credentials, setCredentials] = useState({ username: '', password: '' });
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);

//   const handleInputChange = (field, value) => {
//     setCredentials(prev => ({
//       ...prev,
//       [field]: value
//     }));
    
//     // Clear error when user starts typing
//     if (errors[field]) {
//       setErrors(prev => ({
//         ...prev,
//         [field]: ""
//       }));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     // Validate form
//     const validation = validateLogin(credentials);
//     if (!validation.isValid) {
//       setErrors(validation.errors);
//       return;
//     }

//     setErrors({});
//     setLoading(true);

//     try {
//       await onLogin(credentials.username, credentials.password, 'admin');
//     } catch (err) {
//       setErrors({ submit: err.message });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <BackgroundFix theme={THEMES.blue}>
//       <div className="min-h-screen flex items-center justify-center p-4">
//         <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg w-full max-w-md">
//           <button 
//             onClick={onBack} 
//             className="mb-4 text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-2 text-sm"
//           >
//             ← Back to Role Selection
//           </button>
          
//           <div className="text-center mb-8">
//             <div className="text-4xl mb-4">⚙️</div>
//             <h1 className="text-3xl font-bold text-gray-800 mb-2">Administrator Login</h1>
//             <p className="text-gray-600">System Management Portal</p>
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
//                 placeholder="Enter admin username"
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
//                 placeholder="Enter admin password"
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
//               className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
//             >
//               {loading ? (
//                 <>
//                   <div className="loading-spinner"></div>
//                   Signing In...
//                 </>
//               ) : (
//                 'Access Admin Portal'
//               )}
//             </button>
//           </form>


//         </div>
//       </div>
//     </BackgroundFix>
//   );
// }

// export default AdminLoginPage;