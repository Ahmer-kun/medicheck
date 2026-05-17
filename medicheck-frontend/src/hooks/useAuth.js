import { useState, useEffect } from "react";

function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [backendAvailable, setBackendAvailable] = useState(null); // null = checking, true/false = result

  // Check if backend is available on mount
  useEffect(() => {
    checkBackend();
  }, []);

  const checkBackend = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/health`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      setBackendAvailable(response.ok);
    } catch (error) {
      setBackendAvailable(false);
    }
  };

  const login = async (username, password, role) => {
    setLoading(true);

    try {
      // If backend check is still running, wait briefly then recheck
      if (backendAvailable === null) {
        await checkBackend();
      }

      // Backend is down — tell user clearly, no fallback
      if (!backendAvailable) {
        throw new Error(
          "Service temporarily unavailable. The backend is not reachable. Please try again later."
        );
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      // Guard against HTML error pages
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        throw new Error("Unexpected response from server. Please try again.");
      }

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Invalid response from server. Please try again.");
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Invalid credentials. Please check your username and password.");
      }

      // Store token and user data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);

      return data.user;

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

  // Restore session on app load
  // Rejects mock tokens left over from old fallback system
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      // Clear any mock tokens from the old fallback system
      if (token.startsWith("mock-token-")) {
        console.warn("Clearing old mock token — real login required.");
        logout();
        return;
      }

      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Error restoring session:", error);
        logout();
      }
    }
  }, []);

  return {
    user,
    loading,
    selectedRole,
    backendAvailable,
    login,
    logout,
    selectRole,
    isAuthenticated: !!user
  };
}

export default useAuth;