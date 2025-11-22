import Cropper from "cropperjs";

/**
 * Image cropping utility using Cropper.js
 * Provides functions for full cover cropping and aspect ratio preservation
 */

/**
 * Crops an image to fill a specific area (full cover mode)
 * @param {string} imageSrc - Base64 or URL of the image
 * @param {number} targetWidth - Target width
 * @param {number} targetHeight - Target height
 * @param {Object} options - Cropping options
 * @returns {Promise<string>} - Cropped image as base64
 */
export const cropImageToCover = async (
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

      // Calculate crop dimensions to fill the target area while maintaining full resolution
      const imageAspectRatio = img.width / img.height;
      const targetAspectRatio = targetWidth / targetHeight;

      let cropWidth, cropHeight, cropX, cropY;
      let finalCanvasWidth, finalCanvasHeight;

      if (imageAspectRatio > targetAspectRatio) {
        // Image is wider than target - crop width to fit height
        cropHeight = img.height;
        cropWidth = img.height * targetAspectRatio;
        cropX = (img.width - cropWidth) / 2;
        cropY = 0;

        // Use the full height of the cropped area for maximum resolution
        finalCanvasWidth = cropWidth;
        finalCanvasHeight = cropHeight;
      } else {
        // Image is taller than target - crop height to fit width
        cropWidth = img.width;
        cropHeight = img.width / targetAspectRatio;
        cropX = 0;
        cropY = (img.height - cropHeight) / 2;

        // Use the full width of the cropped area for maximum resolution
        finalCanvasWidth = cropWidth;
        finalCanvasHeight = cropHeight;
      }

      // Apply custom crop offsets if provided
      if (options.cropOffsetX || options.cropOffsetY) {
        const offsetX = options.cropOffsetX || 0;
        const offsetY = options.cropOffsetY || 0;

        // Calculate the scale between preview and actual image
        // We need to convert preview offsets to image coordinate offsets
        const previewScale = Math.max(
          targetWidth / cropWidth,
          targetHeight / cropHeight,
        );
        const scaledOffsetX = offsetX / previewScale;
        const scaledOffsetY = offsetY / previewScale;

        // Adjust crop position by the offset (negative because we want to move the visible area)
        cropX = Math.max(
          0,
          Math.min(img.width - cropWidth, cropX - scaledOffsetX),
        );
        cropY = Math.max(
          0,
          Math.min(img.height - cropHeight, cropY - scaledOffsetY),
        );
      }

      // Set canvas to the full resolution of the cropped area
      canvas.width = finalCanvasWidth;
      canvas.height = finalCanvasHeight;

      // Enable high-quality image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Draw the cropped image at full resolution
      ctx.drawImage(
        img,
        cropX,
        cropY,
        cropWidth,
        cropHeight, // Source rectangle
        0,
        0,
        finalCanvasWidth,
        finalCanvasHeight, // Full resolution destination
      );

      // Convert to base64 with PNG for lossless quality or high-quality JPEG
      const format = options.format || "image/png";
      const quality =
        format === "image/png" ? undefined : options.quality || 0.98;
      const croppedImageSrc = canvas.toDataURL(format, quality);
      resolve(croppedImageSrc);
    };

    img.onerror = () => {
      reject(new Error("Failed to load image for cropping"));
    };

    img.src = imageSrc;
  });
};

/**
 * Crops an image to fit within a specific area (contain mode)
 * @param {string} imageSrc - Base64 or URL of the image
 * @param {number} targetWidth - Target width
 * @param {number} targetHeight - Target height
 * @param {Object} options - Cropping options
 * @returns {Promise<string>} - Cropped image as base64
 */
