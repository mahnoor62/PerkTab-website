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
        let levelsResponse;
        try {
          levelsResponse = await fetchJson("/api/levels");
          console.log("[Levels] Successfully fetched levels:", levelsResponse?.levels?.length || 0);
        } catch (err) {
          console.error("Levels API error:", err);
          console.error("Levels API error details:", {
            status: err.status,
            message: err.message,
            tokenPresent: !!getAuthToken(),
          });
          // If it's an auth error, remove token and redirect
          if (err.status === 401) {
            removeAuthToken();
            setLoading(false);
            router.push("/login");
            return;
          }
          // For other errors, still try to load with empty array
          levelsResponse = { levels: [] };
        }

        if (!isMounted) return;

        setAdmin(sessionResponse.admin);
        setLevels(levelsResponse?.levels || []);
        setLoading(false);
      } catch (error) {
        if (!isMounted) return;
        
        console.error("Error loading data:", error);
        setError(error.message || "Failed to load data");
        // If it's an auth error, redirect to login
        if (error.status === 401 || error.message?.includes("Unauthorized")) {
          removeAuthToken();
          setLoading(false);
          router.push("/login");
          return;
        }
        // For other errors, show error but don't redirect
        setLoading(false);
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
