import axios from "axios";

// API utility for making requests to the backend with Axios
const rawApiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
const apiBaseUrl =
  rawApiBaseUrl && rawApiBaseUrl.endsWith("/")
    ? rawApiBaseUrl.slice(0, -1)
    : rawApiBaseUrl;

if (!apiBaseUrl) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is not defined. Set it in your website/.env.local file."
  );
}

const tokenStorageKey = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY;

if (!tokenStorageKey) {
  throw new Error(
    "NEXT_PUBLIC_AUTH_TOKEN_KEY is not defined. Set it in your website/.env.local file."
  );
}

const API_BASE_URL = apiBaseUrl;
const TOKEN_STORAGE_KEY = tokenStorageKey;

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

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

function normalizeUrl(url) {
  if (!url) return "/";
  if (url.startsWith("http")) {
    return url;
  }
  return url.startsWith("/") ? url : `/${url}`;
}

function ensureJsonContentType(headers = {}) {
  const existing =
    headers["Content-Type"] || headers["content-type"] || headers["CONTENT-TYPE"];
  if (!existing) {
    return {
      ...headers,
      "Content-Type": "application/json",
    };
  }
  return headers;
}

function buildNetworkError(error) {
  let backendPortHint = "";
  try {
    const parsedUrl = new URL(API_BASE_URL);
    backendPortHint =
      parsedUrl.port || (parsedUrl.protocol === "https:" ? "443" : "80");
  } catch (_) {
    backendPortHint = "unknown";
  }

  const friendlyError = new Error(
    `Cannot connect to backend server at ${API_BASE_URL}. ` +
      `Please make sure the backend is running on port ${backendPortHint}. ` +
      `Error: ${error.message}`
  );
  friendlyError.originalError = error;
  return friendlyError;
}

/**
 * Fetch JSON from the backend API with Axios.
 * Automatically includes JWT token in Authorization header.
 */
export async function fetchJson(url, options = {}) {
  const normalizedUrl = normalizeUrl(url);
  const headers = {
    ...options.headers,
  };

  const token = getAuthToken();
  if (token) {
    if (!headers["Authorization"] && !headers["authorization"]) {
      headers["Authorization"] = `Bearer ${token.trim()}`;
      console.log(`[API] Adding Authorization header for ${normalizedUrl}`);
    }
  } else {
    console.warn(`[API] No token found for ${normalizedUrl}`);
  }

  const dataPayload =
    options.data !== undefined ? options.data : options.body !== undefined ? options.body : undefined;

  let finalHeaders = headers;
  if (
    dataPayload &&
    typeof dataPayload === "string" &&
    !(options.skipJsonContentType === true)
  ) {
    finalHeaders = ensureJsonContentType(headers);
  }

  const config = {
    method: options.method || (dataPayload ? "POST" : "GET"),
    url: normalizedUrl.startsWith("http")
      ? normalizedUrl
      : getApiUrl(normalizedUrl),
    headers: finalHeaders,
    params: options.params,
    data: dataPayload,
    withCredentials: options.withCredentials ?? false,
  };

  try {
    const response = await axiosClient.request(config);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      removeAuthToken();
    }

    if (error.response) {
      const message =
        error.response.data?.message ||
        `Request failed with status ${error.response.status}`;
      const formattedError = new Error(message);
      formattedError.status = error.response.status;
      throw formattedError;
    }

    if (error.request) {
      throw buildNetworkError(error);
    }

    throw error;
  }
}

/**
 * Upload file to the backend API using Axios/FormData.
 */
export async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const token = getAuthToken();
  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token.trim()}`;
  } else {
    console.warn("[API] No token found for file upload");
  }

  try {
    const response = await axiosClient.post("/api/upload", formData, {
      headers,
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      removeAuthToken();
    }

    if (error.response) {
      const uploadError = new Error(
        error.response.data?.message || "Upload failed"
      );
      uploadError.status = error.response.status;
      throw uploadError;
    }

    if (error.request) {
      throw buildNetworkError(error);
    }

    throw error;
  }
}