export const cropImageToContain = async (
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

      // Calculate dimensions to fit within target area while maintaining original resolution
      const imageAspectRatio = img.width / img.height;
      const targetAspectRatio = targetWidth / targetHeight;

      let finalWidth, finalHeight, offsetX, offsetY;
      let canvasWidth, canvasHeight;

      if (imageAspectRatio > targetAspectRatio) {
        // Image is wider - fit to width
        // Use the minimum of original width or a high-quality scaled width
        const scaleFactor = Math.min(1, Math.max(targetWidth / img.width, 1));
        finalWidth = img.width * scaleFactor;
        finalHeight = img.height * scaleFactor;

        // Canvas size should accommodate the full image with proper aspect ratio
        canvasWidth = finalWidth;
        canvasHeight = finalWidth / imageAspectRatio;
        offsetX = 0;
        offsetY = (canvasHeight - finalHeight) / 2;
      } else {
        // Image is taller - fit to height
        const scaleFactor = Math.min(1, Math.max(targetHeight / img.height, 1));
        finalWidth = img.width * scaleFactor;
        finalHeight = img.height * scaleFactor;

        canvasWidth = finalHeight * imageAspectRatio;
        canvasHeight = finalHeight;
        offsetX = (canvasWidth - finalWidth) / 2;
        offsetY = 0;
      }

      // Use the original image size if it's smaller than our calculated size
      // This prevents upscaling and maintains original quality
      if (img.width <= canvasWidth && img.height <= canvasHeight) {
        canvasWidth = img.width;
        canvasHeight = img.height;
        finalWidth = img.width;
        finalHeight = img.height;
        offsetX = 0;
        offsetY = 0;
      }

      // Set canvas to optimal size for quality retention
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Enable high-quality image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Fill with background color if specified
      if (options.backgroundColor) {
        ctx.fillStyle = options.backgroundColor;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }

      // Draw the image at full quality
      ctx.drawImage(img, offsetX, offsetY, finalWidth, finalHeight);

      // Convert to base64 with PNG for lossless quality or high-quality JPEG
      const format = options.format || "image/png";
      const quality =
        format === "image/png" ? undefined : options.quality || 0.98;
      const croppedImageSrc = canvas.toDataURL(format, quality);
      resolve(croppedImageSrc);
    };

    img.onerror = () => {
      reject(new Error("Failed to load image for cropping"));
    };

    img.src = imageSrc;
  });
};

/**
 * Creates a Cropper.js instance for interactive cropping
 * @param {HTMLImageElement} imageElement - The image element to crop
 * @param {Object} options - Cropper.js options
 * @returns {Cropper} - Cropper instance
 */
export const createCropper = (imageElement, options = {}) => {
  const defaultOptions = {
    aspectRatio: options.aspectRatio || NaN,
    viewMode: options.viewMode || 1,
    dragMode: options.dragMode || "crop",
    autoCropArea: options.autoCropArea || 1,
    restore: false,
    guides: true,
    center: true,
    highlight: false,
    cropBoxMovable: true,
    cropBoxResizable: true,
    toggleDragModeOnDblclick: false,
  };

  return new Cropper(imageElement, {
    ...defaultOptions,
    ...options,
  });
};

/**
 * Gets the cropped canvas from a Cropper instance
 * @param {Cropper} cropper - Cropper instance
 * @param {Object} options - Output options
 * @returns {HTMLCanvasElement} - Cropped canvas
 */
export const getCroppedCanvas = (cropper, options = {}) => {
  const defaultOptions = {
    width: options.width || undefined,
    height: options.height || undefined,
    minWidth: options.minWidth || 0,
    minHeight: options.minHeight || 0,
    maxWidth: options.maxWidth || Infinity,
    maxHeight: options.maxHeight || Infinity,
    fillColor: options.fillColor || "transparent",
    imageSmoothingEnabled: options.imageSmoothingEnabled !== false,
    imageSmoothingQuality: options.imageSmoothingQuality || "high",
  };

  return cropper.getCroppedCanvas(defaultOptions);
};

/**
 * Crops an image for full cover layout
 * @param {string} imageSrc - Base64 or URL of the image
 * @param {number} cellWidth - Width of the cell/area
 * @param {number} cellHeight - Height of the cell/area
 * @param {Object} options - Cropping options
 * @returns {Promise<string>} - Cropped image as base64
 */
export const cropForFullCover = async (
  imageSrc,
  cellWidth,
  cellHeight,
  options = {},
) => {
  // For preview, limit the size to improve performance
  const isPreview = options.preview !== false;
  const maxPreviewSize = 800; // Max dimension for preview

  let targetWidth = cellWidth;
  let targetHeight = cellHeight;

  if (
    isPreview &&
    (cellWidth > maxPreviewSize || cellHeight > maxPreviewSize)
  ) {
    // Scale down for preview while maintaining aspect ratio
    const scale = Math.min(
      maxPreviewSize / cellWidth,
      maxPreviewSize / cellHeight,
    );
    targetWidth = Math.round(cellWidth * scale);
    targetHeight = Math.round(cellHeight * scale);
  }

  return cropImageToCover(imageSrc, targetWidth, targetHeight, {
    quality: options.quality || (isPreview ? 0.85 : 0.98),
    format: isPreview ? "image/jpeg" : "image/png",
    ...options,
  });
};

/**
 * Crops an image with custom scale and position for Full Cover layout
 * Maintains high quality for 300 DPI printing
 * @param {string} imageSrc - Base64 or URL of the image
 * @param {number} targetWidth - Target width of the container
 * @param {number} targetHeight - Target height of the container
 * @param {Object} options - Cropping options with scale, cropOffsetX, cropOffsetY
 * @returns {Promise<string>} - Cropped image as base64
 */
