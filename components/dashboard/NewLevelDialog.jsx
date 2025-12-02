"use client";

import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
  InputAdornment,
  Popover,
  IconButton,
  Paper,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from "@mui/material";
import { useRef, useState, useEffect } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { getLogoUrl } from "@/lib/logo";

// Predefined dot sizes that cycle: 20, 40, 60, 80, 100
const PREDEFINED_DOT_SIZES = [20, 40, 60, 80, 100];

// Predefined size scores that cycle: 10, 7, 5, 3, 1
const PREDEFINED_SIZE_SCORES = [10, 7, 5, 3, 1];

// Theme default colors that cycle when adding dots
const THEME_DEFAULT_COLORS = [
  "#e92434", // red
  "#ff9e1d", // orange
  "#e9e224", // yellow
  "#36ceba", // cyan
  "#000000", // black
];

// Color scores mapping
const COLOR_SCORES = {
  "#e92434": 5,    // red
  "#ff9e1d": 15,   // orange
  "#e9e224": 10,   // yellow
  "#000000": 20,   // black
  "#36ceba": 25,   // cyan
  "#ffffff": 30,   // white
  "#fff": 30,      // white (alternative)
  "white": 30,
  "black": 20,
  "red": 5,
  "yellow": 10,
  "orange": 15,
  "cyan": 25,
};

// Get predefined dot size based on index (cycles through sizes)
function getPredefinedDotSize(dotIndex) {
  return PREDEFINED_DOT_SIZES[dotIndex % PREDEFINED_DOT_SIZES.length];
}

// Strip "px" or other units from size for display in input fields
function stripSizeUnit(size) {
  if (!size) return "";
  const sizeStr = String(size).trim();
  // Remove common CSS units
  return sizeStr.replace(/px|em|rem|%|vh|vw|cm|mm|in|pt|pc$/i, "").trim();
}

// Get predefined size score based on index (cycles through scores)
function getPredefinedSizeScore(dotIndex) {
  return PREDEFINED_SIZE_SCORES[dotIndex % PREDEFINED_SIZE_SCORES.length];
}

// Get color score based on color value
function getColorScore(color) {
  if (!color) return 0;
  
  const normalizedColor = color.trim().toLowerCase();
  
  // Check exact matches first
  if (COLOR_SCORES[normalizedColor] !== undefined) {
    return COLOR_SCORES[normalizedColor];
  }
  
  // Check hex colors (normalize to lowercase)
  const hexColor = normalizedColor.startsWith("#") 
    ? normalizedColor 
    : `#${normalizedColor}`;
  
  if (COLOR_SCORES[hexColor] !== undefined) {
    return COLOR_SCORES[hexColor];
  }
  
  // Try to match common color names in hex
  const colorMap = {
    "#e92434": 5,    // red
    "#ff9e1d": 15,   // orange
    "#e9e224": 10,   // yellow
    "#000000": 20,   // black
    "#36ceba": 25,   // cyan
    "#ffffff": 30,   // white
    "#fff": 30,
  };
  
  // Normalize hex color (remove spaces, ensure # prefix)
  const cleanHex = hexColor.replace(/\s+/g, "").toLowerCase();
  if (colorMap[cleanHex] !== undefined) {
    return colorMap[cleanHex];
  }
  
  // For other colors, default to 0
  return 0;
}

const defaultFormState = {
  level: "",
  backgroundColor: "#f4f9ff",
  backgroundType: "color", // "color", "colorLogo", or "image"
  backgroundImageUrl: "",
  dots: [],
  logoUrl: "",
};

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
            boxShadow: "0 6px 15px rgba(233, 226, 36, 0.4)",
            border: "1px solid rgba(233, 226, 36, 0.8)",
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
            border: "1px solid rgba(233, 226, 36, 0.3)",
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
              border: "1px solid rgba(233, 226, 36, 0.3)",
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
                  borderColor: "rgba(233, 226, 36, 0.3)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(233, 226, 36, 0.5)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#e9e224",
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

