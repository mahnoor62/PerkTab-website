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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
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

// Predefined dot sizes with default scores - in sequence: Extra Small, Small, Medium, Large, Extra Large
const PREDEFINED_DOT_SIZES = [
  { size: "Extra Small", score: 10 },
  { size: "Small", score: 7 },
  { size: "Medium", score: 5 },
  { size: "Large", score: 3 },
  { size: "Extra Large", score: 1 },
];

// Map size names to pixel values for UI display
const SIZE_TO_PIXELS = {
  "extra small": 20,
  "Extra Small": 20,
  "small": 28,
  "Small": 28,
  "medium": 36,
  "Medium": 36,
  "large": 48,
  "Large": 48,
  "extra large": 60,
  "Extra Large": 60,
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

// Get size order for sorting (Extra Small = 1, Small = 2, Medium = 3, Large = 4, Extra Large = 5)
function getSizeOrderForSort(sizeStr) {
  if (!sizeStr) return 3; // Default to Medium
  const sizeNameLower = String(sizeStr).trim().toLowerCase();
  
  if (sizeNameLower === "extra small" || sizeNameLower === "extrasmall" || sizeNameLower.includes("extra small")) {
    return 1; // Extra Small - first
  } else if (sizeNameLower === "small") {
    return 2; // Small - second
  } else if (sizeNameLower === "medium") {
    return 3; // Medium - third
  } else if (sizeNameLower === "large") {
    return 4; // Large - fourth
  } else if (sizeNameLower === "extra large" || sizeNameLower === "extralarge" || sizeNameLower.includes("extra large")) {
    return 5; // Extra Large - fifth
  }
  return 3; // Default to Medium
}

// Sort dot sizes array in sequence: Extra Small -> Small -> Medium -> Large -> Extra Large
function sortDotSizes(dotSizes) {
  if (!Array.isArray(dotSizes) || dotSizes.length === 0) return dotSizes;
  
  return [...dotSizes].sort((a, b) => {
    const orderA = getSizeOrderForSort(a?.size);
    const orderB = getSizeOrderForSort(b?.size);
    return orderA - orderB;
  });
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
  onDotAdded,
}) {
  const [formValues, setFormValues] = useState(() => ({
    backgroundColor: "",
    backgroundType: "color", // "color", "colorLogo", or "image"
    backgroundImageUrl: "",
    colors: [...PREDEFINED_COLORS],
    dotSizes: [...PREDEFINED_DOT_SIZES],
    dots: [],
    logoUrl: "",
    targetScore: 0,
  }));
  const [imageError, setImageError] = useState(null);
  const [backgroundImageError, setBackgroundImageError] = useState(null);
  const [dotToDelete, setDotToDelete] = useState(null);
  const [deleteDotDialogOpen, setDeleteDotDialogOpen] = useState(false);
  const fileInputRef = useRef(null);
  const backgroundImageInputRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  // Store original background color to restore when switching from image back to color
  const originalBackgroundColorRef = useRef("");
  
  // Helper to format background image URL for preview
  const previewBackgroundImageUrl = formValues.backgroundImageUrl 
    ? getLogoUrl(formValues.backgroundImageUrl)
    : null;
  
  // Helper to format logo URL for preview
  const previewLogoUrl = formValues.logoUrl 
    ? getLogoUrl(formValues.logoUrl)
    : null;

  // Use a ref to track previous level data to detect actual changes
  const prevLevelRef = useRef(null);
  // Track the last saved state to compare changes
  const lastSavedStateRef = useRef(null);
  // Track current formValues counts to prevent reset during user edits
  const formValuesCountsRef = useRef({ dots: 0, colors: 0 });
  // Track current level ID to prevent preserving backgroundType from previous level
  const currentLevelIdRef = useRef(null);

  useEffect(() => {
    if (level) {
      // If we're currently saving, don't reset formValues - wait for save to complete
      if (isSaving) {
        return;
      }

      // CRITICAL: If level._id changed, we're switching to a different level - ALWAYS reset formValues
      // Don't skip reset based on dot/color counts when switching levels
      const isLevelSwitch = currentLevelIdRef.current !== null && currentLevelIdRef.current !== level._id;
      
      // CRITICAL FIX: When switching levels, ALWAYS reset formValues to show new level's data
      // This ensures colors from one level don't appear in another level
      if (isLevelSwitch) {
        console.log(`[LevelEditor] Switching levels: ${currentLevelIdRef.current} -> ${level._id}, Level ${level.level}`);
        console.log(`[LevelEditor] New level colors count: ${Array.isArray(level.colors) ? level.colors.length : 0}`);
        // Clear prevLevelRef to force reset
        prevLevelRef.current = null;
        // Reset formValuesCountsRef to prevent count-based checks from blocking reset
        formValuesCountsRef.current = { dots: 0, colors: 0 };
      }
      
      // Create a stable key from level data to detect changes
      // Include backgroundType in key to detect when it changes in database
      const levelKey = JSON.stringify({
        _id: level._id,
        colors: level.colors,
        dotSizes: level.dotSizes,
        dots: level.dots,
        background: level.background,
        backgroundType: level.backgroundType,
        logoUrl: level.logoUrl,
        updatedAt: level.updatedAt,
      });

      // Check if same level BEFORE updating currentLevelIdRef (needed for backgroundType check)
      const isSameLevel = currentLevelIdRef.current === level._id;
      
      // When switching levels, we already cleared prevLevelRef above, so skip levelKey check
      // For same level, check if data actually changed
      if (!isLevelSwitch) {
        // Only update if level data actually changed (for same level)
        if (prevLevelRef.current === levelKey) {
          return;
        }
        
        // Check if current formValues has more recent changes than the incoming level
        // This prevents resetting when user just made changes that haven't been saved yet
        const levelDotsCount = Array.isArray(level.dots) ? level.dots.length : 0;
        const levelColorsCount = Array.isArray(level.colors) ? level.colors.length : 0;
        
        // If formValues has more dots than level, user just added one - don't reset
        if (formValuesCountsRef.current.dots > levelDotsCount) {
          return;
        }

        // If formValues has more colors than level, user just added one - don't reset
        if (formValuesCountsRef.current.colors > levelColorsCount) {
          return;
        }
      }
      
      prevLevelRef.current = levelKey;

      // Initialize colors array - filter out null/undefined elements
      // CRITICAL: Always use level.colors from database exactly as stored
      // This ensures each level shows only its own colors, not colors from other levels
      // IMPORTANT: When switching levels (isLevelSwitch), ALWAYS use the new level's colors
      // Don't use formValues.colors from previous level - use ONLY level.colors from database
      let initializedColors = [];
      
      // ALWAYS use level.colors from database - no fallback to predefined or previous colors
      // This is critical to prevent colors from one level appearing in another level
      if (level.colors !== undefined && level.colors !== null && Array.isArray(level.colors)) {
        if (level.colors.length > 0) {
          // Use level.colors directly from database - create new array to avoid reference issues
          initializedColors = level.colors
            .filter((c) => c != null && c.color != null && String(c.color).trim() !== "")
            .map((c) => ({
              color: String(c.color || "").trim(),
              score: typeof c.score === 'number' ? c.score : (Number(c.score) || 0),
            }));
        } else {
          // Empty array in database - use empty array (not predefined colors)
          initializedColors = [];
        }
      } else {
        // No colors field in database - use empty array (not predefined colors)
        initializedColors = [];
      }
      
      // Use the colors exactly as they are from the database (can be empty array)
      // This ensures level-specific colors are always used and no cross-contamination
      // Create a new array reference to ensure React detects the change
      const safeColors = [...initializedColors];
      
      // Initialize dotSizes array - filter out null/undefined elements
      let initializedDotSizes = Array.isArray(level.dotSizes) && level.dotSizes.length > 0
        ? level.dotSizes
            .filter((s) => s != null && (s.size != null || s.size !== undefined))
            .map((s) => ({
              size: String(s?.size || ""),
              score: typeof s?.score === 'number' ? s.score : (Number(s?.score) || 0),
            }))
        : [...PREDEFINED_DOT_SIZES];
      
      // Sort dot sizes in sequence: Extra Small -> Small -> Medium -> Large -> Extra Large
      initializedDotSizes = sortDotSizes(initializedDotSizes);
      
      // Ensure dotSizes array is never empty
      const safeDotSizes = initializedDotSizes.length > 0 ? initializedDotSizes : [...PREDEFINED_DOT_SIZES];
      
      // Initialize dots with color, colorScore, and size - filter out null/undefined elements
      // Assign sizes in sequence: Extra Small -> Small -> Medium -> Large -> Extra Large
      const initializedDots = Array.isArray(level.dots) && level.dots.length > 0
        ? level.dots
            .filter((dot) => dot != null)
            .map((dot, index) => {
              // If dot doesn't have a size, assign one from dotSizes array in sequence
              let dotSize = dot?.size || "";
              if (!dotSize && safeDotSizes.length > 0) {
                // Cycle through sizes in order: Extra Small, Small, Medium, Large, Extra Large
                const sizeIndex = index % safeDotSizes.length;
                dotSize = safeDotSizes[sizeIndex].size;
              } else if (!dotSize) {
                // Fallback to predefined sizes in sequence
                const sizeIndex = index % PREDEFINED_DOT_SIZES.length;
                dotSize = PREDEFINED_DOT_SIZES[sizeIndex].size;
              }
              
              return {
                color: String(dot?.color || ""),
                colorScore: typeof dot?.colorScore === 'number' ? dot.colorScore : (Number(dot?.colorScore) || 0),
                size: String(dotSize),
              };
            })
        : [];
      
      // Determine if background is a color or image URL
      const background = level.background || "";
      const logoUrl = level.logoUrl || "";
      const isImageUrl = background && !background.startsWith("#") && 
        (background.startsWith("http") || background.startsWith("/"));
      
      // Use backgroundType from database if available, otherwise infer from data
      // IMPORTANT: Only preserve formValues.backgroundType if we're on the SAME level (same _id)
      // This prevents copying backgroundType from one level to another
      // isSameLevel was already calculated above
      let backgroundType = "color";
      
      if (level.backgroundType && ['color', 'colorLogo', 'image'].includes(level.backgroundType)) {
        // Use saved backgroundType from database (highest priority)
        backgroundType = level.backgroundType;
      } else if (isSameLevel && formValues.backgroundType && ['color', 'colorLogo', 'image'].includes(formValues.backgroundType)) {
        // ONLY preserve user's current selection if we're on the SAME level AND database doesn't have it yet
        // This prevents copying backgroundType when switching between levels
        backgroundType = formValues.backgroundType;
        console.log(`[useEffect] Preserving user's backgroundType selection for same level:`, backgroundType);
      } else {
        // Fallback: Infer from existing data (for backward compatibility with old records)
        if (isImageUrl) {
          backgroundType = "image";
        } else if (background && logoUrl) {
          backgroundType = "colorLogo";
        } else if (background) {
          backgroundType = "color";
        }
      }
      
      // Update current level ID ref
      currentLevelIdRef.current = level._id;
      
      let backgroundColor = "";
      let backgroundImageUrl = "";
      
      if (backgroundType === "image") {
        backgroundImageUrl = background;
      } else if (background) {
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
        logoUrl: logoUrl,
        targetScore: typeof level.targetScore === 'number' ? level.targetScore : (level.targetScore !== undefined ? Number(level.targetScore) || 0 : 0),
      };
      
      setFormValues(initialFormValues);
      // Update formValues counts ref to match the new level's data
      formValuesCountsRef.current = {
        dots: initializedDots.length,
        colors: safeColors.length,
      };
      
      // Debug log to verify colors are being set correctly
      if (isLevelSwitch) {
        console.log(`[LevelEditor] Set formValues for Level ${level.level}:`, {
          colorsCount: safeColors.length,
          colors: safeColors.map(c => c.color),
          formValuesCounts: formValuesCountsRef.current
        });
      }
      // Store initial state as last saved state
      lastSavedStateRef.current = {
        background: level.background || "",
        backgroundType: backgroundType,
        colors: JSON.stringify(safeColors),
        dotSizes: JSON.stringify(safeDotSizes),
        dots: JSON.stringify(initializedDots),
        logoUrl: level.logoUrl || "",
        targetScore: initialFormValues.targetScore,
      };
      setBackgroundImageError(null);
      
      // Notify parent of form values change for real-time preview
      // Only update if onFormValuesChange is provided (dotsOnly mode) AND we're on the correct level
      if (onFormValuesChange && level._id === currentLevelIdRef.current) {
        onFormValuesChange(initialFormValues);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level?._id, level?.colors, level?.dotSizes, level?.dots, level?.background, level?.backgroundType, level?.logoUrl, level?.updatedAt, isSaving]);
  
  // Notify parent whenever formValues change (for real-time preview)
  // Only update if this is for the current level (match by level._id)
  useEffect(() => {
    if (onFormValuesChange && level && level._id === currentLevelIdRef.current) {
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
    
    const targetScoreChanged = formValues.targetScore !== (level.targetScore !== undefined ? Number(level.targetScore) : 0);
    
    return (
      currentBackground !== (level.background || "") ||
      formValues.logoUrl !== (level.logoUrl || "") ||
      dotsChanged ||
      colorsChanged ||
      dotSizesChanged ||
      targetScoreChanged
    );
  }, [formValues, level]);

  const autoSave = useCallback((values) => {
    if (!level || !level._id) {
      console.warn(`[autoSave] Cannot save - level or level._id is missing`, { level: level?._id });
      return;
    }
    
    // Capture level ID to ensure we're saving to the correct level
    const currentLevelId = level._id;
    
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

      // Process targetScore
      const targetScore = values.targetScore !== undefined && values.targetScore !== null
        ? (typeof values.targetScore === 'number' ? values.targetScore : (Number(values.targetScore) || 0))
        : 0;

      // Build current state for comparison
      const currentState = {
        background: finalBackgroundValue,
        backgroundType: values.backgroundType || 'color',
        colors: JSON.stringify(processedColors),
        dotSizes: JSON.stringify(dotSizesToSave),
        dots: JSON.stringify(processedDots),
        logoUrl: values.backgroundType === "image" ? "" : (values.logoUrl || ""),
        targetScore: targetScore,
      };

      // Build payload with ONLY changed fields
      const payload = {};
      
      // Always include backgroundType when background changes OR when backgroundType itself changes
      // This ensures backgroundType is preserved when user changes backgroundColor
      const backgroundChanged = !lastSavedStateRef.current || currentState.background !== lastSavedStateRef.current.background;
      const backgroundTypeChanged = !lastSavedStateRef.current || currentState.backgroundType !== (lastSavedStateRef.current.backgroundType || 'color');
      
      if (backgroundChanged) {
        payload.background = finalBackgroundValue;
        // When background changes, also include current backgroundType to preserve user's selection
        payload.backgroundType = values.backgroundType || 'color';
        console.log(`[autoSave] Background changed, including backgroundType:`, payload.backgroundType);
      } else if (backgroundTypeChanged) {
        payload.backgroundType = values.backgroundType || 'color';
        console.log(`[autoSave] backgroundType changed, adding to payload:`, payload.backgroundType);
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
        // When logoUrl changes, also ensure backgroundType is "colorLogo" if logo exists
        if (values.logoUrl && values.backgroundType !== "image") {
          payload.backgroundType = "colorLogo";
          console.log(`[autoSave] Logo uploaded, setting backgroundType to colorLogo`);
        }
      }
      
      if (!lastSavedStateRef.current || currentState.targetScore !== lastSavedStateRef.current.targetScore) {
        payload.targetScore = targetScore;
      }

      // Only save if there are changes
      if (Object.keys(payload).length > 0) {
        try {
          console.log(`[autoSave] Saving changes for level ID: ${currentLevelId}, level number: ${level?.level}`);
          console.log(`[autoSave] Payload keys:`, Object.keys(payload));
          if (payload.dots) {
            console.log(`[autoSave] Dots count in payload:`, payload.dots.length);
          }
          console.log(`[autoSave] Payload content:`, JSON.stringify(payload, null, 2));
          // Use the new ID-based endpoint - use captured level ID to ensure we save to correct level
          onSave(payload, false, currentLevelId);
          // Update last saved state
          lastSavedStateRef.current = currentState;
        } catch (error) {
          console.error(`[autoSave] Error saving level ${level?.level}:`, error);
          // Don't update lastSavedStateRef on error so it can retry
        }
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
      // Use colors from the form values (colors array) - filter out any null/undefined
      const validColors = (prev.colors || [])
        .filter((c) => c != null && c.color != null && String(c.color).trim() !== "")
        .map((c) => ({
          color: String(c.color || "").trim(),
          score: typeof c.score === 'number' ? c.score : (Number(c.score) || 0),
        }));
      
      // Get dot sizes from the form values (dotSizes array)
      const validDotSizes = (prev.dotSizes || [])
        .filter((s) => s != null && s.size != null && String(s.size).trim() !== "")
        .map((s) => ({
          size: String(s.size || "").trim(),
          score: typeof s.score === 'number' ? s.score : (Number(s.score) || 0),
        }));
      
      // Use predefined sizes if no sizes available
      const availableDotSizes = validDotSizes.length > 0 ? validDotSizes : PREDEFINED_DOT_SIZES;
      
      // Ensure we have valid colors from the colors array
      if (validColors.length === 0) {
        console.warn("[handleAddDot] No valid colors in colors array, using predefined colors");
        const fallbackColors = PREDEFINED_COLORS;
        const currentDotIndex = (prev.dots || []).length;
        const colorIndex = currentDotIndex % fallbackColors.length;
        const sizeIndex = currentDotIndex % availableDotSizes.length;
        const selectedColorItem = fallbackColors[colorIndex];
        const selectedSizeItem = availableDotSizes[sizeIndex];
        
        const newValues = {
          ...prev,
          dots: [
            ...(prev.dots || []),
            {
              color: selectedColorItem.color,
              colorScore: selectedColorItem.score || 0,
              size: selectedSizeItem.size,
            },
          ],
        };
        // Update formValues counts ref
        formValuesCountsRef.current.dots = newValues.dots.length;
        const newDotNumber = newValues.dots.length;
        autoSave(newValues);
        
        // Show success message when dot is added (will be saved by autoSave)
        if (onDotAdded) {
          onDotAdded(newDotNumber);
        }
        
        return newValues;
      }
      
      // Cycle through colors and sizes from their respective arrays evenly (round-robin)
      const currentDotIndex = (prev.dots || []).length;
      const colorIndex = currentDotIndex % validColors.length;
      const sizeIndex = currentDotIndex % availableDotSizes.length;
      const selectedColorItem = validColors[colorIndex];
      const selectedSizeItem = availableDotSizes[sizeIndex];
      
      // Ensure color is always a string
      const selectedColor = String(selectedColorItem?.color || "").trim();
      // Use the score from the colors array
      const colorScore = typeof selectedColorItem?.score === 'number' 
        ? selectedColorItem.score 
        : (Number(selectedColorItem?.score) || 0);
      
      const newValues = {
        ...prev,
        dots: [
          ...(prev.dots || []),
          {
            color: selectedColor,
            colorScore: colorScore,
            size: selectedSizeItem.size,
          },
        ],
      };
      // Update formValues counts ref
      formValuesCountsRef.current.dots = newValues.dots.length;
      const newDotNumber = newValues.dots.length;
      autoSave(newValues);
      
      // Show success message when dot is added (will be saved by autoSave)
      if (onDotAdded) {
        onDotAdded(newDotNumber);
      }
      
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
      // Update formValues counts ref
      formValuesCountsRef.current.colors = newValues.colors.length;
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
      
      // Get the color being deleted (normalize for comparison)
      const deletedColor = String(validColors[index].color || "").trim().toLowerCase();
      
      // Filter out dots that use the deleted color
      // Compare colors case-insensitively and after trimming
      const remainingDots = (prev.dots || []).filter((dot) => {
        if (!dot || !dot.color) return true; // Keep dots without color
        const dotColor = String(dot.color || "").trim().toLowerCase();
        return dotColor !== deletedColor;
      });
      
      const newValues = {
        ...prev,
        colors: validColors.filter((_, i) => i !== index),
        dots: remainingDots,
      };
      // Update formValues counts ref
      formValuesCountsRef.current.colors = newValues.colors.length;
      formValuesCountsRef.current.dots = newValues.dots.length;
      autoSave(newValues);
      return newValues;
    });
  };

  const handleRemoveDot = (index) => {
    setDotToDelete(index);
    setDeleteDotDialogOpen(true);
  };

  const handleConfirmDeleteDot = () => {
    if (dotToDelete === null) return;
    
    setFormValues((prev) => {
      const newValues = {
        ...prev,
        dots: prev.dots.filter((_, i) => i !== dotToDelete),
      };
      // Update formValues counts ref
      formValuesCountsRef.current.dots = newValues.dots.length;
      autoSave(newValues);
      return newValues;
    });
    
    setDeleteDotDialogOpen(false);
    setDotToDelete(null);
  };

  const handleCancelDeleteDot = () => {
    setDeleteDotDialogOpen(false);
    setDotToDelete(null);
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
      background: finalBackgroundValue,
      backgroundType: formValues.backgroundType || 'color',
      colors: processedColors,
      dotSizes: dotSizesToSave,
      dots: processedDots,
      // Only send logoUrl if backgroundType is not "image"
      logoUrl: formValues.backgroundType === "image" ? "" : formValues.logoUrl,
      targetScore: typeof formValues.targetScore === 'number' ? formValues.targetScore : (Number(formValues.targetScore) || 0),
    };
    // Clean up temporary fields (backgroundType is now saved in DB, so keep it)
    // Don't delete backgroundType - it's now a saved field
    onSave(payload, true);
  };

  const handleResetBackground = () => {
    if (!level) return;
    
    // Reset background to white, backgroundType to null, logoUrl to null
    const resetPayload = {
      background: "#ffffff",
      backgroundType: null,
      logoUrl: null,
    };
    
    // Update form values to reflect the reset
    // Set backgroundType to 'color' for UI compatibility, but backend will receive null
    setFormValues((prev) => ({
      ...prev,
      backgroundColor: "#ffffff",
      backgroundImageUrl: "",
      logoUrl: "",
      backgroundType: "color", // Set to color for UI display, but send null to backend
    }));
    
    // Update original background color ref
    originalBackgroundColorRef.current = "#ffffff";
    
    // Save the reset values
    onSave(resetPayload, true, level._id);
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
          const newValues = { 
            ...prev, 
            logoUrl: uploadedUrl,
            // Ensure backgroundType is set to "colorLogo" when logo is uploaded
            backgroundType: prev.backgroundType === "image" ? "image" : "colorLogo"
          };
          // Auto-save after upload - this will save both logoUrl and backgroundType
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
    // Show loading spinner while level data is being initialized
    // Check if level exists and formValues has been initialized from this level
    const isLoading = !level || !formValues || (level && currentLevelIdRef.current !== level._id);
    
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
          {isLoading ? (
            <Stack spacing={2} alignItems="center" justifyContent="center" sx={{ flex: 1 }}>
              <CircularProgress size={32} sx={{ color: "#e9e224" }} />
              <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                Loading colors...
              </Typography>
            </Stack>
          ) : (
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
          )}
        </Paper>
      </Stack>
    );
  }

  // If backgroundOnly is true, show only background configuration
  if (backgroundOnly) {
    return (
      <Stack spacing={2}>
        <Stack 
          direction={{ xs: "column", sm: "row" }} 
          spacing={2} 
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          sx={{ flexWrap: "wrap", gap: 2 }}
        >
          <Typography variant="subtitle1" fontWeight={600} sx={{ color: "#ffffff" }}>
            Background Configuration
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleResetBackground}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 3,
              borderColor: "rgba(255, 255, 255, 0.5)",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              color: "#ffffff",
              whiteSpace: "nowrap",
              "&:hover": {
                borderColor: "#ffffff",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
              },
            }}
          >
            Reset Background
          </Button>
        </Stack>
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
                  
                  // Trigger auto-save when backgroundType changes so it persists after refresh/level change
                  // This ensures the background value (color or image) is saved immediately
                  autoSave(newValues);
                  
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
                  {formValues.logoUrl ? "Replace Logo" : "Upload Logo"}
                </Button>
                {previewLogoUrl && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: "rgba(26, 26, 26, 0.5)",
                      border: "1px solid rgba(233, 226, 36, 0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={previewLogoUrl}
                      alt="Logo preview"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100px",
                        objectFit: "contain",
                      }}
                      onError={(e) => {
                        console.error("Failed to load logo:", previewLogoUrl);
                        e.target.style.display = "none";
                      }}
                    />
                  </Box>
                )}
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
          
          {/* Target Score Configuration - Show in backgroundOnly view too */}
          <Paper
            sx={{
              p: 2,
              backgroundColor: "rgba(26, 26, 26, 0.5)",
              border: "1px solid rgba(233, 226, 36, 0.3)",
              borderRadius: 2,
            }}
          >
            <Stack spacing={1.5}>
              <Typography variant="subtitle2" sx={{ color: "#ffffff", fontWeight: 600 }}>
                Target Score
              </Typography>
              <TextField
                fullWidth
                type="number"
                label="Target Score"
                name="targetScore"
                value={formValues.targetScore !== undefined && formValues.targetScore !== null ? formValues.targetScore : 0}
                onChange={handleInputChange}
                placeholder="Enter target score"
                inputProps={{
                  min: 0,
                }}
                InputProps={{
                  sx: {
                    borderRadius: 2.5,
                    backgroundColor: "rgba(255,255,255,0.1)",
                    color: "#ffffff",
                    "& input": {
                      color: "#ffffff",
                      "&::placeholder": { color: "rgba(255, 255, 255, 0.5)", opacity: 1 },
                    },
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
                  },
                }}
              />
            </Stack>
          </Paper>
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
                {sortDotSizes(formValues.dotSizes || [])
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
                          value={capitalizeSizeName(sizeItem?.size || "")}
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
    // Show loading spinner while level data is being initialized
    // Check if level exists and formValues has been initialized from this level
    const isLoading = !level || !formValues || (level && currentLevelIdRef.current !== level._id);
    
    return (
      <>
      <Stack spacing={2} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ flexShrink: 0 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ color: "#ffffff" }}>
            Dots Configuration
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddDot}
            disabled={isLoading}
            sx={{
              borderRadius: 2,
              borderColor: "rgba(233, 226, 36, 0.5)",
              backgroundColor: "rgba(233, 226, 36, 0.1)",
              color: "#e9e224",
              "&:hover": {
                borderColor: "#e9e224",
                backgroundColor: "rgba(233, 226, 36, 0.2)",
              },
              "&:disabled": {
                borderColor: "rgba(233, 226, 36, 0.3)",
                backgroundColor: "rgba(233, 226, 36, 0.05)",
                color: "rgba(233, 226, 36, 0.5)",
              },
            }}
          >
            Add Dot
          </Button>
        </Stack>

        {isLoading ? (
          <Stack spacing={2} alignItems="center" justifyContent="center" sx={{ flex: 1, minHeight: "500px" }}>
            <CircularProgress size={32} sx={{ color: "#e9e224" }} />
            <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
              Loading dots...
            </Typography>
          </Stack>
        ) : formValues.dots.length === 0 ? (
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

      {/* Dot Deletion Confirmation Dialog */}
      <Dialog
        open={deleteDotDialogOpen}
        onClose={handleCancelDeleteDot}
        PaperProps={{
          sx: {
            backgroundColor: "rgba(26, 26, 26, 0.95)",
            border: "1px solid rgba(233, 226, 36, 0.3)",
            borderRadius: 2,
            minWidth: "320px",
          },
        }}
      >
        <DialogTitle sx={{ color: "#ffffff", fontWeight: 600 }}>
          Delete Dot
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
            Are you sure you want to delete this dot? This dot will be permanently deleted from your database. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid rgba(233, 226, 36, 0.2)" }}>
          <Button
            onClick={handleCancelDeleteDot}
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDeleteDot}
            variant="contained"
            sx={{
              backgroundColor: "#ff5252",
              color: "#ffffff",
              "&:hover": {
                backgroundColor: "#d32f2f",
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      </>
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

          {/* Target Score Configuration */}
          <Paper
            sx={{
              p: 2,
              backgroundColor: "rgba(26, 26, 26, 0.5)",
              border: "1px solid rgba(233, 226, 36, 0.3)",
              borderRadius: 2,
            }}
          >
            <Stack spacing={1.5}>
              <Typography variant="subtitle2" sx={{ color: "#ffffff", fontWeight: 600 }}>
                Target Score
              </Typography>
              <TextField
                fullWidth
                type="number"
                label="Target Score"
                name="targetScore"
                value={formValues.targetScore !== undefined && formValues.targetScore !== null ? formValues.targetScore : 0}
                onChange={handleInputChange}
                placeholder="Enter target score"
                inputProps={{
                  min: 0,
                }}
                InputProps={{
                  sx: {
                    borderRadius: 2.5,
                    backgroundColor: "rgba(255,255,255,0.1)",
                    color: "#ffffff",
                    "& input": {
                      color: "#ffffff",
                      "&::placeholder": { color: "rgba(255, 255, 255, 0.5)", opacity: 1 },
                    },
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
                  },
                }}
              />
            </Stack>
          </Paper>

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
                      {sortDotSizes(formValues.dotSizes || [])
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
                                value={capitalizeSizeName(sizeItem?.size || "")}
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

      {/* Dot Deletion Confirmation Dialog */}
      <Dialog
        open={deleteDotDialogOpen}
        onClose={handleCancelDeleteDot}
        PaperProps={{
          sx: {
            backgroundColor: "rgba(26, 26, 26, 0.95)",
            border: "1px solid rgba(233, 226, 36, 0.3)",
            borderRadius: 2,
            minWidth: "320px",
          },
        }}
      >
        <DialogTitle sx={{ color: "#ffffff", fontWeight: 600 }}>
          Delete Dot
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
            Are you sure you want to delete this dot? This dot will be permanently deleted from your database. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid rgba(233, 226, 36, 0.2)" }}>
          <Button
            onClick={handleCancelDeleteDot}
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDeleteDot}
            variant="contained"
            sx={{
              backgroundColor: "#ff5252",
              color: "#ffffff",
              "&:hover": {
                backgroundColor: "#d32f2f",
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}