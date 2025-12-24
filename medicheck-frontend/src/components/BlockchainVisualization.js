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

  // Node positions with explicit percentages
  const blockchainNodes = isMobile ? [
    { id: 1, name: "Manufacturer", type: "manufacturer", x: 15, y: 20, connected: true },
    { id: 2, name: "Distributor", type: "distributor", x: 40, y: 40, connected: true },
    { id: 3, name: "Pharmacy", type: "pharmacy", x: 70, y: 40, connected: true },
    { id: 4, name: "Regulator", type: "regulator", x: 30, y: 70, connected: true },
    { id: 5, name: "Customer", type: "customer", x: 70, y: 70, connected: true },
    { id: 6, name: "Auditor", type: "auditor", x: 50, y: 90, connected: true }
  ] : [
    { id: 1, name: "Manufacturer", type: "manufacturer", x: 20, y: 30, connected: true },
    { id: 2, name: "Distributor", type: "distributor", x: 30, y: 60, connected: true },
    { id: 3, name: "Pharmacy", type: "pharmacy", x: 70, y: 60, connected: true },
    { id: 4, name: "Regulator", type: "regulator", x: 50, y: 20, connected: true },
    { id: 5, name: "Customer", type: "customer", x: 80, y: 70, connected: true },
    { id: 6, name: "Auditor", type: "auditor", x: 50, y: 80, connected: true }
  ];

  const relationships = [
    { from: 1, to: 2, label: "Supply" },
    { from: 2, to: 3, label: "Distribute" },
    { from: 3, to: 5, label: "Dispense" },
    { from: 4, to: 1, label: "Monitor" },
    { from: 4, to: 2, label: "Regulate" },
    { from: 4, to: 3, label: "Inspect" },
    { from: 6, to: 1, label: "Audit" },
    { from: 6, to: 2, label: "Verify" },
    { from: 6, to: 3, label: "Review" }
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
            duration: Math.random() * 1000 + 500
          }
        ];
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isAnimating]);

  const getNodeColor = (type) => {
    const colors = {
      manufacturer: "bg-blue-500 border-blue-600",
      distributor: "bg-green-500 border-green-600", 
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
      distributor: "🚚", 
      pharmacy: "💊",
      regulator: "🏛️",
      customer: "👤",
      auditor: "🔍"
    };
    return icons[type] || "⚫";
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-200 shadow-sm mb-4 md:mb-6">
      <div className="flex justify-between items-center mb-3 md:mb-4">
        <h3 className="text-base md:text-xl font-bold text-gray-800 truncate">Live Blockchain Network</h3>
        <button 
          onClick={() => setIsAnimating(!isAnimating)}
          className={`px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm font-semibold transition-all ${
            isAnimating ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
          }`}
        >
          {isAnimating ? '🟢 Live' : '⏸️ Paused'}
        </button>
      </div>
      
      <div className={`relative ${isMobile ? 'h-64' : 'h-72 md:h-96'} bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg md:rounded-xl border border-gray-200 p-2 md:p-4 overflow-hidden`}>
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
            const startX = fromNode.x + (dx / length) * 3;
            const startY = fromNode.y + (dy / length) * 3;
            const endX = toNode.x - (dx / length) * 3;
            const endY = toNode.y - (dy / length) * 3;
            
            // Determine line color
            let lineColor = "#94A3B8";
            let markerId = "arrow";
            
            if (rel.from === 4) { // Regulator
              lineColor = "#EF4444";
              markerId = "arrow-red";
            } else if (rel.from === 6) { // Auditor
              lineColor = "#0D9488";
              markerId = "arrow-green";
            } else if (rel.label === "Supply") {
              lineColor = "#3B82F6";
              markerId = "arrow-blue";
            } else if (rel.label === "Distribute") {
              lineColor = "#10B981";
              markerId = "arrow-green";
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
                
                {/* Relationship label - Hide on mobile */}
                {!isMobile && (
                  <text
                    x={`${(startX + endX) / 2}%`}
                    y={`${(startY + endY) / 2 - 2}%`}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="10"
                    fontWeight="600"
                    fill={lineColor}
                    style={{ textShadow: '0 0 3px white, 0 0 3px white' }}
                  >
                    {rel.label}
                  </text>
                )}
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
                className="absolute w-2 h-2 md:w-3 md:h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 shadow"
              >
                <div className="absolute inset-0.5 bg-white rounded-full"></div>
              </div>
            </div>
          );
        })}

        {/* NODES */}
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
            <div className={`${isMobile ? 'w-12 h-12' : 'w-14 md:w-16 h-14 md:h-16'} rounded-full ${getNodeColor(node.type)} border-3 md:border-4 flex flex-col items-center justify-center text-white shadow-lg md:shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-xl group cursor-pointer`}>
              <div className={`${isMobile ? 'text-lg' : 'text-xl md:text-2xl'} mb-0.5 group-hover:scale-110 transition-transform`}>
                {getNodeIcon(node.type)}
              </div>
              <div className={`${isMobile ? 'text-[10px]' : 'text-xs'} font-bold text-center px-1 leading-tight truncate`}>
                {node.name}
              </div>
            </div>
            
            {/* Connection indicator */}
            <div className="absolute -top-1 -right-1 w-2 h-2 md:w-3 md:h-3 rounded-full border border-white bg-green-400 animate-pulse shadow"></div>
          </div>
        ))}

        {/* Blockchain blocks animation */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {[1, 2, 3, 4, 5, 6].map((block) => (
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
          <div className="text-[10px] md:text-xs text-gray-600 mt-0.5">6 Nodes Connected</div>
        </div>
      </div>

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





// import React, { useState, useEffect } from "react";

// function BlockchainVisualization() {
//   const [connections, setConnections] = useState([]);
//   const [isAnimating, setIsAnimating] = useState(true);

//   // Node positions with explicit percentages
//   const blockchainNodes = [
//     { id: 1, name: "Manufacturer", type: "manufacturer", x: 20, y: 30, connected: true },
//     { id: 2, name: "Distributor", type: "distributor", x: 30, y: 60, connected: true },
//     { id: 3, name: "Pharmacy", type: "pharmacy", x: 70, y: 60, connected: true },
//     { id: 4, name: "Regulator", type: "regulator", x: 50, y: 20, connected: true },
//     { id: 5, name: "Customer", type: "customer", x: 80, y: 70, connected: true },
//     { id: 6, name: "Auditor", type: "auditor", x: 50, y: 80, connected: true }
//   ];

//   const relationships = [
//     { from: 1, to: 2, label: "Supply" },
//     { from: 2, to: 3, label: "Distribute" },
//     { from: 3, to: 5, label: "Dispense" },
//     { from: 4, to: 1, label: "Monitor" },
//     { from: 4, to: 2, label: "Regulate" },
//     { from: 4, to: 3, label: "Inspect" },
//     { from: 6, to: 1, label: "Audit" },
//     { from: 6, to: 2, label: "Verify" },
//     { from: 6, to: 3, label: "Review" }
//   ];

//   useEffect(() => {
//     if (!isAnimating) return;
    
//     const interval = setInterval(() => {
//       setConnections(prev => {
//         const randomRel = relationships[Math.floor(Math.random() * relationships.length)];
//         return [
//           ...prev.slice(-5),
//           {
//             id: Date.now(),
//             from: randomRel.from,
//             to: randomRel.to,
//             label: randomRel.label,
//             duration: Math.random() * 1500 + 1000
//           }
//         ];
//       });
//     }, 1200);

//     return () => clearInterval(interval);
//   }, [isAnimating]);

//   const getNodeColor = (type) => {
//     const colors = {
//       manufacturer: "bg-blue-500 border-blue-600",
//       distributor: "bg-green-500 border-green-600", 
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
//       distributor: "🚚", 
//       pharmacy: "💊",
//       regulator: "🏛️",
//       customer: "👤",
//       auditor: "🔍"
//     };
//     return icons[type] || "⚫";
//   };

//   return (
//     <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-6">
//       <div className="flex justify-between items-center mb-4">
//         <h3 className="text-xl font-bold text-gray-800">Live Blockchain Network</h3>
//         <button 
//           onClick={() => setIsAnimating(!isAnimating)}
//           className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
//             isAnimating ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
//           }`}
//         >
//           {isAnimating ? '🟢 Live' : '⏸️ Paused'}
//         </button>
//       </div>
      
//       <div className="relative h-96 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200 p-4 overflow-hidden">
//         {/* PERMANENT CONNECTION LINES */}
//         <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
//           <defs>
//             <marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
//               <polygon points="0 0, 10 3.5, 0 7" className="fill-gray-400" />
//             </marker>
//             <marker id="arrow-blue" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
//               <polygon points="0 0, 10 3.5, 0 7" className="fill-blue-500" />
//             </marker>
//             <marker id="arrow-red" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
//               <polygon points="0 0, 10 3.5, 0 7" className="fill-red-500" />
//             </marker>
//             <marker id="arrow-green" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
//               <polygon points="0 0, 10 3.5, 0 7" className="fill-green-500" />
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
//             const startX = fromNode.x + (dx / length) * 3;
//             const startY = fromNode.y + (dy / length) * 3;
//             const endX = toNode.x - (dx / length) * 3;
//             const endY = toNode.y - (dy / length) * 3;
            
//             // Determine line color
//             let lineColor = "#94A3B8";
//             let markerId = "arrow";
            
//             if (rel.from === 4) { // Regulator
//               lineColor = "#EF4444";
//               markerId = "arrow-red";
//             } else if (rel.from === 6) { // Auditor
//               lineColor = "#0D9488";
//               markerId = "arrow-green";
//             } else if (rel.label === "Supply") {
//               lineColor = "#3B82F6";
//               markerId = "arrow-blue";
//             } else if (rel.label === "Distribute") {
//               lineColor = "#10B981";
//               markerId = "arrow-green";
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
//                   strokeWidth="2"
//                   strokeDasharray="5,3"
//                   markerEnd={`url(#${markerId})`}
//                   opacity="0.7"
//                 />
                
//                 {/* Relationship label */}
//                 <text
//                   x={`${(startX + endX) / 2}%`}
//                   y={`${(startY + endY) / 2 - 2}%`}
//                   textAnchor="middle"
//                   dominantBaseline="middle"
//                   fontSize="10"
//                   fontWeight="600"
//                   fill={lineColor}
//                   style={{ textShadow: '0 0 3px white, 0 0 3px white' }}
//                 >
//                   {rel.label}
//                 </text>
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
//                 className="absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 shadow-lg"
//               >
//                 <div className="absolute inset-0.5 bg-white rounded-full"></div>
//               </div>
//             </div>
//           );
//         })}

//         {/* NODES */}
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
//             <div className={`w-16 h-16 rounded-full ${getNodeColor(node.type)} border-4 flex flex-col items-center justify-center text-white shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl group cursor-pointer`}>
//               <div className="text-2xl mb-0.5 group-hover:scale-125 transition-transform">
//                 {getNodeIcon(node.type)}
//               </div>
//               <div className="text-xs font-bold text-center px-1 leading-tight">
//                 {node.name}
//               </div>
//             </div>
            
//             {/* Connection indicator */}
//             <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white bg-green-400 animate-pulse shadow-md"></div>
//           </div>
//         ))}

//         {/* Blockchain blocks animation */}
//         <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-1">
//           {[1, 2, 3, 4, 5, 6].map((block) => (
//             <div
//               key={block}
//               className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded border-2 border-white shadow-lg flex items-center justify-center"
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
//         <div className="absolute top-4 right-4 bg-gradient-to-r from-green-50 to-blue-50 px-3 py-2 rounded-lg border border-green-200 shadow-sm">
//           <div className="flex items-center space-x-2">
//             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
//             <span className="text-green-700 text-sm font-semibold">Live Network</span>
//           </div>
//           <div className="text-xs text-gray-600 mt-0.5">6 Nodes Connected</div>
//         </div>
//       </div>

//       {/* Network Activity */}
//       <div className="mt-4 p-3 bg-gray-50 rounded-lg">
//         <div className="flex justify-between items-center text-sm">
//           <span className="text-gray-600">Network Activity</span>
//           <span className="text-green-600 font-semibold">High</span>
//         </div>
//         <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
//           <div 
//             className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-1000"
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
//           50% { transform: translateY(-5px); }
//         }
//       `}</style>
//     </div>
//   );
// }

// export default BlockchainVisualization;
