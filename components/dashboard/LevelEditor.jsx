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
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";

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
    dots: [],
    logoUrl: "",
  }));
  const [imageError, setImageError] = useState(null);
  const fileInputRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    if (level) {
      setFormValues({
        backgroundColor: level.backgroundColor || "",
        dots: Array.isArray(level.dots) ? level.dots : [],
        logoUrl: level.logoUrl || "",
      });
    }
  }, [level]);

  const hasChanges = useMemo(() => {
    if (!level) return false;
    const dotsChanged = JSON.stringify(formValues.dots) !== JSON.stringify(level.dots || []);
    return (
      formValues.backgroundColor !== (level.backgroundColor || "") ||
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

  const handleAddDot = () => {
    setFormValues((prev) => {
      const newValues = {
        ...prev,
        dots: [
          ...prev.dots,
          {
            color: "#5ac8fa",
            size: "36",
            score: "0",
          },
        ],
      };
      autoSave(newValues);
      return newValues;
    });
  };

  const handleDotChange = (index, field, value) => {
    setFormValues((prev) => {
      const newValues = {
        ...prev,
        dots: prev.dots.map((dot, i) =>
          i === index ? { ...dot, [field]: value } : dot
        ),
      };
      autoSave(newValues);
      return newValues;
    });
  };

  const handleDotColorChange = (index, value) => {
    handleDotChange(index, "color", value);
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
    onSave({ ...formValues }, true);
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
        const newValues = { ...formValues, logoUrl: uploadedUrl };
        setFormValues(newValues);
        queueMicrotask(() => {
          onSave(newValues, false);
        });
      }
    } finally {
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
        </Stack>

        <Divider sx={{ borderColor: "rgba(46, 204, 113, 0.2)" }} />

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
                borderColor: "rgba(46, 204, 113, 0.5)",
                backgroundColor: "rgba(46, 204, 113, 0.1)",
                color: "#2ecc71",
                "&:hover": {
                  borderColor: "#2ecc71",
                  backgroundColor: "rgba(46, 204, 113, 0.2)",
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
                  background: "rgba(46, 204, 113, 0.4)",
                  borderRadius: "4px",
                  "&:hover": {
                    background: "rgba(46, 204, 113, 0.6)",
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
                      border: "1px solid rgba(46, 204, 113, 0.3)",
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
                              color: "#2ecc71",
                            },
                          },
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                              borderColor: "rgba(46, 204, 113, 0.3)",
                            },
                            "&:hover fieldset": {
                              borderColor: "rgba(46, 204, 113, 0.5)",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#2ecc71",
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
                                color: "#2ecc71",
                              },
                            },
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              "& fieldset": {
                                borderColor: "rgba(46, 204, 113, 0.3)",
                              },
                              "&:hover fieldset": {
                                borderColor: "rgba(46, 204, 113, 0.5)",
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: "#2ecc71",
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
                                color: "#2ecc71",
                              },
                            },
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              "& fieldset": {
                                borderColor: "rgba(46, 204, 113, 0.3)",
                              },
                              "&:hover fieldset": {
                                borderColor: "rgba(46, 204, 113, 0.5)",
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: "#2ecc71",
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

        <Divider sx={{ borderColor: "rgba(46, 204, 113, 0.2)" }} />

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
      </Stack>
    </Box>
  );
}
