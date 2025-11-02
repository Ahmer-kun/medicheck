import React from "react";

function BackgroundFix({ theme, children }) {
  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.background} transition-all duration-500 text-gray-800`}>
      {children}
    </div>
  );
}

export default BackgroundFix;