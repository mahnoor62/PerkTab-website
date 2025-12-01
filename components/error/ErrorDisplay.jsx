"use client";

import { Box, Button, Typography, Stack, Alert, Paper } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RefreshIcon from "@mui/icons-material/Refresh";

export default function ErrorDisplay({ error, onRetry, title = "Error Occurred" }) {
  const errorMessage = error?.message || error?.toString() || "An unknown error occurred";
  const errorStatus = error?.status || error?.response?.status || null;
  const errorDetails = error?.response?.data || error?.data || null;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
        p: 4,
        "&::before": {
          content: '""',
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 20%, rgba(231, 76, 60, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 30%, rgba(155, 89, 182, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 30% 80%, rgba(26, 188, 156, 0.12) 0%, transparent 50%),
            linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)
          `,
          zIndex: 0,
          pointerEvents: "none",
        },
      }}
    >
      <Box sx={{ position: "relative", zIndex: 1, maxWidth: 600, width: "100%" }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            p: 4,
            background:
              "linear-gradient(135deg, rgba(26, 26, 26, 0.95), rgba(231, 76, 60, 0.08), rgba(155, 89, 182, 0.1))",
            border: "1px solid rgba(231, 76, 60, 0.3)",
            boxShadow: "0 24px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(231, 76, 60, 0.1), 0 0 40px rgba(231, 76, 60, 0.1)",
          }}
        >
          <Stack spacing={3} alignItems="center">
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, rgba(231, 76, 60, 0.3), rgba(192, 57, 43, 0.3))",
                boxShadow: "0 20px 40px rgba(231, 76, 60, 0.3), 0 0 0 1px rgba(231, 76, 60, 0.2)",
              }}
            >
              <ErrorOutlineIcon sx={{ color: "#e74c3c", fontSize: 48 }} />
            </Box>

            <Box textAlign="center">
              <Typography variant="h4" fontWeight={700} sx={{ color: "#ffffff", mb: 1 }}>
                {title}
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                An error occurred while loading the page
              </Typography>
            </Box>

            <Alert
              severity="error"
              sx={{
                width: "100%",
                backgroundColor: "rgba(231, 76, 60, 0.1)",
                border: "1px solid rgba(231, 76, 60, 0.3)",
                "& .MuiAlert-icon": {
                  color: "#e74c3c",
                },
                "& .MuiAlert-message": {
                  color: "#ffffff",
                  width: "100%",
                },
              }}
            >
              <Stack spacing={1}>
                <Typography variant="body1" fontWeight={600}>
                  Error Message:
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: "monospace", wordBreak: "break-word" }}>
                  {errorMessage}
                </Typography>
                {errorStatus && (
                  <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.6)", mt: 1 }}>
                    Status Code: {errorStatus}
                  </Typography>
                )}
                {errorDetails && typeof errorDetails === "object" && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.6)", display: "block", mb: 0.5 }}>
                      Error Details:
                    </Typography>
                    <Box
                      component="pre"
                      sx={{
                        fontSize: "0.75rem",
                        color: "rgba(255, 255, 255, 0.8)",
                        backgroundColor: "rgba(0, 0, 0, 0.3)",
                        padding: 1,
                        borderRadius: 1,
                        overflow: "auto",
                        maxHeight: 200,
                        fontFamily: "monospace",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {JSON.stringify(errorDetails, null, 2)}
                    </Box>
                  </Box>
                )}
              </Stack>
            </Alert>

            {onRetry && (
              <Button
                variant="contained"
                size="large"
                startIcon={<RefreshIcon />}
                onClick={onRetry}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  background: "linear-gradient(135deg, #e9e224, #d4c920)",
                  boxShadow:
                    "0 8px 24px rgba(233, 226, 36, 0.4), 0 0 0 1px rgba(233, 226, 36, 0.2)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #d4c920, #bfb01c)",
                    boxShadow:
                      "0 12px 32px rgba(233, 226, 36, 0.6), 0 0 0 1px rgba(233, 226, 36, 0.3)",
                  },
                }}
              >
                Retry
              </Button>
            )}

            <Button
              variant="text"
              onClick={() => {
                window.location.href = "/login";
              }}
              sx={{
                color: "rgba(255, 255, 255, 0.7)",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  color: "#ffffff",
                },
              }}
            >
              Go to Login
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}

