"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CircularProgress, Box } from "@mui/material";
import Dashboard from "@/components/dashboard/Dashboard";
import ErrorDisplay from "@/components/error/ErrorDisplay";
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
          setError({
            message: "Request is taking too long. Please check your connection.",
            status: null,
            response: null,
            data: null,
          });
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

        // Fetch admin session and levels in parallel for faster loading
        const [sessionResponse, levelsResponse] = await Promise.all([
          fetchJson("/api/auth/session").catch((err) => {
            console.error("Session error:", err);
            // If session fails, token might be invalid
            if (err.status === 401) {
              removeAuthToken();
            }
            throw err;
          }),
          fetchJson("/api/levels").catch((err) => {
            console.error("Levels error:", err);
            // Return empty array if levels fail, but don't block the page
            return { levels: [] };
          })
        ]);

        if (!isMounted) return;

        // Check if authenticated
        if (!sessionResponse.authenticated || !sessionResponse.admin) {
          removeAuthToken();
          setLoading(false);
          router.push("/login");
          return;
        }

        setAdmin(sessionResponse.admin);
        setLevels(
          Array.isArray(levelsResponse.levels) ? levelsResponse.levels : []
        );
      } catch (error) {
        if (!isMounted) return;
        
        console.error("Error loading data:", error);
        console.error("Error details:", {
          message: error.message,
          status: error.status,
          response: error.response,
          stack: error.stack,
        });
        
        // Create error object for display
        const errorObj = {
          message: error.message || "Failed to load data",
          status: error.status || error.response?.status || null,
          response: error.response || null,
          data: error.response?.data || error.data || null,
        };
        
        setError(errorObj);
        
        // If it's an auth error, redirect to login
        if (error.status === 401 || error.response?.status === 401 || error.message?.includes("Unauthorized")) {
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
        <CircularProgress sx={{ color: "#e9e224" }} size={48} />
        <Box sx={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "14px" }}>
          Loading dashboard...
        </Box>
      </Box>
    );
  }

  // Show error if not redirecting
  if (error && !admin) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={() => {
          setError(null);
          setLoading(true);
          window.location.reload();
        }}
        title="Failed to Load Dashboard"
      />
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
