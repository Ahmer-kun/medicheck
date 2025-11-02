import { useState, useEffect } from "react";
import { USERS } from "../data/constants";

function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const login = (username, password, role) => {
    setLoading(true);
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const userData = USERS[role];
        if (userData && userData.username === username && userData.password === password) {
          setUser(userData);
          localStorage.setItem('medicheck_user', JSON.stringify(userData));
          resolve(userData);
        } else {
          reject(new Error('Invalid credentials for selected role'));
        }
        setLoading(false);
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    setSelectedRole(null);
    localStorage.removeItem('medicheck_user');
  };

  const selectRole = (role) => {
    setSelectedRole(role);
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('medicheck_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
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