const zenPalette = {
  primary: {
    main: "#e9e224", // Yellow
    light: "#f0e84a",
    dark: "#d4c920",
    contrastText: "#000000",
  },
  secondary: {
    main: "#e74c3c", // C - vivid red
    light: "#ec7063",
    dark: "#c0392b",
    contrastText: "#ffffff",
  },
  info: {
    main: "#1abc9c", // O - light blue/cyan
    light: "#48c9b0",
    dark: "#16a085",
  },
  warning: {
    main: "#f39c12", // O - bright orange
    light: "#f5b041",
    dark: "#d68910",
  },
  error: {
    main: "#e74c3c", // C - vivid red
    light: "#ec7063",
    dark: "#c0392b",
  },
  success: {
    main: "#e9e224", // Yellow
    light: "#f0e84a",
    dark: "#d4c920",
  },
  background: {
    default: "#0a0a0a", // very dark charcoal/black
    paper: "rgba(26, 26, 26, 0.95)", // dark with slight transparency
  },
  text: {
    primary: "#ffffff", // pure white
    secondary: "rgba(255, 255, 255, 0.7)", // white with opacity
  },
  // Additional vibrant colors from the image
  zen: {
    red: "#e74c3c", // C
    orange: "#f39c12", // O
    lime: "#e9e224", // Yellow
    cyan: "#1abc9c", // O
    teal: "#008080", // R - darker blue/teal
    purple: "#9b59b6", // purple/magenta circles
    darkBlue: "#3498db", // dark blue circles
  },
};

export function getDesignTokens() {
  const palette = zenPalette;
  return {
    palette: {
      mode: "dark",
      ...palette,
    },
    typography: {
      fontFamily: [
        "Inter",
        "Segoe UI",
        "Roboto",
        "Helvetica Neue",
        "Arial",
        "sans-serif",
      ].join(","),
      h4: {
        fontWeight: 600,
      },
      h5: {
        fontWeight: 600,
      },
      button: {
        textTransform: "none",
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 16,
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage:
              "linear-gradient(135deg, rgba(233, 226, 36, 0.12), rgba(26, 188, 156, 0.15), rgba(155, 89, 182, 0.1))",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(233, 226, 36, 0.25)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(233, 226, 36, 0.1)",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            fontWeight: 700,
            letterSpacing: 0.3,
            textTransform: "none",
            boxShadow: "0 4px 20px rgba(233, 226, 36, 0.3)",
            "&:hover": {
              boxShadow: "0 6px 28px rgba(233, 226, 36, 0.5)",
            },
          },
          contained: {
            background: "linear-gradient(135deg, #e9e224, #d4c920)",
            "&:hover": {
              background: "linear-gradient(135deg, #d4c920, #bfb01c)",
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            fontWeight: 600,
            background: "rgba(233, 226, 36, 0.15)",
            border: "1px solid rgba(233, 226, 36, 0.3)",
            color: "#e9e224",
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "rgba(233, 226, 36, 0.3)",
              },
              "&:hover fieldset": {
                borderColor: "rgba(233, 226, 36, 0.5)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#e9e224",
                borderWidth: 2,
              },
            },
          },
        },
      },
    },
  };
}

