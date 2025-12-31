// pages/RoleSelectionPage.js
import React, { useState, useEffect } from "react";
import BackgroundFix from "../components/BackgroundFix";
import { THEMES } from "../data/themes";

function RoleSelectionPage({ onRoleSelect }) {
  const [hoveredRole, setHoveredRole] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
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
          {/* Header */}
          <div className="pt-12 md:pt-20 px-4 text-center">
            {/* Animated Title */}
            <div className="relative inline-block mb-6">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-lg blur opacity-30 animate-pulse"></div>
              <h1 className="relative text-5xl md:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient-x">
                MEDICHECK
              </h1>
            </div>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-slate-300 mb-12 font-light tracking-wide">
              Blockchain Medicine Tracker System
            </p>

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
          <div className="px-4 pb-20">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      className={`relative w-full h-full p-8 rounded-3xl bg-gradient-to-br from-slate-900/80 to-slate-900/40 backdrop-blur-xl border border-slate-700/30 transition-all duration-500 group-hover:scale-[1.02] ${
                        hoveredRole === role.id ? 'shadow-2xl' : 'shadow-lg'
                      }`}
                      style={{
                        boxShadow: hoveredRole === role.id ? 
                          `0 0 60px -12px ${role.glow}40` : 
                          '0 20px 40px -20px rgba(0,0,0,0.3)'
                      }}
                    >
                      {/* Icon Container */}
                      <div className="relative mb-8">
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
                          className={`relative w-20 h-20 rounded-2xl flex items-center justify-center text-4xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-12`}
                          style={{
                            background: `linear-gradient(135deg, ${role.glow}30, ${role.glow}10)`,
                            border: `2px solid ${role.glow}30`
                          }}
                        >
                          {role.icon}
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-2xl font-bold mb-3">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">
                          {role.title}
                        </span>
                      </h3>

                      {/* Description */}
                      <p className="text-slate-400 mb-8 text-sm leading-relaxed">
                        {role.description}
                      </p>

                      {/* Features */}
                      <div className="space-y-3 mb-8">
                        {role.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div 
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ background: role.glow }}
                            />
                            <span className="text-sm text-slate-300">{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* Action Button */}
                      <div className="flex items-center justify-between pt-6 border-t border-slate-700/30">
                        <span className="text-xs font-semibold tracking-widest text-slate-400 uppercase">
                          ACCESS PORTAL
                        </span>
                        <div className="relative">
                          <div className="absolute inset-0 animate-ping rounded-full opacity-20" style={{ background: role.glow }} />
                          <div 
                            className="relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                            style={{ background: role.glow }}
                          >
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="text-center pb-12">
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
// // pages/RoleSelectionPage.js
// import React, { useState, useEffect } from "react";
// import BackgroundFix from "../components/BackgroundFix";
// import { THEMES } from "../data/themes";

// function RoleSelectionPage({ onRoleSelect }) {
//   const [hoveredRole, setHoveredRole] = useState(null);
//   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
//   const roles = [
//     {
//       id: 'admin',
//       title: 'ADMINISTRATOR',
//       description: 'Full system access and management',
//       icon: '⚙️',
//       gradient: 'from-[#0ea5e9] via-[#3b82f6] to-[#8b5cf6]',
//       glow: '#3b82f6',
//       particleColor: '#60a5fa',
//       features: ['System Management', 'User Control', 'Full Analytics', 'Access Management']
//     },
//     {
//       id: 'manufacturer',
//       title: 'MANUFACTURER',
//       description: 'Medicine production and batch registration',
//       icon: '🏭',
//       gradient: 'from-[#a855f7] via-[#8b5cf6] to-[#ec4899]',
//       glow: '#a855f7',
//       particleColor: '#d946ef',
//       features: ['Batch Creation', 'Production Tracking', 'Supply Chain', 'Quality Control']
//     },
//     {
//       id: 'pharmacist',
//       title: 'PHARMACIST',
//       description: 'Pharmacy management and batch handling',
//       icon: '💊',
//       gradient: 'from-[#10b981] via-[#059669] to-[#047857]',
//       glow: '#10b981',
//       particleColor: '#34d399',
//       features: ['Medicine Verification', 'Inventory Management', 'Batch Acceptance', 'Patient Safety']
//     },
//     {
//       id: 'viewer',
//       title: 'VIEWER',
//       description: 'Read-only access for quality checking',
//       icon: '👁️',
//       gradient: 'from-[#f59e0b] via-[#d97706] to-[#b45309]',
//       glow: '#f59e0b',
//       particleColor: '#fbbf24',
//       features: ['Quality Checking', 'Batch Verification', 'Compliance Viewing', 'Transparency']
//     },
//     {
//       id: 'analytics',
//       title: 'ANALYTICS',
//       description: 'Data analysis and reporting',
//       icon: '📊',
//       gradient: 'from-[#ec4899] via-[#db2777] to-[#be185d]',
//       glow: '#ec4899',
//       particleColor: '#f472b6',
//       features: ['Data Analytics', 'Performance Reports', 'Trend Analysis', 'Reporting Tools']
//     }
//   ];

