import React from "react";

function Topbar({ onToggle, metamask, user, theme }) {
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className={`flex items-center justify-between p-6 bg-white 
      text-gray-800 shadow-sm border-b border-gray-200`}>
      <div className="flex items-center gap-4">
        <button
          onClick={onToggle}
          className="p-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all transform 
            hover:scale-105 shadow-lg border border-blue-500"
        >
          ☰
        </button>
        <h2 className="text-xl font-bold text-gray-800">
          Medicheck Portal - {user?.name}
        </h2>
      </div>
      
      <div className="flex items-center gap-4">
        {!metamask.isMetaMaskInstalled() ? (
          <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-lg 
            border border-red-200">
            <span className="text-sm text-red-700">Install MetaMask</span>
          </div>
        ) : metamask.isConnected ? (
          <div className="flex items-center gap-3">
            <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-200 
              flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-700">{formatAddress(metamask.account)}</span>
            </div>
            <button
              onClick={metamask.disconnect}
              className="bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg 
                text-red-700 text-sm font-semibold transition-all border border-red-200 
                hover:shadow-lg"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={metamask.connect}
            className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-lg text-white font-semibold transition-all 
              transform hover:scale-105 shadow-lg border border-blue-400 
              flex items-center gap-2"
          >
            <span>🦊</span>
            <span>Connect MetaMask</span>
          </button>
        )}

        {user && (
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full 
              flex items-center justify-center text-blue-600 font-bold shadow-lg border 
              border-blue-200">
              {user.name.charAt(0)}
            </div>
            <div className="text-right">
              <div className="text-gray-800 font-medium">{user.name}</div>
              <div className="text-gray-600 text-sm capitalize">{user.role}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Topbar;