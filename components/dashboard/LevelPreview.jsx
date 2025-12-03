"use client";

import { Box, Stack, Typography } from "@mui/material";
import { getLogoUrl } from "@/lib/logo";

export default function LevelPreview({ level, formValues = null }) {
  if (!level) {
    return (
      <Stack spacing={2} alignItems="center" justifyContent="center">
        <Typography variant="h6" fontWeight={700} sx={{ color: "#ffffff" }}>
          Select a level to preview
        </Typography>
        <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)", textAlign: "center" }}>
          The live preview will render your chosen color palette, dot styling, and logo once a level is active.
        </Typography>
      </Stack>
    );
  }

  // Use formValues if provided for real-time preview, otherwise use level data
  const previewData = formValues ? {
    dots: formValues.dots || level.dots || [],
    background: formValues.backgroundType === "image" 
      ? formValues.backgroundImageUrl 
      : formValues.backgroundColor || level.background || "",
    logoUrl: formValues.backgroundType === "image" ? "" : (formValues.logoUrl || level.logoUrl || ""),
  } : {
    dots: level.dots || [],
    background: level.background || "",
    logoUrl: level.logoUrl || "",
  };

  const dots = Array.isArray(previewData.dots) ? previewData.dots : [];
  // Determine background type: if background starts with http, https, or /uploads/, it's an image URL; otherwise it's a color
  const background = previewData.background?.trim() || "#e9e224";
  
  // Check if it's an image URL (starts with http, https, or /uploads/)
  // Exclude hex colors and common color formats
  const isImageUrl = background && 
    !background.startsWith("#") && 
    !background.match(/^rgba?\(/) &&
    (background.startsWith("http://") || 
     background.startsWith("https://") || 
     background.startsWith("/uploads/") ||
     background.startsWith("/"));
  
  const backgroundColor = isImageUrl ? "transparent" : background;
  // Get full URL for background image using getLogoUrl to format it properly
  // If getLogoUrl returns null, fall back to the original background value
  const formattedUrl = isImageUrl && background ? getLogoUrl(background) : null;
  const backgroundImageUrl = formattedUrl || (isImageUrl ? background : "");
  
  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('[LevelPreview] Background:', {
      background,
      isImageUrl,
      backgroundImageUrl,
      formattedUrl,
      levelBackground: level.background
    });
  }
  
  // Parse dot sizes
  const parseSize = (sizeStr) => {
    if (!sizeStr) return 36;
    const num = parseFloat(sizeStr);
    return isNaN(num) ? 36 : Math.max(num, 20);
  };

  // Generate positions for dots arranged horizontally with horizontal gaps
  const getDotPositions = (dotsArray) => {
    if (dotsArray.length === 0) return [];
    
    const positions = [];
    // Container dimensions (accounting for padding: 12px top, 8px sides)
    const containerWidth = 280 - 16; // 8px padding on each side
    const containerHeight = (280 * 19.5 / 9) - 24 - 140; // Account for top padding (12px) and logo space (140px)
    
    const horizontalGap = 12; // Fixed horizontal gap between dots
    const verticalGap = 8; // Minimal vertical gap between rows (just to avoid overlap)
    
    // Arrange dots in rows (horizontal flow)
    let currentRow = [];
    let currentRowWidth = 0;
    const rows = [];
    
    dotsArray.forEach((dot) => {
      const dotSize = parseSize(dot.size);
      const dotWidth = dotSize + (currentRow.length > 0 ? horizontalGap : 0);
      
      // Check if dot fits in current row
      if (currentRow.length === 0 || currentRowWidth + dotWidth <= containerWidth) {
        currentRow.push({ dot, size: dotSize });
        currentRowWidth += dotWidth;
      } else {
        // Start new row
        rows.push(currentRow);
        currentRow = [{ dot, size: dotSize }];
        currentRowWidth = dotSize;
      }
    });
    
    // Add last row
    if (currentRow.length > 0) {
      rows.push(currentRow);
    }
    
    // Position dots in each row
    let currentTop = 12 + 20; // Top padding + top margin
    
    rows.forEach((row) => {
      const rowMaxSize = Math.max(...row.map(item => item.size));
      const rowTotalWidth = row.reduce((sum, item, idx) => {
        return sum + item.size + (idx > 0 ? horizontalGap : 0);
      }, 0);
      
      // Center the row horizontally
      const startLeft = (containerWidth - rowTotalWidth) / 2 + 8; // Add left padding
      let currentLeft = startLeft;
      
      row.forEach((item) => {
        const centerX = currentLeft + item.size / 2;
        const centerY = currentTop + rowMaxSize / 2;
        
        // Convert to percentage
        const fullContainerHeight = 280 * 19.5 / 9;
        const fullContainerWidth = 280;
        
        positions.push({
          top: `${(centerY / fullContainerHeight) * 100}%`,
          left: `${(centerX / fullContainerWidth) * 100}%`,
        });
        
        currentLeft += item.size + horizontalGap;
      });
      
      // Move to next row
      currentTop += rowMaxSize + verticalGap;
    });
    
    return positions;
  };

  const dotPositions = getDotPositions(dots);

  return (
    <Stack spacing={2} alignItems="center">
      <Typography variant="h6" fontWeight={700} sx={{ color: "#ffffff", mb: 1 }}>
        Preview
      </Typography>
      <Box
        sx={{
          position: "relative",
          width: { xs: "100%", sm: 280 },
          maxWidth: 280,
          aspectRatio: "9/19.5",
          backgroundColor: "#000000",
          borderRadius: 4,
          padding: "12px 8px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.8), inset 0 0 0 2px rgba(255, 255, 255, 0.1)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 8,
            left: "50%",
            transform: "translateX(-50%)",
            width: 120,
            height: 24,
            backgroundColor: "#000000",
            borderRadius: "0 0 16px 16px",
            zIndex: 2,
          }}
        />
        
        <Box
          sx={{
            width: "100%",
            height: "100%",
            borderRadius: 3,
            overflow: "hidden",
            backgroundColor: isImageUrl ? "transparent" : backgroundColor,
            backgroundImage: isImageUrl && backgroundImageUrl 
              ? `url("${backgroundImageUrl}")` 
              : "none",
            backgroundSize: isImageUrl ? "cover" : "auto",
            backgroundPosition: isImageUrl ? "center" : "top left",
            backgroundRepeat: isImageUrl ? "no-repeat" : "repeat",
            position: "relative",
            // Ensure background image covers the entire area
            ...(isImageUrl && backgroundImageUrl && {
              backgroundAttachment: "scroll",
              minHeight: "100%",
            }),
          }}
        >
          {dots.map((dot, idx) => {
            const size = dot.size?.trim() || "36";
            const color = dot.color?.trim() || "rgba(255,255,255,0.4)";
            const position = dotPositions[idx] || { top: "50%", left: "50%" };
            
            // Parse size - handle both numbers and CSS units
            let sizeValue = size;
            if (!isNaN(parseFloat(size)) && isFinite(size)) {
              sizeValue = `${size}px`;
            }
            
            return (
              <Box
                key={idx}
                sx={{
                  position: "absolute",
                  width: sizeValue,
                  height: sizeValue,
                  minWidth: sizeValue,
                  minHeight: sizeValue,
                  maxWidth: sizeValue,
                  maxHeight: sizeValue,
                  aspectRatio: "1/1",
                  borderRadius: "50%",
                  background: color,
                  boxShadow: "0 8px 16px rgba(0,0,0,0.25)",
                  border: "2px solid rgba(255,255,255,0.35)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  top: position.top,
                  left: position.left,
                  transform: "translate(-50%, -50%)",
                  zIndex: 1,
                  flexShrink: 0,
                  "&:hover": {
                    transform: "translate(-50%, -50%) scale(1.05)",
                    boxShadow: "0 12px 24px rgba(0,0,0,0.35)",
                    zIndex: 2,
                  },
                }}
              />
            );
          })}

          {previewData.logoUrl && !isImageUrl && (
            <Box
              component="img"
              src={getLogoUrl(previewData.logoUrl)}
              alt={`Level ${level.level} logo`}
              onError={(e) => {
                console.error("Failed to load logo:", previewData.logoUrl);
                e.target.style.display = "none";
              }}
              sx={{
                position: "absolute",
                bottom: 25,
                left: "50%",
                transform: "translateX(-50%)",
                maxWidth: "60%",
                maxHeight: 110,
                width: "auto",
                height: "auto",
                objectFit: "contain",
              }}
            />
          )}
        </Box>
      </Box>
    </Stack>
  );
}
