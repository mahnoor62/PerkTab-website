"use client";

import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
export default function AppHeader({ adminEmail, onLogout }) {
  const initials =
    adminEmail?.charAt(0)?.toUpperCase() ?? "A";

  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{
        backdropFilter: "blur(18px)",
        borderBottom: (theme) =>
          `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, rgba(46, 204, 113, 0.4), rgba(26, 188, 156, 0.35))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              color: "#000000",
              boxShadow: "0 8px 18px rgba(46, 204, 113, 0.3), 0 0 0 1px rgba(46, 204, 113, 0.2)",
            }}
          >
            D
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              PerkTap
            </Typography>
            {/* <Typography
              variant="body2"
              color="text.secondary"
              sx={{ opacity: 0.8 }}
            >
              Crystal-grade control over your 10 levels
            </Typography> */}
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title={adminEmail}>
            <Avatar
              sx={{
                bgcolor: "primary.main",
                color: "primary.contrastText",
                fontWeight: 600,
              }}
            >
              {initials}
            </Avatar>
          </Tooltip>

          <Tooltip title="Sign out">
            <IconButton
              aria-label="Sign out"
              onClick={onLogout}
              size="large"
              color="primary"
            >
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

