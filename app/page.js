"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CircularProgress, Box } from "@mui/material";
import Dashboard from "@/components/dashboard/Dashboard";
import { getAuthToken, removeAuthToken } from "@/lib/api";
import { fetchJson } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const timeoutId = setTimeout(() => {
      if (isMounted && loading) {
        console.warn("Loading timeout - taking too long");
        setError("Request is taking too long. Please check your connection.");
        setLoading(false);
      }
    }, 10000); // 10 second timeout

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
        
        // Show the actual error message to user
        const errorMessage = error.message || error.toString() || "Failed to load data";
        setError(errorMessage);
        setLoading(false);
        
        // Also set empty levels array so dashboard can still render (but will show error)
        setLevels([]);
      } finally {
        // Always set loading to false, even if we're redirecting
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [router]);

  // Show loading spinner
  if (loading) {
    return (
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
    );
  }

  // Show error if not redirecting
  if (error && !admin) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          gap: 2,
          p: 4,
        }}
      >
        <Box sx={{ color: "#e74c3c", fontSize: "16px", textAlign: "center" }}>
          {error}
        </Box>
        <button
          onClick={() => {
            setError(null);
            setLoading(true);
            window.location.reload();
          }}
          style={{
            padding: "10px 20px",
            background: "#2ecc71",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </Box>
    );
  }

  // If no admin but not loading, redirecting (don't render anything)
  if (!admin) {
    return null;
  }

  return (
    <Dashboard initialLevels={levels} adminEmail={admin.email} />
  );
}
