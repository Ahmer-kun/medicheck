import React from "react";
import BackgroundFix from "../components/BackgroundFix";
import { THEMES } from "../data/themes";

function RoleSelectionPage({ onRoleSelect }) {
  const roles = [
    {
      id: 'admin',
      title: 'Administrator',
      description: 'Full system access and management',
      icon: '⚙️',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-gradient-to-r from-blue-500 to-blue-600'
    },
    {
      id: 'pharmacist',
      title: 'Pharmacist',
      description: 'Pharmacy management and batch handling',
      icon: '💊',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-gradient-to-r from-green-500 to-green-600'
    },
    {
      id: 'manufacturer',
      title: 'Manufacturer',
      description: 'Medicine production and batch registration',
      icon: '🏭',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-gradient-to-r from-purple-500 to-purple-600'
    },
    {
      id: 'viewer',
      title: 'Viewer',
      description: 'Read-only access for quality checking',
      icon: '👁️',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-gradient-to-r from-orange-500 to-orange-600'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Data analysis and reporting',
      icon: '📊',
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-gradient-to-r from-teal-500 to-teal-600'
    }
  ];

  return (
    <BackgroundFix theme={THEMES.blue}>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg w-full max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Medicheck</h1>
            <p className="text-gray-600 text-lg">Blockchain Medicine Tracker System</p>
            <p className="text-gray-500 mt-2">Select your role to continue</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => onRoleSelect(role.id)}
                className={`p-8 rounded-2xl ${role.bgColor} text-white text-left transform hover:scale-105 transition-all duration-300 shadow-lg border border-white/20 hover:shadow-xl group`}
              >
                <div className="flex flex-col h-full">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {role.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{role.title}</h3>
                  <p className="text-white/90 text-sm leading-relaxed">{role.description}</p>
                  <div className="mt-4 text-white/80 text-sm font-medium group-hover:text-white transition-colors">
                    Click to continue →
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-12 text-center text-gray-500 text-sm">
            <p>Secure • Transparent • Blockchain-Powered Medicine Tracking</p>
          </div>
        </div>
      </div>
    </BackgroundFix>
  );
}

export default RoleSelectionPage;