import { SUPPORTED_FORMATS, getPreviewDimensions } from "../constants.js";

// Helper function to create a canvas with specific dimensions and quality
const createOptimizedImage = (img, maxWidth, maxHeight, format = 'image/webp', quality = 0.8) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  
  if (!ctx || !img.naturalWidth || !img.naturalHeight) {
    return null;
  }

  // Calculate scaled dimensions
  const scaleWidth = maxWidth / img.naturalWidth;
  const scaleHeight = maxHeight / img.naturalHeight;
  const scale = Math.min(scaleWidth, scaleHeight, 1);
  
  const scaledWidth = Math.floor(img.naturalWidth * scale);
  const scaledHeight = Math.floor(img.naturalHeight * scale);
  
  canvas.width = scaledWidth;
  canvas.height = scaledHeight;
  
  // Use high-quality rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
  
  return {
    dataURL: canvas.toDataURL(format, quality),
    width: scaledWidth,
    height: scaledHeight
  };
};

// Helper function to compress WebP to really small size (100-200KB)
const compressWebPToTargetSize = (img, targetBytes = 200 * 1024, maxDimension = 800) => {
  let result = null;
  
  // Aggressive compression for really small WebP previews
  const attempts = [
    { dim: Math.min(maxDimension, img.naturalWidth, img.naturalHeight), qual: 0.7 },
    { dim: Math.min(Math.floor(maxDimension * 0.8), img.naturalWidth, img.naturalHeight), qual: 0.7 },
    { dim: Math.min(Math.floor(maxDimension * 0.8), img.naturalWidth, img.naturalHeight), qual: 0.5 },
    { dim: Math.min(Math.floor(maxDimension * 0.6), img.naturalWidth, img.naturalHeight), qual: 0.7 },
    { dim: Math.min(Math.floor(maxDimension * 0.6), img.naturalWidth, img.naturalHeight), qual: 0.5 },
    { dim: Math.min(Math.floor(maxDimension * 0.5), img.naturalWidth, img.naturalHeight), qual: 0.4 },
    { dim: Math.min(400, img.naturalWidth, img.naturalHeight), qual: 0.3 } // Very aggressive fallback
  ];
  
  for (const { dim, qual } of attempts) {
    result = createOptimizedImage(img, dim, dim, 'image/webp', qual);
    if (result) {
      // Rough estimation: base64 string length * 0.75 ≈ byte size
      const estimatedSize = result.dataURL.length * 0.75;
      if (estimatedSize <= targetBytes) {
        break;
      }
    }
  }
  
  return result;
};

export const loadImage = (file, settings = null) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const fallback = () => {
        const { width: previewWidth, height: previewHeight } =
          getPreviewDimensions(settings || {});
        resolve({
          file,
          webpSrc: event.target.result,
          printSrc: event.target.result,
          originalWidth: previewWidth,
          originalHeight: previewHeight,
          previewWidth,
          previewHeight,
          x: 0,
          y: 0,
        });
      };

      try {
        const img = new Image();
        img.onload = () => {
          try {
            // Create really small WebP version for UI previews (100-200KB)
            const webpResult = compressWebPToTargetSize(img, 200 * 1024, 800);
            
            // Create minimal print version (never upscale, moderate compression)
            const maxPrintWidth = Math.min(img.naturalWidth, 2048); // Max 2K instead of 4K
            const maxPrintHeight = Math.min(img.naturalHeight, 2048);
            const printResult = createOptimizedImage(img, maxPrintWidth, maxPrintHeight, 'image/jpeg', 0.85);
            
            if (!webpResult || !printResult) {
              return fallback();
            }

            const { width: previewWidth, height: previewHeight } =
              getPreviewDimensions(settings || {});
            
            // Calculate preview dimensions based on WebP version
            const maxHeight = previewHeight;
            const maxWidth = previewWidth;
            const scaleHeight = maxHeight / webpResult.height;
            const scaleWidth = maxWidth / webpResult.width;
            const scale = Math.min(scaleHeight, scaleWidth, 1);
            const scaledWidth = webpResult.width * scale;
            const scaledHeight = webpResult.height * scale;

            resolve({
              file,
              webpSrc: webpResult.dataURL,      // Small WebP for UI
              printSrc: printResult.dataURL,    // FullHD for PDF
              originalWidth: printResult.width, // Use print version dimensions for calculations
              originalHeight: printResult.height,
              previewWidth: scaledWidth,
              previewHeight: scaledHeight,
              x: 0,
              y: 0,
            });
          } catch (e) {
            console.warn("Failed to create optimized images:", e);
            fallback();
          }
        };
        img.onerror = () => fallback();
        img.src = event.target.result;
      } catch (e) {
        fallback();
      }
    };
    reader.onerror = () => {
      // If FileReader fails, resolve with a minimal placeholder
      const { width: previewWidth, height: previewHeight } =
        getPreviewDimensions(settings || {});
      resolve({
        file,
        webpSrc: "",
        printSrc: "",
        originalWidth: previewWidth,
        originalHeight: previewHeight,
        previewWidth,
        previewHeight,
        x: 0,
        y: 0,
      });
    };
    reader.readAsDataURL(file);
  });
};

export const processFiles = async (
  files,
  availableImagesLength,
  settings = null,
  onProgress = null,
) => {
  const byMime = (file) => SUPPORTED_FORMATS.includes(file.type);
  const byExt = (file) => /\.(jpe?g|png|gif|webp)$/i.test(file.name || "");

  const imageFiles = files
    .filter((file) => byMime(file) || byExt(file))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (imageFiles.length === 0) {
    throw new Error(
      "No supported image files found. Please select JPG, PNG, GIF, or WebP files.",
    );
  }

  const processedImages = [];

  if (onProgress) {
    onProgress({
      current: 0,
      total: imageFiles.length,
      message: "Starting image processing...",
      currentFileName: "",
    });
  }

  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];

    if (onProgress) {
      onProgress({
        current: i,
        total: imageFiles.length,
        message: "Processing images...",
        currentFileName: file.name,
      });
    }

    try {
      const imageData = await loadImage(file, settings);
      processedImages.push({
        ...imageData,
        id: `img-${Date.now()}-${Math.random()}`,
        originalIndex: availableImagesLength + processedImages.length,
      });
    } catch (err) {
      // With robust loadImage, this should rarely happen
      console.warn(`Failed to load image ${file.name}:`, err);
    }
  }

  if (onProgress) {
    onProgress({
      current: imageFiles.length,
      total: imageFiles.length,
      message: "Processing complete!",
      currentFileName: "",
    });
  }

  return processedImages;
};
