"use client";

import { useMemo } from "react";
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { getDesignTokens } from "@/theme/themeOptions";

export default function ThemeRegistry({ children }) {
  const theme = useMemo(() => createTheme(getDesignTokens()), []);

  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}

