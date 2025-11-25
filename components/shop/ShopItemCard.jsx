"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
  Stack,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { getLogoUrl } from "@/lib/logo";

export default function ShopItemCard({
  item,
  onDelete,
  onUpdate,
  onUploadImage,
}) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editDescription, setEditDescription] = useState(item.description);
  const [editCoins, setEditCoins] = useState(String(item.coins || 0));
  const [editImageUrl, setEditImageUrl] = useState(item.imageUrl);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [editRedeemCodes, setEditRedeemCodes] = useState(item.redeemCodes || []);
  const [redeemCodeInput, setRedeemCodeInput] = useState("");
  const [redeemDialogOpen, setRedeemDialogOpen] = useState(false);

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

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      let imageUrl = editImageUrl;

      if (imageFile) {
        const uploadedUrl = await onUploadImage(imageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      const coinsNumber = parseInt(editCoins) || 0;

      await onUpdate(item._id, {
        name: editName,
        description: editDescription,
        coins: coinsNumber,
        imageUrl: imageUrl,
        redeemCodes: editRedeemCodes,
      });

      setEditDialogOpen(false);
      setImageFile(null);
      setPreviewUrl(null);
      setRedeemCodeInput("");
    } catch (error) {
      console.error("Error updating item:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(item._id);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const imageUrl = useMemo(() => {
    if (!item.imageUrl || !item.imageUrl.trim()) {
      return null;
    }
    const url = getLogoUrl(item.imageUrl.trim());
    if (!url) {
      console.warn(`ShopItem "${item.name}": Could not resolve image URL from:`, item.imageUrl);
    }
    return url;
  }, [item.imageUrl, item.name]);

  useEffect(() => {
    setEditRedeemCodes(item.redeemCodes || []);
    setEditName(item.name);
    setEditDescription(item.description);
    setEditCoins(String(item.coins || 0));
    setEditImageUrl(item.imageUrl);
    setRedeemCodeInput("");
    setRedeemDialogOpen(false);
  }, [item]);

  const handleAddRedeemCode = () => {
    const trimmed = redeemCodeInput.trim();
    if (!trimmed) return;
    if (editRedeemCodes.includes(trimmed)) {
      setRedeemCodeInput("");
      return;
    }
    setEditRedeemCodes(prev => [...prev, trimmed]);
    setRedeemCodeInput("");
  };

  const handleRemoveRedeemCode = (code) => {
    setEditRedeemCodes(prev => prev.filter(c => c !== code));
  };

  const handleRedeemCodeKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddRedeemCode();
    }
  };

  const totalRedeemCodes = item.redeemCodeCount ?? (Array.isArray(item.redeemCodes) ? item.redeemCodes.length : 0);

  return (
    <>
    {/* card size  */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 2,
          backgroundColor: "#fafafa",
          border: "1px solid #2ecc71",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "100%",
          maxWidth: "350px",
          margin: "0 auto",
          position: "relative",
          overflow: "hidden",
          transition: "transform 0.2s, box-shadow 0.2s",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 8px 16px rgba(46, 204, 113, 0.2)",
            "& .edit-delete-buttons": {
              opacity: 1,
            },
          },
        }}
      >
        <Box
          className="edit-delete-buttons"
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 1,
            opacity: 0,
            transition: "opacity 0.2s",
            display: "flex",
            gap: 0.5,
          }}
        >
          <IconButton
            size="small"
            onClick={() => setEditDialogOpen(true)}
            sx={{
              backgroundColor: "#ffffff",
              color: "#2ecc71",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
              "&:hover": {
                backgroundColor: "#f0f0f0",
              },
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setDeleteDialogOpen(true)}
            sx={{
              backgroundColor: "#ffffff",
              color: "#e74c3c",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
              "&:hover": {
                backgroundColor: "#f0f0f0",
              },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", height: "100%", textAlign: "center", width: "100%" }}>
          <Box sx={{ px: 1.5, pt: 1.5, pb: 1, width: "100%" }}>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{
                color: "#000000",
                fontSize: "0.95rem",
                textAlign: "center",
                fontFamily: "sans-serif",
                lineHeight: 1.2,
              }}
            >
              {item.name}
            </Typography>
          </Box>

          <Box sx={{ px: 1.5, pb: 1, flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {imageUrl ? (
              <Box
                sx={{
                  width: "100%",
                  maxWidth: "100%",
                  borderRadius: 1,
                  overflow: "hidden",
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                  height: "180px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  backgroundColor: "#e0e0e0",
                }}
              >
                <CardMedia
                  component="img"
                  image={imageUrl}
                  alt={item.name}
                  onError={(e) => {
                    console.error("Failed to load image:", imageUrl, "Original URL:", item.imageUrl);
                    e.target.style.display = "none";
                    const errorBox = e.target.parentElement;
                    if (errorBox) {
                      errorBox.innerHTML = `
                        <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; color: #999999; font-size: 0.75rem;">
                          Image not found
                        </div>
                      `;
                    }
                  }}
                  sx={{
                    objectFit: "cover",
                    width: "100%",
                    height: "180px",
                    display: "block",
                  }}
                />
              </Box>
            ) : (
              <Box
                sx={{
                  width: "100%",
                  height: 180,
                  backgroundColor: "#e0e0e0",
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="body2" sx={{ color: "#999999", fontSize: "0.75rem" }}>
                  No Image
                </Typography>
              </Box>
            )}
          </Box>

          {item.description && (
            <Box sx={{ px: 1.5, pb: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  color: "#666666",
                  fontSize: "0.7rem",
                  textAlign: "center",
                  fontFamily: "sans-serif",
                  lineHeight: 1.3,
                }}
              >
                {item.description}
              </Typography>
            </Box>
          )}

          {totalRedeemCodes > 0 && (
            <Box sx={{ px: 1.5, pb: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Typography
                variant="caption"
                sx={{ color: "#333333", fontWeight: 600, textTransform: "uppercase" }}
              >
                Redeem Codes ({totalRedeemCodes})
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 0.5,
                  justifyContent: "center",
                }}
              >
                {(item.redeemCodes || []).slice(0, 3).map(code => (
                  <Chip
                    key={code}
                    label={code}
                    size="small"
                    sx={{
                      backgroundColor: "rgba(46, 204, 113, 0.15)",
                      color: "#1b5e20",
                      borderColor: "rgba(46, 204, 113, 0.3)",
                    }}
                    variant="outlined"
                  />
                ))}
                {Array.isArray(item.redeemCodes) && item.redeemCodes.length > 3 && (
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => setRedeemDialogOpen(true)}
                    sx={{
                      textTransform: "none",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "#1b5e20",
                      px: 1,
                      minWidth: "auto",
                    }}
                  >
                    View all
                  </Button>
                )}
              </Box>
            </Box>
          )}

          <Button
            fullWidth
            variant="contained"
            sx={{
              borderRadius: 0,
              backgroundColor: "#2ecc71",
              color: "#000000",
              fontWeight: 700,
              fontSize: "0.875rem",
              py: 1,
              textTransform: "none",
              boxShadow: "none",
              mt: "auto",
              fontFamily: "sans-serif",
              "&:hover": {
                backgroundColor: "#27ae60",
                boxShadow: "none",
              },
              "&.Mui-disabled": {
                color: "#000000",
                backgroundColor: "#2ecc71",
              },
            }}
            disabled
          >
            {item.coins} Coins
          </Button>
        </Box>
      </Card>

      <Dialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setEditName(item.name);
          setEditDescription(item.description);
          setEditCoins(String(item.coins || 0));
          setEditImageUrl(item.imageUrl);
          setImageFile(null);
          setPreviewUrl(null);
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: "linear-gradient(135deg, rgba(26, 26, 26, 0.98), rgba(46, 204, 113, 0.05))",
            border: "1px solid rgba(46, 204, 113, 0.3)",
          },
        }}
      >
        <DialogTitle sx={{ color: "#ffffff" }}>Edit Item</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="Item Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
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
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
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
              value={editCoins}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || /^\d+$/.test(value)) {
                  setEditCoins(value);
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
                sx={{
                  borderColor: "rgba(255, 255, 255, 0.3)",
                  color: "rgba(255, 255, 255, 0.7)",
                  "&:hover": {
                    borderColor: "#2ecc71",
                    backgroundColor: "rgba(46, 204, 113, 0.1)",
                  },
                }}
              >
                {imageFile ? "Change Image" : "Upload Image"}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>

              {(previewUrl || imageUrl) && (
                <Box
                  sx={{
                    mt: 2,
                    borderRadius: 2,
                    overflow: "hidden",
                    maxHeight: 200,
                  }}
                >
                  <img
                    src={previewUrl || imageUrl}
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
                Redeem Codes ({editRedeemCodes.length})
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
                {editRedeemCodes.length === 0 ? (
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255, 255, 255, 0.5)" }}
                  >
                    No redeem codes added yet.
                  </Typography>
                ) : (
                  editRedeemCodes.map(code => (
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
              {editRedeemCodes.length > 0 && (
                <Typography
                  variant="caption"
                  sx={{ color: "rgba(255, 255, 255, 0.6)" }}
                >
                  Total codes added: {editRedeemCodes.length}
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => {
              setEditDialogOpen(false);
              setEditName(item.name);
              setEditDescription(item.description);
              setEditCoins(String(item.coins || 0));
              setEditImageUrl(item.imageUrl);
              setImageFile(null);
              setPreviewUrl(null);
              setEditRedeemCodes(item.redeemCodes || []);
              setRedeemCodeInput("");
              setRedeemDialogOpen(false);
            }}
            sx={{ color: "rgba(255, 255, 255, 0.7)" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={
              !editName ||
              !editCoins ||
              parseInt(editCoins) < 0 ||
              isUpdating
            }
            sx={{
              background: "linear-gradient(135deg, #2ecc71, #27ae60)",
              "&:hover": {
                background: "linear-gradient(135deg, #27ae60, #229954)",
              },
            }}
          >
            {isUpdating ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => !isDeleting && setDeleteDialogOpen(false)}
        maxWidth="sm"
        PaperProps={{
          sx: {
            background:
              "linear-gradient(135deg, rgba(26, 26, 26, 0.98), rgba(231, 76, 60, 0.05))",
            border: "1px solid rgba(231, 76, 60, 0.3)",
          },
        }}
      >
        <DialogTitle sx={{ color: "#ffffff", pb: 1 }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "rgba(255, 255, 255, 0.9)", fontSize: "0.95rem" }}>
            Are you sure you want to delete <strong>"{item.name}"</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={isDeleting}
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
            onClick={handleDelete}
            variant="contained"
            disabled={isDeleting}
            sx={{
              backgroundColor: "#e74c3c",
              color: "#ffffff",
              "&:hover": {
                backgroundColor: "#c0392b",
              },
              "&.Mui-disabled": {
                backgroundColor: "rgba(231, 76, 60, 0.5)",
                color: "rgba(255, 255, 255, 0.5)",
              },
            }}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={redeemDialogOpen}
        onClose={() => setRedeemDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background:
              "linear-gradient(135deg, rgba(26, 26, 26, 0.95), rgba(46, 204, 113, 0.08))",
            border: "1px solid rgba(46, 204, 113, 0.3)",
          },
        }}
      >
        <DialogTitle sx={{ color: "#ffffff" }}>
          Redeem Codes — {item.name}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            {Array.isArray(item.redeemCodes) && item.redeemCodes.length > 0 ? (
              item.redeemCodes.map(code => (
                <Box
                  key={code}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    border: "1px solid rgba(46, 204, 113, 0.4)",
                    borderRadius: 1,
                    px: 2,
                    py: 1,
                    backgroundColor: "rgba(46, 204, 113, 0.08)",
                    color: "#ffffff",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                  }}
                >
                  <span>{code}</span>
                </Box>
              ))
            ) : (
              <Typography sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                No redeem codes available for this item.
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setRedeemDialogOpen(false)}
            sx={{ color: "rgba(255, 255, 255, 0.8)" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