//   useEffect(() => {
//     const handleMouseMove = (e) => {
//       setMousePosition({ x: e.clientX, y: e.clientY });
//     };
//     window.addEventListener('mousemove', handleMouseMove);
//     return () => window.removeEventListener('mousemove', handleMouseMove);
//   }, []);

//   return (
//     <BackgroundFix theme={THEMES.blue}>
//       <div 
//         className="relative min-h-screen overflow-hidden"
//         style={{
//           background: 'radial-gradient(circle at 50% 50%, #0f172a 0%, #020617 100%)'
//         }}
//       >
//         {/* Animated Background Particles */}
//         <div className="absolute inset-0 overflow-hidden">
//           {[...Array(30)].map((_, i) => (
//             <div
//               key={i}
//               className="absolute rounded-full animate-pulse"
//               style={{
//                 left: `${Math.random() * 100}%`,
//                 top: `${Math.random() * 100}%`,
//                 width: `${Math.random() * 4 + 1}px`,
//                 height: `${Math.random() * 4 + 1}px`,
//                 background: `rgba(59, 130, 246, ${Math.random() * 0.5 + 0.2})`,
//                 animationDelay: `${Math.random() * 5}s`,
//                 animationDuration: `${Math.random() * 10 + 5}s`
//               }}
//             />
//           ))}
//         </div>

//         {/* Interactive Mouse Trails */}
//         <div 
//           className="fixed pointer-events-none z-0 transition-all duration-100"
//           style={{
//             left: mousePosition.x - 20,
//             top: mousePosition.y - 20,
//             width: '40px',
//             height: '40px',
//             background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)',
//             transform: 'scale(1)',
//             opacity: 0.3
//           }}
//         />

//         {/* Main Content */}
//         <div className="relative z-10">
//           {/* Header */}
//           <div className="pt-12 md:pt-20 px-4 text-center">
//             {/* Animated Title */}
//             <div className="relative inline-block mb-6">
//               <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-lg blur opacity-30 animate-pulse"></div>
//               <h1 className="relative text-5xl md:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient-x">
//                 MEDICHECK
//               </h1>
//             </div>

//             {/* Subtitle */}
//             <p className="text-lg md:text-xl text-slate-300 mb-8 font-light tracking-wide">
//               Blockchain Medicine Tracker System
//             </p>

//             {/* Live Stats */}
//             <div className="inline-flex items-center gap-8 mb-12">
//               {[
//                 { label: 'TOTAL BATCHES', value: '427', color: 'text-emerald-400' },
//                 { label: 'MANUFACTURERS', value: '19', color: 'text-cyan-400' },
//                 { label: 'PHARMACIES', value: '42', color: 'text-amber-400' }
//               ].map((stat, i) => (
//                 <div key={i} className="text-center">
//                   <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
//                   <div className="text-xs text-slate-400 tracking-widest">{stat.label}</div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Role Cards Grid */}
//           <div className="px-4 pb-20">
//             <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {roles.map((role, index) => (
//                 <div
//                   key={role.id}
//                   className="relative group"
//                   onMouseEnter={() => setHoveredRole(role.id)}
//                   onMouseLeave={() => setHoveredRole(null)}
//                 >
//                   {/* Card Glow Effect */}
//                   <div 
//                     className={`absolute -inset-1 rounded-3xl blur-xl transition-all duration-500 ${
//                       hoveredRole === role.id ? 'opacity-80' : 'opacity-20'
//                     }`}
//                     style={{ background: `linear-gradient(45deg, ${role.glow}, transparent)` }}
//                   />

