// API utility for making requests to the backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function getApiUrl(path) {
  // Remove leading slash if present, then ensure it starts with /api
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

/**
 * Fetch JSON from the backend API
 * Automatically includes cookies and sets proper headers
 */
export async function fetchJson(url, options = {}) {
  // If url doesn't start with http, treat it as a relative API path
  const fullUrl = url.startsWith("http") ? url : getApiUrl(url);
  
  // Build headers - don't override Content-Type if already set (for FormData)
  const headers = {
    ...options.headers,
  };
  
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
      credentials: "include", // Include cookies for authentication
      headers,
    });

    // Check if response is ok before trying to parse JSON
    const data = await response.json().catch(() => ({}));
    
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
  
  const response = await fetch(fullUrl, {
    method: "POST",
    credentials: "include", // Include cookies for authentication
    body: formData,
    // Don't set Content-Type - browser will set it with boundary for FormData
  });
  
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "Upload failed");
    error.status = response.status;
    throw error;
  }
  
  return data;
}

