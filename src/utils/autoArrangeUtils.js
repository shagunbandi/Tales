/**
 * Auto-arrangement utility functions for distributing images across pages
 */

import { arrangeAndCenterImages, getRandomColor } from './layoutUtils.js'
import { getPreviewDimensions } from '../constants.js'

/**
 * Automatically arranges images across pages using optimal layout algorithms
 * @param {Array} availableImages - Array of images to arrange
 * @param {Array} existingPages - Array of existing pages
 * @param {Object} settings - Layout settings including page margin, image gap, etc.
 * @returns {Object} Object containing arrangedPages and remainingImages
 */
export function autoArrangeImages(availableImages, existingPages, settings) {
  // Step 1: Calculate remaining pages
  const remainingPages = settings.maxNumberOfPages - existingPages.length

  // If no remaining pages, return all images as remaining
  if (remainingPages <= 0) {
    return {
      arrangedPages: [],
      remainingImages: availableImages,
    }
  }

  // If no images to place, return empty arrays
  if (availableImages.length === 0) {
    return {
      arrangedPages: [],
      remainingImages: [],
    }
  }

  // Step 2: Calculate maximum images per page based on layout constraints
  const maxImagesPerPage = settings.maxImagesPerRow * settings.maxNumberOfRows

  // Step 3: Calculate average images per page with validation
  const totalImagesToPlace = availableImages.length
  let averageImagesPerPage = Math.ceil(totalImagesToPlace / remainingPages)

  // Validate against maximum capacity
  if (averageImagesPerPage > maxImagesPerPage) {
    averageImagesPerPage = maxImagesPerPage
  }

  // Step 4: Calculate how many images can actually be placed
  const maxImagesThatCanBePlaced = remainingPages * averageImagesPerPage
  const imagesToPlace = Math.min(totalImagesToPlace, maxImagesThatCanBePlaced)
  const imagesThatWillRemain = totalImagesToPlace - imagesToPlace

  // Step 5: Create new pages with arranged images
  const arrangedPages = []
  const imagesToArrange = availableImages.slice(0, imagesToPlace)
  const remainingImages = availableImages.slice(imagesToPlace)

  // Get page dimensions for layout calculation
  const { width: previewWidth, height: previewHeight } =
    getPreviewDimensions(settings)
  const pageMargin = settings.pageMargin
  const imageGap = settings.imageGap

  // Distribute images across pages
  let currentImageIndex = 0
  for (
    let pageIndex = 0;
    pageIndex < remainingPages && currentImageIndex < imagesToArrange.length;
    pageIndex++
  ) {
    // Calculate how many images should go on this page
    const imagesForThisPage = Math.min(
      averageImagesPerPage,
      imagesToArrange.length - currentImageIndex,
    )

    if (imagesForThisPage <= 0) break

    // Get images for this page
    const pageImages = imagesToArrange.slice(
      currentImageIndex,
      currentImageIndex + imagesForThisPage,
    )

    // Use arrangeAndCenterImages to get optimal layout for this page
    const arrangedImages = arrangeAndCenterImages(
      pageImages,
      previewWidth,
      previewHeight,
      pageMargin,
      imageGap,
      settings,
    )

    // Create new page
    const newPage = {
      id: `page-${Date.now()}-${pageIndex}`,
      images: arrangedImages,
      color: getRandomColor(),
    }

    arrangedPages.push(newPage)
    currentImageIndex += imagesForThisPage
  }

  return {
    arrangedPages,
    remainingImages,
  }
}
