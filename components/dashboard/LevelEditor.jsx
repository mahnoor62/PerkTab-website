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
  IconButton,
  Paper,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { getLogoUrl } from "@/lib/logo";

const helperText =
  "Accepts HEX, rgba(), hsl(), gradients or any valid CSS color.";

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

export default function LevelEditor({
  level,
  onSave,
  isSaving,
  onUploadLogo,
  isUploadingLogo,
  onUploadBackgroundImage,
  isUploadingBackgroundImage = false,
}) {
  const [formValues, setFormValues] = useState(() => ({
    backgroundColor: "",
    backgroundType: "color", // "color", "colorLogo", or "image"
    backgroundImageUrl: "",
    dots: [],
    logoUrl: "",
  }));
  const [imageError, setImageError] = useState(null);
  const [backgroundImageError, setBackgroundImageError] = useState(null);
  const fileInputRef = useRef(null);
  const backgroundImageInputRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  // Store original background color to restore when switching from image back to color
  const originalBackgroundColorRef = useRef("");
  
  // Helper to format background image URL for preview
  const previewBackgroundImageUrl = formValues.backgroundImageUrl 
    ? getLogoUrl(formValues.backgroundImageUrl)
    : null;

  useEffect(() => {
    if (level) {
      // Initialize dots with proper sizeScore and colorScore
      const initializedDots = Array.isArray(level.dots) 
        ? level.dots.map((dot, index) => {
            const sizeScoreNum = typeof dot.sizeScore === 'number' ? dot.sizeScore : (Number(dot.sizeScore) || getPredefinedSizeScore(index));
            const colorScoreNum = typeof dot.colorScore === 'number' ? dot.colorScore : (Number(dot.colorScore) || getColorScore(dot.color));
            // Strip "px" from size for display in input fields
            const sizeValue = dot.size || String(getPredefinedDotSize(index));
            const displaySize = stripSizeUnit(sizeValue);
            
            return {
              color: dot.color || "",
              size: displaySize, // Store without "px" for editing, backend will add it
              sizeScore: sizeScoreNum,
              colorScore: colorScoreNum,
              totalScore: (typeof dot.totalScore === 'number' ? dot.totalScore : (Number(dot.totalScore) || sizeScoreNum + colorScoreNum)),
            };
          })
        : [];
      
      // Determine if background is a color or image URL
      const background = level.background || "";
      const isImageUrl = background && !background.startsWith("#") && 
        (background.startsWith("http") || background.startsWith("/"));
      
      // Determine background type based on existing data
      let backgroundType = "color";
      let backgroundColor = "";
      let backgroundImageUrl = "";
      
      if (isImageUrl) {
        backgroundType = "image";
        backgroundImageUrl = background;
      } else if (background) {
        // If there's a logo, assume "colorLogo", otherwise "color"
        backgroundType = level.logoUrl ? "colorLogo" : "color";
        backgroundColor = background;
        // Store original background color for restoration when switching from image
        originalBackgroundColorRef.current = background;
      } else {
        // If no background, store empty string
        originalBackgroundColorRef.current = "";
      }
      
      setFormValues({
        backgroundColor: backgroundColor,
        backgroundType: backgroundType,
        backgroundImageUrl: backgroundImageUrl,
        dots: initializedDots,
        logoUrl: level.logoUrl || "",
      });
      setBackgroundImageError(null);
    }
  }, [level]);

  const hasChanges = useMemo(() => {
    if (!level) return false;
    const dotsChanged = JSON.stringify(formValues.dots) !== JSON.stringify(level.dots || []);
    
    // Determine what the current background value should be
    const currentBackground = formValues.backgroundType === "image" 
      ? formValues.backgroundImageUrl 
      : formValues.backgroundColor;
    
    return (
      currentBackground !== (level.background || "") ||
      formValues.logoUrl !== (level.logoUrl || "") ||
      dotsChanged
    );
  }, [formValues, level]);

  const autoSave = useCallback((values) => {
    if (!level) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      // Determine background value based on backgroundType
      const backgroundValue = values.backgroundType === "image" 
        ? values.backgroundImageUrl 
        : values.backgroundColor;
      
      // Don't save if background value is empty/null - only save when user actually sets a value
      if (!backgroundValue || backgroundValue.trim() === "") {
        return;
      }
      
      // Update original background color ref if it's a color (not an image)
      if (values.backgroundType !== "image" && backgroundValue) {
        originalBackgroundColorRef.current = backgroundValue;
      }
      
      const payload = {
        ...values,
        background: backgroundValue,
        // Only send logoUrl if backgroundType is not "image"
        logoUrl: values.backgroundType === "image" ? "" : values.logoUrl,
      };
      // Clean up temporary fields
      delete payload.backgroundColor;
      delete payload.backgroundType;
      delete payload.backgroundImageUrl;
      onSave(payload, false);
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

  const handleAddDot = () => {
    setFormValues((prev) => {
      const newDotIndex = prev.dots.length;
      const predefinedSize = getPredefinedDotSize(newDotIndex);
      const predefinedSizeScore = getPredefinedSizeScore(newDotIndex);
      // Cycle through theme default colors
      const defaultColor = THEME_DEFAULT_COLORS[newDotIndex % THEME_DEFAULT_COLORS.length];
      const colorScore = getColorScore(defaultColor);
      const totalScore = predefinedSizeScore + colorScore;
      
      const newValues = {
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
      autoSave(newValues);
      return newValues;
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
      
      const newValues = {
        ...prev,
        dots: updatedDots,
      };
      autoSave(newValues);
      return newValues;
    });
  };

  const handleDotColorChange = (index, value) => {
    // When color changes, automatically update colorScore and totalScore
    const colorScore = getColorScore(value);
    setFormValues((prev) => {
      const newValues = {
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
      };
      autoSave(newValues);
      return newValues;
    });
  };

  const handleRemoveDot = (index) => {
    setFormValues((prev) => {
      const newValues = {
        ...prev,
        dots: prev.dots.filter((_, i) => i !== index),
      };
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
    // Determine background value based on backgroundType
    const backgroundValue = formValues.backgroundType === "image" 
      ? formValues.backgroundImageUrl 
      : formValues.backgroundColor;
    
    // Don't save if background value is empty - use the existing level background instead
    const finalBackgroundValue = (backgroundValue && backgroundValue.trim() !== "") 
      ? backgroundValue 
      : (level?.background || "");
    
    // Update original background color ref if it's a color (not an image)
    if (formValues.backgroundType !== "image" && finalBackgroundValue) {
      originalBackgroundColorRef.current = finalBackgroundValue;
    }
    
    const payload = {
      ...formValues,
      background: finalBackgroundValue,
      // Only send logoUrl if backgroundType is not "image"
      logoUrl: formValues.backgroundType === "image" ? "" : formValues.logoUrl,
    };
    // Clean up temporary fields
    delete payload.backgroundColor;
    delete payload.backgroundType;
    delete payload.backgroundImageUrl;
    onSave(payload, true);
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
        setFormValues((prev) => {
          const newValues = { ...prev, logoUrl: uploadedUrl };
          // Auto-save after upload
          autoSave(newValues);
          return newValues;
        });
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
        setFormValues((prev) => {
          const newValues = { ...prev, backgroundImageUrl: uploadedUrl };
          // Auto-save after upload
          autoSave(newValues);
          return newValues;
        });
      } else {
        // If upload returns null, there was an error (handled by onUploadBackgroundImage)
        setBackgroundImageError("Failed to upload background image. Please try again.");
      }
    } catch (error) {
      // Catch any errors that weren't handled by onUploadBackgroundImage
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          error?.toString() || 
                          "Failed to upload background image. Please try again.";
      setBackgroundImageError(errorMessage);
    } finally {
      if (backgroundImageInputRef.current) {
        backgroundImageInputRef.current.value = "";
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
                setFormValues((prev) => {
                  const newType = e.target.value;
                  const newValues = {
                    ...prev,
                    backgroundType: newType,
                  };
                  
                  // Handle switching from image to color/colorLogo - restore original background color
                  if (prev.backgroundType === "image" && newType !== "image") {
                    // Restore the original background color if it exists
                    newValues.backgroundColor = originalBackgroundColorRef.current || prev.backgroundColor || "";
                    newValues.backgroundImageUrl = "";
                  } else if (newType === "image") {
                    // Switching to image - preserve backgroundImageUrl if exists, clear backgroundColor
                    newValues.backgroundImageUrl = prev.backgroundImageUrl || "";
                    // Don't clear backgroundColor, just don't use it
                    newValues.logoUrl = ""; // Clear logo when switching to image
                  } else {
                    // Switching between color and colorLogo - preserve backgroundColor
                    newValues.backgroundColor = prev.backgroundColor || originalBackgroundColorRef.current || "";
                    newValues.backgroundImageUrl = "";
                  }
                  
                  // DON'T auto-save when just switching options - only save when user actually sets a value
                  // The save will happen when user changes the color input or uploads an image
                  return newValues;
                });
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
              fullWidth
              label="Background Color"
              name="backgroundColor"
              value={formValues.backgroundColor}
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
              FormHelperTextProps={{
                sx: {
                  color: "rgba(255, 255, 255, 0.6)",
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
        </Stack>

        <Divider sx={{ borderColor: "rgba(233, 226, 36, 0.2)" }} />

        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1" fontWeight={600} sx={{ color: "#ffffff" }}>
              Edit  Configuration
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
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: "50%",
                              backgroundColor: dot.color?.trim() || "transparent",
                              border: "1px solid rgba(255,255,255,0.3)",
                            }}
                          />
                          <Typography variant="subtitle2" sx={{ color: "#ffffff", fontWeight: 600 }}>
                            Dot {index + 1}
                          </Typography>
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

        {/* Logo Section - Show only when backgroundType is "colorLogo" (2nd option) */}
        {formValues.backgroundType === "colorLogo" && (
          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ color: "#ffffff" }}>
              Logo
            </Typography>
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
              disabled={isUploadingLogo}
              sx={{
                px: 5,
                py: 1.4,
                alignSelf: "flex-start",
                borderRadius: 3,
                borderColor: "rgba(233, 226, 36, 0.5)",
                backgroundColor: "rgba(233, 226, 36, 0.1)",
                color: "#e9e224",
                "&:hover": {
                  borderColor: "#e9e224",
                  backgroundColor: "rgba(233, 226, 36, 0.2)",
                },
              }}
            >
              Upload Logo
            </Button>
            
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
      </Stack>
    </Box>
  );
}
