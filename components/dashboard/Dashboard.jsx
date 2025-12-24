// "use client";

// import { useEffect, useMemo, useState } from "react";
// import {
//   Alert,
//   Box,
//   Button,
//   Card,
//   CardContent,
//   Chip,
//   Container,
//   LinearProgress,
//   Paper,
//   Snackbar,
//   Stack,
//   Typography,
// } from "@mui/material";
// import AddRoundedIcon from "@mui/icons-material/AddRounded";
// import AppHeader from "@/components/layout/AppHeader";
// import LevelList from "@/components/dashboard/LevelList";
// import LevelEditor from "@/components/dashboard/LevelEditor";
// import LevelPreview from "@/components/dashboard/LevelPreview";
// import NewLevelDialog from "@/components/dashboard/NewLevelDialog";

// const initialAlertState = {
//   open: false,
//   severity: "success",
//   message: "",
// };

// import { fetchJson, uploadFile, removeAuthToken, getAuthToken } from "@/lib/api";

// export default function Dashboard({ initialLevels = [], adminEmail }) {
//   const MAX_LEVELS = 10;
//   const [levels, setLevels] = useState([]);
//   const [selectedLevel, setSelectedLevel] = useState(null);
//   const [isLoadingLevels, setIsLoadingLevels] = useState(true);
//   const [isSaving, setIsSaving] = useState(false);
//   const [isUploadingLogo, setIsUploadingLogo] = useState(false);
//   const [alertState, setAlertState] = useState(initialAlertState);
//   const [createDialogOpen, setCreateDialogOpen] = useState(false);
//   const [isCreatingLevel, setIsCreatingLevel] = useState(false);
//   const canAddMoreLevels = levels.length < MAX_LEVELS;

//   const selectedLevelData = useMemo(
//     () => levels.find((item) => item.level === selectedLevel),
//     [levels, selectedLevel]
//   );

//   useEffect(() => {
//     async function loadLevels() {
//       setIsLoadingLevels(true);
//       try {
//         const data = await fetchJson("/api/levels");
        
//         if (!data || !data.levels || !Array.isArray(data.levels)) {
//           throw new Error("Invalid response from levels API: missing levels array");
//         }
        
//         // Always use fresh data from database (ignore initialLevels prop)
//         setLevels(data.levels);
//         setSelectedLevel((prev) => {
//           if (data.levels.length === 0) {
//             return null;
//           }
//           // Keep selected level if it exists in new data
//           if (prev != null && data.levels.some((lvl) => lvl.level === prev)) {
//             return prev;
//           }
//           // Otherwise select first level
//           return data.levels[0]?.level ?? null;
//         });
//       } catch (error) {
//         console.error("[Dashboard] Error loading levels:", error);
//         setAlertState({
//           open: true,
//           severity: "error",
//           message: error.message || "Unable to fetch levels. Please refresh and try again.",
//         });
//       } finally {
//         setIsLoadingLevels(false);
//       }
//     }

//     // Always fetch fresh data from database on mount
//     loadLevels();
//   }, []);

//   const handleSelectLevel = (levelNumber) => {
//     setSelectedLevel(levelNumber);
//   };

//   const handleSaveLevel = async (payload, showNotification = false) => {
//     if (!selectedLevelData) return;

//     setIsSaving(true);
//     try {
//       const data = await fetchJson(`/api/levels/${selectedLevelData.level}`, {
//         method: "PUT",
//         body: JSON.stringify(payload),
//       });

//       setLevels((prev) =>
//         prev.map((level) =>
//           level.level === data.level.level ? data.level : level
//         )
//       );

