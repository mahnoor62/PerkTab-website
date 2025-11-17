"use client";

import {
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
  InputAdornment,
  Popover,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
// import SaveIcon from "@mui/icons-material/Save";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";

const colorFields = [
  { name: "backgroundColor", label: "Background Color" },
  { name: "dot1Color", label: "Dot 1 Color" },
  { name: "dot2Color", label: "Dot 2 Color" },
  { name: "dot3Color", label: "Dot 3 Color" },
  { name: "dot4Color", label: "Dot 4 Color" },
  { name: "dot5Color", label: "Dot 5 Color" },
];

const leftSideFields = [
  { name: "backgroundColor", label: "Background Color" },
  { name: "dot1Color", label: "Dot 1 Color" },
  { name: "dot2Color", label: "Dot 2 Color" },
  { name: "dot3Color", label: "Dot 3 Color" },
  { name: "dot4Color", label: "Dot 4 Color" },
  { name: "dot5Color", label: "Dot 5 Color" },
];

const helperText =
  "Accepts HEX, rgba(), hsl(), gradients or any valid CSS color.";

function ColorSwatch({ color, onChange, fieldName }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [pickerColor, setPickerColor] = useState("#000000");

  const open = Boolean(anchorEl);

  const convertToHex = (colorStr) => {
    if (!colorStr) return "#000000";
    const trimmed = colorStr.trim();
    if (trimmed.startsWith("#")) {
      return trimmed.length === 7 ? trimmed : "#000000";
    }
    if (trimmed.startsWith("rgb")) {
      const rgb = trimmed.match(/\d+/g);
      if (rgb && rgb.length >= 3) {
        const r = parseInt(rgb[0]).toString(16).padStart(2, "0");
        const g = parseInt(rgb[1]).toString(16).padStart(2, "0");
        const b = parseInt(rgb[2]).toString(16).padStart(2, "0");
        return `#${r}${g}${b}`;
      }
    }
    return "#000000";
  };

  const handleClick = (event) => {
    event.stopPropagation();
    const hexColor = convertToHex(color);
    setPickerColor(hexColor);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleColorChange = (event) => {
    const newColor = event.target.value;
    setPickerColor(newColor);
    if (onChange && fieldName) {
      onChange(fieldName, newColor);
    }
  };

  return (
    <>
      <Box
        onClick={handleClick}
        sx={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.6)",
          boxShadow: "0 4px 10px rgba(0,0,0,0.12)",
          background: color?.trim() || "transparent",
          cursor: "pointer",
          transition: "transform 0.2s, box-shadow 0.2s",
          "&:hover": {
            transform: "scale(1.1)",
            boxShadow: "0 6px 15px rgba(46, 204, 113, 0.4)",
            border: "1px solid rgba(46, 204, 113, 0.8)",
          },
        }}
      />
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        PaperProps={{
          sx: {
            p: 2,
            backgroundColor: "rgba(26, 26, 26, 0.95)",
            border: "1px solid rgba(46, 204, 113, 0.3)",
            borderRadius: 2,
          },
        }}
      >
        <Stack spacing={2} alignItems="center">
          <Typography variant="body2" sx={{ color: "#ffffff", fontWeight: 600 }}>
            Pick a Color
          </Typography>
          <Box
            component="input"
            type="color"
            value={convertToHex(pickerColor)}
            onChange={handleColorChange}
            sx={{
              width: 200,
              height: 50,
              border: "1px solid rgba(46, 204, 113, 0.3)",
              borderRadius: 1,
              cursor: "pointer",
            }}
          />
          <TextField
            size="small"
            value={pickerColor}
            onChange={(e) => {
              setPickerColor(e.target.value);
              if (onChange && fieldName) {
                onChange(fieldName, e.target.value);
              }
            }}
            placeholder="#000000"
            sx={{
              width: 200,
              "& .MuiOutlinedInput-root": {
                backgroundColor: "rgba(255,255,255,0.1)",
                color: "#ffffff",
                "& fieldset": {
                  borderColor: "rgba(46, 204, 113, 0.3)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(46, 204, 113, 0.5)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#2ecc71",
                },
              },
              "& input": {
                color: "#ffffff",
              },
            }}
          />
        </Stack>
      </Popover>
    </>
  );
}

