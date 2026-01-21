import React, { useState, useEffect } from "react";

function BlockchainVisualization() {
  const [connections, setConnections] = useState([]);
  const [isAnimating, setIsAnimating] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Node positions with better spacing
  const blockchainNodes = isMobile ? [
    { id: 1, name: "Manufacturer", type: "manufacturer", x: 20, y: 20, connected: true },
    { id: 2, name: "Pharmacy", type: "pharmacy", x: 70, y: 20, connected: true },
    { id: 3, name: "Regulator", type: "regulator", x: 20, y: 60, connected: true },
    { id: 4, name: "Customer", type: "customer", x: 70, y: 60, connected: true },
    { id: 5, name: "Auditor", type: "auditor", x: 45, y: 85, connected: true }
  ] : [
    { id: 1, name: "Manufacturer", type: "manufacturer", x: 20, y: 40, connected: true },
    { id: 2, name: "Pharmacy", type: "pharmacy", x: 80, y: 40, connected: true },
    { id: 3, name: "Regulator", type: "regulator", x: 50, y: 15, connected: true },
    { id: 4, name: "Customer", type: "customer", x: 20, y: 70, connected: true },
    { id: 5, name: "Auditor", type: "auditor", x: 80, y: 70, connected: true }
  ];

  // Updated relationships with clearer categorization
  const relationships = [
    { from: 1, to: 2, label: "Supply", color: "#3B82F6", type: "supply" },
    { from: 2, to: 4, label: "Dispense", color: "#8B5CF6", type: "dispense" },
    { from: 3, to: 1, label: "Monitor", color: "#EF4444", type: "monitor" },
    { from: 3, to: 2, label: "Inspect", color: "#EF4444", type: "inspect" },
    { from: 5, to: 1, label: "Audit", color: "#0D9488", type: "audit" },
    { from: 5, to: 2, label: "Review", color: "#0D9488", type: "review" },
    { from: 5, to: 4, label: "Verify", color: "#F59E0B", type: "verify" }
  ];

  useEffect(() => {
    if (!isAnimating) return;
    
    const interval = setInterval(() => {
      setConnections(prev => {
        const randomRel = relationships[Math.floor(Math.random() * relationships.length)];
        return [
          ...prev.slice(-3),
          {
            id: Date.now(),
            from: randomRel.from,
            to: randomRel.to,
            label: randomRel.label,
            duration: Math.random() * 1000 + 500,
            color: randomRel.color
          }
        ];
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isAnimating]);

  const getNodeColor = (type) => {
    const colors = {
      manufacturer: "bg-blue-500 border-blue-600",
      pharmacy: "bg-purple-500 border-purple-600",
      regulator: "bg-red-500 border-red-600",
      customer: "bg-orange-500 border-orange-600",
      auditor: "bg-teal-500 border-teal-600"
    };
    return colors[type];
  };

  const getNodeIcon = (type) => {
    const icons = {
      manufacturer: "🏭",
      pharmacy: "💊",
      regulator: "🏛️",
      customer: "👤",
      auditor: "🔍"
    };
    return icons[type] || "⚫";
  };

  // Group relationships by type for the legend
  const relationshipGroups = [
    {
      title: "Regulatory Actions",
      color: "#EF4444",
      items: relationships.filter(r => r.type === "monitor" || r.type === "inspect")
    },
    {
      title: "Audit Actions",
      color: "#0D9488",
      items: relationships.filter(r => r.type === "audit" || r.type === "review")
    },
    {
      title: "Supply Chain",
      color: "#3B82F6",
      items: relationships.filter(r => r.type === "supply")
    },
    {
      title: "Pharmacy",
      color: "#8B5CF6",
      items: relationships.filter(r => r.type === "dispense")
    },
    {
      title: "Verification",
      color: "#F59E0B",
      items: relationships.filter(r => r.type === "verify")
    }
  ];

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-200 shadow-sm mb-4 md:mb-6">
      <div className="flex justify-between items-center mb-3 md:mb-4">
        <h3 className="text-base md:text-xl font-bold text-gray-800">Live Blockchain Network</h3>
        <button 
          onClick={() => setIsAnimating(!isAnimating)}
          className={`px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm font-semibold transition-all ${
            isAnimating ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
          }`}
        >
          {isAnimating ? '🟢 Live' : '⏸️ Paused'}
        </button>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left side: Relationships Legend */}
        {!isMobile && (
          <div className="lg:w-1/3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-bold text-gray-800 mb-3 text-sm">Network Relationships</h4>
            <div className="space-y-3">
              {relationshipGroups.map((group, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: group.color }}
                    ></div>
                    <span className="text-xs font-semibold text-gray-700">
                      {group.title}
                    </span>
                  </div>
                  <div className="pl-5 space-y-1">
                    {group.items.map((rel, relIndex) => (
                      <div key={relIndex} className="flex items-center gap-2 text-xs text-gray-600">
                        <div className="w-2 h-0.5" style={{ backgroundColor: group.color }}></div>
                        <span>{rel.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Network Stats */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <h5 className="text-xs font-semibold text-gray-700 mb-2">Network Status</h5>
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Nodes Connected:</span>
                  <span className="font-semibold">5</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Connections:</span>
                  <span className="font-semibold">{connections.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-semibold text-green-600">Live</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Right side: Visualization */}
        <div className={`relative ${isMobile ? 'h-64' : 'h-80 md:h-96'} ${isMobile ? 'w-full' : 'lg:w-2/3'} bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg md:rounded-xl border border-gray-200 p-2 md:p-4 overflow-hidden`}>
          {/* PERMANENT CONNECTION LINES */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="5" refX="7" refY="2.5" orient="auto">
                <polygon points="0 0, 8 2.5, 0 5" className="fill-gray-400" />
              </marker>
              <marker id="arrow-blue" markerWidth="8" markerHeight="5" refX="7" refY="2.5" orient="auto">
                <polygon points="0 0, 8 2.5, 0 5" className="fill-blue-500" />
              </marker>
              <marker id="arrow-red" markerWidth="8" markerHeight="5" refX="7" refY="2.5" orient="auto">
                <polygon points="0 0, 8 2.5, 0 5" className="fill-red-500" />
              </marker>
              <marker id="arrow-green" markerWidth="8" markerHeight="5" refX="7" refY="2.5" orient="auto">
                <polygon points="0 0, 8 2.5, 0 5" className="fill-green-500" />
              </marker>
              <marker id="arrow-orange" markerWidth="8" markerHeight="5" refX="7" refY="2.5" orient="auto">
                <polygon points="0 0, 8 2.5, 0 5" className="fill-orange-500" />
              </marker>
              <marker id="arrow-purple" markerWidth="8" markerHeight="5" refX="7" refY="2.5" orient="auto">
                <polygon points="0 0, 8 2.5, 0 5" className="fill-purple-500" />
              </marker>
            </defs>
            
            {/* Draw ALL relationship lines */}
            {relationships.map((rel, idx) => {
              const fromNode = blockchainNodes.find(n => n.id === rel.from);
              const toNode = blockchainNodes.find(n => n.id === rel.to);
              
              if (!fromNode || !toNode) return null;
              
              const dx = toNode.x - fromNode.x;
              const dy = toNode.y - fromNode.y;
              const length = Math.sqrt(dx * dx + dy * dy);
              
              // Adjust start/end points
              const startX = fromNode.x + (dx / length) * 4;
              const startY = fromNode.y + (dy / length) * 4;
              const endX = toNode.x - (dx / length) * 4;
              const endY = toNode.y - (dy / length) * 4;
              
              // Determine line color
              let lineColor = rel.color;
              let markerId = "arrow";
              
              if (rel.type === "monitor" || rel.type === "inspect") {
                markerId = "arrow-red";
              } else if (rel.type === "audit" || rel.type === "review") {
                markerId = "arrow-green";
              } else if (rel.type === "supply") {
                markerId = "arrow-blue";
              } else if (rel.type === "dispense") {
                markerId = "arrow-purple";
              } else if (rel.type === "verify") {
                markerId = "arrow-orange";
              }
              
              return (
                <g key={idx}>
                  {/* Main connection line */}
                  <line
                    x1={`${startX}%`}
                    y1={`${startY}%`}
                    x2={`${endX}%`}
                    y2={`${endY}%`}
                    stroke={lineColor}
                    strokeWidth={isMobile ? "1.5" : "2"}
                    strokeDasharray="5,3"
                    markerEnd={`url(#${markerId})`}
                    opacity="0.7"
                  />
                </g>
              );
            })}
          </svg>
          
          {/* ANIMATED DATA FLOW */}
          {isAnimating && connections.map((conn) => {
            const fromNode = blockchainNodes.find(n => n.id === conn.from);
            const toNode = blockchainNodes.find(n => n.id === conn.to);
            
            if (!fromNode || !toNode) return null;
            
            const dx = toNode.x - fromNode.x;
            const dy = toNode.y - fromNode.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;
            
            return (
              <div
                key={conn.id}
                className="absolute pointer-events-none"
                style={{
                  left: `${fromNode.x}%`,
                  top: `${fromNode.y}%`,
                  width: `${length}%`,
                  height: '2px',
                  transform: `rotate(${angle}deg)`,
                  transformOrigin: '0 0',
                  zIndex: 2,
                  animation: `flowAlongLine ${conn.duration}ms linear forwards`
                }}
              >
                <div
                  className="absolute w-2 h-2 md:w-3 md:h-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{ background: conn.color || '#3B82F6' }}
                >
                  <div className="absolute inset-0.5 bg-white rounded-full"></div>
                </div>
              </div>
            );
          })}

          {/* NODES with full names */}
          {blockchainNodes.map((node) => (
            <div
              key={node.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                node.connected ? 'opacity-100' : 'opacity-50'
              }`}
              style={{ 
                left: `${node.x}%`, 
                top: `${node.y}%`,
                zIndex: 20 
              }}
            >
              <div className="flex flex-col items-center">
                <div className={`${isMobile ? 'w-12 h-12' : 'w-14 md:w-16 h-14 md:h-16'} rounded-full ${getNodeColor(node.type)} border-3 md:border-4 flex flex-col items-center justify-center text-white shadow-lg md:shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-xl group cursor-pointer`}>
                  <div className={`${isMobile ? 'text-lg' : 'text-xl md:text-2xl'} mb-0.5 group-hover:scale-110 transition-transform`}>
                    {getNodeIcon(node.type)}
                  </div>
                </div>
                
                {/* Full name label below the node */}
                <div className={`mt-1 ${isMobile ? 'text-[10px]' : 'text-xs'} font-bold text-gray-700 bg-white bg-opacity-90 px-1.5 py-0.5 rounded-full border border-gray-200 shadow-sm whitespace-nowrap`}>
                  {node.name}
                </div>
              </div>
              
              {/* Connection indicator */}
              <div className="absolute -top-1 -right-1 w-2 h-2 md:w-3 md:h-3 rounded-full border border-white bg-green-400 animate-pulse shadow"></div>
            </div>
          ))}

          {/* Blockchain blocks animation */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {[1, 2, 3, 4, 5].map((block) => (
              <div
                key={block}
                className={`${isMobile ? 'w-4 h-4' : 'w-5 md:w-6 h-5 md:h-6'} bg-gradient-to-br from-blue-500 to-purple-600 rounded border border-white shadow flex items-center justify-center`}
                style={{
                  animation: `bounce 1s infinite ${block * 0.1}s`,
                  animationPlayState: isAnimating ? 'running' : 'paused'
                }}
              >
                <div className="text-white text-xs font-bold">{block}</div>
              </div>
            ))}
          </div>

          {/* Network status */}
          <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-gradient-to-r from-green-50 to-blue-50 px-2 md:px-3 py-1 md:py-2 rounded-lg border border-green-200 shadow-sm">
            <div className="flex items-center space-x-1 md:space-x-2">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-700 text-xs md:text-sm font-semibold">Live Network</span>
            </div>
            <div className="text-[10px] md:text-xs text-gray-600 mt-0.5">5 Nodes Connected</div>
          </div>
        </div>
      </div>

      {/* Mobile: Relationships Legend (below visualization) */}
      {isMobile && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-bold text-gray-800 mb-2 text-sm">Network Relationships</h4>
          <div className="grid grid-cols-2 gap-2">
            {relationshipGroups.map((group, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center gap-1">
                  <div 
                    className="w-2 h-2 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: group.color }}
                  ></div>
                  <span className="text-xs font-semibold text-gray-700 truncate">
                    {group.title}
                  </span>
                </div>
                <div className="pl-3 space-y-0.5">
                  {group.items.map((rel, relIndex) => (
                    <div key={relIndex} className="flex items-center gap-1 text-xs text-gray-600">
                      <div className="w-1.5 h-0.5" style={{ backgroundColor: group.color }}></div>
                      <span>{rel.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Network Activity */}
      <div className="mt-3 md:mt-4 p-2 md:p-3 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center text-xs md:text-sm">
          <span className="text-gray-600">Network Activity</span>
          <span className="text-green-600 font-semibold">High</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 md:h-2 mt-1 md:mt-2">
          <div 
            className="bg-gradient-to-r from-green-400 to-blue-500 h-1.5 md:h-2 rounded-full transition-all duration-1000"
            style={{ width: isAnimating ? '85%' : '0%' }}
          ></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes flowAlongLine {
          0% {
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translate(100%, 0) rotate(var(--angle));
            opacity: 0;
          }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}

export default BlockchainVisualization;



// // BlockchainVisualization.js - Original version
// import React, { useState, useEffect } from "react";

// function BlockchainVisualization() {
//   const [connections, setConnections] = useState([]);
//   const [isAnimating, setIsAnimating] = useState(true);
//   const [isMobile, setIsMobile] = useState(false);

//   // Check if mobile on mount and resize
//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 768);
//     };
    
//     checkMobile();
//     window.addEventListener('resize', checkMobile);
//     return () => window.removeEventListener('resize', checkMobile);
//   }, []);

//   // Node positions - better spacing to prevent overlap
//   const blockchainNodes = isMobile ? [
//     { id: 1, name: "Manufacturer", type: "manufacturer", x: 20, y: 20, connected: true },
//     { id: 2, name: "Pharmacy", type: "pharmacy", x: 70, y: 20, connected: true },
//     { id: 3, name: "Regulator", type: "regulator", x: 20, y: 60, connected: true },
//     { id: 4, name: "Customer", type: "customer", x: 70, y: 60, connected: true },
//     { id: 5, name: "Auditor", type: "auditor", x: 45, y: 85, connected: true }
//   ] : [
//     { id: 1, name: "Manufacturer", type: "manufacturer", x: 20, y: 40, connected: true },
//     { id: 2, name: "Pharmacy", type: "pharmacy", x: 80, y: 40, connected: true },
//     { id: 3, name: "Regulator", type: "regulator", x: 50, y: 15, connected: true },
//     { id: 4, name: "Customer", type: "customer", x: 20, y: 70, connected: true },
//     { id: 5, name: "Auditor", type: "auditor", x: 80, y: 70, connected: true }
//   ];

//   // Updated relationships
//   const relationships = [
//     { from: 1, to: 2, label: "Supply" },
//     { from: 2, to: 4, label: "Dispense" },
//     { from: 3, to: 1, label: "Monitor" },
//     { from: 3, to: 2, label: "Inspect" },
//     { from: 5, to: 1, label: "Audit" },
//     { from: 5, to: 2, label: "Review" },
//     { from: 5, to: 4, label: "Verify" }
//   ];

//   useEffect(() => {
//     if (!isAnimating) return;
    
//     const interval = setInterval(() => {
//       setConnections(prev => {
//         const randomRel = relationships[Math.floor(Math.random() * relationships.length)];
//         return [
//           ...prev.slice(-3),
//           {
//             id: Date.now(),
//             from: randomRel.from,
//             to: randomRel.to,
//             label: randomRel.label,
//             duration: Math.random() * 1000 + 500
//           }
//         ];
//       });
//     }, 1500);

//     return () => clearInterval(interval);
//   }, [isAnimating]);

//   const getNodeColor = (type) => {
//     const colors = {
//       manufacturer: "bg-blue-500 border-blue-600",
//       pharmacy: "bg-purple-500 border-purple-600",
//       regulator: "bg-red-500 border-red-600",
//       customer: "bg-orange-500 border-orange-600",
//       auditor: "bg-teal-500 border-teal-600"
//     };
//     return colors[type];
//   };

//   const getNodeIcon = (type) => {
//     const icons = {
//       manufacturer: "🏭",
//       pharmacy: "💊",
//       regulator: "🏛️",
//       customer: "👤",
//       auditor: "🔍"
//     };
//     return icons[type] || "⚫";
//   };

//   return (
//     <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-200 shadow-sm mb-4 md:mb-6">
//       <div className="flex justify-between items-center mb-3 md:mb-4">
//         <h3 className="text-base md:text-xl font-bold text-gray-800">Live Blockchain Network</h3>
//         <button 
//           onClick={() => setIsAnimating(!isAnimating)}
//           className={`px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm font-semibold transition-all ${
//             isAnimating ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
//           }`}
//         >
//           {isAnimating ? '🟢 Live' : '⏸️ Paused'}
//         </button>
//       </div>
      
//       <div className={`relative ${isMobile ? 'h-64' : 'h-80 md:h-96'} bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg md:rounded-xl border border-gray-200 p-2 md:p-4 overflow-hidden`}>
//         {/* PERMANENT CONNECTION LINES */}
//         <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
//           <defs>
//             <marker id="arrow" markerWidth="8" markerHeight="5" refX="7" refY="2.5" orient="auto">
//               <polygon points="0 0, 8 2.5, 0 5" className="fill-gray-400" />
//             </marker>
//             <marker id="arrow-blue" markerWidth="8" markerHeight="5" refX="7" refY="2.5" orient="auto">
//               <polygon points="0 0, 8 2.5, 0 5" className="fill-blue-500" />
//             </marker>
//             <marker id="arrow-red" markerWidth="8" markerHeight="5" refX="7" refY="2.5" orient="auto">
//               <polygon points="0 0, 8 2.5, 0 5" className="fill-red-500" />
//             </marker>
//             <marker id="arrow-green" markerWidth="8" markerHeight="5" refX="7" refY="2.5" orient="auto">
//               <polygon points="0 0, 8 2.5, 0 5" className="fill-green-500" />
//             </marker>
//             <marker id="arrow-orange" markerWidth="8" markerHeight="5" refX="7" refY="2.5" orient="auto">
//               <polygon points="0 0, 8 2.5, 0 5" className="fill-orange-500" />
//             </marker>
//             <marker id="arrow-purple" markerWidth="8" markerHeight="5" refX="7" refY="2.5" orient="auto">
//               <polygon points="0 0, 8 2.5, 0 5" className="fill-purple-500" />
//             </marker>
//           </defs>
          
//           {/* Draw ALL relationship lines */}
//           {relationships.map((rel, idx) => {
//             const fromNode = blockchainNodes.find(n => n.id === rel.from);
//             const toNode = blockchainNodes.find(n => n.id === rel.to);
            
//             if (!fromNode || !toNode) return null;
            
//             const dx = toNode.x - fromNode.x;
//             const dy = toNode.y - fromNode.y;
//             const length = Math.sqrt(dx * dx + dy * dy);
            
//             // Adjust start/end points
//             const startX = fromNode.x + (dx / length) * 4;
//             const startY = fromNode.y + (dy / length) * 4;
//             const endX = toNode.x - (dx / length) * 4;
//             const endY = toNode.y - (dy / length) * 4;
            
//             // Calculate label position with more space
//             const labelX = (startX + endX) / 2;
//             const labelY = (startY + endY) / 2;
            
//             // Adjust label position based on line angle
//             let labelOffsetX = 0;
//             let labelOffsetY = 0;
            
//             if (Math.abs(dx) > Math.abs(dy)) {
//               // More horizontal line
//               labelOffsetY = -8;
//             } else {
//               // More vertical line
//               labelOffsetX = 8;
//             }
            
//             // Determine line color
//             let lineColor = "#94A3B8";
//             let markerId = "arrow";
            
//             if (rel.from === 3) { // Regulator
//               lineColor = "#EF4444";
//               markerId = "arrow-red";
//             } else if (rel.from === 5) { // Auditor
//               lineColor = "#0D9488";
//               markerId = "arrow-green";
//             } else if (rel.label === "Supply") {
//               lineColor = "#3B82F6";
//               markerId = "arrow-blue";
//             } else if (rel.label === "Dispense") {
//               lineColor = "#8B5CF6";
//               markerId = "arrow-purple";
//             } else if (rel.label === "Verify") {
//               lineColor = "#F59E0B";
//               markerId = "arrow-orange";
//             }
            
//             return (
//               <g key={idx}>
//                 {/* Main connection line */}
//                 <line
//                   x1={`${startX}%`}
//                   y1={`${startY}%`}
//                   x2={`${endX}%`}
//                   y2={`${endY}%`}
//                   stroke={lineColor}
//                   strokeWidth={isMobile ? "1.5" : "2"}
//                   strokeDasharray="5,3"
//                   markerEnd={`url(#${markerId})`}
//                   opacity="0.7"
//                 />
                
//                 {/* Relationship label - Only show on desktop with better positioning */}
//                 {!isMobile && (
//                   <g>
//                     {/* White background for text */}
//                     <rect
//                       x={`${labelX + labelOffsetX - 2}%`}
//                       y={`${labelY + labelOffsetY - 6}%`}
//                       width="24px"
//                       height="14px"
//                       fill="white"
//                       fillOpacity="0.9"
//                       rx="3"
//                       ry="3"
//                     />
//                     {/* Text label */}
//                     <text
//                       x={`${labelX + labelOffsetX}%`}
//                       y={`${labelY + labelOffsetY}%`}
//                       textAnchor="middle"
//                       dominantBaseline="middle"
//                       fontSize="9"
//                       fontWeight="600"
//                       fill={lineColor}
//                     >
//                       {rel.label}
//                     </text>
//                   </g>
//                 )}
//               </g>
//             );
//           })}
//         </svg>
        
//         {/* ANIMATED DATA FLOW */}
//         {isAnimating && connections.map((conn) => {
//           const fromNode = blockchainNodes.find(n => n.id === conn.from);
//           const toNode = blockchainNodes.find(n => n.id === conn.to);
          
//           if (!fromNode || !toNode) return null;
          
//           const dx = toNode.x - fromNode.x;
//           const dy = toNode.y - fromNode.y;
//           const length = Math.sqrt(dx * dx + dy * dy);
//           const angle = Math.atan2(dy, dx) * 180 / Math.PI;
          
//           return (
//             <div
//               key={conn.id}
//               className="absolute pointer-events-none"
//               style={{
//                 left: `${fromNode.x}%`,
//                 top: `${fromNode.y}%`,
//                 width: `${length}%`,
//                 height: '2px',
//                 transform: `rotate(${angle}deg)`,
//                 transformOrigin: '0 0',
//                 zIndex: 2,
//                 animation: `flowAlongLine ${conn.duration}ms linear forwards`
//               }}
//             >
//               <div
//                 className="absolute w-2 h-2 md:w-3 md:h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 shadow"
//               >
//                 <div className="absolute inset-0.5 bg-white rounded-full"></div>
//               </div>
//             </div>
//           );
//         })}

//         {/* NODES - with better text handling */}
//         {blockchainNodes.map((node) => (
//           <div
//             key={node.id}
//             className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
//               node.connected ? 'opacity-100' : 'opacity-50'
//             }`}
//             style={{ 
//               left: `${node.x}%`, 
//               top: `${node.y}%`,
//               zIndex: 20 
//             }}
//           >
//             <div className={`${isMobile ? 'w-12 h-12' : 'w-14 md:w-16 h-14 md:h-16'} rounded-full ${getNodeColor(node.type)} border-3 md:border-4 flex flex-col items-center justify-center text-white shadow-lg md:shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-xl group cursor-pointer`}>
//               <div className={`${isMobile ? 'text-lg' : 'text-xl md:text-2xl'} mb-0.5 group-hover:scale-110 transition-transform`}>
//                 {getNodeIcon(node.type)}
//               </div>
//               <div className={`${isMobile ? 'text-[10px]' : 'text-xs'} font-bold text-center px-1 leading-tight max-w-full`}>
//                 <span className="inline-block max-w-full truncate">{node.name}</span>
//               </div>
//             </div>
            
//             {/* Connection indicator */}
//             <div className="absolute -top-1 -right-1 w-2 h-2 md:w-3 md:h-3 rounded-full border border-white bg-green-400 animate-pulse shadow"></div>
//           </div>
//         ))}

//         {/* Blockchain blocks animation */}
//         <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1">
//           {[1, 2, 3, 4, 5].map((block) => (
//             <div
//               key={block}
//               className={`${isMobile ? 'w-4 h-4' : 'w-5 md:w-6 h-5 md:h-6'} bg-gradient-to-br from-blue-500 to-purple-600 rounded border border-white shadow flex items-center justify-center`}
//               style={{
//                 animation: `bounce 1s infinite ${block * 0.1}s`,
//                 animationPlayState: isAnimating ? 'running' : 'paused'
//               }}
//             >
//               <div className="text-white text-xs font-bold">{block}</div>
//             </div>
//           ))}
//         </div>

//         {/* Network status */}
//         <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-gradient-to-r from-green-50 to-blue-50 px-2 md:px-3 py-1 md:py-2 rounded-lg border border-green-200 shadow-sm">
//           <div className="flex items-center space-x-1 md:space-x-2">
//             <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full animate-pulse"></div>
//             <span className="text-green-700 text-xs md:text-sm font-semibold">Live Network</span>
//           </div>
//           <div className="text-[10px] md:text-xs text-gray-600 mt-0.5">5 Nodes Connected</div>
//         </div>
//       </div>

//       {/* Network Activity */}
//       <div className="mt-3 md:mt-4 p-2 md:p-3 bg-gray-50 rounded-lg">
//         <div className="flex justify-between items-center text-xs md:text-sm">
//           <span className="text-gray-600">Network Activity</span>
//           <span className="text-green-600 font-semibold">High</span>
//         </div>
//         <div className="w-full bg-gray-200 rounded-full h-1.5 md:h-2 mt-1 md:mt-2">
//           <div 
//             className="bg-gradient-to-r from-green-400 to-blue-500 h-1.5 md:h-2 rounded-full transition-all duration-1000"
//             style={{ width: isAnimating ? '85%' : '0%' }}
//           ></div>
//         </div>
//       </div>

//       <style jsx>{`
//         @keyframes flowAlongLine {
//           0% {
//             opacity: 0;
//           }
//           10% {
//             opacity: 1;
//           }
//           90% {
//             opacity: 1;
//           }
//           100% {
//             transform: translate(100%, 0) rotate(var(--angle));
//             opacity: 0;
//           }
//         }
        
//         @keyframes bounce {
//           0%, 100% { transform: translateY(0); }
//           50% { transform: translateY(-4px); }
//         }
//       `}</style>
//     </div>
//   );
// }

// export default BlockchainVisualization;
