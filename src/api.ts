import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create axios instance with proper configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for cookies/session - enables sending cookies in cross-origin requests
});

// Debug logging to help diagnose API issues
apiClient.interceptors.request.use(request => {
  console.log('🚀 API Request:', request.method, request.url, request.withCredentials);
  return request;
});

apiClient.interceptors.response.use(
  response => {
    console.log('✅ API Response:', response.status, response.config.url);
    // Handle any specific success cases if needed
    return response;
  },
  error => {
    console.error('❌ API Error:', error.response?.status, error.config?.url, error.message);
    // Handle specific error statuses if needed
    if (error.response?.status === 401) {
      console.log('Authentication error - user not logged in');
      // Could redirect to login page here if needed
    }
    return Promise.reject(error);
  }
);

export default apiClient;
