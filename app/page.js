"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CircularProgress, Box, Snackbar, Alert } from "@mui/material";
import Dashboard from "@/components/dashboard/Dashboard";
import { getAuthToken, removeAuthToken } from "@/lib/api";
import { fetchJson } from "@/lib/api";

const initialToastState = {
  open: false,
  severity: "error",
  message: "",
};

export default function Home() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastState, setToastState] = useState(initialToastState);

  useEffect(() => {
    let isMounted = true;
    let timeoutId = null;

    async function loadData() {
      try {
        const token = getAuthToken();
        
        if (!token) {
          if (isMounted) {
            setLoading(false);
            router.push("/login");
          }
          return;
        }

        timeoutId = setTimeout(() => {
          if (isMounted) {
            console.warn("Loading timeout - request taking too long");
            const errorMessage = "Request is taking too long. Please check your connection or database server status.";
            setToastState({
              open: true,
              severity: "error",
              message: errorMessage,
            });
            setLoading(false);
          }
        }, 15000);

        // First verify session, then fetch levels
        // This ensures token is valid before making levels request
        const sessionResponse = await fetchJson("/api/auth/session").catch((err) => {
          console.error("Session error:", err);
          // If session fails, token might be invalid
          if (err.status === 401) {
            removeAuthToken();
          }
          throw err;
        });

        // Clear timeout if request succeeds
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }

        // Check if authenticated
        if (!sessionResponse.authenticated || !sessionResponse.admin) {
          removeAuthToken();
          setLoading(false);
          router.push("/login");
          return;
        }

        // Now fetch levels after session is confirmed
        const levelsResponse = await fetchJson("/api/levels").catch((err) => {
          console.error("Levels API error:", err);
          console.error("Levels API error details:", {
            status: err.status,
            message: err.message,
            responseData: err.responseData,
            tokenPresent: !!getAuthToken(),
            error: err,
          });
          // If it's an auth error, remove token and redirect
          if (err.status === 401) {
            removeAuthToken();
            setLoading(false);
            router.push("/login");
            throw err;
          }
          // For other errors, throw the error instead of returning empty array
          throw err;
        });
        
        // Clear timeout if request succeeds
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }

        console.log("[Levels] API response:", levelsResponse);
        console.log("[Levels] Levels array:", levelsResponse?.levels);
        console.log("[Levels] Levels count:", levelsResponse?.levels?.length || 0);

        // Validate response structure
        if (!levelsResponse || typeof levelsResponse !== "object") {
          throw new Error("Invalid response from levels API: Response is not an object");
        }

        if (!Array.isArray(levelsResponse.levels)) {
          throw new Error(`Invalid response from levels API: levels is not an array (got ${typeof levelsResponse.levels})`);
        }

        // If empty array is returned, log warning but don't throw error (empty array is valid)
        if (levelsResponse.levels.length === 0) {
          console.warn("[Levels] WARNING: API returned empty array!");
          console.warn("[Levels] This might indicate:");
          console.warn("  - No levels exist in database");
          console.warn("  - Database connection issue");
          console.warn("  - Wrong database being queried");
          console.warn("  - Check backend logs for more details");
        }

        if (!isMounted) return;

        setAdmin(sessionResponse.admin);
        setLevels(levelsResponse.levels);
        setLoading(false);
      } catch (error) {
        // Clear timeout on error
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }

        if (!isMounted) return;
        
        console.error("Error loading data:", error);
        console.error("Full error object:", error);
        
        // If it's an auth error, redirect to login
        if (error.status === 401 || error.message?.includes("Unauthorized")) {
          removeAuthToken();
          setLoading(false);
          router.push("/login");
          return;
        }
        
        // Show error in toast notification
        let errorMessage = error.message || error.toString() || "Failed to load data";
        
        // Format common database connection errors
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "unknown";
        if (error.message?.includes("timeout") || error.message?.includes("ECONNREFUSED") || error.message?.includes("ENOTFOUND")) {
          if (apiUrl.includes("localhost")) {
            errorMessage = `Cannot connect to backend server at ${apiUrl}. Please ensure the backend is running locally.`;
          } else {
            errorMessage = `Cannot connect to backend server at ${apiUrl}. Please check if the backend server is running and accessible.`;
          }
        } else if (error.message?.includes("Cannot connect to backend")) {
          errorMessage = `Cannot connect to backend server at ${apiUrl}. Please ensure the API server is running and NEXT_PUBLIC_API_URL is correctly configured.`;
        }
        
        setToastState({
          open: true,
          severity: "error",
          message: errorMessage,
        });
        setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [router]);

  // Show loading spinner
  if (loading) {
    return (
      <>
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#0a0a0a",
            gap: 2,
          }}
        >
          <CircularProgress sx={{ color: "#2ecc71" }} size={48} />
          <Box sx={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "14px" }}>
            Loading dashboard...
          </Box>
        </Box>
        <Snackbar
          open={toastState.open}
          autoHideDuration={6000}
          onClose={() => setToastState(initialToastState)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setToastState(initialToastState)}
            severity={toastState.severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {toastState.message}
          </Alert>
        </Snackbar>
      </>
    );
  }

  // If no admin but not loading, redirecting (don't render anything)
  if (!admin) {
    return (
      <Snackbar
        open={toastState.open}
        autoHideDuration={6000}
        onClose={() => setToastState(initialToastState)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToastState(initialToastState)}
          severity={toastState.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toastState.message}
        </Alert>
      </Snackbar>
    );
  }

  return (
    <>
      <Dashboard initialLevels={levels} adminEmail={admin.email} />
      <Snackbar
        open={toastState.open}
        autoHideDuration={6000}
        onClose={() => setToastState(initialToastState)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToastState(initialToastState)}
          severity={toastState.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toastState.message}
        </Alert>
      </Snackbar>
    </>
  );
}
