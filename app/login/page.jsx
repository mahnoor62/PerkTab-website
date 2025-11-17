"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box } from "@mui/material";
import LoginForm from "@/components/auth/LoginForm";
import { getAuthToken } from "@/lib/api";
import { fetchJson } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if already logged in
    const token = getAuthToken();
    if (token) {
      fetchJson("/api/auth/session")
        .then((session) => {
          if (session.authenticated) {
            router.push("/");
          }
        })
        .catch(() => {
          // Not authenticated, stay on login page
        });
    }
  }, [router]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        position: "relative",
        background: "#0a0a0a",
        "&::before": {
          content: '""',
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 20%, rgba(52, 152, 219, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 30%, rgba(155, 89, 182, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 30% 80%, rgba(26, 188, 156, 0.12) 0%, transparent 50%),
            radial-gradient(circle at 70% 80%, rgba(155, 89, 182, 0.15) 0%, transparent 50%),
            linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)
          `,
          zIndex: 0,
          pointerEvents: "none",
        },
      }}
    >
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <LoginForm />
      </Box>
    </Box>
  );
}

