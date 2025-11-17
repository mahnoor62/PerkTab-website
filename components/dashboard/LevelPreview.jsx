"use client";

import {
  Box,
  Stack,
  Typography,
} from "@mui/material";

// Get backend URL for serving uploaded files
function getLogoUrl(logoUrl) {
  if (!logoUrl) return null;
  
  // If it's already a full URL, return as is
  if (logoUrl.startsWith("http://") || logoUrl.startsWith("https://")) {
    return logoUrl;
  }
  
  // If it's a relative path starting with /uploads/, prepend backend URL
  if (logoUrl.startsWith("/uploads/")) {
    // Use the same backend URL as API calls
    const rawBackendUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
    if (!rawBackendUrl) {
      console.warn(
        "[LevelPreview] NEXT_PUBLIC_API_URL is not defined. Logos from uploads cannot be displayed."
      );
      return logoUrl;
    }
    const backendUrl = rawBackendUrl.endsWith("/")
      ? rawBackendUrl.slice(0, -1)
      : rawBackendUrl;
    // Ensure no double slashes
    const cleanUrl = logoUrl.startsWith("/") ? logoUrl : `/${logoUrl}`;
    return `${backendUrl}${cleanUrl}`;
  }
  
  // Return as is for other relative paths
  return logoUrl;
}

export default function LevelPreview({ level }) {
  if (!level) {
    return (
      <Stack spacing={2} alignItems="center" justifyContent="center">
        <Typography variant="h6" fontWeight={700} sx={{ color: "#ffffff" }}>
          Select a level to preview
        </Typography>
        <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)", textAlign: "center" }}>
          The live preview will render your chosen color palette, dot styling, and logo once a level is active.
        </Typography>
      </Stack>
    );
  }

  const dots = [1, 2, 3, 4, 5].map((idx) => level[`dot${idx}Color`]);
  const backgroundColor = level.backgroundColor?.trim() || "#2ecc71";
  const dotPositions = [
    { top: "20%", left: "36%" },
    { top: "30%", left: "60%" },
    { top: "40%", left: "32%" },
    { top: "50%", left: "58%" },
    { top: "60%", left: "36%" },
  ];

  return (
    <Stack spacing={2} alignItems="center">
           <Typography variant="h6" fontWeight={700} sx={{ color: "#ffffff", mb: 1 }}>
         Preview
      </Typography>
      <Box
        sx={{
          position: "relative",
          width: { xs: "100%", sm: 280 },
          maxWidth: 280,
          aspectRatio: "9/19.5",
          backgroundColor: "#000000",
          borderRadius: 4,
          padding: "12px 8px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.8), inset 0 0 0 2px rgba(255, 255, 255, 0.1)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 8,
            left: "50%",
            transform: "translateX(-50%)",
            width: 120,
            height: 24,
            backgroundColor: "#000000",
            borderRadius: "0 0 16px 16px",
            zIndex: 2,
          }}
        />
        
        <Box
          sx={{
            width: "100%",
            height: "100%",
            borderRadius: 3,
            overflow: "hidden",
            backgroundColor: backgroundColor,
            position: "relative",
          }}
        >
          {dots.map((color, idx) => (
            <Box
              key={idx}
              sx={{
                position: "absolute",
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: color?.trim() || "rgba(255,255,255,0.4)",
                boxShadow: "0 8px 16px rgba(0,0,0,0.25)",
                border: "2px solid rgba(255,255,255,0.35)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                top: dotPositions[idx].top,
                left: dotPositions[idx].left,
                transform: "translate(-50%, -50%)",
                "&:hover": {
                  transform: "translate(-50%, -50%) scale(1.05)",
                  boxShadow: "0 12px 24px rgba(0,0,0,0.35)",
                },
              }}
            />
          ))}

          {level.logoUrl && (
            <Box
              component="img"
              src={getLogoUrl(level.logoUrl)}
              alt={`Level ${level.level} logo`}
              onError={(e) => {
                console.error("Failed to load logo:", level.logoUrl);
                e.target.style.display = "none";
              }}
              sx={{
                position: "absolute",
                bottom: 25,
                left: "50%",
                transform: "translateX(-50%)",
                maxWidth: "60%",
                maxHeight: 110,
                width: "auto",
                height: "auto",
                objectFit: "contain",
              }}
            />
          )}
        </Box>
      </Box>
    </Stack>
  );
}

