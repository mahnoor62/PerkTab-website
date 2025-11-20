import axios from "axios";

// Get API base URL from environment variables
const rawApiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

if (!rawApiBaseUrl) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is not defined. Set it in your website/.env.local file."
  );
}

const apiBaseUrl = rawApiBaseUrl.endsWith("/")
  ? rawApiBaseUrl.slice(0, -1)
  : rawApiBaseUrl;

// Get token storage key from environment variables
const tokenStorageKey = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY;

if (!tokenStorageKey) {
  throw new Error(
    "NEXT_PUBLIC_AUTH_TOKEN_KEY is not defined. Set it in your website/.env.local file."
  );
}

const API_BASE_URL = apiBaseUrl;
const TOKEN_STORAGE_KEY = tokenStorageKey;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token.trim()}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeAuthToken();
    }
    
    // Create a more user-friendly error message
    if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
      const friendlyError = new Error(
        `Cannot connect to backend server at ${API_BASE_URL}. ` +
        `Please make sure the backend is running and accessible.`
      );
      friendlyError.status = 0;
      friendlyError.originalError = error;
      return Promise.reject(friendlyError);
    }
    
    // If backend returned an error response, use its message
    if (error.response?.data?.message) {
      const friendlyError = new Error(error.response.data.message);
      friendlyError.status = error.response.status;
      friendlyError.data = error.response.data;
      return Promise.reject(friendlyError);
    }
    
    return Promise.reject(error);
  }
);

// Token storage utilities
export function getAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setAuthToken(token) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

export function removeAuthToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

/**
 * Fetch JSON from the backend API using axios
 * Automatically includes JWT token in Authorization header
 */
export async function fetchJson(url, options = {}) {
  // Remove leading slash if present
  const cleanPath = url.startsWith("/") ? url.slice(1) : url;
  const fullUrl = `${API_BASE_URL}/${cleanPath}`;
  
  try {
    const config = {
      method: options.method || "GET",
      url: fullUrl,
      headers: {
        ...options.headers,
      },
    };
    
    // Add body for POST, PUT, PATCH requests
    if (options.body && ["POST", "PUT", "PATCH"].includes(config.method.toUpperCase())) {
      if (typeof options.body === "string") {
        config.data = JSON.parse(options.body);
      } else {
        config.data = options.body;
      }
    }
    
    const response = await apiClient(config);
    return response.data;
  } catch (error) {
    // Error is already handled by interceptor, just re-throw
    throw error;
  }
}

/**
 * Upload file to the backend API using axios
 * Handles FormData properly
 */
export async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  
  try {
    const token = getAuthToken();
    const response = await axios.post(
      `${API_BASE_URL}/api/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token.trim()}` } : {}),
        },
      }
    );
    
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      removeAuthToken();
    }
    
    if (error.response?.data?.message) {
      const friendlyError = new Error(error.response.data.message);
      friendlyError.status = error.response.status;
      throw friendlyError;
    }
    
    throw error;
  }
}
