import axios from "axios";

const rawServerBaseUrl =
  process.env.NEXT_PUBLIC_API_URL;

if (!rawServerBaseUrl) {
  throw new Error(
    "API_URL (or NEXT_PUBLIC_API_URL) is not defined. Set it in website/.env.local or your deployment environment."
  );
}

const API_BASE_URL = rawServerBaseUrl.endsWith("/")
  ? rawServerBaseUrl.slice(0, -1)
  : rawServerBaseUrl;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.message) {
      const friendlyError = new Error(error.response.data.message);
      friendlyError.status = error.response.status;
      friendlyError.data = error.response.data;
      return Promise.reject(friendlyError);
    }
    return Promise.reject(error);
  }
);

export async function getCurrentAdminFromBackend(token = null) {
  try {
    const ts = Date.now();
    const response = await apiClient.get("/api/auth/session", {
      headers: {
        "Cache-Control": "no-store",
        "Pragma": "no-cache",
        ...(token ? { token: token.trim() } : {}),
      },
      params: { _t: ts },
    });

    if (response.data.authenticated) {
      return response.data.admin;
    }
    return null;
  } catch (error) {
    console.error("Error fetching admin session:", error);
    return null;
  }
}

export async function getAllLevelConfigsFromBackend(token = null) {
  try {
    const ts = Date.now();
    const response = await apiClient.get("/api/levels", {
      headers: {
        "Cache-Control": "no-store",
        "Pragma": "no-cache",
        ...(token ? { token: token.trim() } : {}),
      },
      params: { _t: ts },
    });

    if (response.data && response.data.levels) {
      return response.data.levels;
    }
    return [];
  } catch (error) {
    console.error("Error fetching levels:", error);
    throw error;
  }
}

