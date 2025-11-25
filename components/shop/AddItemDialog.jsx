"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Chip,
  Typography,
} from "@mui/material";

export default function AddItemDialog({
  open,
  onClose,
  onCreate,
  isSubmitting,
  onUploadImage,
  isUploadingImage,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coins, setCoins] = useState("0");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [redeemCodes, setRedeemCodes] = useState([]);
  const [redeemCodeInput, setRedeemCodeInput] = useState("");

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async () => {
    const coinsNumber = parseInt(coins) || 0;
    if (!name || coinsNumber < 0) return;

    try {
      let imageUrl = "";

      if (imageFile) {
        try {
          console.log("Starting image upload for file:", imageFile.name);
          const uploadedResult = await onUploadImage(imageFile);
          console.log("Upload result received:", uploadedResult);
          
          if (uploadedResult) {
            if (typeof uploadedResult === "string") {
              imageUrl = uploadedResult;
              console.log("Image URL set from string:", imageUrl);
            } else if (uploadedResult && typeof uploadedResult === "object" && uploadedResult.url) {
              imageUrl = uploadedResult.url;
              console.log("Image URL set from object:", imageUrl);
            } else {
              console.warn("Unexpected upload result format:", uploadedResult);
            }
          } else {
            console.error("Upload returned null/undefined - upload may have failed");
            throw new Error("Image upload failed. Please try again.");
          }
        } catch (uploadError) {
          console.error("Image upload error in AddItemDialog:", uploadError);
          throw uploadError;
        }
      } else {
        console.log("No image file selected");
      }
      
      console.log("Final payload being sent:", {
        name: name.trim(),
        description: description.trim(),
        coins: coinsNumber,
        imageUrl: imageUrl || "",
      });

      // Only call onCreate if no errors occurred during upload
      await onCreate({
        name: name.trim(),
        description: description.trim(),
        coins: coinsNumber,
        imageUrl: imageUrl || "",
        redeemCodes,
      });

      // Only clear form and close dialog if creation succeeded
      setName("");
      setDescription("");
      setCoins("0");
      setImageFile(null);
      setPreviewUrl(null);
      setRedeemCodes([]);
      setRedeemCodeInput("");
      onClose();
    } catch (error) {
      console.error("Error creating item:", error);
      // Error is already handled by parent (handleUploadImage or handleCreateItem)
      // Don't show success message if there's an error
      // The error message is already displayed by the parent handler
    }
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setCoins("0");
    setImageFile(null);
    setPreviewUrl(null);
    setRedeemCodes([]);
    setRedeemCodeInput("");
    onClose();
  };

  const handleAddRedeemCode = () => {
    const trimmed = redeemCodeInput.trim();
    if (!trimmed) return;
    if (redeemCodes.includes(trimmed)) {
      setRedeemCodeInput("");
      return;
    }
    setRedeemCodes(prev => [...prev, trimmed]);
    setRedeemCodeInput("");
  };

  const handleRemoveRedeemCode = (code) => {
    setRedeemCodes(prev => prev.filter(c => c !== code));
  };

  const handleRedeemCodeKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddRedeemCode();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background:
            "linear-gradient(135deg, rgba(26, 26, 26, 0.98), rgba(46, 204, 113, 0.05))",
          border: "1px solid rgba(46, 204, 113, 0.3)",
        },
      }}
    >
      <DialogTitle sx={{ color: "#ffffff" }}>Add New Item</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="Item Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "#ffffff",
                "& fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.3)",
                },
              },
              "& .MuiInputLabel-root": {
                color: "rgba(255, 255, 255, 0.7)",
              },
            }}
          />

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "#ffffff",
                "& fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.3)",
                },
              },
              "& .MuiInputLabel-root": {
                color: "rgba(255, 255, 255, 0.7)",
              },
            }}
          />

          <TextField
            label="Coins Required *"
            type="text"
            value={coins}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "" || /^\d+$/.test(value)) {
                setCoins(value);
              }
            }}
            fullWidth
            required
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "#ffffff",
                "& fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.3)",
                },
              },
              "& .MuiInputLabel-root": {
                color: "rgba(255, 255, 255, 0.7)",
              },
            }}
          />

          <Box>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              disabled={isUploadingImage}
              sx={{
                borderColor: "rgba(255, 255, 255, 0.3)",
                color: "rgba(255, 255, 255, 0.7)",
                "&:hover": {
                  borderColor: "#2ecc71",
                  backgroundColor: "rgba(46, 204, 113, 0.1)",
                },
              }}
            >
              {isUploadingImage
                ? "Uploading..."
                : imageFile
                ? "Change Image"
                : "Upload Image"}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageChange}
                disabled={isUploadingImage}
              />
            </Button>

            {previewUrl && (
              <Box
                sx={{
                  mt: 2,
                  borderRadius: 2,
                  overflow: "hidden",
                  maxHeight: 200,
                }}
              >
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{
                    width: "100%",
                    height: "auto",
                    objectFit: "cover",
                  }}
                />
              </Box>
            )}
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Typography variant="subtitle2" sx={{ color: "rgba(255, 255, 255, 0.9)" }}>
              Redeem Codes ({redeemCodes.length})
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexDirection: { xs: "column", sm: "row" } }}>
              <TextField
                label="Add Redeem Code"
                value={redeemCodeInput}
                onChange={(e) => setRedeemCodeInput(e.target.value)}
                onKeyDown={handleRedeemCodeKeyDown}
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "#ffffff",
                    "& fieldset": {
                      borderColor: "rgba(255, 255, 255, 0.3)",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "rgba(255, 255, 255, 0.7)",
                  },
                }}
              />
              <Button
                variant="outlined"
                onClick={handleAddRedeemCode}
                sx={{
                  minWidth: { xs: "100%", sm: "auto" },
                  borderColor: "rgba(255, 255, 255, 0.3)",
                  color: "rgba(255, 255, 255, 0.9)",
                  "&:hover": {
                    borderColor: "#2ecc71",
                    backgroundColor: "rgba(46, 204, 113, 0.15)",
                  },
                }}
              >
                Add
              </Button>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                minHeight: 32,
              }}
            >
              {redeemCodes.length === 0 ? (
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255, 255, 255, 0.5)" }}
                >
                  No redeem codes added yet.
                </Typography>
              ) : (
                redeemCodes.map(code => (
                  <Chip
                    key={code}
                    label={code}
                    onDelete={() => handleRemoveRedeemCode(code)}
                    sx={{
                      backgroundColor: "rgba(46, 204, 113, 0.15)",
                      color: "#2ecc71",
                      borderColor: "rgba(46, 204, 113, 0.4)",
                    }}
                    variant="outlined"
                  />
                ))
              )}
            </Box>
            {redeemCodes.length > 0 && (
              <Typography
                variant="caption"
                sx={{ color: "rgba(255, 255, 255, 0.6)" }}
              >
                Total codes added: {redeemCodes.length}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={handleClose}
          disabled={isSubmitting || isUploadingImage}
          sx={{ color: "rgba(255, 255, 255, 0.7)" }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          disabled={
            !name ||
            !coins ||
            parseInt(coins) < 0 ||
            isSubmitting ||
            isUploadingImage
          }
          sx={{
            background: "linear-gradient(135deg, #2ecc71, #27ae60)",
            "&:hover": {
              background: "linear-gradient(135deg, #27ae60, #229954)",
            },
          }}
        >
          {isSubmitting ? "Creating..." : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

