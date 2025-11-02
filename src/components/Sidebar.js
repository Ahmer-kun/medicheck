import React from "react";
import NavLinkItem from "./NavLinkItem";
import { navigationItems } from "../data/constants";

function Sidebar({ collapsed, user, onLogout, theme }) {
  return (
    <div className={`h-full bg-gradient-to-br ${theme.sidebar} 
      ${collapsed ? "w-20" : "w-64"} p-6 transition-all duration-500 
      relative overflow-hidden border-r border-gray-200 shadow-sm`}>
      
      <div className="relative z-10">
        <div className="mb-8">
          <h1 className={`font-bold bg-gradient-to-r from-blue-600 to-blue-700 
            bg-clip-text text-transparent ${collapsed ? "text-2xl text-center" : "text-3xl"} 
            drop-shadow-lg`}>
            {collapsed ? "💊" : "Medicheck"}
          </h1>
          {!collapsed && (
            <p className="text-gray-600 text-sm mt-2 font-light tracking-wide">
              Blockchain Medicine Tracker
            </p>
          )}
        </div>
        
        <nav className="flex flex-col gap-2 mb-8">
          {navigationItems.map((item) => (
            <NavLinkItem 
              key={item.to}
              to={item.to} 
              label={item.label} 
              collapsed={collapsed} 
              icon={item.icon}
              user={user}
            />
          ))}
        </nav>

        {!collapsed && user && (
          <div className="border-t border-gray-200 pt-4">
            <div className="text-gray-600 text-sm mb-2">Logged in as:</div>
            <div className="text-gray-800 font-semibold">{user.name}</div>
            <div className="text-gray-600 text-xs capitalize">{user.role}</div>
            
            <button
              onClick={onLogout}
              className="w-full mt-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl transition-all duration-300 border border-gray-200"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;