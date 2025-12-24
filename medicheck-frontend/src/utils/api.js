// src/utils/api.js - FIXED VERSION

class ApiClient {
  constructor() {
    // this.baseURL = "http://localhost:5000/api";
    this.baseURL = process.env.REACT_APP_API_URL || "https://medicheck-production.up.railway.app/api";
    this.refreshInProgress = false;
    this.refreshQueue = [];
  }

  // Add a method to clean URLs
  cleanUrl(url) {
    // Remove port numbers that might be appended (like :1, :2, etc.)
    url = url.replace(/:(\d+)$/, '');
    
    // Ensure it doesn't start with a colon
    if (url.startsWith(':')) {
      url = url.substring(1);
    }
    
    return url;
  }

  async refreshToken() {
    // ... (keep existing refreshToken code) ...
    if (this.refreshInProgress) {
      return new Promise((resolve, reject) => {
        this.refreshQueue.push({ resolve, reject });
      });
    }

    this.refreshInProgress = true;
    
    try {
      console.log("🔄 Token expired, attempting to refresh...");
      
      const refreshToken = localStorage.getItem("refreshToken");
      
      if (refreshToken) {
        const response = await fetch(`${this.baseURL}/auth/refresh-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${refreshToken}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.token) {
            localStorage.setItem("token", data.token);
            if (data.refreshToken) {
              localStorage.setItem("refreshToken", data.refreshToken);
            }
            if (data.user) {
              localStorage.setItem("user", JSON.stringify(data.user));
            }
            
            console.log("✅ Token refreshed successfully");
            
            this.refreshQueue.forEach(item => item.resolve(data.token));
            this.refreshQueue = [];
            
            return data.token;
          }
        }
      }
      
      console.log("⚠️ Token refresh failed, redirecting to login...");
      
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      
      if (window.location.pathname !== '/' && !window.location.pathname.includes('/login')) {
        window.location.href = '/';
      }
      
      throw new Error("Session expired. Please login again.");
      
    } catch (error) {
      console.error("❌ Token refresh failed:", error);
      
      this.refreshQueue.forEach(item => item.reject(error));
      this.refreshQueue = [];
      
      throw error;
    } finally {
      this.refreshInProgress = false;
    }
  }

  async request(url, options = {}, retryCount = 0) {
  const maxRetries = 1;
  
  try {
    // Clean the URL first
    url = this.cleanUrl(url);
    
    let token = localStorage.getItem("token");
    
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    // Ensure body is stringified
    if (options.body && typeof options.body !== 'string') {
      config.body = JSON.stringify(options.body);
    }

    // Log only non-batch-check requests
    const isBatchCheck = config.method === 'GET' && 
                        url.includes('/batches/') && 
                        !url.includes('/batches/verify/');
    
    if (!isBatchCheck) {
      console.log(`🔄 API Request: ${this.baseURL}${url}`, {
        method: config.method || 'GET',
        hasToken: !!token,
        retryCount
      });
    }

    const response = await fetch(`${this.baseURL}${url}`, config);
    
    // Handle 429 rate limiting
    if (response.status === 429) {
      throw new Error("Rate limit exceeded. Please wait a moment and try again.");
    }

    // Handle 401 - token expired
    if (response.status === 401) {
      if (url.includes('/auth/')) {
        throw new Error("Invalid credentials. Please check your username and password.");
      }
      
      if (retryCount < maxRetries) {
        console.log("🔄 Token expired, attempting refresh...");
        await this.refreshToken();
        return this.request(url, options, retryCount + 1);
      }
      
      throw new Error("Session expired. Please login again.");
    }

    // ✅ FIX: Handle 404 for batch existence checks
    if (response.status === 404) {
      // If it's a batch existence check, return null (batch doesn't exist)
      if (config.method === 'GET' && url.includes('/batches/') && !url.includes('/batches/verify/')) {
        console.log(`ℹ️ Batch not found (expected): ${url} - returning null`);
        return null;
      }
      
      // For other 404s, return the error
      const errorText = await response.text();
      throw new Error(errorText || `Resource not found: ${url}`);
    }

    // Handle other errors
    if (!response.ok) {
      if (response.status === 0) {
        throw new Error("Cannot connect to server. Please make sure the backend is running.");
      }
      
      if (response.status === 403) {
        throw new Error("Access forbidden. You don't have permission to access this resource.");
      }
      
      if (response.status === 500) {
        throw new Error("Server error. Please try again later.");
      }
      
      let errorData;
      try {
        errorData = await response.json();
      } catch (jsonError) {
        const errorText = await response.text();
        errorData = { 
          message: errorText || `HTTP error! status: ${response.status}` 
        };
      }
      
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return { success: true, message: 'Operation completed successfully' };
      }
      throw new Error('Server returned non-JSON response');
    }

    // Parse and return JSON
    const data = await response.json();
    return data;

  } catch (error) {
    // Don't log errors for expected "not found" during batch checks
    const isBatchNotFound = error.message.includes('not found') && 
                           url.includes('/batches/') && 
                           options.method === 'GET';
    
    if (!isBatchNotFound) {
      console.error("❌ API request failed:", {
        url: `${this.baseURL}${url}`,
        error: error.message,
        retryCount
      });
    }
    
    // Provide user-friendly error messages
    if (error.message.includes("Failed to fetch") || 
        error.message.includes("connection refused") ||
        error.message.includes("NetworkError")) {
      throw new Error("Cannot connect to backend server. Please make sure the server is running on http://localhost:5000");
    }
    
    if (error.message.includes("Session expired")) {
      throw error;
    }

    if (error.message.includes("Rate limit")) {
      throw new Error("Too many requests. Please wait a moment and try again.");
    }

    if (error.message.includes("forbidden")) {
      throw new Error("Access denied. You don't have permission to access this resource.");
    }
    
    throw error;
  }
}

  // HTTP method shortcuts
  async get(url, options = {}) {
    return this.request(url, { ...options, method: "GET" });
  }

  async post(url, data, options = {}) {
    return this.request(url, { 
      ...options, 
      method: "POST",
      body: data 
    });
  }

  async put(url, data, options = {}) {
    return this.request(url, { 
      ...options, 
      method: "PUT",
      body: data 
    });
  }

  async patch(url, data, options = {}) {
    return this.request(url, { 
      ...options, 
      method: "PATCH",
      body: data 
    });
  }

  async delete(url, options = {}) {
    try {
      return await this.request(url, { 
        ...options, 
        method: "DELETE" 
      });
    } catch (error) {
      console.error(`❌ DELETE request failed for ${url}:`, error);
      throw error;
    }
  }

  // Other methods remain the same...
  isAuthenticated() {
    const token = localStorage.getItem("token");
    return !!token;
  }

  clearAuth() {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  }

  setAuth(token, refreshToken = null, user = null) {
    localStorage.setItem("token", token);
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }

  getCurrentUser() {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  }

  async testConnection() {
    try {
      const response = await this.get("/health", {}, true);
      return {
        success: true,
        message: "Connected to backend successfully",
        data: response
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error
      };
    }
  }
}

// Create and export singleton instance
export const api = new ApiClient();

// Helper functions
export const handleApiError = (error, showAlert = true) => {
  console.error("API Error:", error);
  
  let userMessage = error.message;
  
  if (error.message.includes("Session expired")) {
    userMessage = "Your session has expired. Please log in again.";
    
    setTimeout(() => {
      localStorage.clear();
      window.location.href = '/';
    }, 2000);
  }
  
  if (error.message.includes("Cannot connect to server")) {
    userMessage = "Cannot connect to the server. Please check if the backend is running.";
  }
  
  if (error.message.includes("Rate limit")) {
    userMessage = "Too many requests. Please wait a moment and try again.";
  }
  
  if (showAlert && userMessage) {
    alert(`❌ ${userMessage}`);
  }
  
  return {
    success: false,
    error: error,
    message: userMessage
  };
};

export const handleApiSuccess = (data, message = "Operation completed successfully") => {
  return {
    success: true,
    data: data,
    message: message
  };
};

export default api;
