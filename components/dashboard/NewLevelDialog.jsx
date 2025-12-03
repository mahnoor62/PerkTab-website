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
  Grid,
} from "@mui/material";
import { useRef, useState, useEffect } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { getLogoUrl } from "@/lib/logo";

// Predefined theme colors with default scores
const PREDEFINED_COLORS = [
  { color: "#e92434", score: 5 },    // red
  { color: "#ff9e1d", score: 15 },   // orange
  { color: "#e9e224", score: 10 },    // yellow
  { color: "#36ceba", score: 25 },   // cyan
  { color: "#000000", score: 20 },   // black
];

// Predefined dot sizes with default scores
const PREDEFINED_DOT_SIZES = [
  { size: "extra small", score: 10 },
  { size: "small", score: 7 },
  { size: "medium", score: 5 },
  { size: "large", score: 3 },
  { size: "extra large", score: 1 },
];

// Map size names to pixel values for UI display
const SIZE_TO_PIXELS = {
  "extra small": 20,
  "small": 40,
  "medium": 60,
  "large": 80,
  "extra large": 100,
};

// Get color score based on color value
function getColorScore(color) {
  if (!color) return 0;
  
  const normalizedColor = color.trim().toLowerCase();
  
  // Check exact matches in predefined colors
  for (const colorItem of PREDEFINED_COLORS) {
    if (colorItem.color.toLowerCase() === normalizedColor) {
      return colorItem.score;
    }
  }
  
  // Check hex colors (normalize to lowercase)
  const hexColor = normalizedColor.startsWith("#") 
    ? normalizedColor 
    : `#${normalizedColor}`;
  
  for (const colorItem of PREDEFINED_COLORS) {
    if (colorItem.color.toLowerCase() === hexColor) {
      return colorItem.score;
    }
  }
  
  // For other colors, default to 0
  return 0;
}

// Get a random color from the colors array
function getRandomColor(colors) {
  if (!colors || colors.length === 0) {
    return PREDEFINED_COLORS[0].color; // default to first predefined color
  }
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex].color;
}

// Get size name based on index (cycles through sizes)
function getSizeNameForDot(dotIndex) {
  return PREDEFINED_DOT_SIZES[dotIndex % PREDEFINED_DOT_SIZES.length].size;
}