export const cropImageWithScaleAndPosition = async (
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

      // Get scale and position from options
      const scale = options.scale || 1;
      const offsetX = options.cropOffsetX || 0;
      const offsetY = options.cropOffsetY || 0;

      // Calculate how the image would be displayed with object-cover behavior
      const imageAspectRatio = img.width / img.height;
      const targetAspectRatio = targetWidth / targetHeight;

      let baseWidth, baseHeight;
      if (imageAspectRatio > targetAspectRatio) {
        // Image is wider - scale to container height
        baseHeight = targetHeight;
        baseWidth = baseHeight * imageAspectRatio;
      } else {
        // Image is taller - scale to container width
        baseWidth = targetWidth;
        baseHeight = baseWidth / imageAspectRatio;
      }

      // Apply user's scale
      const scaledWidth = baseWidth * scale;
      const scaledHeight = baseHeight * scale;

      // Calculate the source rectangle in the original image
      // The offset represents where the user positioned the scaled image
      const centerX = img.width / 2;
      const centerY = img.height / 2;

      // Convert the offset and scale back to source image coordinates
      const sourceScale = Math.min(
        img.width / scaledWidth,
        img.height / scaledHeight,
      );
      const sourceWidth = targetWidth * sourceScale;
      const sourceHeight = targetHeight * sourceScale;

      // Apply the offset to determine the source crop area
      const sourceOffsetX = (offsetX / scaledWidth) * img.width;
      const sourceOffsetY = (offsetY / scaledHeight) * img.height;

      const sourceX = Math.max(
        0,
        Math.min(
          img.width - sourceWidth,
          centerX - sourceWidth / 2 - sourceOffsetX,
        ),
      );
      const sourceY = Math.max(
        0,
        Math.min(
          img.height - sourceHeight,
          centerY - sourceHeight / 2 - sourceOffsetY,
        ),
      );

      // Calculate optimal canvas dimensions to maintain original quality
      // For PDF mode, we want higher resolution but same coordinate system
      const isPDFMode = options.pdfMode === true;
      const sourceToTargetRatio = Math.min(
        img.width / targetWidth,
        img.height / targetHeight,
      );

      let qualityMultiplier;
      if (isPDFMode) {
        // For PDF: Use higher resolution (2-3x) for print quality
        qualityMultiplier = Math.min(
          sourceToTargetRatio,
          Math.max(3, sourceToTargetRatio * 0.9),
        );
      } else {
        // For preview: Use moderate resolution (2x) for display
        qualityMultiplier = Math.min(
          sourceToTargetRatio,
          Math.max(2, sourceToTargetRatio * 0.8),
        );
      }

      const canvasWidth = Math.round(targetWidth * qualityMultiplier);
      const canvasHeight = Math.round(targetHeight * qualityMultiplier);

      // Set canvas to optimal dimensions for quality
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Enable maximum quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Additional quality settings for better rendering (cross-browser)
      if (ctx.webkitImageSmoothingEnabled !== undefined) {
        ctx.webkitImageSmoothingEnabled = true;
      }
      if (ctx.mozImageSmoothingEnabled !== undefined) {
        ctx.mozImageSmoothingEnabled = true;
      }
      if (ctx.msImageSmoothingEnabled !== undefined) {
        ctx.msImageSmoothingEnabled = true;
      }

      // Draw the cropped and scaled image at optimal resolution
      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        canvasWidth,
        canvasHeight,
      );

      // Format selection: PNG for preview (lossless), JPEG for PDF (smaller/faster)
      const format = options.format || "image/png";
      const quality =
        format === "image/png" ? undefined : options.quality || 0.95;
      const croppedImageSrc = canvas.toDataURL(format, quality);
      resolve(croppedImageSrc);
    };

    img.onerror = () => {
      reject(new Error("Failed to load image for cropping"));
    };

    img.src = imageSrc;
  });
};

/**
 * Crops multiple images for grid layout
 * @param {Array} images - Array of image objects with src property
 * @param {number} cellWidth - Width of each cell
 * @param {number} cellHeight - Height of each cell
 * @param {Object} options - Cropping options
 * @returns {Promise<Array>} - Array of cropped image objects
 */
export const cropImagesForGrid = async (
  images,
  cellWidth,
  cellHeight,
  options = {},
) => {
  const croppedImages = [];

  for (const image of images) {
    try {
      const croppedSrc = await cropForFullCover(
        image.src,
        cellWidth,
        cellHeight,
        options,
      );

      croppedImages.push({
        ...image,
        src: croppedSrc,
        originalSrc: image.originalSrc || image.src, // Preserve original image
        previewWidth: cellWidth,
        previewHeight: cellHeight,
      });
    } catch (error) {

      // Fallback to original image
      croppedImages.push({
        ...image,
        originalSrc: image.originalSrc || image.src, // Preserve original in fallback
        previewWidth: cellWidth,
        previewHeight: cellHeight,
      });
    }
  }

  return croppedImages;
};
