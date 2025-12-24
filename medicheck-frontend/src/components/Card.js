import React from "react";

function Card({ title, value, gradient, icon, compact = false }) {
  return (
    <div className={`p-4 md:p-6 rounded-xl md:rounded-2xl bg-white transform hover:scale-105 
      transition-all duration-300 hover:shadow-xl border border-gray-200 relative overflow-hidden group`}>
      
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50 to-transparent 
        -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] 
        transition-transform duration-1000"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs md:text-sm font-light opacity-90 text-gray-600">{title}</div>
            <div className={`${compact ? 'text-xl md:text-2xl' : 'text-2xl md:text-3xl'} font-bold mt-1 md:mt-2 text-gray-800`}>
              {value}
            </div>
          </div>
          <div className={`${compact ? 'text-xl' : 'text-2xl md:text-3xl'} opacity-80 text-gray-600`}>{icon}</div>
        </div>
      </div>
    </div>
  );
}

export default Card;
// import React from "react";

// function Card({ title, value, gradient, icon }) {
//   return (
//     <div className={`p-6 rounded-2xl bg-white transform hover:scale-105 
//       transition-all duration-300 hover:shadow-xl border border-gray-200 relative overflow-hidden group`}>
      
//       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50 to-transparent 
//         -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] 
//         transition-transform duration-1000"></div>
      
//       <div className="relative z-10">
//         <div className="flex justify-between items-start">
//           <div>
//             <div className="text-sm font-light opacity-90 text-gray-600">{title}</div>
//             <div className="text-3xl font-bold mt-2 text-gray-800">{value}</div>
//           </div>
//           <div className="text-2xl opacity-80 text-gray-600">{icon}</div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Card;