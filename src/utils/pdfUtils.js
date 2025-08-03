import jsPDF from "jspdf";
import { PAGE_SIZES } from "../constants.js";
import { previewToMm } from "./layoutUtils.js";
import { batchOptimizeImagesForPDF } from "./imageOptimizationUtils.js";
import { getPreviewDimensions } from "../constants.js";

/**
 * Determines the image format from base64 data
 * @param {string} base64Data - Base64 image data
 * @returns {string} - Image format for jsPDF
 */
const getImageFormat = (base64Data) => {
  if (base64Data.startsWith('data:image/png')) {
    return 'PNG';
  } else if (base64Data.startsWith('data:image/jpeg') || base64Data.startsWith('data:image/jpg')) {
    return 'JPEG';
  } else if (base64Data.startsWith('data:image/webp')) {
    return 'WEBP';
  } else if (base64Data.startsWith('data:image/gif')) {
    return 'GIF';
  }
  // Default to JPEG for unknown formats
  return 'JPEG';
};

export const generatePDF = async (pages, settings = null, onProgress = null) => {
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
      message: 'Optimizing images for high-quality printing...',
      percentage: 0
    });
  }

  const optimizedPages = [];
  const totalImages = pages.reduce((total, page) => total + page.images.length, 0);
  let processedImages = 0;

  for (const page of pages) {
    if (page.images.length > 0) {
      const optimizedImages = await batchOptimizeImagesForPDF(
        page.images,
        settings,
        previewDimensions,
        (optimizationProgress) => {
          const overallProgress = ((processedImages + optimizationProgress.step) / totalImages) * 50; // First 50% for optimization
          if (onProgress) {
            onProgress({
              step: Math.round(overallProgress),
              total: 100,
              message: `Optimizing images: ${optimizationProgress.message}`,
              percentage: Math.round(overallProgress)
            });
          }
        }
      );
      processedImages += page.images.length;
      optimizedPages.push({
        ...page,
        images: optimizedImages
      });
    } else {
      optimizedPages.push(page);
    }
  }

  if (onProgress) {
    onProgress({
      step: 50,
      total: 100,
      message: 'Creating PDF document...',
      percentage: 50
    });
  }

  const pdf = new jsPDF({
    orientation: orientation,
    unit: "mm",
    format: settings?.pageSize || "a4",
    compress: false, // Disable compression for better quality
  });

  const totalSteps = optimizedPages.length;
  let currentStep = 0;

  for (let pageIndex = 0; pageIndex < optimizedPages.length; pageIndex++) {
    const page = optimizedPages[pageIndex];

    if (onProgress) {
      const progress = 50 + ((currentStep / totalSteps) * 50); // Second 50% for PDF creation
      onProgress({
        step: Math.round(progress),
        total: 100,
        message: `Adding page ${pageIndex + 1} of ${optimizedPages.length} to PDF...`,
        percentage: Math.round(progress)
      });
    }

    if (pageIndex > 0) {
      pdf.addPage();
    }

    pdf.setFillColor(page.color.color);
    const pageWidth =
      orientation === "landscape" ? pageSize.width : pageSize.height;
    const pageHeight =
      orientation === "landscape" ? pageSize.height : pageSize.width;
    pdf.rect(0, 0, pageWidth, pageHeight, "F");

    // Allow UI to update
    await new Promise(resolve => setTimeout(resolve, 10));

    for (const image of page.images) {

      try {
        // Convert preview dimensions to mm with proper dimension types
        const allocatedWidth = previewToMm(image.previewWidth, settings, 'width');
        const allocatedHeight = previewToMm(image.previewHeight, settings, 'height');
        const imgX = previewToMm(image.x, settings, 'x');
        const imgY = previewToMm(image.y, settings, 'y');

        // Determine image format from the base64 data
        const imageFormat = getImageFormat(image.src);
        
        // For full cover layout, crop the image to fit the allocated space for PDF
        if (settings.designStyle === 'full_cover' || image.fullCoverMode) {
          // Crop image to fit allocated space for PDF generation
          try {
            const { cropForFullCover } = await import('./imageCropUtils.js');
            const croppedImageSrc = await cropForFullCover(
              image.src,
              allocatedWidth * 3, // Higher resolution for print
              allocatedHeight * 3,
              { 
                quality: 0.95, 
                format: 'image/jpeg',
                preview: false // High quality for PDF
              }
            );
            
            pdf.addImage(
              croppedImageSrc, 
              'JPEG',
              imgX, 
              imgY, 
              allocatedWidth, 
              allocatedHeight,
              undefined, // alias
              'SLOW', // compression
              0 // rotation
            );
          } catch (error) {
            console.warn('Failed to crop image for PDF, using original:', error);
            // Fallback to original image with aspect ratio preservation
            const originalAspectRatio = image.originalWidth / image.originalHeight;
            const allocatedAspectRatio = allocatedWidth / allocatedHeight;
            
            let finalWidth, finalHeight, finalX, finalY;
            if (originalAspectRatio > allocatedAspectRatio) {
              finalWidth = allocatedWidth;
              finalHeight = allocatedWidth / originalAspectRatio;
              finalX = imgX;
              finalY = imgY + (allocatedHeight - finalHeight) / 2;
            } else {
              finalHeight = allocatedHeight;
              finalWidth = allocatedHeight * originalAspectRatio;
              finalX = imgX + (allocatedWidth - finalWidth) / 2;
              finalY = imgY;
            }
            
            pdf.addImage(image.src, imageFormat, finalX, finalY, finalWidth, finalHeight);
          }
        } else {
          // For classic layout, calculate aspect ratio preserving dimensions
          const originalAspectRatio = image.originalWidth / image.originalHeight;
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
            'SLOW', // compression
            0 // rotation
          );
        }
      } catch (err) {
        console.warn(`Failed to add image to PDF:`, err);
      }
    }

    currentStep++;
  }

  if (onProgress) {
    onProgress({
      step: 100,
      total: 100,
      message: 'Saving PDF...',
      percentage: 100
    });
  }

  // Allow UI to update before saving
  await new Promise(resolve => setTimeout(resolve, 100));

  const filename = `images-${new Date().toISOString().slice(0, 10)}.pdf`;
  pdf.save(filename);
};