// Capitalize size name for display (e.g., "extra small" -> "Extra Small")
function capitalizeSizeName(sizeStr) {
  if (!sizeStr) return "";
  const str = String(sizeStr).trim();
  // Split by space and capitalize each word
  return str
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

const defaultFormState = {
  level: "",
  backgroundColor: "#f4f9ff",
  backgroundType: "color", // "color", "colorLogo", or "image"
  backgroundImageUrl: "",
  colors: [...PREDEFINED_COLORS],
  dotSizes: [...PREDEFINED_DOT_SIZES],
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
          minWidth: 28,
          minHeight: 28,
          maxWidth: 28,
          maxHeight: 28,
          aspectRatio: "1/1",
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.6)",
          boxShadow: "0 4px 10px rgba(0,0,0,0.12)",
          background: color?.trim() || "transparent",
          cursor: "pointer",
          flexShrink: 0,
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
    setFormValues({
      ...defaultFormState,
      colors: [...PREDEFINED_COLORS],
      dotSizes: [...PREDEFINED_DOT_SIZES],
    });
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
          colors: prev.colors.length > 0 ? prev.colors : [...PREDEFINED_COLORS],
          dotSizes: prev.dotSizes.length > 0 ? prev.dotSizes : [...PREDEFINED_DOT_SIZES],
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
      // Use colors from the form (user-defined colors)
      const availableColors = prev.colors && prev.colors.length > 0 ? prev.colors : PREDEFINED_COLORS;
      // Cycle through colors evenly (round-robin) - no consecutive same colors
      const currentDotIndex = prev.dots.length;
      const colorIndex = currentDotIndex % availableColors.length;
      const selectedColorItem = availableColors[colorIndex];
      // Ensure color is always a string
      const selectedColor = String(selectedColorItem?.color || "#000000");
      // Use the score from the colors array, not calculate it
      const colorScore = selectedColorItem?.score || getColorScore(selectedColor);
      
      return {
        ...prev,
        dots: [
          ...prev.dots,
          {
            color: selectedColor,
            colorScore: colorScore,
          },
        ],
      };
    });
  };

  const handleDotChange = (index, field, value) => {
    setFormValues((prev) => {
      const updatedDots = prev.dots.map((dot, i) => {
        if (i === index) {
          return {
            ...dot,
            [field]: value,
          };
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
    setFormValues((prev) => {
      const colorScore = getColorScore(value);
      return {
        ...prev,
        dots: prev.dots.map((dot, i) => {
          if (i === index) {
            return {
              ...dot,
              color: value,
              colorScore: colorScore,
            };
          }
          return dot;
        }),
      };
    });
  };

  const handleColorChange = (index, field, value) => {
    setFormValues((prev) => {
      const updatedColors = prev.colors.map((colorItem, i) => {
        if (i === index) {
          return {
            ...colorItem,
            [field]: field === "score" ? (value === "" ? 0 : Number(value) || 0) : value,
          };
        }
        return colorItem;
      });
      return {
        ...prev,
        colors: updatedColors,
      };
    });
  };

  const handleAddColor = () => {
    setFormValues((prev) => ({
      ...prev,
      colors: [
        ...prev.colors,
        { color: "#000000", score: 0 },
      ],
    }));
  };

  const handleRemoveColor = (index) => {
    setFormValues((prev) => {
      // Ensure we don't remove the last color
      const validColors = (prev.colors || []).filter((c) => c != null && c.color);
      if (validColors.length <= 1) {
        console.warn("[handleRemoveColor] Cannot remove the last color");
        return prev;
      }
      
      // Validate index
      if (index < 0 || index >= validColors.length) {
        console.warn(`[handleRemoveColor] Invalid index ${index}`);
        return prev;
      }
      
      // Get the color being deleted (normalize for comparison)
      const deletedColor = String(validColors[index].color || "").trim().toLowerCase();
      
      // Filter out dots that use the deleted color
      // Compare colors case-insensitively and after trimming
      const remainingDots = (prev.dots || []).filter((dot) => {
        if (!dot || !dot.color) return true; // Keep dots without color
        const dotColor = String(dot.color || "").trim().toLowerCase();
        return dotColor !== deletedColor;
      });
      
      return {
        ...prev,
        colors: prev.colors.filter((_, i) => i !== index),
        dots: remainingDots,
      };
    });
  };

  const handleDotSizeChange = (index, field, value) => {
    setFormValues((prev) => {
      const updatedDotSizes = prev.dotSizes.map((sizeItem, i) => {
        if (i === index) {
          return {
            ...sizeItem,
            [field]: field === "score" ? (value === "" ? 0 : Number(value) || 0) : value,
          };
        }
        return sizeItem;
      });
      return {
        ...prev,
        dotSizes: updatedDotSizes,
      };
    });
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


  // Prevent form submission when pressing Enter in color or dot size fields
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();
    }
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

      // Always ensure dotSizes are sent with default scores if empty or invalid
      let dotSizesToSave = PREDEFINED_DOT_SIZES.map((s) => ({ size: s.size, score: s.score }));
      if (formValues.dotSizes && Array.isArray(formValues.dotSizes) && formValues.dotSizes.length > 0) {
        // Validate that all items have size property
        const validDotSizes = formValues.dotSizes.filter((s) => s && s.size);
        if (validDotSizes.length > 0) {
          dotSizesToSave = validDotSizes.map((s) => ({
            size: s.size || "",
            score: typeof s.score === 'number' ? s.score : (Number(s.score) || 0),
          }));
        }
      }

      await onCreate({
        level: levelNumber,
        background: backgroundValue,
        backgroundType: formValues.backgroundType, // Keep for UI logic
        colors: formValues.colors && formValues.colors.length > 0 ? formValues.colors : PREDEFINED_COLORS,
        dotSizes: dotSizesToSave, // Always send dotSizes with structure: {size: String, score: Number}
        dots: formValues.dots.map((dot) => ({
          color: String(dot.color || ""),
          colorScore: dot.colorScore !== undefined ? dot.colorScore : getColorScore(dot.color),
        })),
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

          {/* Background Color Field - Show for "color" */}
          {formValues.backgroundType === "color" && (
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

          {/* Background Color & Logo - Show for "colorLogo" */}
          {formValues.backgroundType === "colorLogo" && (
            <Stack spacing={2}>
              <TextField
                fullWidth
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
              <Stack spacing={1.5}>
                <Typography variant="subtitle2" sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
                  Logo
                </Typography>
                {imageError && (
                  <Typography variant="body2" sx={{ color: "#ff5252", mt: 0.5 }}>
                    {imageError}
                  </Typography>
                )}
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "stretch", sm: "center" }}>
                  <Box
                    sx={{
                      width: { xs: "100%", sm: 200 },
                      height: 120,
                      borderRadius: 3,
                      border: "1px dashed rgba(233, 226, 36, 0.4)",
                      backgroundColor: previewLogoUrl ? "transparent" : "rgba(26, 26, 26, 0.5)",
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
                        alt="Logo preview"
                        sx={{
                          maxWidth: "90%",
                          maxHeight: "90%",
                          objectFit: "contain",
                        }}
                      />
                    ) : (
                      <Typography sx={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "0.875rem" }}>
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
              </Stack>
            </Stack>
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
                    width: { xs: "100%", sm: 200 },
                    height: 120,
                    borderRadius: 3,
                    border: "1px dashed rgba(233, 226, 36, 0.4)",
                    backgroundColor: previewBackgroundImageUrl ? "transparent" : "rgba(26, 26, 26, 0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  {previewBackgroundImageUrl ? (
                    <Box
                      component="img"
                      src={previewBackgroundImageUrl}
                      alt="Background preview"
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: 3,
                      }}
                    />
                  ) : (
                    <Typography sx={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "0.875rem" }}>
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
            <Typography variant="subtitle1" fontWeight={600} sx={{ color: "#ffffff" }}>
              Edit Configuration
            </Typography>

            {/* Colors Configuration Panel */}
            <Paper
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
                    Colors
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleAddColor}
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
                    Add Color
                  </Button>
                </Stack>
                <Box
                  sx={{
                    maxHeight: "400px",
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
                  <Grid container spacing={2}>
                    {formValues.colors.map((colorItem, index) => (
                      <Grid item xs={12} key={index}>
                        <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ pt: 1 }}>
                          <Box sx={{ pt: 0.5 }}>
                            <ColorSwatch
                              color={colorItem.color}
                              onChange={(fieldName, value) => handleColorChange(index, "color", value)}
                              fieldName={`color${index}`}
                            />
                          </Box>
                          <TextField
                            fullWidth
                            size="small"
                            label="Color"
                            value={colorItem.color}
                            onChange={(e) => handleColorChange(index, "color", e.target.value)}
                            onKeyDown={handleKeyDown}
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
                            size="small"
                            type="number"
                            label="Score"
                            value={colorItem.score}
                            onChange={(e) => handleColorChange(index, "score", e.target.value)}
                            onKeyDown={handleKeyDown}
                            sx={{
                              width: 100,
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
                                color: "#ffffff",
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
                          />
                          <Box sx={{ pt: 0.5 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveColor(index)}
                              sx={{
                                color: "#ff5252",
                                "&:hover": {
                                  backgroundColor: "rgba(255, 82, 82, 0.1)",
                                },
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Stack>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Stack>
            </Paper>

            {/* Dot Sizes Configuration Panel */}
            <Paper
              sx={{
                p: 2,
                backgroundColor: "rgba(26, 26, 26, 0.5)",
                border: "1px solid rgba(233, 226, 36, 0.3)",
                borderRadius: 2,
              }}
            >
              <Stack spacing={2}>
                <Typography variant="subtitle2" sx={{ color: "#ffffff", fontWeight: 600 }}>
                  Dot Sizes
                </Typography>
                <Box
                  sx={{
                    maxHeight: "400px",
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
                  <Grid container spacing={2}>
                    {formValues.dotSizes.map((sizeItem, index) => (
                      <Grid item xs={12} key={index}>
                        <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ pt: 1 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Size"
                            value={capitalizeSizeName(sizeItem.size)}
                            disabled
                            InputProps={{
                              sx: {
                                color: "#ffffff",
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
                          <TextField
                            size="small"
                            type="number"
                            label="Score"
                            value={sizeItem.score}
                            onChange={(e) => handleDotSizeChange(index, "score", e.target.value)}
                            onKeyDown={handleKeyDown}
                            sx={{
                              width: 100,
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
                                color: "#ffffff",
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
                          />
                        </Stack>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Stack>
            </Paper>

            <Divider sx={{ borderColor: "rgba(233, 226, 36, 0.2)" }} />

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1" fontWeight={600} sx={{ color: "#ffffff" }}>
                Dots
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
                {formValues.dots.map((dot, index) => {
                  // Use small size for UI display (40px) - dot sizes shown in preview only
                  const displaySize = 40;
                  return (
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
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box
                              sx={{
                                width: displaySize,
                                height: displaySize,
                                minWidth: displaySize,
                                minHeight: displaySize,
                                maxWidth: displaySize,
                                maxHeight: displaySize,
                                aspectRatio: "1/1",
                                borderRadius: "50%",
                                backgroundColor: dot.color?.trim() || "transparent",
                                border: "1px solid rgba(255,255,255,0.3)",
                                flexShrink: 0,
                              }}
                            />
                            <Stack>
                              <Typography variant="subtitle2" sx={{ color: "#ffffff", fontWeight: 600 }}>
                                Dot {index + 1}
                              </Typography>
                            </Stack>
                          </Stack>
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
                        </Stack>
                      </Paper>
                    );
                  })}
                </Stack>
              </Box>
            )}
          </Stack>

          <Divider sx={{ borderColor: "rgba(233, 226, 36, 0.2)" }} />

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
