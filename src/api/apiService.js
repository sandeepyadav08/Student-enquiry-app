import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'http://192.168.0.126:8080/api/student-enquiry';

class ApiService {
  constructor() {
    this.baseURL = BASE_URL;
  }

  async getToken() {
    try {
      return await SecureStore.getItemAsync('authToken');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  async setToken(token) {
    try {
      await SecureStore.setItemAsync('authToken', token);
      console.log('Token stored:', token);
    } catch (error) {
      console.error('Error setting token:', error);
    }
  }

  async removeToken() {
    try {
      await SecureStore.deleteItemAsync('authToken');
      console.log('Token removed');
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }

  async makeRequest(endpoint, options = {}) {
    const token = await this.getToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: `Server returned non-JSON response: ${text.substring(0, 100)}...` };
      }
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth APIs
  async login(email, password) {
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      formData.append('app', 'true');

      const response = await fetch('http://192.168.0.126:8080/api/student-enquiry/login', {
        method: 'POST',
        body: formData,
      });
      
      const text = await response.text();
      
      // Remove BOM and decode HTML entities
      const cleanText = text
        .replace(/^\uFEFF/, '') // Remove BOM
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim();
      
      let data;
      try {
        data = JSON.parse(cleanText);
      } catch (e) {
        if (!response.ok) {
           throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        // If it's a success 200 but not valid JSON (unexpected), handle gracefully if needed, 
        // but user says success is JSON.
      }

      if (!response.ok) {
        // Handle API specific errors
        if (data && data.errors) {
            // Check for password error or general error
            const errorMessage = data.errors.password || data.errors.email || data.message || 'Invalid credentials';
            throw new Error(errorMessage);
        }
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return data;
    } catch (error) {
      console.log('Login API error:', error);
      throw error;
    }
  }

  // Enquiry APIs
  async createEnquiry(enquiryData) {
    return this.makeRequest('/enquiry/create', {
      method: 'POST',
      body: JSON.stringify(enquiryData),
    });
  }

  async getEnquiries() {
    return this.makeRequest('/enquiry/list');
  }

  // Registration APIs
  async createRegistration(registrationData) {
    return this.makeRequest('/registration/create', {
      method: 'POST',
      body: JSON.stringify(registrationData),
    });
  }

  // Fees APIs
  async createFeesEntry(feesData) {
    return this.makeRequest('/fees/create', {
      method: 'POST',
      body: JSON.stringify(feesData),
    });
  }

  async forgotPassword(email) {
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('app', 'true');

      const response = await fetch(`${this.baseURL}/forget-password`, {
        method: 'POST',
        body: formData,
      });

      const text = await response.text();
       // Remove BOM and decode HTML entities
      const cleanText = text
        .replace(/^\uFEFF/, '') // Remove BOM
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim();

      let data;
      try {
        data = JSON.parse(cleanText);
      } catch (e) {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
         }
      }

      if (!response.ok) {
         if (data && data.errors) {
            const errorMessage = data.errors.email || data.message || 'Failed to send OTP';
            throw new Error(errorMessage);
        }
        throw new Error(data && data.message ? data.message : `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.log('Forgot Password API error:', error);
      throw error;
    }
  }

  async resetPassword(otp, password) {
    try {
      const formData = new FormData();
      formData.append('otp', otp);
      formData.append('password', password);
      formData.append('app', 'true');

      const response = await fetch(`${this.baseURL}/reset-password`, {
        method: 'POST',
        body: formData,
      });

      const text = await response.text();
      // Remove BOM and decode HTML entities
      const cleanText = text
        .replace(/^\uFEFF/, '') // Remove BOM
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim();

       let data;
      try {
        data = JSON.parse(cleanText);
      } catch (e) {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
         }
      }

      if (!response.ok) {
         if (data && data.errors) {
            const errorMessage = data.errors.otp || data.message || 'Failed to reset password';
            throw new Error(errorMessage);
        }
        throw new Error(data && data.message ? data.message : `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return data;
    } catch (error) {
      console.log('Reset Password API error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      const token = await this.getToken();
      const response = await fetch(`${this.baseURL}/logout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        }
      });
      
      const text = await response.text();
       // Remove BOM and decode HTML entities
      const cleanText = text
        .replace(/^\uFEFF/, '') // Remove BOM
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim();

      let data;
      try {
        data = JSON.parse(cleanText);
      } catch (e) {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
         }
      }
      
      return data;
    } catch (error) {
        console.log("Logout API Error", error);
        throw error;
    }
  }
}

export default new ApiService();