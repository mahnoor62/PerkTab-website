// Server-side API utility for making requests to the backend from Next.js server components
const API_BASE_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function fetchJsonServer(url, options = {}) {
  // If url doesn't start with http, treat it as a relative API path
  const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;
  
  // For server-side requests, we need to forward cookies from the request
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(fullUrl, {
    ...options,
    headers,
    // Forward cookies from the original request if available
    credentials: "include",
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
export async function getCurrentAdminFromBackend(cookieStore) {
  try {
    const API_BASE_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    
    // Convert cookie store to cookie header string
    let cookieHeader = "";
    if (cookieStore) {
      const allCookies = await cookieStore.getAll();
      cookieHeader = allCookies.map(c => `${c.name}=${c.value}`).join("; ");
    }
    
    const response = await fetch(`${API_BASE_URL}/api/auth/session`, {
      headers: cookieHeader ? { Cookie: cookieHeader } : {},
      credentials: "include",
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
export async function getAllLevelConfigsFromBackend(cookieStore) {
  try {
    const API_BASE_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    
    // Convert cookie store to cookie header string
    let cookieHeader = "";
    if (cookieStore) {
      const allCookies = await cookieStore.getAll();
      cookieHeader = allCookies.map(c => `${c.name}=${c.value}`).join("; ");
    }
    
    const response = await fetch(`${API_BASE_URL}/api/levels`, {
      headers: cookieHeader ? { Cookie: cookieHeader } : {},
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.levels || [];
  } catch (error) {
    console.error("Error fetching levels:", error);
    return [];
  }
}

