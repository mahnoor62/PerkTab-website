// API utility for making requests to the backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const TOKEN_STORAGE_KEY = "change_me_to_a_secure_secret";

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

export function getApiUrl(path) {
  // Remove leading slash if present, then ensure it starts with /api
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

/**
 * Fetch JSON from the backend API
 * Automatically includes JWT token in Authorization header
 */
export async function fetchJson(url, options = {}) {
  // If url doesn't start with http, treat it as a relative API path
  const fullUrl = url.startsWith("http") ? url : getApiUrl(url);
  
  // Build headers - don't override Content-Type if already set (for FormData)
  const headers = {
    ...options.headers,
  };
  
  // Add JWT token to Authorization header if available
  const token = getAuthToken();
  if (token) {
    // Always set Authorization header (case-insensitive check)
    if (!headers["Authorization"] && !headers["authorization"]) {
      headers["Authorization"] = `Bearer ${token.trim()}`;
      // Debug logging
      console.log(`[API] Adding Authorization header for ${fullUrl}`);
    }
  } else {
    console.warn(`[API] No token found for ${fullUrl}`);
  }
  
  // Only set Content-Type to JSON if body is a string (JSON) and not already set
  if (
    options.body &&
    typeof options.body === "string" &&
    !headers["Content-Type"] &&
    !headers["content-type"]
  ) {
    headers["Content-Type"] = "application/json";
  }
  
  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    // Check if response is ok before trying to parse JSON
    const data = await response.json().catch(() => ({}));
    
    // If unauthorized, clear token
    if (response.status === 401) {
      removeAuthToken();
    }
    
    if (!response.ok) {
      const error = new Error(data.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      throw error;
    }
    
    return data;
  } catch (error) {
    // Handle network errors (backend not reachable)
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      const backendUrl = API_BASE_URL;
      const friendlyError = new Error(
        `Cannot connect to backend server at ${backendUrl}. ` +
        `Please make sure the backend is running on port ${backendUrl.split(':').pop() || '5000'}. ` +
        `Error: ${error.message}`
      );
      friendlyError.originalError = error;
      throw friendlyError;
    }
    // Re-throw other errors
    throw error;
  }
}

/**
 * Upload file to the backend API
 * Handles FormData properly
 */
export async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  
  const fullUrl = getApiUrl("/api/upload");
  
  // Add JWT token to Authorization header
  const token = getAuthToken();
  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const response = await fetch(fullUrl, {
    method: "POST",
    headers,
    body: formData,
    // Don't set Content-Type - browser will set it with boundary for FormData
  });
  
  const data = await response.json().catch(() => ({}));
  
  // If unauthorized, clear token
  if (response.status === 401) {
    removeAuthToken();
  }
  
  if (!response.ok) {
    const error = new Error(data.message || "Upload failed");
    error.status = response.status;
    throw error;
  }
  
  return data;
}

