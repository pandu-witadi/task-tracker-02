import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5155/api/v1', // Update this with your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Error messages
const errorMessages = {
  network: 'Unable to connect to the server. Please check your internet connection.',
  timeout: 'Request timeout. The server is taking too long to respond.',
  server: 'An error occurred on the server. Please try again later.',
  default: 'An unexpected error occurred. Please try again.',
};

// Add a request interceptor to include the token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMessage = errorMessages.default;
    
    if (error.code === 'ECONNABORTED') {
      errorMessage = errorMessages.timeout;
    } else if (!error.response) {
      // Network error
      errorMessage = errorMessages.network;
    } else if (error.response.status === 401) {
      // Handle unauthorized errors (e.g., redirect to login)
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(new Error('Unauthorized'));
    } else if (error.response.status === 403) {
      errorMessage = 'You do not have permission to perform this action.';
    } else if (error.response.status === 404) {
      errorMessage = 'The requested resource was not found.';
    } else if (error.response.status >= 500) {
      errorMessage = errorMessages.server;
    } else if (error.response.data && error.response.data.message) {
      // Use server-provided error message if available
      errorMessage = error.response.data.message;
    }
    
    const errorWithMessage = new Error(errorMessage);
    errorWithMessage.status = error.response?.status;
    return Promise.reject(errorWithMessage);
  }
);

// Auth API
export const authAPI = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      // Store the token in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'An error occurred during login' };
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'An error occurred during registration' };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    // Redirect to login page
    window.location.href = '/login';
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch user data' };
    }
  },
};

export default api;
