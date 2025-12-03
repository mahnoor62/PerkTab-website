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
  Grid,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { getLogoUrl } from "@/lib/logo";

const helperText =
  "Accepts HEX, rgba(), hsl(), gradients or any valid CSS color.";

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

// Get a random color from the colors array
function getRandomColor(colors) {
  if (!colors || colors.length === 0) {
    return "#e92434"; // default red
  }
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex].color;
}

// Get size name based on index (cycles through sizes)
function getSizeNameForDot(dotIndex) {
  return PREDEFINED_DOT_SIZES[dotIndex % PREDEFINED_DOT_SIZES.length].size;
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
          transition: "transform 0.2s, box-shadow 0.2s",
          flexShrink: 0,
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
  hideColors = false,
  colorsOnly = false,
  backgroundOnly = false,
  dotSizesOnly = false,
  dotsOnly = false,
  showBackgroundDetails = false,
  onFormValuesChange,
}) {
  const [formValues, setFormValues] = useState(() => ({
    backgroundColor: "",
    backgroundType: "color", // "color", "colorLogo", or "image"
    backgroundImageUrl: "",
    colors: [...PREDEFINED_COLORS],
    dotSizes: [...PREDEFINED_DOT_SIZES],
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

  // Use a ref to track previous level data to detect actual changes
  const prevLevelRef = useRef(null);
  // Track the last saved state to compare changes
  const lastSavedStateRef = useRef(null);

  useEffect(() => {
    if (level) {
      // Create a stable key from level data to detect changes
      const levelKey = JSON.stringify({
        _id: level._id,
        colors: level.colors,
        dotSizes: level.dotSizes,
        dots: level.dots,
        background: level.background,
        logoUrl: level.logoUrl,
        updatedAt: level.updatedAt,
      });

      // Only update if level data actually changed
      if (prevLevelRef.current === levelKey) {
        return;
      }
      prevLevelRef.current = levelKey;

      // Initialize colors array - filter out null/undefined elements
      const initializedColors = Array.isArray(level.colors) && level.colors.length > 0
        ? level.colors
            .filter((c) => c != null && (c.color != null || c.color !== undefined))
            .map((c) => ({
              color: String(c?.color || ""),
              score: typeof c?.score === 'number' ? c.score : (Number(c?.score) || 0),
            }))
        : [...PREDEFINED_COLORS];
      
      // Ensure colors array is never empty
      const safeColors = initializedColors.length > 0 ? initializedColors : [...PREDEFINED_COLORS];
      
      // Initialize dotSizes array - filter out null/undefined elements
      const initializedDotSizes = Array.isArray(level.dotSizes) && level.dotSizes.length > 0
        ? level.dotSizes
            .filter((s) => s != null && (s.size != null || s.size !== undefined))
            .map((s) => ({
              size: String(s?.size || ""),
              score: typeof s?.score === 'number' ? s.score : (Number(s?.score) || 0),
            }))
        : [...PREDEFINED_DOT_SIZES];
      
      // Ensure dotSizes array is never empty
      const safeDotSizes = initializedDotSizes.length > 0 ? initializedDotSizes : [...PREDEFINED_DOT_SIZES];
      
      // Initialize dots with color and colorScore - filter out null/undefined elements
      const initializedDots = Array.isArray(level.dots) && level.dots.length > 0
        ? level.dots
            .filter((dot) => dot != null)
            .map((dot) => ({
              color: String(dot?.color || ""),
              colorScore: typeof dot?.colorScore === 'number' ? dot.colorScore : (Number(dot?.colorScore) || 0),
            }))
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
      
      const initialFormValues = {
        backgroundColor: backgroundColor,
        backgroundType: backgroundType,
        backgroundImageUrl: backgroundImageUrl,
        colors: safeColors,
        dotSizes: safeDotSizes,
        dots: initializedDots,
        logoUrl: level.logoUrl || "",
      };
      
      setFormValues(initialFormValues);
      // Store initial state as last saved state
      lastSavedStateRef.current = {
        background: level.background || "",
        colors: JSON.stringify(safeColors),
        dotSizes: JSON.stringify(safeDotSizes),
        dots: JSON.stringify(initializedDots),
        logoUrl: level.logoUrl || "",
      };
      setBackgroundImageError(null);
      
      // Notify parent of form values change for real-time preview
      if (onFormValuesChange) {
        onFormValuesChange(initialFormValues);
      }
    }
  }, [level, onFormValuesChange]);
  
  // Notify parent whenever formValues change (for real-time preview)
  useEffect(() => {
    if (onFormValuesChange && level) {
      onFormValuesChange(formValues);
    }
  }, [formValues, onFormValuesChange, level]);

  const hasChanges = useMemo(() => {
    if (!level) return false;
    const dotsChanged = JSON.stringify(formValues.dots) !== JSON.stringify(level.dots || []);
    const colorsChanged = JSON.stringify(formValues.colors) !== JSON.stringify(level.colors || []);
    const dotSizesChanged = JSON.stringify(formValues.dotSizes) !== JSON.stringify(level.dotSizes || []);
    
    // Determine what the current background value should be
    const currentBackground = formValues.backgroundType === "image" 
      ? formValues.backgroundImageUrl 
      : formValues.backgroundColor;
    
    return (
      currentBackground !== (level.background || "") ||
      formValues.logoUrl !== (level.logoUrl || "") ||
      dotsChanged ||
      colorsChanged ||
      dotSizesChanged
    );
  }, [formValues, level]);

  const autoSave = useCallback((values) => {
    if (!level || !level._id) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      // Determine background value based on backgroundType
      const backgroundValue = values.backgroundType === "image" 
        ? values.backgroundImageUrl 
        : values.backgroundColor;
      
      // Use existing background if new one is empty
      const finalBackgroundValue = (backgroundValue && backgroundValue.trim() !== "") 
        ? backgroundValue 
        : (level?.background || "");
      
      // Update original background color ref if it's a color (not an image)
      if (values.backgroundType !== "image" && finalBackgroundValue) {
        originalBackgroundColorRef.current = finalBackgroundValue;
      }
      
      // Process colors array - ensure all have color and score
      const processedColors = (values.colors && Array.isArray(values.colors) && values.colors.length > 0)
        ? values.colors
            .filter((c) => c != null && c.color)
            .map((c) => ({
              color: String(c.color || ""),
              score: typeof c.score === 'number' ? c.score : (Number(c.score) || 0),
            }))
        : [];
      
      // Process dotSizes array
      let dotSizesToSave = [];
      if (values.dotSizes && Array.isArray(values.dotSizes) && values.dotSizes.length > 0) {
        const validDotSizes = values.dotSizes.filter((s) => s && s.size);
        if (validDotSizes.length > 0) {
          dotSizesToSave = validDotSizes.map((s) => ({
            size: String(s.size || ""),
            score: typeof s.score === 'number' ? s.score : (Number(s.score) || 0),
          }));
        }
      }
      
      // Process dots array - ensure all have color as string, filter out null/undefined
      const processedDots = (values.dots && Array.isArray(values.dots))
        ? values.dots
            .filter((dot) => dot != null && dot !== undefined)
            .map((dot) => {
              const dotColor = dot && typeof dot.color === 'string' ? String(dot.color).trim() : "";
              if (!dotColor || dotColor === "") {
                return null;
              }
              return {
                color: dotColor,
                colorScore: typeof dot.colorScore === 'number' ? dot.colorScore : (Number(dot.colorScore) || 0),
              };
            })
            .filter((dot) => dot != null)
        : [];

      // Build current state for comparison
      const currentState = {
        background: finalBackgroundValue,
        colors: JSON.stringify(processedColors),
        dotSizes: JSON.stringify(dotSizesToSave),
        dots: JSON.stringify(processedDots),
        logoUrl: values.backgroundType === "image" ? "" : (values.logoUrl || ""),
      };

      // Build payload with ONLY changed fields
      const payload = {};
      
      if (!lastSavedStateRef.current || currentState.background !== lastSavedStateRef.current.background) {
        payload.background = finalBackgroundValue;
      }
      
      if (!lastSavedStateRef.current || currentState.colors !== lastSavedStateRef.current.colors) {
        payload.colors = processedColors;
      }
      
      if (!lastSavedStateRef.current || currentState.dotSizes !== lastSavedStateRef.current.dotSizes) {
        payload.dotSizes = dotSizesToSave;
      }
      
      if (!lastSavedStateRef.current || currentState.dots !== lastSavedStateRef.current.dots) {
        payload.dots = processedDots;
      }
      
      if (!lastSavedStateRef.current || currentState.logoUrl !== lastSavedStateRef.current.logoUrl) {
        payload.logoUrl = values.backgroundType === "image" ? "" : (values.logoUrl || "");
      }

      // Only save if there are changes
      if (Object.keys(payload).length > 0) {
        console.log(`[autoSave] Saving changes for level ${level._id}:`, Object.keys(payload));
        // Use the new ID-based endpoint
        onSave(payload, false, level._id);
        // Update last saved state
        lastSavedStateRef.current = currentState;
      }
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
      // Ensure we have valid colors array - filter out any null/undefined
      const validColors = (prev.colors || [])
        .filter((c) => c != null && c.color != null)
        .map((c) => ({
          color: String(c.color || ""),
          score: typeof c.score === 'number' ? c.score : (Number(c.score) || 0),
        }));
      
      // Use colors from the form (user-defined colors) or fallback to predefined
      const availableColors = validColors.length > 0 ? validColors : PREDEFINED_COLORS;
      
      // Ensure availableColors is never empty
      if (availableColors.length === 0) {
        console.warn("[handleAddDot] No valid colors available, using default");
        return prev;
      }
      
      // Cycle through colors evenly (round-robin) - no consecutive same colors
      const currentDotIndex = (prev.dots || []).length;
      const colorIndex = currentDotIndex % availableColors.length;
      const selectedColorItem = availableColors[colorIndex];
      
      // Ensure color is always a string
      const selectedColor = String(selectedColorItem?.color || "#000000");
      // Use the score from the colors array
      const colorScore = typeof selectedColorItem?.score === 'number' 
        ? selectedColorItem.score 
        : (Number(selectedColorItem?.score) || 0);
      
      const newValues = {
        ...prev,
        colors: availableColors, // Ensure colors are valid
        dots: [
          ...(prev.dots || []),
          {
            color: selectedColor,
            colorScore: colorScore,
          },
        ],
      };
      autoSave(newValues);
      return newValues;
    });
  };

  const handleDotChange = (index, field, value) => {
    setFormValues((prev) => {
      // Ensure dots array exists and is valid
      const validDots = (prev.dots || [])
        .filter((dot) => dot != null)
        .map((dot) => ({
          color: String(dot?.color || ""),
          colorScore: typeof dot?.colorScore === 'number' ? dot.colorScore : (Number(dot?.colorScore) || 0),
        }));
      
      // Validate index
      if (index < 0 || index >= validDots.length) {
        console.warn(`[handleDotChange] Invalid index ${index} for dots array of length ${validDots.length}`);
        return prev;
      }
      
      const updatedDots = validDots.map((dot, i) => {
        if (i === index) {
          const updatedDot = {
            ...dot,
            [field]: field === "color" ? String(value || "") : value,
          };
          // Ensure colorScore is a number
          if (updatedDot.colorScore !== undefined) {
            updatedDot.colorScore = typeof updatedDot.colorScore === 'number' 
              ? updatedDot.colorScore 
              : (Number(updatedDot.colorScore) || 0);
          }
          return updatedDot;
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
    setFormValues((prev) => {
      // Ensure dots array exists and is valid
      const validDots = (prev.dots || [])
        .filter((dot) => dot != null)
        .map((dot) => ({
          color: String(dot?.color || ""),
          colorScore: typeof dot?.colorScore === 'number' ? dot.colorScore : (Number(dot?.colorScore) || 0),
        }));
      
      // Validate index
      if (index < 0 || index >= validDots.length) {
        console.warn(`[handleDotColorChange] Invalid index ${index} for dots array of length ${validDots.length}`);
        return prev;
      }
      
      const colorValue = String(value || "");
      
      // Ensure colors array is valid for lookup
      const validColors = (prev.colors || [])
        .filter((c) => c != null && c.color != null)
        .map((c) => ({
          color: String(c.color || ""),
          score: typeof c.score === 'number' ? c.score : (Number(c.score) || 0),
        }));
      
      // Find the color score from the colors array
      const colorItem = validColors.find((c) => c.color === colorValue);
      const colorScore = colorItem 
        ? (typeof colorItem.score === 'number' ? colorItem.score : (Number(colorItem.score) || 0))
        : (validDots[index]?.colorScore || 0);
      
      const newValues = {
        ...prev,
        dots: validDots.map((dot, i) => {
          if (i === index) {
            return {
              ...dot,
              color: colorValue,
              colorScore: colorScore,
            };
          }
          return dot;
        }),
      };
      autoSave(newValues);
      return newValues;
    });
  };

  const handleColorChange = (index, field, value) => {
    setFormValues((prev) => {
      // Ensure colors array exists and is valid
      const validColors = (prev.colors || [])
        .filter((c) => c != null)
        .map((c) => ({
          color: String(c?.color || ""),
          score: typeof c?.score === 'number' ? c.score : (Number(c?.score) || 0),
        }));
      
      // Validate index is within bounds
      if (index < 0 || index >= validColors.length) {
        console.warn(`[handleColorChange] Invalid index ${index} for colors array of length ${validColors.length}`);
        return prev;
      }
      
      const updatedColors = validColors.map((colorItem, i) => {
        if (i === index) {
          return {
            ...colorItem,
            [field]: field === "score" 
              ? (value === "" ? 0 : Number(value) || 0) 
              : String(value || ""),
          };
        }
        return colorItem;
      });
      
      const newValues = {
        ...prev,
        colors: updatedColors,
      };
      autoSave(newValues);
      return newValues;
    });
  };

  const handleDotSizeChange = (index, field, value) => {
    setFormValues((prev) => {
      // Ensure dotSizes array exists and is valid
      const validDotSizes = (prev.dotSizes || [])
        .filter((s) => s != null && s.size != null)
        .map((s) => ({
          size: String(s?.size || ""),
          score: typeof s?.score === 'number' ? s.score : (Number(s?.score) || 0),
        }));
      
      // If empty, use predefined sizes
      const safeDotSizes = validDotSizes.length > 0 ? validDotSizes : [...PREDEFINED_DOT_SIZES];
      
      // Validate index is within bounds
      if (index < 0 || index >= safeDotSizes.length) {
        console.warn(`[handleDotSizeChange] Invalid index ${index} for dotSizes array of length ${safeDotSizes.length}`);
        return prev;
      }
      
      const updatedDotSizes = safeDotSizes.map((sizeItem, i) => {
        if (i === index) {
          return {
            ...sizeItem,
            [field]: field === "score" 
              ? (value === "" ? 0 : Number(value) || 0) 
              : String(value || ""),
          };
        }
        return sizeItem;
      });
      
      const newValues = {
        ...prev,
        dotSizes: updatedDotSizes,
      };
      autoSave(newValues);
      return newValues;
    });
  };

  const handleAddColor = () => {
    setFormValues((prev) => {
      // Ensure colors array is valid before adding
      const validColors = (prev.colors || [])
        .filter((c) => c != null && c.color != null)
        .map((c) => ({
          color: String(c.color || ""),
          score: typeof c.score === 'number' ? c.score : (Number(c.score) || 0),
        }));
      
      const newValues = {
        ...prev,
        colors: [
          ...validColors,
          { color: "#000000", score: 0 },
        ],
      };
      autoSave(newValues);
      return newValues;
    });
  };

  const handleRemoveColor = (index) => {
    setFormValues((prev) => {
      // Ensure colors array exists and is valid
      const validColors = (prev.colors || [])
        .filter((c) => c != null && c.color != null)
        .map((c) => ({
          color: String(c.color || ""),
          score: typeof c.score === 'number' ? c.score : (Number(c.score) || 0),
        }));
      
      // Validate index
      if (index < 0 || index >= validColors.length) {
        console.warn(`[handleRemoveColor] Invalid index ${index} for colors array of length ${validColors.length}`);
        return prev;
      }
      
      // Don't allow removing the last color
      if (validColors.length <= 1) {
        console.warn("[handleRemoveColor] Cannot remove the last color");
        return prev;
      }
      
      const newValues = {
        ...prev,
        colors: validColors.filter((_, i) => i !== index),
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
    
    // Use existing background if new one is empty
    const finalBackgroundValue = (backgroundValue && backgroundValue.trim() !== "") 
      ? backgroundValue 
      : (level?.background || "");
    
    // Update original background color ref if it's a color (not an image)
    if (formValues.backgroundType !== "image" && finalBackgroundValue) {
      originalBackgroundColorRef.current = finalBackgroundValue;
    }
    
    // Process colors array - ensure all have color and score
    const processedColors = (formValues.colors && Array.isArray(formValues.colors) && formValues.colors.length > 0)
      ? formValues.colors.map((c) => ({
          color: c.color || "",
          score: typeof c.score === 'number' ? c.score : (Number(c.score) || 0),
        }))
      : [];
    
    // Always ensure dotSizes are sent with proper structure
    let dotSizesToSave = [];
    if (formValues.dotSizes && Array.isArray(formValues.dotSizes) && formValues.dotSizes.length > 0) {
      // Validate that all items have size property
      const validDotSizes = formValues.dotSizes.filter((s) => s && s.size);
      if (validDotSizes.length > 0) {
        dotSizesToSave = validDotSizes.map((s) => ({
          size: String(s.size || ""),
          score: typeof s.score === 'number' ? s.score : (Number(s.score) || 0),
        }));
      }
    }
    
    // Process dots array - ensure all have color as string, filter out null/undefined
    const processedDots = (formValues.dots && Array.isArray(formValues.dots))
      ? formValues.dots
          .filter((dot) => dot != null && dot !== undefined)
          .map((dot) => {
            const dotColor = dot && typeof dot.color === 'string' ? String(dot.color).trim() : "";
            // Ensure color is not empty
            if (!dotColor || dotColor === "") {
              return null; // Filter out dots without valid color
            }
            return {
              color: dotColor,
              colorScore: typeof dot.colorScore === 'number' ? dot.colorScore : (Number(dot.colorScore) || 0),
            };
          })
          .filter((dot) => dot != null) // Remove any nulls from the map
      : [];

    const payload = {
      ...formValues,
      background: finalBackgroundValue,
      colors: processedColors,
      dotSizes: dotSizesToSave,
      dots: processedDots,
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

  // If colorsOnly is true, show only the Colors panel
  if (colorsOnly) {
    return (
      <Stack spacing={2} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ color: "#ffffff", flexShrink: 0 }}>
          Colors Configuration
        </Typography>
        <Paper
          sx={{
            p: 2,
            backgroundColor: "rgba(26, 26, 26, 0.5)",
            border: "1px solid rgba(233, 226, 36, 0.3)",
            borderRadius: 2,
            flex: 1,
            minHeight: 0,
            maxHeight: "400px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Stack spacing={2} sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ flexShrink: 0 }}>
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
                flex: 1,
                minHeight: 0,
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
              <Stack spacing={1.5}>
                {(formValues.colors || [])
                  .filter((c) => c != null && c.color != null)
                  .map((colorItem, originalIndex) => {
                    // Find the actual index in the original array for correct updates
                    const actualIndex = (formValues.colors || []).findIndex((c, i) => 
                      c === colorItem || (c != null && c.color === colorItem.color)
                    );
                    const index = actualIndex >= 0 ? actualIndex : originalIndex;
                    
                    return (
                      <Stack 
                        key={index}
                        direction="row" 
                        spacing={1.5} 
                        alignItems="center"
                        sx={{
                          p: 1.5,
                          borderRadius: 1,
                          backgroundColor: "rgba(255, 255, 255, 0.02)",
                          "&:hover": {
                            backgroundColor: "rgba(255, 255, 255, 0.05)",
                          },
                        }}
                      >
                        <Box sx={{ flexShrink: 0 }}>
                          <ColorSwatch
                            color={colorItem?.color || ""}
                            onChange={(fieldName, value) => handleColorChange(index, "color", value)}
                            fieldName={`color${index}`}
                          />
                        </Box>
                        <TextField
                          fullWidth
                          size="small"
                          label="Color"
                          value={colorItem?.color || ""}
                          onChange={(e) => handleColorChange(index, "color", e.target.value)}
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
                            "& .MuiInputLabel-root": {
                              transform: "translate(14px, 9px) scale(1)",
                              "&.MuiInputLabel-shrink": {
                                transform: "translate(14px, -9px) scale(0.75)",
                              },
                            },
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
                          value={colorItem?.score ?? 0}
                          onChange={(e) => handleColorChange(index, "score", e.target.value)}
                          sx={{
                            width: 100,
                            flexShrink: 0,
                            "& .MuiInputLabel-root": {
                              transform: "translate(14px, 9px) scale(1)",
                              "&.MuiInputLabel-shrink": {
                                transform: "translate(14px, -9px) scale(0.75)",
                              },
                            },
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
                        <Box sx={{ flexShrink: 0 }}>
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
                    );
                  })}
              </Stack>
            </Box>
          </Stack>
        </Paper>
      </Stack>
    );
  }

  // If backgroundOnly is true, show only background configuration
  if (backgroundOnly) {
    return (
      <Stack spacing={2}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ color: "#ffffff" }}>
          Background Configuration
        </Typography>
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
          {formValues.backgroundType === "color" && (
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

          {/* Background Color & Logo - Show for "colorLogo" */}
          {formValues.backgroundType === "colorLogo" && (
            <Stack direction="row" spacing={2} alignItems="flex-start">
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
              <Box sx={{ minWidth: 200, pt: 1 }}>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  hidden
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <Button
                  variant="outlined"
                  fullWidth
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
                    py: 1.4,
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
                      mt: 1,
                      fontSize: "0.75rem",
                    }}
                  >
                    {imageError}
                  </Typography>
                )}
              </Box>
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
                    <Typography sx={{ color: "rgba(255, 255, 255, 0.6)" , ml:3}}>
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
        {backgroundOnly && <Stack />}
      </Stack>
    );
  }

  // If showBackgroundDetails is true, show background image details box
  // REMOVED - Background Image Details section
  // if (showBackgroundDetails) {
  //   if (formValues.backgroundType !== "image" || !previewBackgroundImageUrl) {
  //     return null;
  //   }
  //   return (
  //     <Paper
  //       sx={{
  //         p: 2,
  //         backgroundColor: "rgba(26, 26, 26, 0.5)",
  //         border: "1px solid rgba(233, 226, 36, 0.3)",
  //         borderRadius: 2,
  //       }}
  //     >
  //       <Stack spacing={2}>
  //         <Typography variant="subtitle2" sx={{ color: "#ffffff", fontWeight: 600 }}>
  //           Background Image Details
  //         </Typography>
  //         <Box
  //           sx={{
  //             width: "100%",
  //             minHeight: 200,
  //             borderRadius: 2,
  //             border: "1px solid rgba(233, 226, 36, 0.3)",
  //             overflow: "hidden",
  //             backgroundImage: `url(${previewBackgroundImageUrl})`,
  //             backgroundSize: "cover",
  //             backgroundPosition: "center",
  //             backgroundRepeat: "no-repeat",
  //           }}
  //         />
  //         <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
  //           Image URL: {formValues.backgroundImageUrl}
  //         </Typography>
  //       </Stack>
  //     </Paper>
  //   );
  // }

  // If dotSizesOnly is true, show only dot sizes
  if (dotSizesOnly) {
    return (
      <Stack spacing={2} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ color: "#ffffff", flexShrink: 0 }}>
          Dot Sizes Configuration
        </Typography>
        <Paper
          sx={{
            p: 2,
            backgroundColor: "rgba(26, 26, 26, 0.5)",
            border: "1px solid rgba(233, 226, 36, 0.3)",
            borderRadius: 2,
            flex: 1,
            minHeight: 0,
            maxHeight: "400px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Stack spacing={2} sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            <Typography variant="subtitle2" sx={{ color: "#ffffff", fontWeight: 600, flexShrink: 0 }}>
              Dot Sizes
            </Typography>
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
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
              <Stack spacing={1.5}>
                {(formValues.dotSizes || [])
                  .filter((s) => s != null && s.size != null)
                  .map((sizeItem, originalIndex) => {
                    const actualIndex = (formValues.dotSizes || []).findIndex((s, i) => 
                      s === sizeItem || (s != null && s.size === sizeItem.size)
                    );
                    const index = actualIndex >= 0 ? actualIndex : originalIndex;
                    
                    return (
                      <Stack 
                        key={index}
                        direction="row" 
                        spacing={1.5} 
                        alignItems="center"
                        sx={{
                          p: 1,
                          borderRadius: 1,
                          backgroundColor: "rgba(255, 255, 255, 0.02)",
                          "&:hover": {
                            backgroundColor: "rgba(255, 255, 255, 0.05)",
                          },
                        }}
                      >
                        <TextField
                          fullWidth
                          size="small"
                          label="Size"
                          value={sizeItem?.size || ""}
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
                          value={sizeItem?.score ?? 0}
                          onChange={(e) => handleDotSizeChange(index, "score", e.target.value)}
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
                    );
                  })}
              </Stack>
            </Box>
          </Stack>
        </Paper>
      </Stack>
    );
  }

  // If dotsOnly is true, show only dots
  if (dotsOnly) {
    return (
      <Stack spacing={2} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ flexShrink: 0 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ color: "#ffffff" }}>
            Dots Configuration
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
              minHeight: "500px",
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
            <Stack spacing={1.5}>
              {(formValues.dots || [])
                .filter((dot) => dot != null)
                .map((dot, originalIndex) => {
                  // Find the actual index in the original array for correct updates
                  const actualIndex = (formValues.dots || []).findIndex((d, i) => d === dot);
                  const index = actualIndex >= 0 ? actualIndex : originalIndex;
                  const displaySize = 20;
                  
                  return (
                    <Paper
                      key={index}
                      sx={{
                        p: 1.5,
                        backgroundColor: "rgba(26, 26, 26, 0.5)",
                        border: "1px solid rgba(233, 226, 36, 0.3)",
                        borderRadius: 2,
                      }}
                    >
                      <Stack spacing={1.5}>
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
                                backgroundColor: dot?.color?.trim() || "transparent",
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
                          value={dot?.color || ""}
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

          {/* Colors Configuration Panel */}
          {!hideColors && (
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
                  maxHeight: "180px",
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
                <Stack spacing={1.5}>
                  {(formValues.colors || [])
                    .filter((c) => c != null && c.color != null)
                    .map((colorItem, originalIndex) => {
                      const actualIndex = (formValues.colors || []).findIndex((c, i) => 
                        c === colorItem || (c != null && c.color === colorItem.color)
                      );
                      const index = actualIndex >= 0 ? actualIndex : originalIndex;
                      
                      return (
                        <Stack 
                          key={index}
                          direction="row" 
                          spacing={1.5} 
                          alignItems="center"
                          sx={{
                            p: 1,
                            borderRadius: 1,
                            backgroundColor: "rgba(255, 255, 255, 0.02)",
                            "&:hover": {
                              backgroundColor: "rgba(255, 255, 255, 0.05)",
                            },
                          }}
                        >
                          <ColorSwatch
                            color={colorItem?.color || ""}
                            onChange={(fieldName, value) => handleColorChange(index, "color", value)}
                            fieldName={`color${index}`}
                          />
                          <TextField
                            fullWidth
                            size="small"
                            label="Color"
                            value={colorItem?.color || ""}
                            onChange={(e) => handleColorChange(index, "color", e.target.value)}
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
                            value={colorItem?.score ?? 0}
                            onChange={(e) => handleColorChange(index, "score", e.target.value)}
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
                        </Stack>
                      );
                    })}
                </Stack>
              </Box>
            </Stack>
          </Paper>
          )}

          {/* Dot Sizes and Dots - Side by side on large screens */}
          <Grid container spacing={2}>
            <Grid item xs={12} lg={6}>
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
                      maxHeight: "180px",
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
                    <Stack spacing={1.5}>
                      {(formValues.dotSizes || [])
                        .filter((s) => s != null && s.size != null)
                        .map((sizeItem, originalIndex) => {
                          const actualIndex = (formValues.dotSizes || []).findIndex((s, i) => 
                            s === sizeItem || (s != null && s.size === sizeItem.size)
                          );
                          const index = actualIndex >= 0 ? actualIndex : originalIndex;
                          
                          return (
                            <Stack 
                              key={index}
                              direction="row" 
                              spacing={1.5} 
                              alignItems="center"
                              sx={{
                                p: 1,
                                borderRadius: 1,
                                backgroundColor: "rgba(255, 255, 255, 0.02)",
                                "&:hover": {
                                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                                },
                              }}
                            >
                              <TextField
                                fullWidth
                                size="small"
                                label="Size"
                                value={sizeItem?.size || ""}
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
                                value={sizeItem?.score ?? 0}
                                onChange={(e) => handleDotSizeChange(index, "score", e.target.value)}
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
                          );
                        })}
                    </Stack>
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} lg={6}>
              <Stack spacing={2}>
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

                {(!formValues.dots || formValues.dots.length === 0) ? (
                  <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.6)", textAlign: "center", py: 2 }}>
                    No dots added yet. Click "Add Dot" to add your first dot.
                  </Typography>
                ) : (
                  <Box
                    sx={{
                      maxHeight: "280px",
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
                    <Stack spacing={1.5}>
                      {(formValues.dots || [])
                        .filter((dot) => dot != null)
                        .map((dot, originalIndex) => {
                          const actualIndex = (formValues.dots || []).findIndex((d, i) => d === dot);
                          const index = actualIndex >= 0 ? actualIndex : originalIndex;
                          // Use small size for UI display (20px) - dot sizes shown in preview only
                          const displaySize = 20;
                          
                          return (
                            <Paper
                              key={index}
                              sx={{
                                p: 1.5,
                                backgroundColor: "rgba(26, 26, 26, 0.5)",
                                border: "1px solid rgba(233, 226, 36, 0.3)",
                                borderRadius: 2,
                              }}
                            >
                              <Stack spacing={1.5}>
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
                                        backgroundColor: dot?.color?.trim() || "transparent",
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
                                  value={dot?.color || ""}
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
                                          color={dot?.color || ""}
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
            </Grid>
          </Grid>
        </Stack>

        <Divider sx={{ borderColor: "rgba(233, 226, 36, 0.2)" }} />
      </Stack>
    </Box>
  );
}
