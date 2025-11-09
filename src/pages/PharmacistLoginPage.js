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
          </form>

          <div className="mt-6 text-center text-gray-600 text-sm">
            <p className="font-semibold mb-2">Demo Credentials:</p>
            <p>Username: <strong>pharmacist</strong></p>
            <p>Password: <strong>pharma123</strong></p>
          </div>
        </div>
      </div>
    </BackgroundFix>
  );
}

export default PharmacistLoginPage;


// import React, { useState } from "react";
// import BackgroundFix from "../components/BackgroundFix";
// import { THEMES } from "../data/themes";

// function PharmacistLoginPage({ onLogin, onBack }) {
//   const [credentials, setCredentials] = useState({ username: '', password: '' });
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       await onLogin(credentials.username, credentials.password, 'pharmacist');
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <BackgroundFix theme={THEMES.blue}>
//       <div className="min-h-screen flex items-center justify-center p-4">
//         <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg w-full max-w-md">
//           <button onClick={onBack} className="mb-4 text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-2">
//             ← Back to Role Selection
//           </button>
          
//           <div className="text-center mb-8">
//             <div className="text-4xl mb-4">💊</div>
//             <h1 className="text-3xl font-bold text-gray-800 mb-2">Pharmacist Login</h1>
//             <p className="text-gray-600">Pharmacy Management Portal</p>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Username
//               </label>
//               <input
//                 type="text"
//                 value={credentials.username}
//                 onChange={(e) => setCredentials({...credentials, username: e.target.value})}
//                 className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 placeholder="Enter pharmacist username"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Password
//               </label>
//               <input
//                 type="password"
//                 value={credentials.password}
//                 onChange={(e) => setCredentials({...credentials, password: e.target.value})}
//                 className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 placeholder="Enter pharmacist password"
//                 required
//               />
//             </div>

//             {error && (
//               <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
//                 {error}
//               </div>
//             )}

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
//             >
//               {loading ? 'Signing In...' : 'Access Pharmacy Portal'}
//             </button>
//           </form>

//           <div className="mt-6 text-center text-gray-600 text-sm">
//             <p>Demo Credentials:</p>
//             <p>Username: <strong>pharmacist</strong></p>
//             <p>Password: <strong>pharma123</strong></p>
//           </div>
//         </div>
//       </div>
//     </BackgroundFix>
//   );
// }

// export default PharmacistLoginPage;