//                   {/* Main Card */}
//                   <div className="relative">
//                     {/* Card Border */}
//                     <div className={`absolute inset-0 rounded-3xl p-[2px] ${
//                       hoveredRole === role.id ? 'opacity-100' : 'opacity-50'
//                     } transition-all duration-500`}>
//                       <div 
//                         className="w-full h-full rounded-3xl opacity-50"
//                         style={{ background: `linear-gradient(45deg, ${role.glow}, transparent)` }}
//                       />
//                     </div>

//                     {/* Card Content */}
//                     <button
//                       onClick={() => onRoleSelect(role.id)}
//                       className={`relative w-full h-full p-8 rounded-3xl bg-gradient-to-br from-slate-900/80 to-slate-900/40 backdrop-blur-xl border border-slate-700/30 transition-all duration-500 group-hover:scale-[1.02] ${
//                         hoveredRole === role.id ? 'shadow-2xl' : 'shadow-lg'
//                       }`}
//                       style={{
//                         boxShadow: hoveredRole === role.id ? 
//                           `0 0 60px -12px ${role.glow}40` : 
//                           '0 20px 40px -20px rgba(0,0,0,0.3)'
//                       }}
//                     >
//                       {/* Icon Container */}
//                       <div className="relative mb-8">
//                         {/* Icon Glow */}
//                         <div 
//                           className="absolute inset-0 blur-2xl rounded-2xl transition-all duration-500"
//                           style={{ 
//                             background: role.glow,
//                             opacity: hoveredRole === role.id ? 0.3 : 0.1
//                           }}
//                         />
                        
//                         {/* Icon */}
//                         <div 
//                           className={`relative w-20 h-20 rounded-2xl flex items-center justify-center text-4xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-12`}
//                           style={{
//                             background: `linear-gradient(135deg, ${role.glow}30, ${role.glow}10)`,
//                             border: `2px solid ${role.glow}30`
//                           }}
//                         >
//                           {role.icon}
//                         </div>
//                       </div>

//                       {/* Title */}
//                       <h3 className="text-2xl font-bold mb-3">
//                         <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">
//                           {role.title}
//                         </span>
//                       </h3>

//                       {/* Description */}
//                       <p className="text-slate-400 mb-8 text-sm leading-relaxed">
//                         {role.description}
//                       </p>

//                       {/* Features */}
//                       <div className="space-y-3 mb-8">
//                         {role.features.map((feature, idx) => (
//                           <div key={idx} className="flex items-center gap-3">
//                             <div 
//                               className="w-2 h-2 rounded-full flex-shrink-0"
//                               style={{ background: role.glow }}
//                             />
//                             <span className="text-sm text-slate-300">{feature}</span>
//                           </div>
//                         ))}
//                       </div>

//                       {/* Action Button */}
//                       <div className="flex items-center justify-between pt-6 border-t border-slate-700/30">
//                         <span className="text-xs font-semibold tracking-widest text-slate-400 uppercase">
//                           ACCESS PORTAL
//                         </span>
//                         <div className="relative">
//                           <div className="absolute inset-0 animate-ping rounded-full opacity-20" style={{ background: role.glow }} />
//                           <div 
//                             className="relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
//                             style={{ background: role.glow }}
//                           >
//                             <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" />
//                             </svg>
//                           </div>
//                         </div>
//                       </div>
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Footer */}
//           <div className="text-center pb-12">
//             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/30">
//               <div className="flex items-center gap-2">
//                 <div className="relative">
//                   <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
//                   <div className="absolute inset-0 w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
//                 </div>
//                 <span className="text-sm text-slate-300 font-semibold tracking-wider">
//                   SYSTEM STATUS: <span className="text-emerald-400">OPERATIONAL</span>
//                 </span>
//               </div>
//             </div>
//             <p className="mt-4 text-slate-500 text-sm">
//               Select your role to continue to the secure portal
//             </p>
//           </div>
//         </div>

