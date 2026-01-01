import { useState, useEffect } from "react";
import { USERS } from "../data/constants";

function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const login = async (username, password, role) => {
    setLoading(true);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
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


//  Better Error Handling For Future Use 
// import { useState, useEffect } from "react";
// import { USERS } from "../data/constants";

// function useAuth() {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [selectedRole, setSelectedRole] = useState(null);
//   const [backendAvailable, setBackendAvailable] = useState(false);

//   // Check if backend is available on mount
//   useEffect(() => {
//     checkBackend();
//   }, []);

//   const checkBackend = async () => {
//     try {
//       const response = await fetch(`${process.env.REACT_APP_API_URL}/health`, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });
      
//       if (response.ok) {
//         setBackendAvailable(true);
//         console.log("✅ Backend is available");
//       } else {
//         setBackendAvailable(false);
//         console.log("⚠️ Backend not available, using fallback");
//       }
//     } catch (error) {
//       setBackendAvailable(false);
//       console.log("⚠️ Backend not available, using fallback");
//     }
//   };

//   const login = async (username, password, role) => {
//     setLoading(true);
    
//     try {
//       // First try to use backend if available
//       if (backendAvailable) {
//         console.log("Trying backend login...");
//         const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ username, password }),
//         });

//         // Check if response is HTML (error page)
//         const contentType = response.headers.get("content-type");
//         if (contentType && contentType.includes("text/html")) {
//           throw new Error("Backend returned HTML instead of JSON");
//         }

//         // Try to parse as JSON
//         const text = await response.text();
//         let data;
        
//         try {
//           data = JSON.parse(text);
//         } catch (parseError) {
//           console.error("Failed to parse JSON:", text.substring(0, 100));
//           throw new Error("Invalid response from server");
//         }

//         if (!response.ok || !data.success) {
//           throw new Error(data.message || "Login failed");
//         }

//         // Store token and user data
//         localStorage.setItem("token", data.token);
//         localStorage.setItem("user", JSON.stringify(data.user));
//         setUser(data.user);

//         return data.user;
//       }
      
//       // Fallback: Use hardcoded users
//       throw new Error("Backend not available, using fallback");
      
//     } catch (error) {
//       console.log("Backend login failed, using fallback:", error.message);
      
//       // FALLBACK: Use hardcoded users
//       const user = Object.values(USERS).find(
//         u => u.username === username && u.password === password && u.role === role
//       );
      
//       if (user) {
//         // Create mock token and user data
//         const mockToken = `mock-token-${Date.now()}`;
//         const userData = { 
//           ...user, 
//           token: mockToken,
//           id: `user-${Date.now()}`,
//           email: `${username}@example.com`
//         };
        
//         localStorage.setItem("token", mockToken);
//         localStorage.setItem("user", JSON.stringify(userData));
//         setUser(userData);
        
//         console.log("✅ Fallback login successful for:", user.username);
//         return userData;
//       } else {
//         throw new Error("Invalid credentials. Please check username/password.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const logout = () => {
//     setUser(null);
//     setSelectedRole(null);
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//   };

//   const selectRole = (role) => {
//     setSelectedRole(role);
//   };

//   // Check for existing session on app load
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     const savedUser = localStorage.getItem("user");
    
//     if (token && savedUser) {
//       try {
//         setUser(JSON.parse(savedUser));
//       } catch (error) {
//         console.error("Error parsing saved user:", error);
//         logout();
//       }
//     }
//   }, []);

//   return {
//     user,
//     loading,
//     selectedRole,
//     backendAvailable,
//     login,
//     logout,
//     selectRole,
//     isAuthenticated: !!user
//   };
// }

// export default useAuth;
