"use client";

import {
  Card,
  CardActionArea,
  Stack,
  Typography,
  Box,
  Tooltip,
  Divider,
  Fab,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

function LevelBadge({ level }) {
  return (
    <Box
      sx={{
        px: 1.5,
        py: 0.5,
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        background:
          "linear-gradient(135deg, rgba(233, 226, 36, 0.3), rgba(26, 188, 156, 0.3))",
        color: "#ffffff",
        border: "1px solid rgba(233, 226, 36, 0.4)",
      }}
    >
      Level {level}
    </Box>
  );
}

function DotPreview({ colors }) {
  const maxDots = 8;
  const displayColors = colors.slice(0, maxDots);
  const hasMore = colors.length > maxDots;
  
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      {displayColors.map((color, idx) => (
        <Tooltip title={color || "Not set"} key={idx}>
          <Box
            sx={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: color?.trim() || "rgba(255,255,255,0.5)",
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 2px 6px rgba(15, 35, 67, 0.2)",
            }}
          />
        </Tooltip>
      ))}
      {hasMore && (
        <Typography
          variant="caption"
          sx={{
            color: "rgba(255, 255, 255, 0.6)",
            ml: 0.5,
            fontSize: "0.75rem",
          }}
        >
          ...
        </Typography>
      )}
    </Stack>
  );
}

function formatUpdatedAt(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mi = String(date.getUTCMinutes()).padStart(2, "0");
  const ss = String(date.getUTCSeconds()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy}, ${hh}:${mi}:${ss} UTC`;
}

export default function LevelList({
  levels,
  selectedLevel,
  onSelectLevel,
  onAddClick,
  canAddMoreLevels = true,
}) {
  if (!levels.length) {
    return (
      <Card
        sx={{
          borderRadius: 4,
          padding: 3,
          textAlign: "center",
          background:
            "linear-gradient(135deg, rgba(26, 26, 26, 0.95), rgba(233, 226, 36, 0.08), rgba(26, 188, 156, 0.1))",
          border: "1px dashed rgba(233, 226, 36, 0.4)",
          boxShadow: "0 18px 32px rgba(0, 0, 0, 0.5)",
        }}
      >
        <Stack spacing={2} alignItems="center">
          <Typography variant="h6" fontWeight={700} sx={{ color: "#ffffff" }}>
            No levels yet
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
            Kick-start your DotBack experience by creating the first level. Configure colors and logo instantly after creation.
          </Typography>
          <CardActionArea
            onClick={onAddClick}
            sx={{
              borderRadius: 3,
              mt: 1,
              px: 2,
              py: 1,
              border: "1px solid rgba(233, 226, 36, 0.6)",
              backgroundColor: "rgba(233, 226, 36, 0.15)",
            }}
          >
            <Typography fontWeight={600} sx={{ color: "#e9e224" }}>
              Create Level
            </Typography>
          </CardActionArea>
        </Stack>
      </Card>
    );
  }

  return (
    <Box sx={{ position: "relative", width: "100%" }}>
      <Box
        sx={{
          display: "grid",
          gap: 2,
          width: "100%",
          minWidth: 0,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            md: "repeat(2, minmax(0, 1fr))",
            lg: "1fr",
          },
        }}
      >
        {levels.map((level) => {
        const isSelected = level.level === selectedLevel;
        // Get dot colors from the dots array dynamically
        const dotColors = Array.isArray(level.dots) 
          ? level.dots.map((dot) => dot.color)
          : [];
        return (
          <Card
            key={level.level}
            elevation={0}
            sx={{
              borderRadius: 3,
              border: isSelected
                ? "2px solid #e9e224"
                : "1px solid rgba(233, 226, 36, 0.2)",
              background: isSelected
                ? "linear-gradient(135deg, rgba(26, 26, 26, 0.95), rgba(233, 226, 36, 0.15), rgba(26, 188, 156, 0.1))"
                : "linear-gradient(135deg, rgba(26, 26, 26, 0.9), rgba(233, 226, 36, 0.05), rgba(26, 188, 156, 0.05))",
              transition: "all 0.25s ease",
              transform: isSelected ? "translateY(-2px)" : "none",
              boxShadow: isSelected
                ? "0 18px 30px rgba(233, 226, 36, 0.3), 0 0 0 1px rgba(233, 226, 36, 0.2)"
                : "0 8px 18px rgba(0, 0, 0, 0.3)",
              minWidth: 0,
            }}
          >
            <CardActionArea
              onClick={() => onSelectLevel(level.level)}
              sx={{
                p: 2.5,
                display: "grid",
                rowGap: 2,
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <LevelBadge level={level.level} />
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gap: 1,
                  color: "rgba(255, 255, 255, 0.75)",
                }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ textTransform: "uppercase", letterSpacing: 0.6, color: "rgba(255, 255, 255, 0.55)" }}
                  >
                    Background
                  </Typography>
                  {level.backgroundColor ? (
                    <Box sx={{ mt: 0.5 }}>
                      <DotPreview colors={[level.backgroundColor]} />
                    </Box>
                  ) : (
                    <Typography variant="subtitle1" fontWeight={700} sx={{ color: "#ffffff" }}>
                      No background set
                    </Typography>
                  )}
                </Box>

                {/* <Box>
                  <Typography
                    variant="caption"
                    sx={{ textTransform: "uppercase", letterSpacing: 0.6, color: "rgba(255, 255, 255, 0.55)" }}
                  >
                    Dot Palette
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <DotPreview colors={dotColors} />
                  </Box>
                </Box> */}
                
                {/* Show all dots dynamically */}
                {dotColors.length > 0 && (
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ textTransform: "uppercase", letterSpacing: 0.6, color: "rgba(255, 255, 255, 0.55)" }}
                    >
                      Dots ({dotColors.length})
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <DotPreview colors={dotColors} />
                    </Box>
                  </Box>
                )}

                <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
                  Last updated: {formatUpdatedAt(level.updatedAt)}
                </Typography>
              </Box>
            </CardActionArea>
          </Card>
        );
      })}
      </Box>
      {/* Floating Add Level Button */}
      {canAddMoreLevels ? (
        <Fab
          color="primary"
          aria-label="add level"
          onClick={onAddClick}
          sx={{
            position: "sticky",
            bottom: 16,
            left: "50%",
            transform: "translateX(-50%)",
            mt: 2,
            background: "linear-gradient(135deg, #e9e224, #d4c920)",
            boxShadow:
              "0 8px 24px rgba(233, 226, 36, 0.4), 0 0 0 1px rgba(233, 226, 36, 0.2)",
            "&:hover": {
              background: "linear-gradient(135deg, #d4c920, #bfb01c)",
              boxShadow:
                "0 12px 32px rgba(233, 226, 36, 0.6), 0 0 0 1px rgba(233, 226, 36, 0.3)",
            },
            display: { xs: "flex", lg: "none" }, // Show on mobile/tablet, hide on desktop (header button visible)
          }}
        >
          <AddIcon />
        </Fab>
      ) : null}
    </Box>
  );
}

