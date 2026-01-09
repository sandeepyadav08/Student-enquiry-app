import * as SecureStore from "expo-secure-store";

const BASE_URL = "http://192.168.0.126:8080/api/student-enquiry";

class ApiService {
  constructor() {
    this.baseURL = BASE_URL;
  }

  async getToken() {
    try {
      return await SecureStore.getItemAsync("authToken");
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  }

  async setToken(token) {
    try {
      await SecureStore.setItemAsync("authToken", token);
      console.log("Token stored:", token);
    } catch (error) {
      console.error("Error setting token:", error);
    }
  }

  async removeToken() {
    try {
      await SecureStore.deleteItemAsync("authToken");
      console.log("Token removed");
    } catch (error) {
      console.error("Error removing token:", error);
    }
  }

  cleanJsonString(text) {
    if (!text) return "";
    return text
      .replace(/^\uFEFF/, "") // Remove BOM
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .trim();
  }

  async makeRequest(endpoint, options = {}) {
    const token = await this.getToken();

    const headers = {
      Accept: "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    let body = options.body;
    if (body instanceof URLSearchParams) {
      body = body.toString();
      if (!headers["Content-Type"]) {
        headers["Content-Type"] = "application/x-www-form-urlencoded";
      }
    } else if (
      body &&
      !(body instanceof FormData) &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
      if (!headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
      }
    }

    const config = {
      ...options,
      headers,
      body,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const text = await response.text();
      const cleanText = this.cleanJsonString(text);

      let data;
      try {
        data = JSON.parse(cleanText);
      } catch (e) {
        console.error(
          "JSON Parse Error in makeRequest:",
          e,
          "Clean Text:",
          cleanText
        );
        data = {
          message: `Server returned invalid JSON: ${cleanText.substring(
            0,
            100
          )}...`,
        };
      }

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  // Auth APIs
  async login(email, password) {
    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("app", "true");

      const response = await fetch(
        "http://192.168.0.126:8080/api/student-enquiry/login",
        {
          method: "POST",
          body: formData,
        }
      );

      const text = await response.text();
      const cleanText = this.cleanJsonString(text);

      let data;
      try {
        data = JSON.parse(cleanText);
      } catch (e) {
        console.error(
          "JSON Parse Error in login:",
          e,
          "Clean Text:",
          cleanText
        );
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }

      if (!response.ok) {
        // Handle API specific errors
        if (data && data.errors) {
          // Check for password error or general error
          const errorMessage =
            data.errors.password ||
            data.errors.email ||
            data.message ||
            "Invalid credentials";
          throw new Error(errorMessage);
        }
        throw new Error(
          data.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return data;
    } catch (error) {
      console.log("Login API error:", error);
      throw error;
    }
  }

  async getProfile() {
    return this.makeRequest("/profile/true");
  }

  async getDashboardStats() {
    return this.makeRequest("/dashboard/true");
  }

  // Enquiry APIs
  async createEnquiry(enquiryData) {
    const formData = new FormData();
    Object.keys(enquiryData).forEach((key) => {
      formData.append(
        key,
        enquiryData[key] !== null && enquiryData[key] !== undefined
          ? enquiryData[key]
          : ""
      );
    });
    formData.append("app", "true");

    return this.makeRequest("/enquiry/true", {
      method: "POST",
      body: formData,
    });
  }

  async getEnquiries() {
    return this.makeRequest("/enquiry-list/true");
  }

  async getEnquiryRegistrationData(id) {
    return this.makeRequest(`/enquiry-registrations/true/${id}`);
  }

  async getEnquiryDetails(id) {
    return this.makeRequest(`/enquiry/${id}`);
  }

  async updateEnquiry(id, enquiryData) {
    const params = new URLSearchParams();
    Object.keys(enquiryData).forEach((key) => {
      params.append(
        key,
        enquiryData[key] !== null && enquiryData[key] !== undefined
          ? enquiryData[key]
          : ""
      );
    });
    // The backend might need the ID in the body as well
    params.append("id", id);
    params.append("app", "true");

    return this.makeRequest(`/enquiry/${id}`, {
      method: "PUT",
      body: params,
    });
  }
  async getCourses() {
    return this.makeRequest("/course-list");
  }

  async getFranchisees() {
    return this.makeRequest("/franchisee-list");
  }

  // Registration APIs
  async createRegistration(registrationData) {
    const formData = new FormData();
    Object.keys(registrationData).forEach((key) => {
      formData.append(
        key,
        registrationData[key] !== null && registrationData[key] !== undefined
          ? registrationData[key]
          : ""
      );
    });
    formData.append("app", "true");

    return this.makeRequest("/registrations/true", {
      method: "POST",
      body: formData,
    });
  }

  async getRegistrations() {
    return this.makeRequest("/registrations-list/true");
  }

  async getRegistrationNumber() {
    return this.makeRequest("/registrations/number/true");
  }

  async getRegistrationDetails(id) {
    return this.makeRequest(`/registrations/${id}?app=true`);
  }

  async updateRegistration(id, registrationData) {
    const params = new URLSearchParams();
    Object.keys(registrationData).forEach((key) => {
      params.append(
        key,
        registrationData[key] !== null && registrationData[key] !== undefined
          ? registrationData[key]
          : ""
      );
    });
    params.append("id", id);
    params.append("app", "true");

    return this.makeRequest(`/registration/${id}`, {
      method: "PUT",
      body: params,
    });
  }

  // Fees APIs
  async createFeesEntry(feesData) {
    const params = new URLSearchParams();
    params.append('app', 'true');
    params.append('registration_no', feesData.registrationNo || '');
    params.append('fee_date', feesData.date instanceof Date ? feesData.date.toISOString().split('T')[0] : feesData.date || '');
    params.append('paid_fees', feesData.paidFees || '');
    params.append('paid_through', feesData.paidThrough || '');
    params.append('received_by', feesData.receivedBy || '');

    return this.makeRequest('/fee-payments', {
      method: 'PUT',
      body: params,
    });
  }

  async getFeeRegistrationNumbers() {
    return this.makeRequest("/fee-registrations-number/true");
  }

  async getPaymentHistory() {
    return this.makeRequest("/fee-payments/true");
  }

  async forgotPassword(email) {
    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("app", "true");

      const response = await fetch(`${this.baseURL}/forget-password`, {
        method: "POST",
        body: formData,
      });

      const text = await response.text();
      const cleanText = this.cleanJsonString(text);

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
          const errorMessage =
            data.errors.email || data.message || "Failed to send OTP";
          throw new Error(errorMessage);
        }
        throw new Error(
          data && data.message
            ? data.message
            : `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return data;
    } catch (error) {
      console.log("Forgot Password API error:", error);
      throw error;
    }
  }

  async resetPassword(otp, password) {
    try {
      const formData = new FormData();
      formData.append("otp", otp);
      formData.append("password", password);
      formData.append("app", "true");

      const response = await fetch(`${this.baseURL}/reset-password`, {
        method: "POST",
        body: formData,
      });

      const text = await response.text();
      const cleanText = this.cleanJsonString(text);

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
          const errorMessage =
            data.errors.otp || data.message || "Failed to reset password";
          throw new Error(errorMessage);
        }
        throw new Error(
          data && data.message
            ? data.message
            : `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return data;
    } catch (error) {
      console.log("Reset Password API error:", error);
      throw error;
    }
  }

  async logout() {
    try {
      const token = await this.getToken();
      const response = await fetch(`${this.baseURL}/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const text = await response.text();
      const cleanText = this.cleanJsonString(text);

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
