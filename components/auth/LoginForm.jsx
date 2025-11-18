"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import LockRoundedIcon from "@mui/icons-material/LockRounded";

import { fetchJson, setAuthToken, getAuthToken } from "@/lib/api";

async function loginRequest(credentials) {
  return await fetchJson("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export default function LoginForm() {
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await loginRequest(formValues);
      // Store JWT token in localStorage
      if (response.token) {
        console.log("[Login] Received token from server, storing...");
        setAuthToken(response.token);
        
        // Wait a moment to ensure storage is complete
        await new Promise((resolve) => setTimeout(resolve, 100));
        
        // Verify token was stored
        const storedToken = getAuthToken();
        if (storedToken && storedToken === response.token.trim()) {
          console.log("[Login] Token verification: stored and retrieved successfully");
        } else {
          console.error("[Login] Token verification: failed to retrieve token!", {
            expectedLength: response.token.trim().length,
            retrievedLength: storedToken?.length || 0,
            tokensMatch: storedToken === response.token.trim(),
          });
          // Still proceed, but log the issue
        }
      } else {
        console.error("[Login] No token in response:", response);
        throw new Error("No authentication token received from server");
      }
      // Redirect to dashboard
      console.log("[Login] Redirecting to dashboard...");
      window.location.href = "/";
    } catch (err) {
      // Show user-friendly error message
      const errorMessage = err.message || "Login failed. Please try again.";
      setError(errorMessage);
      console.error("Login error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        maxWidth: 420,
        width: "100%",
        backdropFilter: "blur(24px)",
        background:
          "linear-gradient(135deg, rgba(26, 26, 26, 0.95), rgba(46, 204, 113, 0.08), rgba(26, 188, 156, 0.1))",
        border: "1px solid rgba(46, 204, 113, 0.3)",
        boxShadow: "0 24px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(46, 204, 113, 0.1), 0 0 40px rgba(46, 204, 113, 0.1)",
      }}
    >
      <CardContent component="form" onSubmit={handleSubmit} sx={{ p: 4 }}>
        <Stack spacing={3} alignItems="center">
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(135deg, rgba(46, 204, 113, 0.3), rgba(26, 188, 156, 0.3))",
              boxShadow: "0 20px 40px rgba(46, 204, 113, 0.3), 0 0 0 1px rgba(46, 204, 113, 0.2)",
            }}
          >
            <LockRoundedIcon sx={{ color: "#2ecc71", fontSize: 36 }} />
          </Box>
          <Box textAlign="center">
            <Typography variant="h5" fontWeight={700} sx={{ color: "#ffffff" }}>
              Login
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, color: "rgba(255, 255, 255, 0.7)" }}>
              Enter your login credentials to access the dashboard.
            </Typography>
          </Box>

          <Stack spacing={2} sx={{ width: "100%" }}>
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formValues.email}
              onChange={handleChange}
              required
              autoComplete="email"
              InputProps={{
                sx: {
                  color: "#ffffff",
                  "& input::placeholder": { color: "rgba(255, 255, 255, 0.5)", opacity: 1 },
                },
              }}
              InputLabelProps={{
                sx: {
                  color: "rgba(255, 255, 255, 0.7)",
                  "&.Mui-focused": {
                    color: "#2ecc71",
                  },
                },
              }}
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={formValues.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              InputProps={{
                sx: {
                  color: "#ffffff",
                  "& input::placeholder": { color: "rgba(255, 255, 255, 0.5)", opacity: 1 },
                },
              }}
              InputLabelProps={{
                sx: {
                  color: "rgba(255, 255, 255, 0.7)",
                  "&.Mui-focused": {
                    color: "#2ecc71",
                  },
                },
              }}
            />
          </Stack>

          {error ? (
            <Alert severity="error" sx={{ width: "100%" }}>
              {error}
            </Alert>
          ) : null}

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={isSubmitting}
            startIcon={
              isSubmitting ? <CircularProgress size={18} /> : null
            }
            sx={{ py: 1.2 }}
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

