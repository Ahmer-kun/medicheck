import React, { useState, useEffect } from "react";

function BlockchainVisualization() {
  const [connections, setConnections] = useState([]);
  const [isAnimating, setIsAnimating] = useState(true);

  const blockchainNodes = [
    { id: 1, name: "Manufacturer", type: "manufacturer", position: "left-20 top-1/4", connected: true },
    { id: 2, name: "Distributor", type: "distributor", position: "left-1/3 top-1/2", connected: true },
    { id: 3, name: "Pharmacy", type: "pharmacy", position: "right-1/3 top-1/2", connected: true },
    { id: 4, name: "Regulator", type: "regulator", position: "left-1/2 top-1/6", connected: true },
    { id: 5, name: "Customer", type: "customer", position: "right-20 top-3/4", connected: true },
    { id: 6, name: "Auditor", type: "auditor", position: "right-1/2 top-5/6", connected: true }
  ];

  useEffect(() => {
    // Dynamic connection animation
    const interval = setInterval(() => {
      setConnections(prev => [
        ...prev.slice(-10), // Keep only last 10 connections
        {
          id: Date.now(),
          from: Math.floor(Math.random() * 6) + 1,
          to: Math.floor(Math.random() * 6) + 1,
          duration: Math.random() * 2000 + 1000
        }
      ]);
    }, 800);

    return () => clearInterval(interval);
  }, []);

  const getNodeColor = (type, connected) => {
    const baseColors = {
      manufacturer: "bg-blue-500 border-blue-600",
      distributor: "bg-green-500 border-green-600", 
      pharmacy: "bg-purple-500 border-purple-600",
      regulator: "bg-red-500 border-red-600",
      customer: "bg-orange-500 border-orange-600",
      auditor: "bg-teal-500 border-teal-600"
    };
    
    const disconnectedColors = {
      manufacturer: "bg-blue-300 border-blue-400",
      distributor: "bg-green-300 border-green-400",
      pharmacy: "bg-purple-300 border-purple-400",
      regulator: "bg-red-300 border-red-400", 
      customer: "bg-orange-300 border-orange-400",
      auditor: "bg-teal-300 border-teal-400"
    };

    return connected ? baseColors[type] : disconnectedColors[type];
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

  const getConnectionPath = (fromId, toId) => {
    const fromNode = blockchainNodes.find(n => n.id === fromId);
    const toNode = blockchainNodes.find(n => n.id === toId);
    
    if (!fromNode || !toNode) return null;

    const positions = {
      "left-20 top-1/4": { x: 20, y: 25 },
      "left-1/3 top-1/2": { x: 33, y: 50 },
      "right-1/3 top-1/2": { x: 67, y: 50 },
      "left-1/2 top-1/6": { x: 50, y: 17 },
      "right-20 top-3/4": { x: 80, y: 75 },
      "right-1/2 top-5/6": { x: 50, y: 83 }
    };

    const fromPos = positions[fromNode.position];
    const toPos = positions[toNode.position];

    return { from: fromPos, to: toPos };
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">Live Blockchain Network</h3>
        <button 
          onClick={() => setIsAnimating(!isAnimating)}
          className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
            isAnimating ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
          }`}
        >
          {isAnimating ? '🟢 Live' : '⏸️ Paused'}
        </button>
      </div>
      
      <div className="relative h-80 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200 p-4 overflow-hidden">
        {/* Central Blockchain */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 via-purple-400 to-blue-400 transform -translate-x-1/2 animate-pulse"></div>
        
        {/* Dynamic Connections */}
        {isAnimating && connections.map((conn) => {
          const path = getConnectionPath(conn.from, conn.to);
          if (!path) return null;

          return (
            <div
              key={conn.id}
              className="absolute pointer-events-none"
              style={{
                left: `${path.from.x}%`,
                top: `${path.from.y}%`,
                width: `${Math.abs(path.to.x - path.from.x)}%`,
                height: `${Math.abs(path.to.y - path.from.y)}%`,
                background: `linear-gradient(45deg, transparent, #3B82F6, transparent)`,
                opacity: 0,
                animation: `pulseConnection ${conn.duration}ms ease-in-out`
              }}
            />
          );
        })}

        {/* Nodes */}
        {blockchainNodes.map((node) => (
          <div
            key={node.id}
            className={`absolute ${node.position} transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${
              node.connected ? 'opacity-100 scale-100' : 'opacity-60 scale-90'
            }`}
          >
            <div className={`w-16 h-16 rounded-full ${getNodeColor(node.type, node.connected)} border-2 flex flex-col items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl group`}>
              <div className="text-xl mb-1 group-hover:scale-125 transition-transform">{getNodeIcon(node.type)}</div>
              <div className="text-xs font-semibold text-center px-1 leading-tight">{node.name}</div>
            </div>
            <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
              node.connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
            }`}></div>
          </div>
        ))}

        {/* Live Data Blocks */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {[1, 2, 3, 4, 5, 6].map((block) => (
            <div
              key={block}
              className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded border border-white shadow-lg flex items-center justify-center"
              style={{
                animation: `bounce 1s infinite`,
                animationDelay: `${block * 0.1}s`,
                animationPlayState: isAnimating ? 'running' : 'paused'
              }}
            >
              <div className="text-white text-xs font-bold">{block}</div>
            </div>
          ))}
        </div>

        {/* Network Stats */}
        <div className="absolute top-4 right-4 bg-gradient-to-r from-green-50 to-blue-50 px-3 py-2 rounded-lg border border-green-200">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-700 text-sm font-semibold">Live Network</span>
          </div>
          <div className="text-xs text-gray-600 mt-1">6 Nodes Connected</div>
        </div>
      </div>

      {/* Network Activity */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Network Activity</span>
          <span className="text-green-600 font-semibold">High</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-1000"
            style={{ width: isAnimating ? '85%' : '0%' }}
          ></div>
        </div>
      </div>

      <style>{`
        @keyframes pulseConnection {
          0% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 0.7; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.5); }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}

export default BlockchainVisualization;