//         {/* Floating Particles on Hover */}
//         {hoveredRole && (
//           <div className="fixed inset-0 pointer-events-none z-0">
//             {[...Array(20)].map((_, i) => {
//               const role = roles.find(r => r.id === hoveredRole);
//               return (
//                 <div
//                   key={i}
//                   className="absolute rounded-full animate-float"
//                   style={{
//                     left: `${Math.random() * 100}%`,
//                     top: `${Math.random() * 100}%`,
//                     width: `${Math.random() * 6 + 2}px`,
//                     height: `${Math.random() * 6 + 2}px`,
//                     background: role.particleColor,
//                     opacity: Math.random() * 0.3 + 0.1,
//                     animationDelay: `${Math.random() * 5}s`,
//                     animationDuration: `${Math.random() * 10 + 10}s`
//                   }}
//                 />
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </BackgroundFix>
//   );
// }

// export default RoleSelectionPage;

// HIGH RESOLUTION WITH ANIMATIONS AND DETAILED CARDS HAS MODIFIED STRUCTURE AND INFO 

// pages/RoleSelectionPage.js
// import React from "react";
// import BackgroundFix from "../components/BackgroundFix";
// import { THEMES } from "../data/themes";

// function RoleSelectionPage({ onRoleSelect }) {
//   const roles = [
//     {
//       id: 'admin',
//       title: 'Global Admin',
//       description: 'Complete system oversight, user management, and access control.',
//       icon: '👑',
//       gradient: 'from-blue-600 to-indigo-700',
//       glowColor: 'bg-indigo-500',
//       features: ['System Management', 'User Control', 'Full Analytics', 'Network Authorization']
//     },
//     {
//       id: 'manufacturer',
//       title: 'Manufacturer',
//       description: 'Register medicine batches and manage production with blockchain verification.',
//       icon: '🏭',
//       gradient: 'from-purple-600 to-fuchsia-700',
//       glowColor: 'bg-purple-500',
//       features: ['Batch Registration', 'Production Tracking', 'Quality Control', 'Supply Chain']
//     },
//     {
//       id: 'pharmacist',
//       title: 'Pharmacist',
//       description: 'Validate medicine authenticity and manage pharmacy inventory securely.',
//       icon: '💊',
//       gradient: 'from-emerald-600 to-teal-700',
//       glowColor: 'bg-emerald-500',
//       features: ['Medicine Verification', 'Inventory Management', 'Customer Service', 'Batch Acceptance']
//     },
//     {
//       id: 'viewer',
//       title: 'Quality Auditor',
//       description: 'Audit supply chain history with cryptographic verification.',
//       icon: '👁️',
//       gradient: 'from-amber-500 to-orange-600',
//       glowColor: 'bg-amber-400',
//       features: ['Read-Only Access', 'Quality Checking', 'Compliance Audit', 'Reports Viewing']
//     },
//     {
//       id: 'analytics',
//       title: 'Supply Analytics',
//       description: 'Visualize global movement patterns and inventory telemetry.',
//       icon: '📊',
//       gradient: 'from-rose-600 to-pink-700',
//       glowColor: 'bg-rose-500',
//       features: ['Data Analytics', 'Performance Reports', 'Trend Analysis', 'Export Tools']
//     }
//   ];

//   return (
//     <BackgroundFix theme={THEMES.blue}>
//       <div className="relative flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 py-12 sm:py-20">
//         {/* Background elements */}
//         <div className="absolute top-0 left-1/4 w-72 h-72 sm:w-96 sm:h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
//         <div className="absolute bottom-0 right-1/4 w-72 h-72 sm:w-96 sm:h-96 bg-fuchsia-600/10 rounded-full blur-[120px] pointer-events-none" />

//         {/* Header Section */}
//         <div className="relative text-center max-w-2xl mb-12 sm:mb-20 animate-in fade-in zoom-in duration-1000">
//           <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-xs font-bold uppercase tracking-[0.2em] text-indigo-400 mb-4 sm:mb-6">
//             <span className="relative flex h-2 w-2 mr-2 sm:mr-3">
//               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
//               <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
//             </span>
//             Decentralized Protocol v4.2
//           </div>
//           <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 sm:mb-6 text-transparent bg-clip-text bg-gradient-to-b from-gray-800 to-gray-600 dark:from-white dark:to-slate-400">
//             Medicheck Core
//           </h1>
//           <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-slate-400 leading-relaxed font-medium px-2">
//             Enter the secure medicine tracking ecosystem. Choose your protocol role to authenticate and access the ledger.
//           </p>
//         </div>

