// Server-side API utility for making requests to the backend from Next.js server components
// Note: Server components can't access localStorage, so they will need to receive token from headers
// lib/api-server.js

const isProduction = process.env.NEXT_PUBLIC_VERCEL_ENV === "production" || 
                     process.env.NODE_ENV === "production";

const rawServerBaseUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

if (!rawServerBaseUrl) {
  const errorMsg = isProduction
    ? "API_URL or NEXT_PUBLIC_API_URL is not defined. Set it in Vercel Environment Variables (Settings > Environment Variables). For production, use your backend URL (e.g., https://perktab-backend.tecshield.net)."
    : "API_URL (or NEXT_PUBLIC_API_URL) is not defined. Set it in website/.env.local (e.g., NEXT_PUBLIC_API_URL=http://localhost:5000).";
  throw new Error(errorMsg);
}

const API_BASE_URL = rawServerBaseUrl.endsWith("/")
  ? rawServerBaseUrl.slice(0, -1)
  : rawServerBaseUrl;

// Log server-side API configuration
console.log("[API-Server] Configuration:", {
  apiUrl: API_BASE_URL,
  source: process.env.API_URL ? "API_URL" : "NEXT_PUBLIC_API_URL",
  environment: isProduction ? "production" : "development",
  warning: isProduction && API_BASE_URL?.includes("localhost")
    ? "⚠️ WARNING: Production environment using localhost URL!"
    : null,
});



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