//       if (showNotification) {
//         setAlertState({
//           open: true,
//           severity: "success",
//           message: `Level ${selectedLevelData.level} saved successfully.`,
//         });
//       }
//     } catch (error) {
//       setAlertState({
//         open: true,
//         severity: "error",
//         message: error.message || "Unable to save level configuration.",
//       });
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleUploadLogo = async (file) => {
//     setIsUploadingLogo(true);
//     try {
//       const data = await uploadFile(file);
//       setAlertState({
//         open: true,
//         severity: "success",
//         message: "Logo uploaded successfully.",
//       });
//       return data.url;
//     } catch (error) {
//       setAlertState({
//         open: true,
//         severity: "error",
//         message: error.message || "Logo upload failed.",
//       });
//       return null;
//     } finally {
//       setIsUploadingLogo(false);
//     }
//   };

//   const handleCreateLevel = async (payload) => {
//     setIsCreatingLevel(true);
//     try {
//       const data = await fetchJson("/api/levels", {
//         method: "POST",
//         body: JSON.stringify(payload),
//       });

//       setLevels((prev) =>
//         [...prev, data.level].sort((a, b) => a.level - b.level)
//       );
//       setSelectedLevel(data.level.level);
//       setAlertState({
//         open: true,
//         severity: "success",
//         message: `Level ${data.level.level} created successfully.`,
//       });

//       return data.level;
//     } catch (error) {
//       throw error;
//     } finally {
//       setIsCreatingLevel(false);
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       console.log("[Logout] Initiating logout...");
//       await fetchJson("/api/auth/logout", { method: "POST" });
//       console.log("[Logout] Logout API call successful");
//     } catch (error) {
//       console.warn("[Logout] Logout request failed:", error);
//     } finally {
//       console.log("[Logout] Removing token from storage...");
//       removeAuthToken();
//       // Verify token is removed
//       const tokenStorageKey = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY;
//       if (!tokenStorageKey) {
//         console.error("[Logout] ERROR: NEXT_PUBLIC_AUTH_TOKEN_KEY is not defined in environment variables!");
//         return;
//       }
//       const tokenAfterRemove = localStorage.getItem(tokenStorageKey);
//       if (tokenAfterRemove) {
//         console.error("[Logout] WARNING: Token still exists after removal!");
//         // Force clear
//         localStorage.removeItem(tokenStorageKey);
//       } else {
//         console.log("[Logout] Token successfully removed");
//       }
//       window.location.href = "/login";
//     }
//   };

//   return (
//     <Box
//       sx={{
//         minHeight: "100vh",
//         pb: 6,
//         position: "relative",
//         background: "#0a0a0a",
//         "&::before": {
//           content: '""',
//           position: "fixed",
//           top: 0,
//           left: 0,
//           right: 0,
//           bottom: 0,
//           background: `
//             radial-gradient(circle at 20% 20%, rgba(52, 152, 219, 0.15) 0%, transparent 50%),
//             radial-gradient(circle at 80% 30%, rgba(155, 89, 182, 0.2) 0%, transparent 50%),
//             radial-gradient(circle at 30% 80%, rgba(26, 188, 156, 0.12) 0%, transparent 50%),
//             radial-gradient(circle at 70% 80%, rgba(155, 89, 182, 0.15) 0%, transparent 50%),
//             linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)
//           `,
//           zIndex: 0,
//           pointerEvents: "none",
//         },
//       }}
//     >
//       <Box sx={{ position: "relative", zIndex: 1 }}>
//         <AppHeader adminEmail={adminEmail} onLogout={handleLogout} />

//         {isLoadingLevels ? (
//           <LinearProgress sx={{ position: "sticky", top: 0, zIndex: 2 }} />
//         ) : null}

//         <Container maxWidth="xl" sx={{ mt: 6 }}>
//         <Stack spacing={4}>
//           <Stack spacing={1}>
//             <Typography variant="h3" fontWeight={700} sx={{ color: "#ffffff" }}>
//               Level Operations Control
//             </Typography>
//             <Typography variant="body1" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
//               Manage the color system, dot palette, and branding for every DotBack level.
//               Updates are persisted instantly in MongoDB.
//             </Typography>
//           </Stack>

//           <Paper
//             elevation={0}
//             sx={{
//               borderRadius: 5,
//               p: { xs: 3, md: 4 },
//               background:
//                 "linear-gradient(135deg, rgba(26, 26, 26, 0.95), rgba(233, 226, 36, 0.08), rgba(26, 188, 156, 0.1))",
//               border: "1px solid rgba(233, 226, 36, 0.3)",
//               boxShadow: "0 24px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(233, 226, 36, 0.1), 0 0 40px rgba(233, 226, 36, 0.1)",
//               position: "relative",
//               overflow: "hidden",
//               "&::before": {
//                 content: '""',
//                 position: "absolute",
//                 top: -50,
//                 right: -50,
//                 width: 200,
//                 height: 200,
//                 borderRadius: "50%",
//                 background: "radial-gradient(circle, rgba(233, 226, 36, 0.15), transparent)",
//                 filter: "blur(40px)",
//                 pointerEvents: "none",
//               },
//             }}
//           >
//             <Stack spacing={3}>
//               <Stack
//                 direction={{ xs: "column", md: "row" }}
//                 justifyContent="space-between"
//                 alignItems={{ xs: "flex-start", md: "center" }}
//                 spacing={2}
//               >
//                 <Stack spacing={1}>
//                   <Typography variant="h5" fontWeight={700} sx={{ color: "#ffffff" }}>
//                     Active Level
//                   </Typography>
//                   <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
//                     Adjust configuration parameters, preview the results, and launch the updated branding in minutes.
//                   </Typography>
//                 </Stack>
//                 <Stack direction="row" spacing={2} alignItems="center">
//                   <Chip
//                     label={
//                       selectedLevelData
//                         ? `Editing Level ${selectedLevelData.level}`
//                         : "No level selected"
//                     }
//                     color={selectedLevelData ? "primary" : "default"}
//                     sx={{
//                       fontWeight: 600,
//                       fontSize: 16,
//                       px: 2,
//                       py: 2,
//                       borderRadius: 999,
//                       backgroundColor: selectedLevelData
//                         ? undefined
//                         : "rgba(12,37,66,0.08)",
//                     }}
//                   />
//                   {canAddMoreLevels ? (
//                     <Button
//                       variant="contained"
//                       size="large"
//                       startIcon={<AddRoundedIcon />}
//                       onClick={() => setCreateDialogOpen(true)}
//                       sx={{
//                         borderRadius: 3,
//                         background: "linear-gradient(135deg, #e9e224, #d4c920)",
//                         boxShadow:
//                           "0 8px 24px rgba(233, 226, 36, 0.4), 0 0 0 1px rgba(233, 226, 36, 0.2)",
//                         "&:hover": {
//                           background: "linear-gradient(135deg, #d4c920, #bfb01c)",
//                           boxShadow:
//                             "0 12px 32px rgba(233, 226, 36, 0.6), 0 0 0 1px rgba(233, 226, 36, 0.3)",
//                         },
//                       }}
//                     >
//                       Add Level
//                     </Button>
//                   ) : null}
//                 </Stack>
//               </Stack>

//               <Box
//                 sx={{
//                   display: "grid",
//                   gap: 4,
//                   alignItems: "stretch",
//                   gridTemplateColumns: {
//                     xs: "1fr",
//                     lg: "minmax(260px, 320px) 1fr",
//                   },
//                 }}
//               >
//                 <Box
//                   sx={{
//                     height: "calc(100vh - 220px)",
//                     minHeight: "760px",
//                     overflowY: "auto",
//                     overflowX: "hidden",
//                     pr: 1,
//                     pt: 2,
//                     pb: 2,
//                     "&::-webkit-scrollbar": {
//                       width: "8px",
//                     },
//                     "&::-webkit-scrollbar-track": {
//                       background: "rgba(26, 26, 26, 0.5)",
//                       borderRadius: "4px",
//                     },
//                     "&::-webkit-scrollbar-thumb": {
//                       background: "rgba(233, 226, 36, 0.4)",
//                       borderRadius: "4px",
//                       "&:hover": {
//                         background: "rgba(233, 226, 36, 0.6)",
//                       },
//                     },
//                   }}
//                 >
//                   <LevelList
//                     levels={levels}
//                     selectedLevel={selectedLevel}
//                     onSelectLevel={handleSelectLevel}
//                     onAddClick={() => setCreateDialogOpen(true)}
//                     canAddMoreLevels={canAddMoreLevels}
//                   />
//                 </Box>
//                 <Card
//                   elevation={0}
//                   sx={{
//                     borderRadius: 4,
//                     background:
//                       "linear-gradient(135deg, rgba(26, 26, 26, 0.95), rgba(233, 226, 36, 0.08), rgba(26, 188, 156, 0.1))",
//                     border: "1px solid rgba(233, 226, 36, 0.3)",
//                     boxShadow: "0 20px 45px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(233, 226, 36, 0.1)",
//                   }}
//                 >
//                   <CardContent
//                     sx={{
//                       p: { xs: 3, md: 4 },
//                       display: "grid",
//                       gap: 4,
//                       alignItems: "start",
//                       gridTemplateColumns: {
//                         xs: "1fr",
//                         md: "1fr 1fr",
//                       },
//                     }}
//                   >
//                     <LevelEditor
//                       level={selectedLevelData}
//                       onSave={handleSaveLevel}
//                       isSaving={isSaving}
//                       isUploadingLogo={isUploadingLogo}
//                       onUploadLogo={handleUploadLogo}
//                     />
//                     <LevelPreview level={selectedLevelData} />
//                   </CardContent>
//                 </Card>
//               </Box>
//             </Stack>
//           </Paper>
//         </Stack>
//       </Container>
//       </Box>

//       <Snackbar
//         open={alertState.open}
//         autoHideDuration={4000}
//         onClose={() => setAlertState(initialAlertState)}
//         anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
//       >
//         <Alert
//           onClose={() => setAlertState(initialAlertState)}
//           severity={alertState.severity}
//           variant="filled"
//           sx={{ width: "100%" }}
//         >
//           {alertState.message}
//         </Alert>
//       </Snackbar>
//       <NewLevelDialog
//         open={createDialogOpen}
//         onClose={() => setCreateDialogOpen(false)}
//         onCreate={handleCreateLevel}
//         isSubmitting={isCreatingLevel}
//       />
//     </Box>
//   );
// }

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

import AppHeader from "@/components/layout/AppHeader";
import LevelList from "@/components/dashboard/LevelList";
import LevelEditor from "@/components/dashboard/LevelEditor";
import LevelPreview from "@/components/dashboard/LevelPreview";
import NewLevelDialog from "@/components/dashboard/NewLevelDialog";

import { fetchJson, uploadFile, removeAuthToken } from "@/lib/api";

const MAX_LEVELS = 10;

const initialAlertState = {
  open: false,
  severity: "success",
  message: "",
};

export default function Dashboard({ initialLevels = [], adminEmail }) {
  const [levels, setLevels] = useState(initialLevels);
  const [selectedLevel, setSelectedLevel] = useState(
    initialLevels[0]?.level ?? null
  );

  const [isLoadingLevels, setIsLoadingLevels] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [alertState, setAlertState] = useState(initialAlertState);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isCreatingLevel, setIsCreatingLevel] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [levelToDelete, setLevelToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editorFormValues, setEditorFormValues] = useState(null);

  const canAddMoreLevels = levels.length < MAX_LEVELS;

  // jis level ko select kia hua hai uska complete object
  const selectedLevelData = useMemo(
    () => levels.find((item) => item.level === selectedLevel) ?? null,
    [levels, selectedLevel]
  );

  // 🔹 sirf DB se levels load karo – koi default front-end se mat banao
  useEffect(() => {
    (async () => {
      setIsLoadingLevels(true);
      try {
        const data = await fetchJson("/api/levels");
        const list = Array.isArray(data.levels) ? data.levels : [];

        setLevels(list);

        // selection handling
        setSelectedLevel((prev) => {
          if (!list.length) return null; // koi level hi nahi
          // agar pehle wala selected abhi bhi list mein hai to use hi rehne do
          if (prev != null && list.some((lvl) => lvl.level === prev)) return prev;
          // warna pehla level select kar lo
          return list[0].level;
        });
      } catch (error) {
        console.error("[Dashboard] Error loading levels:", error);
        setAlertState({
          open: true,
          severity: "error",
          message:
            error.message ||
            "Unable to fetch levels. Please refresh and try again.",
        });
      } finally {
        setIsLoadingLevels(false);
      }
    })();
  }, []);

  const handleSelectLevel = (levelNumber) => {
    setSelectedLevel(levelNumber);
    setEditorFormValues(null); // Reset form values when switching levels
  };

  // 🔹 sirf existing level update – backend already sirf DB update karega
  const handleSaveLevel = async (payload, showNotification = false, levelId = null) => {
    if (!selectedLevelData) return;

    setIsSaving(true);
    try {
      // Use ID-based endpoint if levelId is provided (for partial updates)
      // Otherwise fall back to level number endpoint (for full updates)
      const endpoint = levelId 
        ? `/api/levels/id/${levelId}`
        : `/api/levels/${selectedLevelData.level}`;
      
      const data = await fetchJson(endpoint, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      const updated = data.level;

      // Create a new object to ensure React detects the change
      setLevels((prev) =>
        prev.map((lvl) => 
          (levelId && lvl._id === levelId) || (!levelId && lvl.level === updated.level)
            ? { ...updated } // Create new object reference
            : lvl
        )
      );

      // Update selected level data if it's the current one
      if ((levelId && selectedLevelData._id === levelId) || (!levelId && selectedLevelData.level === updated.level)) {
        // Force re-render by updating selected level data reference
        setSelectedLevel((prev) => prev); // Trigger re-selection
      }

      if (showNotification) {
        setAlertState({
          open: true,
          severity: "success",
          message: `Level ${updated.level} saved successfully.`,
        });
      }
    } catch (error) {
      setAlertState({
        open: true,
        severity: "error",
        message:
          error.message || "Unable to save level configuration. Please retry.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // 🔹 logo upload same hi rakha – sirf errors handle
  const handleUploadLogo = async (file) => {
    setIsUploadingLogo(true);
    try {
      const data = await uploadFile(file);
      setAlertState({
        open: true,
        severity: "success",
        message: "Logo uploaded successfully.",
      });
      return data.url;
    } catch (error) {
      setAlertState({
        open: true,
        severity: "error",
        message: error.message || "Logo upload failed.",
      });
      return null;
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // 🔹 Background image upload handler
  const handleUploadBackgroundImage = async (file) => {
    setIsUploadingLogo(true); // Reuse the same loading state
    try {
      const data = await uploadFile(file);
      setAlertState({
        open: true,
        severity: "success",
        message: "Background image uploaded successfully.",
      });
      return data.url;
    } catch (error) {
      // Extract the actual error message from the error object
      let errorMessage = "Background image upload failed.";
      
      if (error?.response?.data?.message) {
        // Backend returned a specific error message
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        // Backend returned error in 'error' field
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        // Error object has a message property
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        // Error is a string
        errorMessage = error;
      } else if (error?.response?.status) {
        // HTTP error status
        const status = error.response.status;
        if (status === 400) {
          errorMessage = "Invalid file. Please upload a valid PNG or JPG image.";
        } else if (status === 401) {
          errorMessage = "Unauthorized. Please log in again.";
        } else if (status === 413) {
          errorMessage = "File too large. Please upload a smaller image.";
        } else if (status === 500) {
          errorMessage = error?.response?.data?.message || "Server error. Please try again later.";
        } else {
          errorMessage = `Upload failed with status ${status}. Please try again.`;
        }
      }
      
      // Throw error with proper message - let the component handle displaying it
      const uploadError = new Error(errorMessage);
      uploadError.status = error?.response?.status;
      throw uploadError;
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // 🔹 Add Level – backend 1–10 me se next free level choose karega
  const handleCreateLevel = async (payload = {}) => {
    setIsCreatingLevel(true);
    try {
      const data = await fetchJson("/api/levels", {
        method: "POST",
        body: JSON.stringify(payload), // payload optional hai, backend level number khud decide karega
      });

      const created = data.level;

      setLevels((prev) =>
        [...prev, created].sort((a, b) => a.level - b.level)
      );
      setSelectedLevel(created.level);

      setAlertState({
        open: true,
        severity: "success",
        message: `Level ${created.level} created successfully.`,
      });

      return created;
    } catch (error) {
      // Re-throw error so NewLevelDialog can catch and display it
      throw error;
    } finally {
      setIsCreatingLevel(false);
    }
  };

  // 🔹 Delete Level - Open confirmation dialog
  const handleDeleteLevel = (levelNumber) => {
    setLevelToDelete(levelNumber);
    setDeleteDialogOpen(true);
  };

  // 🔹 Confirm Delete Level
  const handleConfirmDelete = async () => {
    if (!levelToDelete) return;

    const levelToDeleteValue = levelToDelete;
    
    // Close dialog immediately to prevent flicker
    setDeleteDialogOpen(false);
    setLevelToDelete(null);
    
    setIsDeleting(true);
    try {
      await fetchJson(`/api/levels/${levelToDeleteValue}`, {
        method: "DELETE",
      });

      // Update selection first if needed, then update levels list
      if (selectedLevel === levelToDeleteValue) {
        setLevels((prev) => {
          const updated = prev.filter((lvl) => lvl.level !== levelToDeleteValue).sort((a, b) => a.level - b.level);
          if (updated.length > 0) {
            setSelectedLevel(updated[0].level);
          } else {
            setSelectedLevel(null);
          }
          return updated;
        });
      } else {
        // Just update the levels list
        setLevels((prev) => 
          prev.filter((lvl) => lvl.level !== levelToDeleteValue).sort((a, b) => a.level - b.level)
        );
      }

      setAlertState({
        open: true,
        severity: "success",
        message: `Level ${levelToDeleteValue} deleted successfully.`,
      });
    } catch (error) {
      setAlertState({
        open: true,
        severity: "error",
        message: error.message || "Unable to delete level.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = async () => {
    try {
      console.log("[Logout] Initiating logout...");
      await fetchJson("/api/auth/logout", { method: "POST" });
      console.log("[Logout] Logout API call successful");
    } catch (error) {
      console.warn("[Logout] Logout request failed:", error);
    } finally {
      console.log("[Logout] Removing token from storage...");
      removeAuthToken();

      const tokenStorageKey = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY;
      if (!tokenStorageKey) {
        console.error(
          "[Logout] ERROR: NEXT_PUBLIC_AUTH_TOKEN_KEY is not defined in environment variables!"
        );
      } else {
        localStorage.removeItem(tokenStorageKey);
      }

      window.location.href = "/login";
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

        {isLoadingLevels ? (
          <LinearProgress sx={{ position: "sticky", top: 0, zIndex: 2 }} />
        ) : null}

        <Container maxWidth="xl" sx={{ mt: 6 }}>
          <Stack spacing={4}>
            <Stack spacing={1}>
              <Typography
                variant="h3"
                fontWeight={700}
                sx={{ color: "#ffffff" }}
              >
                Level Operations Control
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "rgba(255, 255, 255, 0.7)" }}
              >
                Manage the color system, dot palette, and branding for every
                PerkTap level. Updates are persisted instantly in MongoDB.
              </Typography>
            </Stack>

            <Paper
              elevation={0}
              sx={{
                borderRadius: 5,
                p: { xs: 3, md: 4 },
                background:
                  "linear-gradient(135deg, rgba(26, 26, 26, 0.95), rgba(233, 226, 36, 0.08), rgba(26, 188, 156, 0.1))",
                border: "1px solid rgba(233, 226, 36, 0.3)",
                boxShadow:
                  "0 24px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(233, 226, 36, 0.1), 0 0 40px rgba(233, 226, 36, 0.1)",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: -50,
                  right: -50,
                  width: 200,
                  height: 200,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(233, 226, 36, 0.15), transparent)",
                  filter: "blur(40px)",
                  pointerEvents: "none",
                },
              }}
            >
              <Stack spacing={3}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", md: "center" }}
                  spacing={2}
                >
                  <Stack spacing={1}>
                    <Typography
                      variant="h5"
                      fontWeight={700}
                      sx={{ color: "#ffffff" }}
                    >
                      Active Level
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                    >
                      Adjust configuration parameters, preview the results, and
                      launch the updated branding in minutes.
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Chip
                      label={
                        selectedLevelData
                          ? `Editing Level ${selectedLevelData.level}`
                          : "No level selected"
                      }
                      color={selectedLevelData ? "primary" : "default"}
                      sx={{
                        fontWeight: 600,
                        fontSize: 16,
                        px: 2,
                        py: 2,
                        borderRadius: 999,
                        backgroundColor: selectedLevelData
                          ? undefined
                          : "rgba(12,37,66,0.08)",
                      }}
                    />
                    {canAddMoreLevels ? (
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<AddRoundedIcon />}
                        onClick={() => setCreateDialogOpen(true)}
                        sx={{
                          borderRadius: 3,
                          background:
                            "linear-gradient(135deg, #e9e224, #d4c920)",
                          boxShadow:
                            "0 8px 24px rgba(233, 226, 36, 0.4), 0 0 0 1px rgba(233, 226, 36, 0.2)",
                          "&:hover": {
                            background:
                              "linear-gradient(135deg, #d4c920, #bfb01c)",
                            boxShadow:
                              "0 12px 32px rgba(233, 226, 36, 0.6), 0 0 0 1px rgba(233, 226, 36, 0.3)",
                          },
                        }}
                      >
                        Add Level
                      </Button>
                    ) : null}
                  </Stack>
                </Stack>

                <Box
                  sx={{
                    display: "grid",
                    gap: 4,
                    alignItems: "stretch",
                    gridTemplateColumns: {
                      xs: "1fr",
                      lg: "minmax(260px, 320px) 1fr",
                    },
                  }}
                >
                  <Box
                    sx={{
                      height: "calc(100vh - 220px)",
                      minHeight: "1280px", // Increased to show at least 6 levels (6 cards * ~150px + gaps)
                      overflowY: "auto",
                      overflowX: "hidden",
                      pr: 1,
                      pt: 2,
                      pb: 2,
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
                    <LevelList
                      levels={levels}
                      selectedLevel={selectedLevel}
                      onSelectLevel={handleSelectLevel}
                      onAddClick={() => setCreateDialogOpen(true)}
                      onDeleteLevel={handleDeleteLevel}
                      canAddMoreLevels={canAddMoreLevels}
                    />
                  </Box>

                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 4,
                      background:
                        "linear-gradient(135deg, rgba(26, 26, 26, 0.95), rgba(233, 226, 36, 0.08), rgba(26, 188, 156, 0.1))",
                      border: "1px solid rgba(233, 226, 36, 0.3)",
                      boxShadow:
                        "0 20px 45px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(233, 226, 36, 0.1)",
                    }}
                  >
                    <CardContent
                      sx={{
                        p: { xs: 3, md: 4 },
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                      }}
                    >
                      {!selectedLevelData ? (
                        <Stack spacing={2} alignItems="center" sx={{ py: 8 }} justifyContent="center">
                          <Typography variant="h6" fontWeight={700} sx={{ color: "#ffffff" }}>
                            No level selected
                          </Typography>
                          <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)", textAlign: "center" }}>
                            Choose a level from the directory to adjust its DotBack configuration, or create a new level to get started.
                          </Typography>
                        </Stack>
                      ) : (
                        <>
                          {/* Row 1: Background Config (left) and Background Image Details (right) */}
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: {
                                xs: "column",
                                md: "row",
                              },
                              gap: 4,
                              alignItems: "start",
                            }}
                          >
                            <LevelEditor
                              level={selectedLevelData}
                              onSave={handleSaveLevel}
                              isSaving={isSaving}
                              isUploadingLogo={isUploadingLogo}
                              onUploadLogo={handleUploadLogo}
                              onUploadBackgroundImage={handleUploadBackgroundImage}
                              isUploadingBackgroundImage={isUploadingLogo}
                              backgroundOnly={true}
                            />
                            {/* REMOVED - Background Image Details section */}
                            {/* <LevelEditor
                              level={selectedLevelData}
                              onSave={handleSaveLevel}
                              isSaving={isSaving}
                              isUploadingLogo={isUploadingLogo}
                              onUploadLogo={handleUploadLogo}
                              onUploadBackgroundImage={handleUploadBackgroundImage}
                              isUploadingBackgroundImage={isUploadingLogo}
                              showBackgroundDetails={true}
                            /> */}
                          </Box>

                          {/* Row 2: Dot Sizes (left) and Colors (right) */}
                          <Box
                            sx={{
                              display: "grid",
                              gap: 4,
                              alignItems: "stretch",
                              gridTemplateColumns: {
                                xs: "1fr",
                                md: "1fr 1fr",
                              },
                            }}
                          >
                            <LevelEditor
                              level={selectedLevelData}
                              onSave={handleSaveLevel}
                              isSaving={isSaving}
                              isUploadingLogo={isUploadingLogo}
                              onUploadLogo={handleUploadLogo}
                              onUploadBackgroundImage={handleUploadBackgroundImage}
                              isUploadingBackgroundImage={isUploadingLogo}
                              dotSizesOnly={true}
                            />
                            <LevelEditor
                              level={selectedLevelData}
                              onSave={handleSaveLevel}
                              isSaving={isSaving}
                              isUploadingLogo={isUploadingLogo}
                              onUploadLogo={handleUploadLogo}
                              onUploadBackgroundImage={handleUploadBackgroundImage}
                              isUploadingBackgroundImage={isUploadingLogo}
                              colorsOnly={true}
                            />
                          </Box>

                          {/* Row 3: Dots (left) and Mobile Preview (right) */}
                          <Box
                            sx={{
                              display: "grid",
                              gap: 4,
                              alignItems: "start",
                              gridTemplateColumns: {
                                xs: "1fr",
                                md: "1fr 1fr",
                              },
                            }}
                          >
                            <LevelEditor
                              level={selectedLevelData}
                              onSave={handleSaveLevel}
                              isSaving={isSaving}
                              isUploadingLogo={isUploadingLogo}
                              onUploadLogo={handleUploadLogo}
                              onUploadBackgroundImage={handleUploadBackgroundImage}
                              isUploadingBackgroundImage={isUploadingLogo}
                              dotsOnly={true}
                              onFormValuesChange={setEditorFormValues}
                            />
                            <LevelPreview level={selectedLevelData} formValues={editorFormValues} />
                          </Box>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Box>
              </Stack>
            </Paper>
          </Stack>
        </Container>
      </Box>

      <Snackbar
        open={alertState.open}
        autoHideDuration={4000}
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

      <NewLevelDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreate={handleCreateLevel}
        isSubmitting={isCreatingLevel}
        onUploadLogo={handleUploadLogo}
        isUploadingLogo={isUploadingLogo}
        existingLevels={levels}
        onUploadBackgroundImage={handleUploadBackgroundImage}
        isUploadingBackgroundImage={isUploadingLogo}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => !isDeleting && setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background:
              "linear-gradient(135deg, rgba(26, 26, 26, 0.95), rgba(233, 226, 36, 0.08), rgba(26, 188, 156, 0.1))",
            border: "1px solid rgba(233, 226, 36, 0.3)",
            boxShadow:
              "0 24px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(233, 226, 36, 0.1), 0 0 40px rgba(233, 226, 36, 0.1)",
          },
        }}
      >
        <DialogTitle sx={{ pb: 2, borderBottom: "1px solid rgba(233, 226, 36, 0.2)", color: "#ffffff" }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography sx={{ color: "rgba(255, 255, 255, 0.9)" }}>
            Are you sure you want to delete <strong>Level {levelToDelete}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid rgba(233, 226, 36, 0.2)" }}>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setLevelToDelete(null);
            }}
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
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            variant="contained"
            sx={{
              background: "linear-gradient(135deg, #e74c3c, #c0392b)",
              "&:hover": {
                background: "linear-gradient(135deg, #c0392b, #a93226)",
              },
              "&:disabled": {
                background: "rgba(231, 76, 60, 0.3)",
              },
            }}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
