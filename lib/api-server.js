// Server-side API utility for making requests to the backend from Next.js server components
// Note: Server components can't access localStorage, so they will need to receive token from headers
const API_BASE_URL = process.env.API_URL;

/**
 * Extract JWT token from request headers
 * For server components, token should be passed via custom header or cookie
 * This is a fallback - client-side components should use api.js instead
 */
function getTokenFromHeaders(headers) {
  const authHeader = headers?.get("authorization") || headers?.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  return null;
}

async function fetchJsonServer(url, options = {}, token = null) {
  // If url doesn't start with http, treat it as a relative API path
  const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;
  
  // Build headers
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  
  // Add Authorization header if token provided
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(fullUrl, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const error = new Error(data.message || "Request failed");
    error.status = response.status;
    throw error;
  }

  return await response.json();
}

// Helper to get admin session from backend
// Note: For server components, pass token via headers or use client-side components
export async function getCurrentAdminFromBackend(token = null) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/session`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.authenticated ? data.admin : null;
  } catch (error) {
    return null;
  }
}

// Helper to get all levels from backend
// Note: For server components, pass token via headers or use client-side components
export async function getAllLevelConfigsFromBackend(token = null) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/levels`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.levels;
  } catch (error) {
    console.error("Error fetching levels:", error);
    return [];
  }
}