//         {/* Grid Section */}
//         <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 w-full max-w-7xl">
//           {roles.map((role, index) => (
//             <button
//               key={role.id}
//               onClick={() => onRoleSelect(role.id)}
//               style={{ animationDelay: `${index * 100}ms` }}
//               className="group relative flex flex-col items-start text-left p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-gray-200 dark:border-white/10 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/10 animate-in fade-in slide-in-from-bottom-8 fill-mode-both"
//             >
//               {/* Decorative Glow Background */}
//               <div className={`absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${role.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              
//               {/* Glow effect for the icon */}
//               <div className="relative mb-6 sm:mb-8">
//                 <div className={`absolute inset-0 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 ${role.glowColor}`} />
//                 <div className={`relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center bg-gradient-to-br ${role.gradient} text-white shadow-lg transform group-hover:-translate-y-1 group-hover:rotate-3 transition-transform duration-500`}>
//                   <span className="text-xl sm:text-2xl">{role.icon}</span>
//                 </div>
//               </div>

//               <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gray-800 group-hover:to-gray-600 dark:group-hover:from-white dark:group-hover:to-slate-400 transition-all">
//                 {role.title}
//               </h3>
              
//               <p className="text-gray-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 group-hover:text-gray-700 dark:group-hover:text-slate-300 transition-colors">
//                 {role.description}
//               </p>

//               {/* Features List */}
//               <div className="space-y-1.5 sm:space-y-2 mb-6 sm:mb-8">
//                 {role.features.map((feature, idx) => (
//                   <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm opacity-90 text-gray-600 dark:text-slate-400">
//                     <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-slate-500 rounded-full"></div>
//                     <span>{feature}</span>
//                   </div>
//                 ))}
//               </div>

//               <div className="mt-auto flex items-center text-xs font-bold tracking-widest uppercase text-gray-500 dark:text-slate-500 group-hover:text-gray-700 dark:group-hover:text-white transition-all">
//                 <span className="mr-2">Continue</span>
//                 <svg 
//                   xmlns="http://www.w3.org/2000/svg" 
//                   className="w-3 h-3 sm:w-4 sm:h-4 transform group-hover:translate-x-1 transition-transform" 
//                   viewBox="0 0 24 24" 
//                   fill="none" 
//                   stroke="currentColor" 
//                   strokeWidth="3" 
//                   strokeLinecap="round" 
//                   strokeLinejoin="round"
//                 >
//                   <line x1="5" y1="12" x2="19" y2="12"></line>
//                   <polyline points="12 5 19 12 12 19"></polyline>
//                 </svg>
//               </div>
              
//               {/* Border Highlight Effect */}
//               <div className="absolute inset-x-4 sm:inset-x-6 md:inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-gray-300/20 dark:via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
//             </button>
//           ))}
          
//           {/* Placeholder for future expansion */}
//           <div className="hidden lg:flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border-2 border-dashed border-gray-300 dark:border-white/5 opacity-50 group hover:opacity-100 transition-opacity cursor-not-allowed">
//             <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-gray-300 dark:border-white/20 flex items-center justify-center text-gray-400 dark:text-white/40 mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
//               <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                 <line x1="12" y1="5" x2="12" y2="19"></line>
//                 <line x1="5" y1="12" x2="19" y2="12"></line>
//               </svg>
//             </div>
//             <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-white/30">Add Terminal</p>
//           </div>
//         </div>

