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
    dotSizes: formValues.dotSizes || level.dotSizes || [],
    background: formValues.backgroundType === "image" 
      ? formValues.backgroundImageUrl 
      : formValues.backgroundColor || level.background || "",
    logoUrl: formValues.backgroundType === "image" ? "" : (formValues.logoUrl || level.logoUrl || ""),
  } : {
    dots: level.dots || [],
    dotSizes: level.dotSizes || [],
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
  
  // Get dot sizes mapping from dotSizes array
  const dotSizesMap = {};
  const dotSizesArray = Array.isArray(previewData.dotSizes) ? previewData.dotSizes : [];
  dotSizesArray.forEach((sizeItem) => {
    if (sizeItem && sizeItem.size) {
      const sizeName = String(sizeItem.size).trim();
      const sizeNameLower = sizeName.toLowerCase();
      
      // Try to parse as number (if it's a pixel value like "36" or "36px")
      let sizeValue = parseFloat(sizeItem.size);
      if (isNaN(sizeValue)) {
        // Map size names to pixel values (in sequence: Extra Small -> Small -> Medium -> Large -> Extra Large)
        if (sizeNameLower === "extra small" || sizeNameLower === "extrasmall" || sizeNameLower.includes("extra small")) {
          sizeValue = 20; // Extra Small - smallest
        } else if (sizeNameLower === "small") {
          sizeValue = 28; // Small
        } else if (sizeNameLower === "medium") {
          sizeValue = 36; // Medium
        } else if (sizeNameLower === "large") {
          sizeValue = 48; // Large
        } else if (sizeNameLower === "extra large" || sizeNameLower === "extralarge" || sizeNameLower.includes("extra large")) {
          sizeValue = 60; // Extra Large - largest
        } else {
          sizeValue = 36; // Default to Medium
        }
      }
      // Store both lowercase and original case versions
      dotSizesMap[sizeNameLower] = Math.max(sizeValue, 20);
      dotSizesMap[sizeName] = Math.max(sizeValue, 20);
    }
  });

  // Parse dot sizes - first try to match from dotSizes array, then fallback to parsing
  const parseSize = (sizeStr, dotSizeName = null) => {
    // If we have a size name, try to match it in dotSizesMap first
    if (dotSizeName) {
      const sizeNameKey = String(dotSizeName).trim().toLowerCase();
      if (dotSizesMap[sizeNameKey]) {
        return dotSizesMap[sizeNameKey];
      }
    }
    
    // Try to parse the size string directly
    if (sizeStr) {
      const sizeNameKey = String(sizeStr).trim().toLowerCase();
      if (dotSizesMap[sizeNameKey]) {
        return dotSizesMap[sizeNameKey];
      }
      const num = parseFloat(sizeStr);
      if (!isNaN(num)) {
        return Math.max(num, 20);
      }
    }
    
    // Default size
    return 36;
  };

  // Get size order for sorting (Extra Small = 1, Small = 2, Medium = 3, Large = 4, Extra Large = 5)
  const getSizeOrder = (sizeStr) => {
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
  };

  // Group dots in batches of 5 and sort each batch by size sequence
  // Pattern: Extra Small -> Small -> Medium -> Large -> Extra Large (repeats every 5 dots)
  const sortedDots = [];
  const batchSize = 5;
  
  for (let i = 0; i < dots.length; i += batchSize) {
    const batch = dots.slice(i, i + batchSize);
    // Sort each batch by size order: Extra Small -> Small -> Medium -> Large -> Extra Large
    const sortedBatch = batch.sort((a, b) => {
      const orderA = getSizeOrder(a.size);
      const orderB = getSizeOrder(b.size);
      return orderA - orderB;
    });
    sortedDots.push(...sortedBatch);
  }

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
      // Get size from dot.size (can be size name or pixel value)
      const dotSize = parseSize(dot.size, dot.sizeName);
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

  const dotPositions = getDotPositions(sortedDots);

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
          {sortedDots.map((dot, idx) => {
            const color = dot.color?.trim() || "rgba(255,255,255,0.4)";
            const position = dotPositions[idx] || { top: "50%", left: "50%" };
            
            // Get size from dotSizes array or parse directly
            const sizeValue = parseSize(dot.size, dot.sizeName);
            const sizeValuePx = `${sizeValue}px`;
            
            return (
              <Box
                key={idx}
                sx={{
                  position: "absolute",
                  width: sizeValuePx,
                  height: sizeValuePx,
                  minWidth: sizeValuePx,
                  minHeight: sizeValuePx,
                  maxWidth: sizeValuePx,
                  maxHeight: sizeValuePx,
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