export default function NewLevelDialog({
  open,
  onClose,
  onCreate,
  isSubmitting,
  onUploadLogo,
  isUploadingLogo = false,
  existingLevels = [],
  onUploadBackgroundImage,
  isUploadingBackgroundImage = false,
}) {
  const [formValues, setFormValues] = useState(defaultFormState);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [backgroundImageError, setBackgroundImageError] = useState(null);
  const fileInputRef = useRef(null);
  const backgroundImageInputRef = useRef(null);
  const previewLogoUrl = getLogoUrl(formValues.logoUrl);
  // Get full URL for background image preview - use getLogoUrl to format it properly
  const previewBackgroundImageUrl = formValues.backgroundImageUrl 
    ? getLogoUrl(formValues.backgroundImageUrl)
    : null;

  // Calculate next available level number
  const getNextAvailableLevel = () => {
    if (!Array.isArray(existingLevels) || existingLevels.length === 0) {
      return 1;
    }
    
    // Get all existing level numbers
    const existingLevelNumbers = existingLevels
      .map((level) => level.level)
      .filter((level) => typeof level === 'number' && level >= 1 && level <= 10)
      .sort((a, b) => a - b);
    
    // Find the first gap in the sequence, or return next number after the highest
    for (let i = 1; i <= 10; i++) {
      if (!existingLevelNumbers.includes(i)) {
        return i;
      }
    }
    
    // If all levels 1-10 exist, return null (but this shouldn't happen due to MAX_LEVELS check)
    return null;
  };

  const resetAndClose = () => {
    setFormValues(defaultFormState);
    setError(null);
    setImageError(null);
    setBackgroundImageError(null);
    onClose?.();
  };

  // Auto-fill level number when dialog opens
  useEffect(() => {
    if (open) {
      const nextLevel = getNextAvailableLevel();
      if (nextLevel !== null) {
        setFormValues((prev) => ({
          ...prev,
          level: String(nextLevel),
        }));
      }
      // Reset error when dialog opens
      setError(null);
      setImageError(null);
      setBackgroundImageError(null);
    }
  }, [open, existingLevels]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    // Clear error when user changes level number
    if (name === "level") {
      setError(null);
    }
  };

  const handleAddDot = () => {
    setFormValues((prev) => {
      const newDotIndex = prev.dots.length;
      const predefinedSize = getPredefinedDotSize(newDotIndex);
      const predefinedSizeScore = getPredefinedSizeScore(newDotIndex);
      // Cycle through theme default colors
      const defaultColor = THEME_DEFAULT_COLORS[newDotIndex % THEME_DEFAULT_COLORS.length];
      const colorScore = getColorScore(defaultColor);
      const totalScore = predefinedSizeScore + colorScore;
      
      return {
        ...prev,
        dots: [
          ...prev.dots,
          {
            color: defaultColor,
            size: String(predefinedSize),
            sizeScore: predefinedSizeScore,
            colorScore: colorScore,
            totalScore: totalScore,
          },
        ],
      };
    });
  };

  const handleDotChange = (index, field, value) => {
    setFormValues((prev) => {
      const updatedDots = prev.dots.map((dot, i) => {
        if (i === index) {
          const updated = { ...dot };
          
          // Handle different field types
          if (field === "color") {
            updated.color = value;
            updated.colorScore = getColorScore(value);
          } else if (field === "sizeScore") {
            // Convert to number immediately
            updated.sizeScore = value === "" ? 0 : Number(value) || 0;
          } else if (field === "colorScore") {
            // Convert to number immediately
            updated.colorScore = value === "" ? 0 : Number(value) || 0;
          } else if (field === "size") {
            updated.size = value;
            // If sizeScore is not set, update it
            if (!dot.sizeScore || dot.sizeScore === 0 || dot.sizeScore === "0") {
              updated.sizeScore = getPredefinedSizeScore(index);
            }
          } else {
            updated[field] = value;
          }
          
          // Convert sizeScore and colorScore to numbers for calculation
          const sizeScoreNum = typeof updated.sizeScore === 'number' 
            ? updated.sizeScore 
            : (Number(updated.sizeScore) || 0);
          const colorScoreNum = typeof updated.colorScore === 'number' 
            ? updated.colorScore 
            : (Number(updated.colorScore) || 0);
          
          // Update totalScore automatically
          updated.totalScore = sizeScoreNum + colorScoreNum;
          
          return updated;
        }
        return dot;
      });
      
      return {
        ...prev,
        dots: updatedDots,
      };
    });
  };

  const handleDotColorChange = (index, value) => {
    // When color changes, automatically update colorScore and totalScore
    const colorScore = getColorScore(value);
    setFormValues((prev) => ({
      ...prev,
      dots: prev.dots.map((dot, i) => {
        if (i === index) {
          const sizeScoreNum = typeof dot.sizeScore === 'number' ? dot.sizeScore : (Number(dot.sizeScore) || 0);
          return {
            ...dot,
            color: value,
            colorScore: colorScore,
            totalScore: sizeScoreNum + colorScore,
          };
        }
        return dot;
      }),
    }));
  };

  const handleRemoveDot = (index) => {
    setFormValues((prev) => ({
      ...prev,
      dots: prev.dots.filter((_, i) => i !== index),
    }));
  };

  const handleColorPickerChange = (fieldName, value) => {
    setFormValues((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleDefaultColors = () => {
    // Use the same theme default colors
    const defaultColorPalette = THEME_DEFAULT_COLORS;

    setFormValues((prev) => {
      const currentDotCount = prev.dots.length;
      
      // If no dots exist, don't add any
      if (currentDotCount === 0) {
        return {
          ...prev,
          backgroundColor: "#ffffff",
        };
      }

      // Update existing dots with default colors (cycling through palette if needed)
      // Also update colorScore and totalScore based on new colors
      const updatedDots = prev.dots.map((dot, index) => {
        const newColor = defaultColorPalette[index % defaultColorPalette.length];
        const colorScore = getColorScore(newColor);
        const sizeScoreNum = typeof dot.sizeScore === 'number' ? dot.sizeScore : (Number(dot.sizeScore) || 0);
        return {
          ...dot,
          color: newColor,
          colorScore: colorScore,
          totalScore: sizeScoreNum + colorScore,
        };
      });

      return {
        ...prev,
        backgroundColor: "#ffffff",
        dots: updatedDots,
      };
    });
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !onUploadLogo) {
      return;
    }

    const fileType = file.type.toLowerCase();
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    const validExtensions = ['.png', '.jpg', '.jpeg'];
    const fileName = file.name.toLowerCase();
    
    const isValidType = validTypes.includes(fileType) || 
                       validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isValidType) {
      setImageError('Please upload only PNG or JPG images.');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setImageError(null);
    try {
      const uploadedUrl = await onUploadLogo(file);
      if (uploadedUrl) {
        setFormValues((prev) => ({ ...prev, logoUrl: uploadedUrl }));
      }
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleBackgroundImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !onUploadBackgroundImage) {
      return;
    }

    const fileType = file.type.toLowerCase();
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    const validExtensions = ['.png', '.jpg', '.jpeg'];
    const fileName = file.name.toLowerCase();
    
    const isValidType = validTypes.includes(fileType) || 
                       validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isValidType) {
      setBackgroundImageError('Please upload only PNG or JPG images.');
      if (backgroundImageInputRef.current) {
        backgroundImageInputRef.current.value = '';
      }
      return;
    }

    setBackgroundImageError(null);
    try {
      const uploadedUrl = await onUploadBackgroundImage(file);
      if (uploadedUrl) {
        setFormValues((prev) => ({ ...prev, backgroundImageUrl: uploadedUrl }));
      }
    } finally {
      if (backgroundImageInputRef.current) {
        backgroundImageInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    const levelNumber = Number(formValues.level);
    if (!Number.isInteger(levelNumber) || levelNumber < 1 || levelNumber > 10) {
      setError("Level must be an integer between 1 and 10.");
      return;
    }

    try {
      // Determine background value based on type
      const backgroundValue = formValues.backgroundType === "image" 
        ? formValues.backgroundImageUrl 
        : formValues.backgroundColor;

      await onCreate({
        level: levelNumber,
        background: backgroundValue,
        backgroundType: formValues.backgroundType, // Keep for UI logic
        dots: formValues.dots,
        logoUrl: formValues.backgroundType === "image" ? "" : formValues.logoUrl,
      });
      resetAndClose();
    } catch (err) {
      setError(err.message || "Unable to create level.");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={resetAndClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        component: "form",
        onSubmit: handleSubmit,
        sx: {
          borderRadius: 4,
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(233, 226, 36, 0.1), 0 0 40px rgba(233, 226, 36, 0.1)",
          background:
            "linear-gradient(135deg, rgba(26, 26, 26, 0.95), rgba(233, 226, 36, 0.08), rgba(26, 188, 156, 0.1))",
          border: "1px solid rgba(233, 226, 36, 0.3)",
        },
      }}
    >
      <DialogTitle sx={{ pb: 2, borderBottom: "1px solid rgba(233, 226, 36, 0.2)" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "linear-gradient(135deg, rgba(233, 226, 36, 0.3), rgba(26, 188, 156, 0.3))",
                color: "#ffffff",
                border: "1px solid rgba(233, 226, 36, 0.4)",
                boxShadow: "0 12px 24px rgba(233, 226, 36, 0.35)",
              }}
            >
              <AddIcon />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ color: "#ffffff" }}>
                Create a New Level
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                Define the level identifier and its initial visual palette.
              </Typography>
            </Box>
          </Stack>
          <Button
            variant="outlined"
            onClick={handleDefaultColors}
            sx={{
              borderRadius: 2,
              borderColor: "rgba(233, 226, 36, 0.5)",
              backgroundColor: "rgba(233, 226, 36, 0.1)",
              color: "#e9e224",
              px: 2,
              py: 1,
              whiteSpace: "nowrap",
              "&:hover": {
                borderColor: "#e9e224",
                backgroundColor: "rgba(233, 226, 36, 0.2)",
              },
            }}
          >
            Default Color
          </Button>
        </Stack>
      </DialogTitle>
      <DialogContent dividers sx={{ "&.MuiDialogContent-dividers": { borderColor: "rgba(233, 226, 36, 0.2)" } }}>
        <Stack spacing={2.5}>
          <TextField
            autoFocus
            type="number"
            label="Level Number"
            name="level"
            value={formValues.level}
            onChange={handleChange}
            required
            inputProps={{
              min: 1,
              max: 10,
            }}
            helperText="Enter an integer between 1 and 10."
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
                  color: "#e9e224",
                },
              },
            }}
            FormHelperTextProps={{
              sx: {
                color: "rgba(255, 255, 255, 0.6)",
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "rgba(233, 226, 36, 0.3)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(233, 226, 36, 0.5)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#e9e224",
                },
                backgroundColor: "rgba(26, 26, 26, 0.5)",
              },
            }}
          />

          {/* Background Type Selection */}
          <FormControl component="fieldset">
            <FormLabel
              component="legend"
              sx={{
                color: "rgba(255, 255, 255, 0.7)",
                "&.Mui-focused": {
                  color: "#e9e224",
                },
                mb: 1,
              }}
            >
              Background Type
            </FormLabel>
            <RadioGroup
              row
              value={formValues.backgroundType}
              onChange={(e) => {
                setFormValues((prev) => ({
                  ...prev,
                  backgroundType: e.target.value,
                  // Reset backgroundImageUrl when switching to non-image type
                  backgroundImageUrl: e.target.value !== "image" ? "" : prev.backgroundImageUrl,
                  // Reset logoUrl when switching to image type
                  logoUrl: e.target.value === "image" ? "" : prev.logoUrl,
                }));
              }}
              sx={{
                "& .MuiFormControlLabel-label": {
                  color: "#ffffff",
                },
                "& .MuiRadio-root": {
                  color: "rgba(233, 226, 36, 0.5)",
                  "&.Mui-checked": {
                    color: "#e9e224",
                  },
                },
              }}
            >
              <FormControlLabel
                value="color"
                control={<Radio />}
                label="Background Color"
              />
              <FormControlLabel
                value="colorLogo"
                control={<Radio />}
                label="Background Color & Logo"
              />
              <FormControlLabel
                value="image"
                control={<Radio />}
                label="Background Image"
              />
            </RadioGroup>
          </FormControl>

          {/* Background Color Field - Show for "color" and "colorLogo" */}
          {(formValues.backgroundType === "color" || formValues.backgroundType === "colorLogo") && (
            <TextField
              label="Background Color"
              name="backgroundColor"
              value={formValues.backgroundColor}
              onChange={handleChange}
              InputProps={{
                sx: {
                  color: "#ffffff",
                  "& input::placeholder": { color: "rgba(255, 255, 255, 0.5)", opacity: 1 },
                },
                endAdornment: (
                  <InputAdornment position="end">
                    <ColorSwatch
                      color={formValues.backgroundColor}
                      onChange={handleColorPickerChange}
                      fieldName="backgroundColor"
                    />
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{
                sx: {
                  color: "rgba(255, 255, 255, 0.7)",
                  "&.Mui-focused": {
                    color: "#e9e224",
                  },
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "rgba(233, 226, 36, 0.3)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(233, 226, 36, 0.5)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#e9e224",
                  },
                  backgroundColor: "rgba(26, 26, 26, 0.5)",
                },
              }}
            />
          )}

          {/* Background Image Upload - Show for "image" */}
          {formValues.backgroundType === "image" && (
            <Stack spacing={1.5}>
              <Typography variant="subtitle2" sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
                Background Image
              </Typography>
              {backgroundImageError && (
                <Typography variant="body2" sx={{ color: "#ff5252", mt: 0.5 }}>
                  {backgroundImageError}
                </Typography>
              )}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "stretch", sm: "center" }}>
                <Box
                  sx={{
                    flex: 1,
                    minHeight: 200,
                    borderRadius: 3,
                    border: "1px dashed rgba(233, 226, 36, 0.4)",
                    backgroundColor: previewBackgroundImageUrl ? "transparent" : "rgba(26, 26, 26, 0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    position: "relative",
                    backgroundImage: previewBackgroundImageUrl
                      ? `url(${previewBackgroundImageUrl})`
                      : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }}
                >
                  {!previewBackgroundImageUrl && (
                    <Typography sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
                      No background image uploaded yet
                    </Typography>
                  )}
                </Box>

                <Box>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    hidden
                    ref={backgroundImageInputRef}
                    onChange={handleBackgroundImageChange}
                  />
                  <Button
                    variant="outlined"
                    startIcon={
                      isUploadingBackgroundImage ? (
                        <CircularProgress size={18} />
                      ) : (
                        <CloudUploadIcon />
                      )
                    }
                    onClick={() => backgroundImageInputRef.current?.click()}
                    disabled={isUploadingBackgroundImage || !onUploadBackgroundImage}
                    sx={{
                      px: 4,
                      py: 1.2,
                      borderRadius: 3,
                      borderColor: "rgba(233, 226, 36, 0.5)",
                      backgroundColor: "rgba(233, 226, 36, 0.1)",
                      color: "#e9e224",
                      whiteSpace: "nowrap",
                      "&:hover": {
                        borderColor: "#e9e224",
                        backgroundColor: "rgba(233, 226, 36, 0.2)",
                      },
                      "&:disabled": {
                        color: "rgba(255, 255, 255, 0.5)",
                        borderColor: "rgba(255, 255, 255, 0.2)",
                      },
                    }}
                  >
                    {formValues.backgroundImageUrl ? "Replace Background" : "Upload Background"}
                  </Button>
                </Box>
              </Stack>
            </Stack>
          )}

          <Divider sx={{ borderColor: "rgba(233, 226, 36, 0.2)" }} />

          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1" fontWeight={600} sx={{ color: "#ffffff" }}>
                Add Configuration
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddDot}
                sx={{
                  borderRadius: 2,
                  borderColor: "rgba(233, 226, 36, 0.5)",
                  backgroundColor: "rgba(233, 226, 36, 0.1)",
                  color: "#e9e224",
                  "&:hover": {
                    borderColor: "#e9e224",
                    backgroundColor: "rgba(233, 226, 36, 0.2)",
                  },
                }}
              >
                Add Dot
              </Button>
            </Stack>

            {formValues.dots.length === 0 ? (
              <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.6)", textAlign: "center", py: 2 }}>
                No dots added yet. Click "Add Dot" to add your first dot.
              </Typography>
            ) : (
              <Box
                sx={{
                  maxHeight: "500px",
                  overflowY: "auto",
                  overflowX: "hidden",
                  pr: 1,
                  "&::-webkit-scrollbar": {
                    width: "8px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "rgba(26, 26, 26, 0.5)",
                    borderRadius: "4px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "rgba(233, 226, 36, 0.4)",
                    borderRadius: "4px",
                    "&:hover": {
                      background: "rgba(233, 226, 36, 0.6)",
                    },
                  },
                }}
              >
                <Stack spacing={2}>
                  {formValues.dots.map((dot, index) => (
                    <Paper
                      key={index}
                      sx={{
                        p: 2,
                        backgroundColor: "rgba(26, 26, 26, 0.5)",
                        border: "1px solid rgba(233, 226, 36, 0.3)",
                        borderRadius: 2,
                      }}
                    >
                      <Stack spacing={2}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle2" sx={{ color: "#ffffff", fontWeight: 600 }}>
                            Dot {index + 1}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveDot(index)}
                            sx={{
                              color: "#ff5252",
                              "&:hover": {
                                backgroundColor: "rgba(255, 82, 82, 0.1)",
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>

                        <TextField
                          fullWidth
                          size="small"
                          label="Color"
                          value={dot.color}
                          onChange={(e) => handleDotChange(index, "color", e.target.value)}
                          placeholder="e.g. #5ac8fa"
                          InputProps={{
                            sx: {
                              color: "#ffffff",
                              "& input::placeholder": { color: "rgba(255, 255, 255, 0.5)", opacity: 1 },
                            },
                            endAdornment: (
                              <InputAdornment position="end">
                                <ColorSwatch
                                  color={dot.color}
                                  onChange={(fieldName, value) => handleDotColorChange(index, value)}
                                  fieldName={`dot${index}Color`}
                                />
                              </InputAdornment>
                            ),
                          }}
                          InputLabelProps={{
                            sx: {
                              color: "rgba(255, 255, 255, 0.7)",
                              "&.Mui-focused": {
                                color: "#e9e224",
                              },
                            },
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              "& fieldset": {
                                borderColor: "rgba(233, 226, 36, 0.3)",
                              },
                              "&:hover fieldset": {
                                borderColor: "rgba(233, 226, 36, 0.5)",
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: "#e9e224",
                              },
                              backgroundColor: "rgba(255,255,255,0.05)",
                            },
                          }}
                        />

                        <Stack direction="row" spacing={2}>
                          <TextField
                            fullWidth
                            size="small"
                            type="text"
                            label="Size"
                            value={dot.size || String(getPredefinedDotSize(index))}
                            onChange={(e) => handleDotChange(index, "size", e.target.value)}
                            placeholder="e.g. 36"
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
                                  color: "#e9e224",
                                },
                              },
                            }}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                "& fieldset": {
                                  borderColor: "rgba(233, 226, 36, 0.3)",
                                },
                                "&:hover fieldset": {
                                  borderColor: "rgba(233, 226, 36, 0.5)",
                                },
                                "&.Mui-focused fieldset": {
                                  borderColor: "#e9e224",
                                },
                                backgroundColor: "rgba(255,255,255,0.05)",
                              },
                            }}
                          />

                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            label="Size Score"
                            value={dot.sizeScore !== undefined && dot.sizeScore !== null ? (typeof dot.sizeScore === 'number' ? dot.sizeScore : Number(dot.sizeScore) || 0) : 0}
                            onChange={(e) => {
                              const newValue = e.target.value;
                              handleDotChange(index, "sizeScore", newValue);
                            }}
                            placeholder="e.g. 0"
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
                                  color: "#e9e224",
                                },
                              },
                            }}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                "& fieldset": {
                                  borderColor: "rgba(233, 226, 36, 0.3)",
                                },
                                "&:hover fieldset": {
                                  borderColor: "rgba(233, 226, 36, 0.5)",
                                },
                                "&.Mui-focused fieldset": {
                                  borderColor: "#e9e224",
                                },
                                backgroundColor: "rgba(255,255,255,0.05)",
                              },
                            }}
                          />

                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            label="Color Score"
                            value={dot.colorScore !== undefined && dot.colorScore !== null ? (typeof dot.colorScore === 'number' ? dot.colorScore : Number(dot.colorScore) || 0) : 0}
                            onChange={(e) => {
                              const newValue = e.target.value;
                              handleDotChange(index, "colorScore", newValue);
                            }}
                            placeholder="e.g. 0"
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
                                  color: "#e9e224",
                                },
                              },
                            }}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                "& fieldset": {
                                  borderColor: "rgba(233, 226, 36, 0.3)",
                                },
                                "&:hover fieldset": {
                                  borderColor: "rgba(233, 226, 36, 0.5)",
                                },
                                "&.Mui-focused fieldset": {
                                  borderColor: "#e9e224",
                                },
                                backgroundColor: "rgba(255,255,255,0.05)",
                              },
                            }}
                          />

                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            label="Score (Total)"
                            value={(() => {
                              const sizeScore = typeof dot.sizeScore === 'number' ? dot.sizeScore : (parseFloat(dot.sizeScore || "0") || 0);
                              const colorScore = typeof dot.colorScore === 'number' ? dot.colorScore : (parseFloat(dot.colorScore || "0") || 0);
                              return sizeScore + colorScore;
                            })()}
                            disabled
                            InputProps={{
                              sx: {
                                color: "#ffffff",
                                "& input::placeholder": { color: "rgba(255, 255, 255, 0.5)", opacity: 1 },
                              },
                            }}
                            InputLabelProps={{
                              sx: {
                                color: "rgba(255, 255, 255, 0.7)",
                              },
                            }}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                "& fieldset": {
                                  borderColor: "rgba(233, 226, 36, 0.3)",
                                },
                                backgroundColor: "rgba(255,255,255,0.05)",
                                "&.Mui-disabled": {
                                  backgroundColor: "rgba(255,255,255,0.02)",
                                },
                              },
                            }}
                          />
                        </Stack>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>

          <Divider sx={{ borderColor: "rgba(233, 226, 36, 0.2)" }} />

          {/* Logo Section - Show only when backgroundType is "colorLogo" */}
          {formValues.backgroundType === "colorLogo" && (
            <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
              Logo (optional)
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "stretch", sm: "center" }}>
              <Box
                sx={{
                  flex: 1,
                  minHeight: 120,
                  borderRadius: 3,
                  border: "1px dashed rgba(233, 226, 36, 0.4)",
                  backgroundColor: "rgba(26, 26, 26, 0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {previewLogoUrl ? (
                  <Box
                    component="img"
                    src={previewLogoUrl}
                    alt="Uploaded logo preview"
                    sx={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <Typography sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
                    No logo uploaded yet
                  </Typography>
                )}
              </Box>

              <Box>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
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
                  disabled={isUploadingLogo || !onUploadLogo}
                  sx={{
                    px: 4,
                    py: 1.2,
                    borderRadius: 3,
                    borderColor: "rgba(233, 226, 36, 0.5)",
                    backgroundColor: "rgba(233, 226, 36, 0.1)",
                    color: "#e9e224",
                    whiteSpace: "nowrap",
                    "&:hover": {
                      borderColor: "#e9e224",
                      backgroundColor: "rgba(233, 226, 36, 0.2)",
                    },
                    "&:disabled": {
                      color: "rgba(255, 255, 255, 0.5)",
                      borderColor: "rgba(255, 255, 255, 0.2)",
                    },
                  }}
                >
                  {formValues.logoUrl ? "Replace Logo" : "Upload Logo"}
                </Button>
              </Box>
            </Stack>
            
            {imageError && (
              <Typography
                variant="body2"
                sx={{
                  color: "#ff5252",
                  backgroundColor: "rgba(255, 82, 82, 0.1)",
                  padding: 1.5,
                  borderRadius: 2,
                  border: "1px solid rgba(255, 82, 82, 0.3)",
                }}
              >
                {imageError}
              </Typography>
            )}
            </Stack>
          )}

          {error ? (
            <Typography 
              variant="body2" 
              sx={{ 
                color: "#ff5252",
                backgroundColor: "rgba(255, 82, 82, 0.1)",
                padding: 1.5,
                borderRadius: 2,
                border: "1px solid rgba(255, 82, 82, 0.3)",
              }}
            >
              {error}
            </Typography>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid rgba(233, 226, 36, 0.2)" }}>
        <Button 
          onClick={resetAndClose} 
          sx={{ 
            color: "rgba(255, 255, 255, 0.7)",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              color: "#ffffff",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          sx={{ 
            px: 3, 
            borderRadius: 3,
            background: "linear-gradient(135deg, #e9e224, #d4c920)",
            boxShadow:
              "0 8px 24px rgba(233, 226, 36, 0.4), 0 0 0 1px rgba(233, 226, 36, 0.2)",
            "&:hover": {
              background: "linear-gradient(135deg, #d4c920, #bfb01c)",
              boxShadow:
                "0 12px 32px rgba(233, 226, 36, 0.6), 0 0 0 1px rgba(233, 226, 36, 0.3)",
            },
            "&:disabled": {
              background: "rgba(233, 226, 36, 0.3)",
              color: "rgba(255, 255, 255, 0.5)",
            },
          }}
        >
          {isSubmitting ? "Creating..." : "Create Level"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