//         {/* Footer Info */}
//         <div className="mt-12 sm:mt-16 md:mt-20 lg:mt-24 text-center animate-in fade-in duration-1000 delay-500">
//           <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-12 text-gray-500 dark:text-slate-500">
//             <div className="flex flex-col items-center gap-1 sm:gap-2">
//               <div className="text-gray-800 dark:text-white/80 font-bold text-base sm:text-lg leading-none">99.9%</div>
//               <div className="text-[10px] sm:text-xs uppercase tracking-widest font-bold">Uptime</div>
//             </div>
//             <div className="w-px h-6 sm:h-8 bg-gray-300 dark:bg-white/10" />
//             <div className="flex flex-col items-center gap-1 sm:gap-2">
//               <div className="text-gray-800 dark:text-white/80 font-bold text-base sm:text-lg leading-none">AES-256</div>
//               <div className="text-[10px] sm:text-xs uppercase tracking-widest font-bold">Encrypted</div>
//             </div>
//             <div className="w-px h-6 sm:h-8 bg-gray-300 dark:bg-white/10" />
//             <div className="flex flex-col items-center gap-1 sm:gap-2">
//               <div className="text-gray-800 dark:text-white/80 font-bold text-base sm:text-lg leading-none">Ethereum</div>
//               <div className="text-[10px] sm:text-xs uppercase tracking-widest font-bold">Blockchain</div>
//             </div>
//           </div>
//           <p className="mt-8 sm:mt-10 md:mt-12 text-gray-400 dark:text-slate-600 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] md:tracking-[0.4em]">
//             Empowering Global Healthcare Safety through Cryptography
//           </p>
//         </div>
//       </div>
//     </BackgroundFix>
//   );
// }

// export default RoleSelectionPage;


// UPDATE WITH WHITE AND GRADIENT BORDER CARD STYLE 

// import React from "react";
// import BackgroundFix from "../components/BackgroundFix";
// import { THEMES } from "../data/themes";

// function RoleSelectionPage({ onRoleSelect }) {
//   const roles = [
//     {
//       id: "admin",
//       title: "Administrator",
//       description: "Full system access and platform control",
//       icon: "⚙️",
//       gradient: "from-blue-500 via-blue-600 to-indigo-600",
//     },
//     {
//       id: "pharmacist",
//       title: "Pharmacist",
//       description: "Pharmacy operations & batch verification",
//       icon: "💊",
//       gradient: "from-green-500 via-emerald-600 to-green-700",
//     },
//     {
//       id: "manufacturer",
//       title: "Manufacturer",
//       description: "Medicine production & blockchain registration",
//       icon: "🏭",
//       gradient: "from-purple-500 via-fuchsia-600 to-purple-700",
//     },
//     {
//       id: "viewer",
//       title: "Viewer",
//       description: "Read-only quality inspection access",
//       icon: "👁️",
//       gradient: "from-orange-500 via-amber-600 to-orange-700",
//     },
//     {
//       id: "analytics",
//       title: "Analytics",
//       description: "Advanced insights & reporting dashboard",
//       icon: "📊",
//       gradient: "from-teal-500 via-cyan-600 to-teal-700",
//     },
//   ];

//   return (
//     <BackgroundFix theme={THEMES.blue}>
//       <div className="min-h-screen flex items-center justify-center px-6 py-12">
//         <div className="relative w-full max-w-7xl rounded-3xl bg-white/70 backdrop-blur-xl border border-white/30 shadow-2xl p-10">

//           {/* Header */}
//           <div className="text-center mb-14">
//             <h1 className="text-5xl font-extrabold tracking-tight text-gray-900">
//               Medi<span className="text-blue-600">Check</span>
//             </h1>
//             <p className="mt-3 text-lg text-gray-600">
//               Blockchain-Powered Medicine Tracking
//             </p>
//             <p className="mt-1 text-sm text-gray-500">
//               Choose your access role to continue
//             </p>
//           </div>

//           {/* Cards */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
//             {roles.map((role) => (
//               <button
//                 key={role.id}
//                 onClick={() => onRoleSelect(role.id)}
//                 className="group relative rounded-3xl p-[1.5px] transition-all duration-300 hover:scale-[1.05]"
//               >
//                 {/* Glow Border */}
//                 <div
//                   className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${role.gradient} opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-300`}
//                 />

//                 {/* Card */}
//                 <div className="relative h-full rounded-3xl bg-white/90 backdrop-blur-xl p-8 text-left shadow-lg border border-gray-200">
//                   <div className="flex flex-col h-full">

