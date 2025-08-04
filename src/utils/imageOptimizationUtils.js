import { PAGE_SIZES } from "../constants.js";

/**
 * Calculate optimal image dimensions for high-quality printing at 300 DPI
 * @param {string} pageSize - Page size (a4, letter, legal)
 * @param {string} orientation - Page orientation (landscape, portrait)
 * @returns {Object} - Optimal dimensions in pixels
 */
export const getOptimalPrintDimensions = (
  pageSize = "a4",
  orientation = "landscape",
) => {
  const pageDimensions = PAGE_SIZES[pageSize];
  const DPI = 300;
  const MM_TO_INCH = 25.4;

  // Get page dimensions in mm
  const pageWidthMm =
    orientation === "landscape" ? pageDimensions.width : pageDimensions.height;
  const pageHeightMm =
    orientation === "landscape" ? pageDimensions.height : pageDimensions.width;

  // Convert to pixels at 300 DPI
  const optimalWidth = Math.round((pageWidthMm / MM_TO_INCH) * DPI);
  const optimalHeight = Math.round((pageHeightMm / MM_TO_INCH) * DPI);

  return {
    width: optimalWidth,
    height: optimalHeight,
    dpi: DPI,
  };
};

/**
 * Resize an image to optimal dimensions for PDF generation
 * @param {string} imageSrc - Base64 image source
 * @param {number} targetWidth - Target width in pixels
 * @param {number} targetHeight - Target height in pixels
 * @param {Object} options - Resizing options
 * @returns {Promise<string>} - Optimized image as base64
 */
export const optimizeImageForPDF = async (
  imageSrc,
  targetWidth,
  targetHeight,
  options = {},
) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Calculate scaling to fit within target dimensions while maintaining aspect ratio
      const imageAspectRatio = img.width / img.height;
      const targetAspectRatio = targetWidth / targetHeight;

      let finalWidth, finalHeight;

      // Don't upscale - only downscale if image is larger than target
      if (img.width <= targetWidth && img.height <= targetHeight) {
        // Image is already smaller than target, keep original size
        finalWidth = img.width;
        finalHeight = img.height;
      } else {
        // Scale down to fit within target dimensions
        if (imageAspectRatio > targetAspectRatio) {
          // Image is wider - limit by width
          finalWidth = Math.min(targetWidth, img.width);
          finalHeight = finalWidth / imageAspectRatio;
        } else {
          // Image is taller - limit by height
          finalHeight = Math.min(targetHeight, img.height);
          finalWidth = finalHeight * imageAspectRatio;
        }
      }

      // Set canvas to final dimensions
      canvas.width = finalWidth;
      canvas.height = finalHeight;

      // Enable high-quality scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Draw the resized image
      ctx.drawImage(img, 0, 0, finalWidth, finalHeight);

      // Convert to base64 with high quality
      const quality = options.quality || 0.92;
      const format = options.format || "image/jpeg";
      const optimizedImageSrc = canvas.toDataURL(format, quality);

      resolve(optimizedImageSrc);
    };

    img.onerror = () => {
      reject(new Error("Failed to load image for optimization"));
    };

    img.src = imageSrc;
  });
};

/**
 * Calculate the optimal dimensions for a specific area of a page
 * @param {number} pageWidth - Full page width in pixels
 * @param {number} pageHeight - Full page height in pixels
 * @param {number} areaWidth - Area width in preview units
 * @param {number} areaHeight - Area height in preview units
 * @param {number} previewWidth - Preview page width
 * @param {number} previewHeight - Preview page height
 * @returns {Object} - Optimal dimensions for this area
 */
export const getOptimalAreaDimensions = (
  pageWidth,
  pageHeight,
  areaWidth,
  areaHeight,
  previewWidth,
  previewHeight,
) => {
  // Calculate the scaling factor from preview to print resolution
  const scaleX = pageWidth / previewWidth;
  const scaleY = pageHeight / previewHeight;

  // Calculate optimal dimensions for this specific area
  const optimalWidth = Math.round(areaWidth * scaleX);
  const optimalHeight = Math.round(areaHeight * scaleY);

  return {
    width: optimalWidth,
    height: optimalHeight,
  };
};

/**
 * Batch optimize multiple images for PDF generation
 * @param {Array} images - Array of image objects with src, previewWidth, previewHeight
 * @param {Object} pageSettings - Page settings with size and orientation
 * @param {Object} previewDimensions - Preview page dimensions
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Array>} - Array of optimized image objects
 */
export const batchOptimizeImagesForPDF = async (
  images,
  pageSettings,
  previewDimensions,
  onProgress = null,
) => {
  const { width: pageWidth, height: pageHeight } = getOptimalPrintDimensions(
    pageSettings.pageSize,
    pageSettings.orientation,
  );

  const optimizedImages = [];

  for (let i = 0; i < images.length; i++) {
    const image = images[i];

    if (onProgress) {
      onProgress({
        step: i,
        total: images.length,
        message: `Optimizing image ${i + 1} of ${images.length}...`,
        percentage: Math.round((i / images.length) * 100),
      });
    }

    try {
      // Calculate optimal dimensions for this image's area
      const areaDimensions = getOptimalAreaDimensions(
        pageWidth,
        pageHeight,
        image.previewWidth,
        image.previewHeight,
        previewDimensions.width,
        previewDimensions.height,
      );

      // Optimize the image
      const optimizedSrc = await optimizeImageForPDF(
        image.src,
        areaDimensions.width,
        areaDimensions.height,
        { quality: 0.92, format: "image/jpeg" },
      );

      optimizedImages.push({
        ...image,
        src: optimizedSrc,
        optimized: true,
      });
    } catch (error) {
      console.warn(`Failed to optimize image ${i + 1}:`, error);
      // Keep original image if optimization fails
      optimizedImages.push(image);
    }

    // Allow UI to update
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  if (onProgress) {
    onProgress({
      step: images.length,
      total: images.length,
      message: "Image optimization complete!",
      percentage: 100,
    });
  }

  return optimizedImages;
};