export default function LevelEditor({
  level,
  onSave,
  isSaving,
  onUploadLogo,
  isUploadingLogo,
}) {
  const [formValues, setFormValues] = useState(() => ({
    backgroundColor: "",
    dot1Color: "",
    dot2Color: "",
    dot3Color: "",
    dot4Color: "",
    dot5Color: "",
    logoUrl: "",
  }));
  const fileInputRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    if (level) {
      setFormValues({
        backgroundColor: level.backgroundColor || "",
        dot1Color: level.dot1Color || "",
        dot2Color: level.dot2Color || "",
        dot3Color: level.dot3Color || "",
        dot4Color: level.dot4Color || "",
        dot5Color: level.dot5Color || "",
        logoUrl: level.logoUrl || "",
      });
    }
  }, [level]);

  const hasChanges = useMemo(() => {
    if (!level) return false;
    return (
      colorFields.some(
        ({ name }) => formValues[name] !== (level[name] || "")
      ) || formValues.logoUrl !== (level.logoUrl || "")
    );
  }, [formValues, level]);

  const autoSave = useCallback((values) => {
    if (!level) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      onSave(values, false);
    }, 500);
  }, [level, onSave]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => {
      const newValues = { ...prev, [name]: value };
      autoSave(newValues);
      return newValues;
    });
  };

  const handleColorPickerChange = (fieldName, value) => {
    setFormValues((prev) => {
      const newValues = { ...prev, [fieldName]: value };
      autoSave(newValues);
      return newValues;
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!level) return;
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    onSave({ ...formValues }, true);
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !onUploadLogo) {
      return;
    }
    try {
      const uploadedUrl = await onUploadLogo(file);
      if (uploadedUrl) {
        const newValues = { ...formValues, logoUrl: uploadedUrl };
        setFormValues(newValues);
        // Call onSave after state update completes to avoid React warning
        queueMicrotask(() => {
          onSave(newValues, false);
        });
      }
    } finally {
      // reset input so same file can be reselected
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  if (!level) {
    return (
      <Stack spacing={2} alignItems="center" sx={{ height: "100%" }} justifyContent="center">
        <Typography variant="h6" fontWeight={700} sx={{ color: "#ffffff" }}>
          No level selected
        </Typography>
        <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)", textAlign: "center" }}>
          Choose a level from the directory to adjust its DotBack configuration, or create a new level to get started.
        </Typography>
      </Stack>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ color: "#ffffff" }}>
            Level {level.level} Configuration
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5, color: "rgba(255, 255, 255, 0.7)" }}>
            Adjust the background, dot palette, and logo for this stage. Preview updates in real time on the right.
          </Typography>
        </Box>

        <Stack spacing={2}>
          {leftSideFields.map(({ name, label }) => (
            <Box key={name}>
              <TextField
                fullWidth
                label={label}
                name={name}
                value={formValues[name]}
                onChange={handleInputChange}
                placeholder="e.g. #5ac8fa or rgba(90,200,250,0.5)"
                helperText={helperText}
                InputProps={{
                  sx: {
                    borderRadius: 2.5,
                    backgroundColor: "rgba(255,255,255,0.1)",
                    color: "#ffffff",
                    "& input": {
                      color: "#ffffff",
                      "&::placeholder": {
                        color: "rgba(255, 255, 255, 0.5)",
                        opacity: 1,
                      },
                    },
                  },
                  endAdornment: (
                    <InputAdornment position="end">
                      <ColorSwatch
                        color={formValues[name]}
                        onChange={handleColorPickerChange}
                        fieldName={name}
                      />
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{
                  sx: {
                    color: "rgba(255, 255, 255, 0.7)",
                    "&.Mui-focused": {
                      color: "#2ecc71",
                    },
                  },
                }}
                FormHelperTextProps={{
                  sx: {
                    color: "rgba(255, 255, 255, 0.6)",
                  },
                }}
              />
            </Box>
          ))}
        </Stack>

        <Stack spacing={2}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ color: "#ffffff" }}>
            Logo
          </Typography>
          <input
            type="file"
            accept="image/*"
            hidden
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <Button
            variant="outlined"
            startIcon={
              isUploadingLogo ? (
                <CircularProgress size={18} />
              ) : (
                <CloudUploadIcon />
              )
            }
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingLogo}
            sx={{
              px: 5,
              py: 1.4,
              alignSelf: "flex-start",
              borderRadius: 3,
              borderColor: "rgba(46, 204, 113, 0.5)",
              backgroundColor: "rgba(46, 204, 113, 0.1)",
              color: "#2ecc71",
              "&:hover": {
                borderColor: "#2ecc71",
                backgroundColor: "rgba(46, 204, 113, 0.2)",
              },
            }}
          >
            Upload Logo
          </Button>
        </Stack>

        {/* <Box>
          <Button
            type="submit"
            disabled={!hasChanges || isSaving}
            size="large"
            variant="contained"
            startIcon={
              isSaving ? <CircularProgress size={20} /> : <SaveIcon />
            }
            sx={{
              px: 5,
              py: 1.4,
              alignSelf: "flex-start",
              borderRadius: 3,
              boxShadow: "0 18px 30px rgba(90,200,250,0.35)",
            }}
          >
            Save Changes
          </Button>
        </Box> */}
      </Stack>
    </Box>
  );
}