//                     <div className="text-5xl mb-6 transition-transform duration-300 group-hover:scale-110">
//                       {role.icon}
//                     </div>

//                     <h3 className="text-2xl font-bold text-gray-900 mb-2">
//                       {role.title}
//                     </h3>

//                     <p className="text-gray-600 text-sm leading-relaxed flex-grow">
//                       {role.description}
//                     </p>

//                     <div className="mt-6 flex items-center justify-between">
//                       <span className="text-sm font-semibold text-blue-600">
//                         Continue
//                       </span>
//                       <span className="text-blue-600 text-lg transition-transform group-hover:translate-x-1">
//                         →
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </button>
//             ))}
//           </div>

//           {/* Footer */}
//           <div className="mt-14 text-center text-xs text-gray-500 tracking-wide">
//             Secure • Transparent • Immutable • Blockchain Verified
//           </div>
//         </div>
//       </div>
//     </BackgroundFix>
//   );
// }

// export default RoleSelectionPage;


// ORIGIONAL

// import React from "react";
// import BackgroundFix from "../components/BackgroundFix";
// import { THEMES } from "../data/themes";

// function RoleSelectionPage({ onRoleSelect }) {
//   const roles = [
//     {
//       id: 'admin',
//       title: 'Administrator',
//       description: 'Full system access and management',
//       icon: '⚙️',
//       color: 'from-blue-500 to-blue-600',
//       bgColor: 'bg-gradient-to-r from-blue-500 to-blue-600'
//     },
//     {
//       id: 'pharmacist',
//       title: 'Pharmacist',
//       description: 'Pharmacy management and batch handling',
//       icon: '💊',
//       color: 'from-green-500 to-green-600',
//       bgColor: 'bg-gradient-to-r from-green-500 to-green-600'
//     },
//     {
//       id: 'manufacturer',
//       title: 'Manufacturer',
//       description: 'Medicine production and batch registration',
//       icon: '🏭',
//       color: 'from-purple-500 to-purple-600',
//       bgColor: 'bg-gradient-to-r from-purple-500 to-purple-600'
//     },
//     {
//       id: 'viewer',
//       title: 'Viewer',
//       description: 'Read-only access for quality checking',
//       icon: '👁️',
//       color: 'from-orange-500 to-orange-600',
//       bgColor: 'bg-gradient-to-r from-orange-500 to-orange-600'
//     },
//     {
//       id: 'analytics',
//       title: 'Analytics',
//       description: 'Data analysis and reporting',
//       icon: '📊',
//       color: 'from-teal-500 to-teal-600',
//       bgColor: 'bg-gradient-to-r from-teal-500 to-teal-600'
//     }
//   ];

//   return (
//     <BackgroundFix theme={THEMES.blue}>
//       <div className="min-h-screen flex items-center justify-center p-4">
//         <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg w-full max-w-6xl">
//           <div className="text-center mb-12">
//             <h1 className="text-4xl font-bold text-gray-800 mb-4">Medicheck</h1>
//             <p className="text-gray-600 text-lg">Blockchain Medicine Tracker System</p>
//             <p className="text-gray-500 mt-2">Select your role to continue</p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {roles.map((role) => (
//               <button
//                 key={role.id}
//                 onClick={() => onRoleSelect(role.id)}
//                 className={`p-8 rounded-2xl ${role.bgColor} text-white text-left transform hover:scale-105 transition-all duration-300 shadow-lg border border-white/20 hover:shadow-xl group`}
//               >
//                 <div className="flex flex-col h-full">
//                   <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
//                     {role.icon}
//                   </div>
//                   <h3 className="text-2xl font-bold mb-3">{role.title}</h3>
//                   <p className="text-white/90 text-sm leading-relaxed">{role.description}</p>
//                   <div className="mt-4 text-white/80 text-sm font-medium group-hover:text-white transition-colors">
//                     Click to continue →
//                   </div>
//                 </div>
//               </button>
//             ))}
//           </div>

//           <div className="mt-12 text-center text-gray-500 text-sm">
//             <p>Secure • Transparent • Blockchain-Powered Medicine Tracking</p>
//           </div>
//         </div>
//       </div>
//     </BackgroundFix>
//   );
// }

// export default RoleSelectionPage;