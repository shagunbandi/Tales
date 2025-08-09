/**
 * Auto-arrangement utility functions for distributing images across pages
 */

import { getRandomColor, arrangeImages } from "./layoutUtils.js";
import { getPreviewDimensions } from "../constants.js";

/**
 * Automatically arranges images across pages using optimal layout algorithms
 * @param {Array} availableImages - Array of images to arrange
 * @param {Array} existingPages - Array of existing pages
 * @param {Object} settings - Layout settings including page margin, image gap, etc.
 * @returns {Promise<Object>} Object containing arrangedPages and remainingImages
 */
export async function autoArrangeImages(
  availableImages,
  existingPages,
  settings,
  onProgress = null,
) {
  // Step 1: Calculate remaining pages
  const remainingPages = settings.maxNumberOfPages - existingPages.length;

  // If no remaining pages, return all images as remaining
  if (remainingPages <= 0) {
    return {
      arrangedPages: [],
      remainingImages: availableImages,
    };
  }

  // If no images to place, return empty arrays
  if (availableImages.length === 0) {
    return {
      arrangedPages: [],
      remainingImages: [],
    };
  }

  // For full cover mode, optimize distribution across available pages
  if (settings.designStyle === "full_cover") {
    // Calculate maximum images per page based on both grid and per-page settings
    const maxImagesPerRow = settings.maxImagesPerRow || 4;
    const maxNumberOfRows = settings.maxNumberOfRows || 4;
    const maxImagesFromGrid = maxImagesPerRow * maxNumberOfRows;
    const maxImagesPerPage = Math.min(
      maxImagesFromGrid,
      settings.imagesPerPage || maxImagesFromGrid,
    );

    // Optimize distribution: try to fit all images within available pages
    const totalImages = availableImages.length;
    let imagesPerPage;

    if (totalImages <= remainingPages * maxImagesPerPage) {
      // We can fit all images, so distribute optimally
      imagesPerPage = Math.ceil(totalImages / remainingPages);
      // But don't exceed the maximum per page
      imagesPerPage = Math.min(imagesPerPage, maxImagesPerPage);
    } else {
      // We can't fit all images, so use maximum capacity
      imagesPerPage = maxImagesPerPage;
    }

    const totalPagesNeeded = Math.ceil(totalImages / imagesPerPage);
    const pagesToCreate = Math.min(totalPagesNeeded, remainingPages);
    const arrangedPages = [];
    const { width: previewWidth, height: previewHeight } =
      getPreviewDimensions(settings);

    let imageIndex = 0;

    for (let pageIdx = 0; pageIdx < pagesToCreate; pageIdx++) {
      if (onProgress) {
        onProgress({
          step: pageIdx,
          total: pagesToCreate,
          message: `Creating full cover page ${pageIdx + 1} of ${pagesToCreate}...`,
          percentage: Math.round((pageIdx / pagesToCreate) * 100),
        });
      }

      // Allow UI to update
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Calculate images for this specific page
      const remainingImages = totalImages - imageIndex;
      const remainingPagesToCreate = pagesToCreate - pageIdx;
      const imagesForThisPage = Math.min(
        Math.ceil(remainingImages / remainingPagesToCreate),
        maxImagesPerPage,
        remainingImages,
      );

      // Get images for this page
      const pageImages = availableImages.slice(
        imageIndex,
        imageIndex + imagesForThisPage,
      );
      imageIndex += imagesForThisPage;

      if (pageImages.length > 0) {
        const arrangedImages = await arrangeImages(
          pageImages,
          previewWidth,
          previewHeight,
          settings,
        );

        const newPage = {
          id: `page-${Date.now()}-${pageIdx}`,
          images: arrangedImages,
          color: getRandomColor(),
        };

        arrangedPages.push(newPage);
      }
    }

    if (onProgress) {
      onProgress({
        step: pagesToCreate,
        total: pagesToCreate,
        message: "Full cover auto-arrange complete!",
        percentage: 100,
      });
    }

    return {
      arrangedPages,
      remainingImages: availableImages.slice(imageIndex),
    };
  }

  // For classic mode, use the original logic
  // Step 2: Calculate maximum images per page based on both grid and per-page settings
  const maxImagesFromGrid = settings.maxImagesPerRow * settings.maxNumberOfRows;
  const maxImagesPerPage = Math.min(
    maxImagesFromGrid,
    settings.imagesPerPage || maxImagesFromGrid,
  );

  // Step 3: Calculate average images per page with validation
  const totalImagesToPlace = availableImages.length;
  let averageImagesPerPage = Math.ceil(totalImagesToPlace / remainingPages);

  // Validate against maximum capacity
  if (averageImagesPerPage > maxImagesPerPage) {
    averageImagesPerPage = maxImagesPerPage;
  }

  // Step 4: Calculate how many images can actually be placed
  const maxImagesThatCanBePlaced = remainingPages * averageImagesPerPage;
  const imagesToPlace = Math.min(totalImagesToPlace, maxImagesThatCanBePlaced);

  // Step 5: Create new pages with arranged images
  const arrangedPages = [];
  const imagesToArrange = availableImages.slice(0, imagesToPlace);
  const remainingImages = availableImages.slice(imagesToPlace);

  // Get page dimensions for layout calculation
  const { width: previewWidth, height: previewHeight } =
    getPreviewDimensions(settings);

  // Distribute images across pages
  let currentImageIndex = 0;
  const totalPagesToCreate = Math.min(
    remainingPages,
    Math.ceil(imagesToArrange.length / averageImagesPerPage),
  );

  for (
    let pageIndex = 0;
    pageIndex < remainingPages && currentImageIndex < imagesToArrange.length;
    pageIndex++
  ) {
    if (onProgress) {
      onProgress({
        step: pageIndex,
        total: totalPagesToCreate,
        message: `Arranging page ${pageIndex + 1} of ${totalPagesToCreate}...`,
        percentage: Math.round((pageIndex / totalPagesToCreate) * 100),
      });
    }

    // Allow UI to update
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Calculate how many images should go on this page
    const imagesForThisPage = Math.min(
      averageImagesPerPage,
      imagesToArrange.length - currentImageIndex,
    );

    if (imagesForThisPage <= 0) break;

    // Get images for this page
    const pageImages = imagesToArrange.slice(
      currentImageIndex,
      currentImageIndex + imagesForThisPage,
    );

    // Use shared layout function (now async)
    const arrangedImages = await arrangeImages(
      pageImages,
      previewWidth,
      previewHeight,
      settings,
    );

    // Create new page
    const newPage = {
      id: `page-${Date.now()}-${pageIndex}`,
      images: arrangedImages,
      color: getRandomColor(),
    };

    arrangedPages.push(newPage);
    currentImageIndex += imagesForThisPage;
  }

  if (onProgress) {
    onProgress({
      step: totalPagesToCreate,
      total: totalPagesToCreate,
      message: "Auto-arrange complete!",
      percentage: 100,
    });
  }

  return {
    arrangedPages,
    remainingImages,
  };
}
