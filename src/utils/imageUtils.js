import { SUPPORTED_FORMATS, getPreviewDimensions } from "../constants.js";

export const loadImage = (file, settings = null) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const fallback = () => {
        const { width: previewWidth, height: previewHeight } =
          getPreviewDimensions(settings || {});
        resolve({
          file,
          src: event.target.result,
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
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              return fallback();
            }
            canvas.width = img.naturalWidth || 1;
            canvas.height = img.naturalHeight || 1;
            ctx.drawImage(img, 0, 0);
            const correctedSrc = canvas.toDataURL(
              "image/jpeg",
              settings?.imageQuality,
            );

            const { width: previewWidth, height: previewHeight } =
              getPreviewDimensions(settings || {});
            const maxHeight = previewHeight;
            const maxWidth = previewWidth;
            const scaleHeight = maxHeight / (img.naturalHeight || 1);
            const scaleWidth = maxWidth / (img.naturalWidth || 1);
            const scale = Math.min(scaleHeight, scaleWidth, 1);
            const scaledWidth = (img.naturalWidth || 1) * scale;
            const scaledHeight = (img.naturalHeight || 1) * scale;

            resolve({
              file,
              src: correctedSrc || event.target.result,
              originalWidth: img.naturalWidth || scaledWidth,
              originalHeight: img.naturalHeight || scaledHeight,
              previewWidth: scaledWidth,
              previewHeight: scaledHeight,
              x: 0,
              y: 0,
            });
          } catch (e) {
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
        src: "",
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
        name: file.name,
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
