import React, { useState, useEffect } from "react";
import BackgroundFix from "../components/BackgroundFix";
import { THEMES } from "../data/themes";
import { useNavigate } from "react-router-dom";

function RoleSelectionPage({ onRoleSelect }) {
  const [hoveredRole, setHoveredRole] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  
  const roles = [
    {
      id: 'admin',
      title: 'ADMINISTRATOR',
      description: 'Full system access and management',
      icon: '⚙️',
      gradient: 'from-[#0ea5e9] via-[#3b82f6] to-[#8b5cf6]',
      glow: '#3b82f6',
      particleColor: '#60a5fa',
      features: ['System Management', 'User Control', 'Full Analytics', 'Access Management']
    },
    {
      id: 'manufacturer',
      title: 'MANUFACTURER',
      description: 'Medicine production and batch registration',
      icon: '🏭',
      gradient: 'from-[#a855f7] via-[#8b5cf6] to-[#ec4899]',
      glow: '#a855f7',
      particleColor: '#d946ef',
      features: ['Batch Creation', 'Production Tracking', 'Supply Chain', 'Quality Control']
    },
    {
      id: 'pharmacist',
      title: 'PHARMACIST',
      description: 'Pharmacy management and batch handling',
      icon: '💊',
      gradient: 'from-[#10b981] via-[#059669] to-[#047857]',
      glow: '#10b981',
      particleColor: '#34d399',
      features: ['Medicine Verification', 'Inventory Management', 'Batch Acceptance', 'Patient Safety']
    },
    {
      id: 'viewer',
      title: 'VIEWER',
      description: 'Read-only access for quality checking',
      icon: '👁️',
      gradient: 'from-[#f59e0b] via-[#d97706] to-[#b45309]',
      glow: '#f59e0b',
      particleColor: '#fbbf24',
      features: ['Quality Checking', 'Batch Verification', 'Compliance Viewing', 'Transparency']
    },
    {
      id: 'analytics',
      title: 'ANALYTICS',
      description: 'Data analysis and reporting',
      icon: '📊',
      gradient: 'from-[#ec4899] via-[#db2777] to-[#be185d]',
      glow: '#ec4899',
      particleColor: '#f472b6',
      features: ['Data Analytics', 'Performance Reports', 'Trend Analysis', 'Reporting Tools']
    }
  ];

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleBackToLanding = () => {
    navigate("/");
  };

  return (
    <BackgroundFix theme={THEMES.blue}>
      <div 
        className="relative min-h-screen overflow-hidden"
        style={{
          background: 'radial-gradient(circle at 50% 50%, #0f172a 0%, #020617 100%)'
        }}
      >
        {/* Animated Background Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 4 + 1}px`,
                height: `${Math.random() * 4 + 1}px`,
                background: `rgba(59, 130, 246, ${Math.random() * 0.5 + 0.2})`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 10 + 5}s`
              }}
            />
          ))}
        </div>

        {/* Interactive Mouse Trails */}
        <div 
          className="fixed pointer-events-none z-0 transition-all duration-100"
          style={{
            left: mousePosition.x - 20,
            top: mousePosition.y - 20,
            width: '40px',
            height: '40px',
            background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)',
            transform: 'scale(1)',
            opacity: 0.3
          }}
        />

        {/* Main Content */}
        <div className="relative z-10">
          {/* Header Section */}
          <div className="pt-12 md:pt-20 px-4">
            {/* Back Button - Top Left */}
            <div className="mb-8">
              <button
                onClick={handleBackToLanding}
                className="text-slate-300 hover:text-white transition-colors flex items-center gap-2 text-sm bg-slate-800/30 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-700/30 hover:border-slate-600/50"
              >
                <span>←</span>
                <span>Back to Home</span>
              </button>
            </div>
            
            {/* Title Section - Fixed gradient issue */}
            <div className="text-center mb-8">
              <div className="relative inline-block mb-2">
                {/* Glow effect only behind text */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-lg blur opacity-30 animate-pulse"></div>
                {/* Gradient text only */}
                <h1 className="relative text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient-x">
                  MEDICHECK
                </h1>
              </div>
              
              {/* Subtitle */}
              <p className="text-base sm:text-lg md:text-xl text-slate-300 font-light tracking-wide">
                Blockchain Medicine Tracker System
              </p>
            </div>

            {/* Sleek Horizontal Line Divider */}
            <div className="relative max-w-2xl mx-auto mb-12">
              {/* Glow line */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-20 blur-sm"></div>
              
              {/* Main line with gradient */}
              <div className="relative h-px">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></div>
                <div className="absolute left-1/4 w-1/2 h-[2px] bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full blur-[1px]"></div>
                
                {/* Animated dots */}
                <div className="absolute left-1/4 -translate-x-1/2 -top-1.5">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 animate-pulse"></div>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 -top-1.5">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                </div>
                <div className="absolute left-3/4 -translate-x-1/2 -top-1.5">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-pink-400 to-blue-500 animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>
              </div>
              
              {/* Text labels */}
              <div className="flex justify-between mt-4">
                <span className="text-xs text-slate-400 font-semibold tracking-widest uppercase">SECURE ACCESS</span>
                <span className="text-xs text-slate-400 font-semibold tracking-widest uppercase">ROLE-BASED PORTAL</span>
                <span className="text-xs text-slate-400 font-semibold tracking-widest uppercase">BLOCKCHAIN VERIFIED</span>
              </div>
            </div>
          </div>

          {/* Role Cards Grid */}
          <div className="px-4 pb-12 sm:pb-20">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {roles.map((role, index) => (
                <div
                  key={role.id}
                  className="relative group"
                  onMouseEnter={() => setHoveredRole(role.id)}
                  onMouseLeave={() => setHoveredRole(null)}
                >
                  {/* Card Glow Effect */}
                  <div 
                    className={`absolute -inset-1 rounded-3xl blur-xl transition-all duration-500 ${
                      hoveredRole === role.id ? 'opacity-80' : 'opacity-20'
                    }`}
                    style={{ background: `linear-gradient(45deg, ${role.glow}, transparent)` }}
                  />

                  {/* Main Card */}
                  <div className="relative">
                    {/* Card Border */}
                    <div className={`absolute inset-0 rounded-3xl p-[2px] ${
                      hoveredRole === role.id ? 'opacity-100' : 'opacity-50'
                    } transition-all duration-500`}>
                      <div 
                        className="w-full h-full rounded-3xl opacity-50"
                        style={{ background: `linear-gradient(45deg, ${role.glow}, transparent)` }}
                      />
                    </div>

                    {/* Card Content */}
                    <button
                      onClick={() => onRoleSelect(role.id)}
                      className={`relative w-full h-full p-4 sm:p-6 md:p-8 rounded-3xl bg-gradient-to-br from-slate-900/80 to-slate-900/40 backdrop-blur-xl border border-slate-700/30 transition-all duration-500 group-hover:scale-[1.02] ${
                        hoveredRole === role.id ? 'shadow-2xl' : 'shadow-lg'
                      }`}
                      style={{
                        boxShadow: hoveredRole === role.id ? 
                          `0 0 40px -8px ${role.glow}40` : 
                          '0 20px 40px -20px rgba(0,0,0,0.3)'
                      }}
                    >
                      {/* Icon Container */}
                      <div className="relative mb-4 sm:mb-6 md:mb-8">
                        {/* Icon Glow */}
                        <div 
                          className="absolute inset-0 blur-2xl rounded-2xl transition-all duration-500"
                          style={{ 
                            background: role.glow,
                            opacity: hoveredRole === role.id ? 0.3 : 0.1
                          }}
                        />
                        
                        {/* Icon */}
                        <div 
                          className={`relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-xl sm:text-2xl md:text-4xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-12`}
                          style={{
                            background: `linear-gradient(135deg, ${role.glow}30, ${role.glow}10)`,
                            border: `2px solid ${role.glow}30`
                          }}
                        >
                          {role.icon}
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">
                          {role.title}
                        </span>
                      </h3>

                      {/* Description */}
                      <p className="text-slate-400 mb-4 sm:mb-6 md:mb-8 text-xs sm:text-sm leading-relaxed">
                        {role.description}
                      </p>

                      {/* Features */}
                      <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 md:mb-8">
                        {role.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 sm:gap-3">
                            <div 
                              className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0"
                              style={{ background: role.glow }}
                            />
                            <span className="text-xs sm:text-sm text-slate-300">{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* Action Button */}
                      <div className="flex items-center justify-between pt-4 sm:pt-6 border-t border-slate-700/30">
                        <span className="text-xs font-semibold tracking-widest text-slate-400 uppercase">
                          ACCESS PORTAL
                        </span>
                        <div className="relative">
                          <div className="absolute inset-0 animate-ping rounded-full opacity-20" style={{ background: role.glow }} />
                          <div 
                            className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                            style={{ background: role.glow }}
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pb-8 sm:pb-12 px-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/30">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
                </div>
                <span className="text-sm text-slate-300 font-semibold tracking-wider">
                  SYSTEM STATUS: <span className="text-emerald-400">OPERATIONAL</span>
                </span>
              </div>
            </div>
            <p className="mt-4 text-slate-500 text-sm">
              Select your role to continue to the secure portal
            </p>
            
            {/* Back to Landing Button at Bottom */}
            <button
              onClick={handleBackToLanding}
              className="mt-6 text-slate-400 hover:text-slate-300 transition-colors flex items-center gap-2 text-sm mx-auto"
            >
              <span>←</span>
              <span>Return to Home Page</span>
            </button>
          </div>
        </div>

        {/* Floating Particles on Hover */}
        {hoveredRole && (
          <div className="fixed inset-0 pointer-events-none z-0">
            {[...Array(20)].map((_, i) => {
              const role = roles.find(r => r.id === hoveredRole);
              return (
                <div
                  key={i}
                  className="absolute rounded-full animate-float"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    width: `${Math.random() * 6 + 2}px`,
                    height: `${Math.random() * 6 + 2}px`,
                    background: role.particleColor,
                    opacity: Math.random() * 0.3 + 0.1,
                    animationDelay: `${Math.random() * 5}s`,
                    animationDuration: `${Math.random() * 10 + 10}s`
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    </BackgroundFix>
  );
}

export default RoleSelectionPage;

