import React from "react";
import NavLinkItem from "./NavLinkItem";
import { navigationItems } from "../data/constants";
import logo from "../pictures/MSG2.jpeg";

function Sidebar({ collapsed, user, onLogout, theme }) {
  return (
    <div className={`h-full bg-gradient-to-br ${theme.sidebar} 
      ${collapsed ? "w-20" : "w-64 md:w-72"} p-4 md:p-6 transition-all duration-500 
      relative overflow-hidden`}>
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex-shrink-0 mb-4 md:mb-6">
          <div className="flex items-center gap-3">
            {/* Logo Image */}
            <div className={`${collapsed ? "w-10 h-10" : "w-14 h-14 md:w-16 md:h-16"} flex-shrink-0`}>
              <img 
                src={logo} 
                alt="Medicheck Logo" 
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            
            {/* Title - Only shows when not collapsed */}
            {!collapsed && (
              <div className="min-w-0">
                <h1 className={`font-bold bg-gradient-to-r from-blue-600 to-blue-700 
                  bg-clip-text text-transparent text-2xl md:text-3xl drop-shadow-lg`}>
                  Medicheck
                </h1>
                <p className="text-gray-600 text-xs md:text-sm mt-0.5 font-light tracking-wide">
                  Blockchain Medicine Tracker
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Navigation Items - Using existing no-scrollbar class */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
          <nav>
            <div className="flex flex-col gap-1.5 md:gap-2 pr-1">
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
            </div>
          </nav>
        </div>

        {/* User Info and Logout */}
        {!collapsed && user && (
          <div className="flex-shrink-0 border-t border-gray-200 pt-3 md:pt-4 mt-3">
            <div className="text-gray-600 text-xs md:text-sm mb-1">Logged in as:</div>
            <div className="text-gray-800 font-semibold text-sm md:text-base truncate">{user.name}</div>
            <div className="text-gray-600 text-xs capitalize mb-2 md:mb-3">{user.role}</div>
            
            <button
              onClick={onLogout}
              className="w-full py-1.5 md:py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-all duration-300 border border-gray-200 text-xs md:text-sm font-medium"
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
