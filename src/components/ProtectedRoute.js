import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ user, requiredRole, children }) {
  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center shadow-lg">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;