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
} from "@mui/material";
import { useRef, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { getLogoUrl } from "@/lib/logo";

const defaultFormState = {
  level: "",
  backgroundColor: "#f4f9ff",
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
}) {
  const [formValues, setFormValues] = useState(defaultFormState);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(null);
  const fileInputRef = useRef(null);
  const previewLogoUrl = getLogoUrl(formValues.logoUrl);

  const resetAndClose = () => {
    setFormValues(defaultFormState);
    setError(null);
    setImageError(null);
    onClose?.();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    // Clear error when user changes level number
    if (name === "level") {
      setError(null);
    }
  };

  const handleAddDot = () => {
    setFormValues((prev) => ({
      ...prev,
      dots: [
        ...prev.dots,
        {
          color: "#5ac8fa",
          size: "36",
          score: "0",
        },
      ],
    }));
  };

  const handleDotChange = (index, field, value) => {
    setFormValues((prev) => ({
      ...prev,
      dots: prev.dots.map((dot, i) =>
        i === index ? { ...dot, [field]: value } : dot
      ),
    }));
  };

  const handleDotColorChange = (index, value) => {
    handleDotChange(index, "color", value);
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
    // Default color palette (excluding white/background color)
    const defaultColorPalette = [
      "#e92434", // red
      "#ff9e1d", // orange
      "#e9e224", // yellow
      "#36ceba", // cyan
      "#000000", // black
    ];

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
      const updatedDots = prev.dots.map((dot, index) => ({
        ...dot,
        color: defaultColorPalette[index % defaultColorPalette.length],
      }));

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    const levelNumber = Number(formValues.level);
    if (!Number.isInteger(levelNumber) || levelNumber < 1 || levelNumber > 10) {
      setError("Level must be an integer between 1 and 10.");
      return;
    }

    try {
      await onCreate({
        level: levelNumber,
        backgroundColor: formValues.backgroundColor,
        dots: formValues.dots,
        logoUrl: formValues.logoUrl,
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

          <Divider sx={{ borderColor: "rgba(233, 226, 36, 0.2)" }} />

          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
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
                            value={dot.size}
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
                            type="text"
                            label="Score"
                            value={dot.score}
                            onChange={(e) => handleDotChange(index, "score", e.target.value)}
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
                        </Stack>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>

          <Divider sx={{ borderColor: "rgba(233, 226, 36, 0.2)" }} />

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
