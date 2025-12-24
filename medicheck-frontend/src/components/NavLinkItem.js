import React from "react";
import { Link } from "react-router-dom";
import { navigationItems } from "../data/constants";

function NavLinkItem({ to, label, collapsed, icon, user }) {
  const canAccess = user ? navigationItems.find(item => item.to === to)?.roles.includes(user.role) : true;
  
  if (!canAccess) return null;

  return (
    <Link
      to={to}
      className="flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-xl transition-all duration-300 
        group relative overflow-hidden hover:bg-blue-50 border border-transparent 
        hover:border-blue-200 text-gray-700"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 
        opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl 
        flex items-center justify-center text-blue-600 font-semibold shadow-lg 
        group-hover:from-blue-500 group-hover:to-blue-600 group-hover:text-white 
        transition-all duration-300 z-10 border border-blue-200 flex-shrink-0">
        {icon}
      </div>
      {!collapsed && (
        <span className="text-xs md:text-sm font-medium text-gray-700 group-hover:text-blue-600 z-10 truncate">
          {label}
        </span>
      )}
    </Link>
  );
}

export default NavLinkItem;

// import React from "react";
// import { Link } from "react-router-dom";
// import { navigationItems } from "../data/constants";

// function NavLinkItem({ to, label, collapsed, icon, user }) {
//   const canAccess = user ? navigationItems.find(item => item.to === to)?.roles.includes(user.role) : true;
  
//   if (!canAccess) return null;

//   return (
//     <Link
//       to={to}
//       className="flex items-center gap-3 p-3 rounded-xl transition-all duration-300 
//         group relative overflow-hidden hover:bg-blue-50 border border-transparent 
//         hover:border-blue-200 text-gray-700"
//     >
//       <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 
//         opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
//       <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl 
//         flex items-center justify-center text-blue-600 font-semibold shadow-lg 
//         group-hover:from-blue-500 group-hover:to-blue-600 group-hover:text-white 
//         transition-all duration-300 z-10 border border-blue-200">
//         {icon}
//       </div>
//       {!collapsed && (
//         <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 z-10">
//           {label}
//         </span>
//       )}
//     </Link>
//   );
// }

// export default NavLinkItem;