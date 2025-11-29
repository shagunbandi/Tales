import jsPDF from "jspdf";
import { PAGE_SIZES } from "../constants.js";
import { previewToMm } from "./layoutUtils.js";
import { batchOptimizeImagesForPDF } from "./imageOptimizationUtils.js";
import { getPreviewDimensions } from "../constants.js";
import { getImageBorderEdges } from "./imageBorderUtils.js";

/**
 * Determines the image format from base64 data
 * @param {string} base64Data - Base64 image data
 * @returns {string} - Image format for jsPDF
 */
const getImageFormat = (base64Data) => {
  if (base64Data.startsWith("data:image/png")) {
    return "PNG";
  } else if (
    base64Data.startsWith("data:image/jpeg") ||
    base64Data.startsWith("data:image/jpg")
  ) {
    return "JPEG";
  } else if (base64Data.startsWith("data:image/webp")) {
    return "WEBP";
  } else if (base64Data.startsWith("data:image/gif")) {
    return "GIF";
  }
  // Default to JPEG for unknown formats
  return "JPEG";
};

export const generatePDF = async (
  pages,
  settings = null,
  onProgress = null,
  albumName = null,
) => {
  if (pages.length === 0) {
    throw new Error("No pages to generate PDF from");
  }

  const pageSize = PAGE_SIZES[settings?.pageSize || "a4"];
  const orientation = settings?.orientation || "landscape";
  const previewDimensions = getPreviewDimensions(settings);

  // Step 1: Optimize all images for PDF printing
  if (onProgress) {
    onProgress({
      step: 0,
      total: 100,
      message: "Optimizing images for high-quality printing...",
      percentage: 0,
    });
  }

  const optimizedPages = [];
  const totalImages = pages.reduce(
    (total, page) => total + page.images.length,
    0,
  );
  let processedImages = 0;

  for (const page of pages) {
    if (page.images.length > 0) {
      const optimizedImages = await batchOptimizeImagesForPDF(
        page.images,
        settings,
        previewDimensions,
        (optimizationProgress) => {
          const overallProgress =
            ((processedImages + optimizationProgress.step) / totalImages) * 50; // First 50% for optimization
          if (onProgress) {
            onProgress({
              step: Math.round(overallProgress),
              total: 100,
              message: `Optimizing images: ${optimizationProgress.message}`,
              percentage: Math.round(overallProgress),
            });
          }
        },
      );
      processedImages += page.images.length;
      optimizedPages.push({
        ...page,
        images: optimizedImages,
      });
    } else {
      optimizedPages.push(page);
    }
  }

  if (onProgress) {
    onProgress({
      step: 50,
      total: 100,
      message: "Creating PDF document...",
      percentage: 50,
    });
  }

  // Calculate combined page dimensions (double width for side-by-side layout)
  const singlePageWidth =
    orientation === "landscape" ? pageSize.width : pageSize.height;
  const singlePageHeight =
    orientation === "landscape" ? pageSize.height : pageSize.width;
  const combinedPageWidth = singlePageWidth * 2;
  const combinedPageHeight = singlePageHeight;

  const pdf = new jsPDF({
    orientation: "landscape", // Always landscape for side-by-side pages
    unit: "mm",
    format: [combinedPageWidth, combinedPageHeight], // Custom format for double-width pages
    compress: false, // Disable compression for better quality
  });

  const totalSteps = Math.ceil(optimizedPages.length / 2); // Now processing pairs of pages
  let currentStep = 0;

  // Process pages in pairs
  for (let pairIndex = 0; pairIndex < optimizedPages.length; pairIndex += 2) {
    const leftPage = optimizedPages[pairIndex];
    const rightPage = optimizedPages[pairIndex + 1]; // May be undefined if odd number of pages

    if (onProgress) {
      const progress = 50 + (currentStep / totalSteps) * 50; // Second 50% for PDF creation
      const pageText = rightPage 
        ? `pages ${pairIndex + 1} and ${pairIndex + 2}` 
        : `page ${pairIndex + 1}`;
      onProgress({
        step: Math.round(progress),
        total: 100,
        message: `Adding ${pageText} of ${optimizedPages.length} to PDF...`,
        percentage: Math.round(progress),
      });
    }

    if (pairIndex > 0) {
      pdf.addPage();
    }

    // Helper function to render a single page at a given x-offset
    const renderPage = async (page, xOffset) => {
      if (!page) return; // Skip if no page (odd number case)

      // Fill background for this page
      pdf.setFillColor(page.color.color);
      pdf.rect(xOffset, 0, singlePageWidth, singlePageHeight, "F");

      // Allow UI to update
      await new Promise((resolve) => setTimeout(resolve, 10));

      for (const image of page.images) {
        try {
          // Convert preview dimensions to mm with proper dimension types
          // Note: image positions already include border offset from layout calculation
          const allocatedWidth = previewToMm(
            image.previewWidth,
            settings,
            "width",
          );
          const allocatedHeight = previewToMm(
            image.previewHeight,
            settings,
            "height",
          );
          const imgX = previewToMm(image.x, settings, "x") + xOffset; // Add x-offset for side-by-side layout
          const imgY = previewToMm(image.y, settings, "y");

        // Determine image format from the base64 data
        const imageFormat = getImageFormat(image.src);

        // For full cover layout, crop the image to fit the allocated space for PDF
        if (settings.designStyle === "full_cover" || image.fullCoverMode) {
          // Check if image needs custom cropping (scale/position adjustments)
          const needsCustomCropping =
            (image.scale && image.scale !== 1) ||
            (image.cropOffsetX && image.cropOffsetX !== 0) ||
            (image.cropOffsetY && image.cropOffsetY !== 0);

          if (needsCustomCropping) {
            // Use custom cropping for edited images
            try {
              const { cropImageWithScaleAndPosition } = await import(
                "./imageCropUtils.js"
              );
              const sourceImage = image.originalSrc || image.src;

              // Use SAME base dimensions as preview for consistency
              const croppedImageSrc = await cropImageWithScaleAndPosition(
                sourceImage,
                image.previewWidth ?? allocatedWidth, // Use preview dimensions first
                image.previewHeight ?? allocatedHeight,
                {
                  scale: image.scale || 1,
                  cropOffsetX: image.cropOffsetX || 0,
                  cropOffsetY: image.cropOffsetY || 0,
                  format: "image/jpeg", // JPEG for smaller file size
                  quality: 0.92, // High quality but smaller than PNG
                  pdfMode: true, // Flag to indicate this is for PDF
                },
              );

              pdf.addImage(
                croppedImageSrc,
                "JPEG",
                imgX,
                imgY,
                allocatedWidth,
                allocatedHeight,
                undefined, // alias
                "SLOW", // compression
                0, // rotation
              );

              // Add border if configured and enabled for this page - use page background color
              // Only apply borders to edges adjacent to other images, not page boundaries
              const borderEnabled = page.enablePageBorder !== false;
              if (borderEnabled && settings.pictureBorderWidth && settings.pictureBorderWidth > 0) {
                const borderWidthMm = settings.pictureBorderWidth; // Already in mm
                const borderColor = page.color.color || "#FFFFFF"; // Use page background color
                
                // Determine which edges should have borders
                const pageDimensions = {
                  width: singlePageWidth,
                  height: singlePageHeight
                };
                
                // Convert image dimensions to mm for comparison
                const imageMm = {
                  id: image.id,
                  x: previewToMm(image.x, settings, "x"),
                  y: previewToMm(image.y, settings, "y"),
                  previewWidth: allocatedWidth,
                  previewHeight: allocatedHeight
                };
                
                const allImagesMm = page.images.map(img => ({
                  id: img.id,
                  x: previewToMm(img.x, settings, "x"),
                  y: previewToMm(img.y, settings, "y"),
                  previewWidth: previewToMm(img.previewWidth, settings, "width"),
                  previewHeight: previewToMm(img.previewHeight, settings, "height")
                }));
                
                const borderEdges = getImageBorderEdges(imageMm, allImagesMm, pageDimensions, 0.1);
                
                // Convert hex color to RGB
                const r = parseInt(borderColor.slice(1, 3), 16);
                const g = parseInt(borderColor.slice(3, 5), 16);
                const b = parseInt(borderColor.slice(5, 7), 16);
                pdf.setDrawColor(r, g, b);
                pdf.setLineWidth(borderWidthMm);
                
                // Draw only the borders that should be visible (between images)
                if (borderEdges.top) {
                  pdf.line(imgX, imgY, imgX + allocatedWidth, imgY);
                }
                if (borderEdges.right) {
                  pdf.line(imgX + allocatedWidth, imgY, imgX + allocatedWidth, imgY + allocatedHeight);
                }
                if (borderEdges.bottom) {
                  pdf.line(imgX, imgY + allocatedHeight, imgX + allocatedWidth, imgY + allocatedHeight);
                }
                if (borderEdges.left) {
                  pdf.line(imgX, imgY, imgX, imgY + allocatedHeight);
                }
              }
            } catch (error) {

              // Fallback to standard cropping
            }
          } else {
            // Use standard cropping for non-edited images (faster)
            try {
              const { cropForFullCover } = await import("./imageCropUtils.js");
              const croppedImageSrc = await cropForFullCover(
                image.src,
                allocatedWidth * 2, // Reduced from 3x for better performance
                allocatedHeight * 2,
                {
                  quality: 0.92,
                  format: "image/jpeg",
                  preview: false, // High quality for PDF
                },
              );

              pdf.addImage(
                croppedImageSrc,
                "JPEG",
                imgX,
                imgY,
                allocatedWidth,
                allocatedHeight,
                undefined, // alias
                "SLOW", // compression
                0, // rotation
              );

              // Add border if configured and enabled for this page - use page background color
              // Only apply borders to edges adjacent to other images, not page boundaries
              const borderEnabled = page.enablePageBorder !== false;
              if (borderEnabled && settings.pictureBorderWidth && settings.pictureBorderWidth > 0) {
                const borderWidthMm = settings.pictureBorderWidth; // Already in mm
                const borderColor = page.color.color || "#FFFFFF"; // Use page background color
                
                // Determine which edges should have borders
                const pageDimensions = {
                  width: singlePageWidth,
                  height: singlePageHeight
                };
                
                // Convert image dimensions to mm for comparison
                const imageMm = {
                  id: image.id,
                  x: previewToMm(image.x, settings, "x"),
                  y: previewToMm(image.y, settings, "y"),
                  previewWidth: allocatedWidth,
                  previewHeight: allocatedHeight
                };
                
                const allImagesMm = page.images.map(img => ({
                  id: img.id,
                  x: previewToMm(img.x, settings, "x"),
                  y: previewToMm(img.y, settings, "y"),
                  previewWidth: previewToMm(img.previewWidth, settings, "width"),
                  previewHeight: previewToMm(img.previewHeight, settings, "height")
                }));
                
                const borderEdges = getImageBorderEdges(imageMm, allImagesMm, pageDimensions, 0.1);
                
                // Convert hex color to RGB
                const r = parseInt(borderColor.slice(1, 3), 16);
                const g = parseInt(borderColor.slice(3, 5), 16);
                const b = parseInt(borderColor.slice(5, 7), 16);
                pdf.setDrawColor(r, g, b);
                pdf.setLineWidth(borderWidthMm);
                
                // Draw only the borders that should be visible (between images)
                if (borderEdges.top) {
                  pdf.line(imgX, imgY, imgX + allocatedWidth, imgY);
                }
                if (borderEdges.right) {
                  pdf.line(imgX + allocatedWidth, imgY, imgX + allocatedWidth, imgY + allocatedHeight);
                }
                if (borderEdges.bottom) {
                  pdf.line(imgX, imgY + allocatedHeight, imgX + allocatedWidth, imgY + allocatedHeight);
                }
                if (borderEdges.left) {
                  pdf.line(imgX, imgY, imgX, imgY + allocatedHeight);
                }
              }
            } catch (error) {

              // Fallback to original image processing
            }
          }
        } else {
          // Calculate aspect ratio preserving dimensions
          const originalAspectRatio =
            image.originalWidth / image.originalHeight;
          const allocatedAspectRatio = allocatedWidth / allocatedHeight;

          let finalWidth, finalHeight, finalX, finalY;
          if (originalAspectRatio > allocatedAspectRatio) {
            // Image is wider than allocated space - fit to width
            finalWidth = allocatedWidth;
            finalHeight = allocatedWidth / originalAspectRatio;
            finalX = imgX;
            finalY = imgY + (allocatedHeight - finalHeight) / 2; // Center vertically
          } else {
            // Image is taller than allocated space - fit to height
            finalHeight = allocatedHeight;
            finalWidth = allocatedHeight * originalAspectRatio;
            finalX = imgX + (allocatedWidth - finalWidth) / 2; // Center horizontally
            finalY = imgY;
          }

          pdf.addImage(
            image.src,
            imageFormat,
            finalX,
            finalY,
            finalWidth,
            finalHeight,
            undefined, // alias
            "SLOW", // compression
            0, // rotation
          );
        }
        } catch (err) {

        }
      }
    };

    // Render left page (first page in the pair) at x-offset 0
    await renderPage(leftPage, 0);

    // Render right page (second page in the pair) at x-offset singlePageWidth
    if (rightPage) {
      await renderPage(rightPage, singlePageWidth);
    }

    currentStep++;
  }

  if (onProgress) {
    onProgress({
      step: 100,
      total: 100,
      message: "Saving PDF...",
      percentage: 100,
    });
  }

  // Allow UI to update before saving
  await new Promise((resolve) => setTimeout(resolve, 100));

  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = albumName
    ? `${albumName.replace(/[^a-z0-9]/gi, "_")}-${dateStr}.pdf`
    : `images-${dateStr}.pdf`;
  pdf.save(filename);
};
