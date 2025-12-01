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
} from "@mui/material";
import { useRef, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { getLogoUrl } from "@/lib/logo";

const defaultFormState = {
  level: "",
  backgroundColor: "#f4f9ff",
  dot1Color: "#5ac8fa",
  dot2Color: "#8ad4ff",
  dot3Color: "#a8e6ff",
  dot4Color: "#c4f0ff",
  dot5Color: "#e2f8ff",
  logoUrl: "",
};

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
        dot1Color: formValues.dot1Color,
        dot2Color: formValues.dot2Color,
        dot3Color: formValues.dot3Color,
        dot4Color: formValues.dot4Color,
        dot5Color: formValues.dot5Color,
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
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(46, 204, 113, 0.1), 0 0 40px rgba(46, 204, 113, 0.1)",
          background:
            "linear-gradient(135deg, rgba(26, 26, 26, 0.95), rgba(46, 204, 113, 0.08), rgba(26, 188, 156, 0.1))",
          border: "1px solid rgba(46, 204, 113, 0.3)",
        },
      }}
    >
      <DialogTitle sx={{ pb: 2, borderBottom: "1px solid rgba(46, 204, 113, 0.2)" }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(135deg, rgba(46, 204, 113, 0.3), rgba(26, 188, 156, 0.3))",
              color: "#ffffff",
              border: "1px solid rgba(46, 204, 113, 0.4)",
              boxShadow: "0 12px 24px rgba(46, 204, 113, 0.35)",
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
      </DialogTitle>
      <DialogContent dividers sx={{ "&.MuiDialogContent-dividers": { borderColor: "rgba(46, 204, 113, 0.2)" } }}>
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
                  color: "#2ecc71",
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
                  borderColor: "rgba(46, 204, 113, 0.3)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(46, 204, 113, 0.5)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#2ecc71",
                },
                backgroundColor: "rgba(26, 26, 26, 0.5)",
              },
            }}
          />

          <Typography variant="subtitle2" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
            Optional: configure the level with your preferred palette now, or adjust
            after creation.
          </Typography>

          <Stack
            spacing={2}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
              gap: 2,
            }}
          >
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
                  backgroundColor: "rgba(26, 26, 26, 0.5)",
                },
              }}
            />
            <TextField
              label="Dot 1 Color"
              name="dot1Color"
              value={formValues.dot1Color}
              onChange={handleChange}
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
                  backgroundColor: "rgba(26, 26, 26, 0.5)",
                },
              }}
            />
            <TextField
              label="Dot 2 Color"
              name="dot2Color"
              value={formValues.dot2Color}
              onChange={handleChange}
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
                  backgroundColor: "rgba(26, 26, 26, 0.5)",
                },
              }}
            />
            <TextField
              label="Dot 3 Color"
              name="dot3Color"
              value={formValues.dot3Color}
              onChange={handleChange}
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
                  backgroundColor: "rgba(26, 26, 26, 0.5)",
                },
              }}
            />
            <TextField
              label="Dot 4 Color"
              name="dot4Color"
              value={formValues.dot4Color}
              onChange={handleChange}
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
                  backgroundColor: "rgba(26, 26, 26, 0.5)",
                },
              }}
            />
            <TextField
              label="Dot 5 Color"
              name="dot5Color"
              value={formValues.dot5Color}
              onChange={handleChange}
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
                  backgroundColor: "rgba(26, 26, 26, 0.5)",
                },
              }}
            />
          </Stack>

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
                  border: "1px dashed rgba(46, 204, 113, 0.4)",
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
                    borderColor: "rgba(46, 204, 113, 0.5)",
                    backgroundColor: "rgba(46, 204, 113, 0.1)",
                    color: "#2ecc71",
                    whiteSpace: "nowrap",
                    "&:hover": {
                      borderColor: "#2ecc71",
                      backgroundColor: "rgba(46, 204, 113, 0.2)",
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
      <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid rgba(46, 204, 113, 0.2)" }}>
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
            background: "linear-gradient(135deg, #2ecc71, #27ae60)",
            boxShadow:
              "0 8px 24px rgba(46, 204, 113, 0.4), 0 0 0 1px rgba(46, 204, 113, 0.2)",
            "&:hover": {
              background: "linear-gradient(135deg, #27ae60, #229954)",
              boxShadow:
                "0 12px 32px rgba(46, 204, 113, 0.6), 0 0 0 1px rgba(46, 204, 113, 0.3)",
            },
            "&:disabled": {
              background: "rgba(46, 204, 113, 0.3)",
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

