import { useState, useEffect } from "react";
import { USERS } from "../data/constants";

function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const login = async (username, password, role) => {
    setLoading(true);
    
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Login failed");
      }

      // Store token and user data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);

      return data.user;
    } catch (error) {
      console.error("Login error:", error);
      throw new Error(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setSelectedRole(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const selectRole = (role) => {
    setSelectedRole(role);
  };

  // Check for existing session on app load
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Error parsing saved user:", error);
        logout();
      }
    }
  }, []);

  return {
    user,
    loading,
    selectedRole,
    login,
    logout,
    selectRole,
    isAuthenticated: !!user
  };
}

export default useAuth;