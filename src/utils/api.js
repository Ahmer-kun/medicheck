class ApiClient {
  constructor() {
    this.baseURL = "http://localhost:5000/api";
  }

  async request(url, options = {}) {
    const token = localStorage.getItem("token");
    
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`🔄 API Request: ${this.baseURL}${url}`);
      const response = await fetch(`${this.baseURL}${url}`, config);
      
      // Handle rate limiting (429)
      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please wait a moment and try again.");
      }

      // Handle connection errors
      if (!response.ok) {
        if (response.status === 0) {
          throw new Error("Cannot connect to server. Please make sure the backend is running.");
        }
        
        // Try to parse error as JSON, fallback to text
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        } catch (jsonError) {
          const errorText = await response.text();
          throw new Error(errorText || `HTTP error! status: ${response.status}`);
        }
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // If it's a 204 No Content or empty response, return success
        if (response.status === 204 || response.headers.get('content-length') === '0') {
          return { success: true, message: 'Operation completed successfully' };
        }
        throw new Error('Server returned non-JSON response');
      }

      return await response.json();
    } catch (error) {
      console.error("❌ API request failed:", error);
      
      // Provide more helpful error messages
      if (error.message.includes("Failed to fetch") || error.message.includes("connection refused")) {
        throw new Error("Cannot connect to backend server. Please make sure the server is running on http://localhost:5000");
      }
      
      if (error.message.includes("Rate limit")) {
        throw new Error("Too many requests. Please wait a moment and try again.");
      }
      
      throw error;
    }
  }

  // HTTP method shortcuts
  async get(url) {
    return this.request(url);
  }

  async post(url, data) {
    return this.request(url, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put(url, data) {
    return this.request(url, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete(url) {
    return this.request(url, {
      method: "DELETE",
    });
  }
}

export const api = new ApiClient();


//      ADMIN ERROR

// src/utils/api.js
// src/utils/api.js

// class ApiClient {
//   constructor() {
//     this.baseURL = "http://localhost:5000/api";
//   }

//   async request(url, options = {}) {
//     const token = localStorage.getItem("token");
    
//     const config = {
//       headers: {
//         "Content-Type": "application/json",
//         ...(token && { Authorization: `Bearer ${token}` }),
//         ...options.headers,
//       },
//       ...options,
//     };

//     try {
//       const response = await fetch(`${this.baseURL}${url}`, config);
      
//       // Handle non-JSON responses
//       const contentType = response.headers.get('content-type');
//       if (!contentType || !contentType.includes('application/json')) {
//         throw new Error('Server returned non-JSON response');
//       }
      
//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || `HTTP error! status: ${response.status}`);
//       }

//       return data;
//     } catch (error) {
//       console.error("API request failed:", error);
      
//       if (error.message.includes('Failed to fetch')) {
//         throw new Error('Cannot connect to server. Please check your connection and ensure the backend is running.');
//       }
      
//       throw error;
//     }
//   }

//   // ... rest of methods remain the same


//   // HTTP method shortcuts
//   async get(url) {
//     return this.request(url);
//   }

//   async post(url, data) {
//     return this.request(url, {
//       method: "POST",
//       body: JSON.stringify(data),
//     });
//   }

//   async put(url, data) {
//     return this.request(url, {
//       method: "PUT",
//       body: JSON.stringify(data),
//     });
//   }

//   async delete(url) {
//     return this.request(url, {
//       method: "DELETE",
//     });
//   }
// }

// export const api = new ApiClient();


