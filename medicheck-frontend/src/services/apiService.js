// src/services/apiService.js
import { api, createApiResponse, createApiError } from '../utils/api';

// Base service class
class ApiService {
  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  async getAll(options = {}) {
    return api.get(this.endpoint, options);
  }

  async getById(id, options = {}) {
    return api.get(`${this.endpoint}/${id}`, options);
  }

  async create(data, options = {}) {
    return api.post(this.endpoint, data, options);
  }

  async update(id, data, options = {}) {
    return api.put(`${this.endpoint}/${id}`, data, options);
  }

  async delete(id, options = {}) {
    return api.delete(`${this.endpoint}/${id}`, options);
  }

  async patch(id, data, options = {}) {
    return api.patch(`${this.endpoint}/${id}`, data, options);
  }
}

// Specific service implementations
export class BatchService extends ApiService {
  constructor() {
    super('/batches');
  }

  async verify(batchNo) {
    return api.get(`${this.endpoint}/verify/${batchNo}`);
  }

  async accept(batchNo) {
    return api.put(`${this.endpoint}/accept/${batchNo}`);
  }

  async getByManufacturer(manufacturer) {
    return api.get(`${this.endpoint}?manufacturer=${encodeURIComponent(manufacturer)}`);
  }

  async getExpired() {
    return api.get(`${this.endpoint}?status=expired`);
  }
}

export class PharmacyService extends ApiService {
  constructor() {
    super('/pharmacy');
  }

  async getMedicines(pharmacyId) {
    return api.get(`${this.endpoint}/medicines/${pharmacyId}`);
  }

  async addMedicine(medicineData) {
    return api.post(`${this.endpoint}/medicines`, medicineData);
  }

  async acceptBatch(batchData) {
    return api.post(`${this.endpoint}/accept-batch`, batchData);
  }

  async verifyMedicine(batchNo) {
    return api.get(`${this.endpoint}/verify/${batchNo}`);
  }
}

export class ManufacturerService extends ApiService {
  constructor() {
    super('/manufacturers');
  }

  async getCompanies() {
    return api.get('/manufacturer-companies');
  }

  async createCompany(companyData) {
    return api.post('/manufacturer-companies', companyData);
  }

  async getBatches(manufacturerId) {
    return api.get(`${this.endpoint}/batches?manufacturer=${manufacturerId}`);
  }
}

export class AuthService {
  async login(credentials) {
    return api.post('/auth/login', credentials);
  }

  async logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return Promise.resolve({ success: true, message: 'Logged out successfully' });
  }

  async validateToken() {
    try {
      const response = await api.get('/auth/validate');
      return response.success;
    } catch {
      return false;
    }
  }
}

export class AnalyticsService {
  async getDashboardStats() {
    return api.get('/analytics/dashboard');
  }

  async getBatchAnalytics() {
    return api.get('/analytics/batches');
  }

  async getManufacturerStats() {
    return api.get('/analytics/manufacturers');
  }

  async getPharmacyStats() {
    return api.get('/analytics/pharmacies');
  }
}

// Export service instances
export const batchService = new BatchService();
export const pharmacyService = new PharmacyService();
export const manufacturerService = new ManufacturerService();
export const authService = new AuthService();
export const analyticsService = new AnalyticsService();

// Utility function for handling API errors in components
export const handleApiError = (error, setError) => {
  console.error('API Error:', error);
  
  if (setError) {
    setError(error.message);
  }
  
  return { success: false, error: error.message };
};

// Utility function for successful API responses
export const handleApiSuccess = (data, message, setData) => {
  if (setData) {
    setData(data);
  }
  
  return { success: true, data, message };
};