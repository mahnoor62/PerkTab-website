"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Grid,
  LinearProgress,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AppHeader from "@/components/layout/AppHeader";
import { fetchJson, uploadFile, removeAuthToken } from "@/lib/api";
import { getAuthToken } from "@/lib/api";
import { useRouter } from "next/navigation";
import ShopItemCard from "@/components/shop/ShopItemCard";
import AddItemDialog from "@/components/shop/AddItemDialog";

const initialAlertState = {
  open: false,
  severity: "success",
  message: "",
};

export default function ShopPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alertState, setAlertState] = useState(initialAlertState);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isCreatingItem, setIsCreatingItem] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const token = getAuthToken();
        if (!token) {
          router.push("/login");
          return;
        }

        const sessionResponse = await fetchJson("/api/auth/session").catch(
          (err) => {
            if (err.status === 401) {
              removeAuthToken();
              router.push("/login");
            }
            throw err;
          }
        );

        if (!sessionResponse.authenticated || !sessionResponse.admin) {
          removeAuthToken();
          router.push("/login");
          return;
        }

        setAdminEmail(sessionResponse.admin.email);

        const itemsResponse = await fetchJson("/api/shop/admin");
        const itemsList = Array.isArray(itemsResponse.items)
          ? itemsResponse.items
          : [];
        setItems(itemsList);
      } catch (error) {
        console.error("[Shop] Error loading data:", error);
        setAlertState({
          open: true,
          severity: "error",
          message: error.message || "Failed to load shop items.",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetchJson("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.warn("[Logout] Logout request failed:", error);
    } finally {
      removeAuthToken();
      router.push("/login");
    }
  };

  const handleUploadImage = async (file) => {
    setIsUploadingImage(true);
    try {
      console.log("handleUploadImage called with file:", file?.name);
      const data = await uploadFile(file);
      console.log("uploadFile returned data:", data);
      
      if (!data || !data.url) {
        console.error("Upload response missing url field:", data);
        setAlertState({
          open: true,
          severity: "error",
          message: "Image upload failed: Invalid response from server.",
        });
        throw new Error("Invalid upload response: missing url field");
      }
      
      console.log("Image uploaded successfully, URL:", data.url);
      // Don't show success message here - only show success when item is created
      return data.url;
    } catch (error) {
      console.error("Error in handleUploadImage:", error);
      setAlertState({
        open: true,
        severity: "error",
        message: error.message || "Image upload failed.",
      });
      throw error; // Re-throw so AddItemDialog can handle it
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleCreateItem = async (payload) => {
    setIsCreatingItem(true);
    try {
      const data = await fetchJson("/api/shop", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setItems((prev) => [data.item, ...prev]);
      setAlertState({
        open: true,
        severity: "success",
        message: `Item "${data.item.name}" created successfully.`,
      });
      return data.item;
    } catch (error) {
      setAlertState({
        open: true,
        severity: "error",
        message: error.message || "Unable to create item.",
      });
      throw error;
    } finally {
      setIsCreatingItem(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await fetchJson(`/api/shop/${itemId}`, {
        method: "DELETE",
      });

      setItems((prev) => prev.filter((item) => item._id !== itemId));
      setAlertState({
        open: true,
        severity: "success",
        message: "Item deleted successfully.",
      });
    } catch (error) {
      setAlertState({
        open: true,
        severity: "error",
        message: error.message || "Unable to delete item.",
      });
    }
  };

  const handleUpdateItem = async (itemId, payload) => {
    try {
      const data = await fetchJson(`/api/shop/${itemId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      setItems((prev) =>
        prev.map((item) => (item._id === itemId ? data.item : item))
      );
      setAlertState({
        open: true,
        severity: "success",
        message: `Item "${data.item.name}" updated successfully.`,
      });
    } catch (error) {
      setAlertState({
        open: true,
        severity: "error",
        message: error.message || "Unable to update item.",
      });
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        pb: 6,
        position: "relative",
        background: "#0a0a0a",
        "&::before": {
          content: '""',
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 20%, rgba(52, 152, 219, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 30%, rgba(155, 89, 182, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 30% 80%, rgba(26, 188, 156, 0.12) 0%, transparent 50%),
            radial-gradient(circle at 70% 80%, rgba(155, 89, 182, 0.15) 0%, transparent 50%),
            linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)
          `,
          zIndex: 0,
          pointerEvents: "none",
        },
      }}
    >
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <AppHeader adminEmail={adminEmail} onLogout={handleLogout} />

        {isLoading ? (
          <LinearProgress sx={{ position: "sticky", top: 0, zIndex: 2 }} />
        ) : null}

        <Container maxWidth="xl" sx={{ mt: 6 }}>
          <Stack spacing={4}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
              spacing={2}
            >
              <Stack spacing={1}>
                <Typography
                  variant="h3"
                  fontWeight={700}
                  sx={{ color: "#ffffff" }}
                >
                  Shop
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                >
                  Manage shop items, prices, and inventory.
                </Typography>
              </Stack>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddRoundedIcon />}
                onClick={() => setCreateDialogOpen(true)}
                sx={{
                  borderRadius: 3,
                  background: "linear-gradient(135deg, #e9e224, #d4c920)",
                  boxShadow:
                    "0 8px 24px rgba(233, 226, 36, 0.4), 0 0 0 1px rgba(233, 226, 36, 0.2)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #d4c920, #bfb01c)",
                    boxShadow:
                      "0 12px 32px rgba(233, 226, 36, 0.6), 0 0 0 1px rgba(233, 226, 36, 0.3)",
                  },
                }}
              >
                Add Item
              </Button>
            </Stack>

            {items.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  textAlign: "center",
                  background:
                    "linear-gradient(135deg, rgba(26, 26, 26, 0.95), rgba(233, 226, 36, 0.08))",
                  border: "1px solid rgba(233, 226, 36, 0.3)",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ color: "rgba(255, 255, 255, 0.7)", mb: 2 }}
                >
                  No items in shop yet
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255, 255, 255, 0.5)" }}
                >
                  Click "Add Item" to create your first shop item
                </Typography>
              </Paper>
            ) : (
              <Grid 
                container 
                spacing={2} 
                sx={{ 
                  width: "100%",
                  justifyContent: { xs: "center", sm: "flex-start" },
                }}
              >
                {items.map((item) => (
                  <Grid 
                    item 
                    xs={12} 
                    sm={6} 
                    md={3} 
                    key={item._id} 
                    sx={{ 
                      display: "flex",
                      justifyContent: { xs: "center", sm: "flex-start" },
                    }}
                  >
                    <ShopItemCard
                      item={item}
                      onDelete={handleDeleteItem}
                      onUpdate={handleUpdateItem}
                      onUploadImage={handleUploadImage}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Stack>
        </Container>
      </Box>

      <Snackbar
        open={alertState.open}
        autoHideDuration={10000}
        onClose={() => setAlertState(initialAlertState)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setAlertState(initialAlertState)}
          severity={alertState.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {alertState.message}
        </Alert>
      </Snackbar>

      <AddItemDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreate={handleCreateItem}
        isSubmitting={isCreatingItem}
        onUploadImage={handleUploadImage}
        isUploadingImage={isUploadingImage}
      />
    </Box>
  );
}

