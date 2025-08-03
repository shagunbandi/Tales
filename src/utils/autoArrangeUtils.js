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
export async function autoArrangeImages(availableImages, existingPages, settings, onProgress = null) {
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

  // Step 2: Calculate maximum images per page based on layout constraints
  const maxImagesPerPage = settings.maxImagesPerRow * settings.maxNumberOfRows;

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
  const totalPagesToCreate = Math.min(remainingPages, Math.ceil(imagesToArrange.length / averageImagesPerPage));
  
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
        percentage: Math.round((pageIndex / totalPagesToCreate) * 100)
      });
    }

    // Allow UI to update
    await new Promise(resolve => setTimeout(resolve, 10));

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
    const arrangedImages = await arrangeImages(pageImages, previewWidth, previewHeight, settings);

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
      message: 'Auto-arrange complete!',
      percentage: 100
    });
  }

  return {
    arrangedPages,
    remainingImages,
  };
}
