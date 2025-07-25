import {
  COLOR_PALETTE,
  PAGE_SIZES,
  getPreviewDimensions,
} from '../constants.js'

/**
 * Layout utility functions for image arrangement and page management
 */

/**
 * Converts preview dimensions to millimeters for PDF generation
 * @param {number} previewValue - The preview dimension value in pixels
 * @param {Object} settings - The current settings object
 * @returns {number} The dimension in millimeters
 */
export function previewToMm(previewValue, settings) {
  if (!settings) {
    throw new Error('Settings object is required for preview to mm conversion')
  }

  const pageSize = PAGE_SIZES[settings.pageSize || 'a4']
  const orientation = settings.orientation || 'landscape'

  // Calculate actual page dimensions in mm
  let actualPageWidth, actualPageHeight
  if (orientation === 'landscape') {
    actualPageWidth = pageSize.width
    actualPageHeight = pageSize.height
  } else {
    actualPageWidth = pageSize.height
    actualPageHeight = pageSize.width
  }

  // Get preview dimensions using the existing function
  const previewDimensions = getPreviewDimensions(settings)

  // Calculate conversion factors
  const widthConversionFactor = actualPageWidth / previewDimensions.width
  const heightConversionFactor = actualPageHeight / previewDimensions.height

  // Convert preview value to millimeters
  // For width-related values (x, width), use width conversion factor
  // For height-related values (y, height), use height conversion factor
  // Since we can't determine which dimension this is, we'll use the average
  // or assume it's proportional to the page dimensions
  const conversionFactor = (widthConversionFactor + heightConversionFactor) / 2

  return previewValue * conversionFactor
}

/**
 * Generates a random color from the color palette
 * @returns {Object} Color object with color property
 */
export function getRandomColor() {
  const randomIndex = Math.floor(Math.random() * COLOR_PALETTE.length)
  return COLOR_PALETTE[randomIndex]
}

/**
 * Automatically arranges images across pages using optimal layout algorithms
 * @param {Array} availableImages - Array of images to arrange
 * @param {Array} existingPages - Array of existing pages
 * @param {Object} settings - Layout settings including page margin, image gap, etc.
 * @returns {Object} Object containing arrangedPages and remainingImages
 */
export function autoArrangeImages(availableImages, existingPages, settings) {
  // TODO: Implement automatic image arrangement across pages
}

/**
 * Finds the correct position to insert an image back into the available images list
 * @param {Array} availableImages - Current array of available images
 * @param {number} originalIndex - The original index of the image
 * @returns {number} The correct insert position
 */
export function findCorrectInsertPosition(availableImages, originalIndex) {
  // If the available images array is empty, insert at the beginning
  if (availableImages.length === 0) {
    return 0
  }

  // Find the position where the image should be inserted to maintain original order
  // We want to insert the image so that all images with originalIndex < this image's originalIndex
  // come before it, and all images with originalIndex > this image's originalIndex come after it

  let insertIndex = 0

  for (let i = 0; i < availableImages.length; i++) {
    const currentImage = availableImages[i]

    // If the current image has a higher originalIndex, we should insert before it
    if (currentImage.originalIndex > originalIndex) {
      insertIndex = i
      break
    }

    // If we reach the end, insert at the end
    if (i === availableImages.length - 1) {
      insertIndex = availableImages.length
    }
  }

  return insertIndex
}

/**
 * Arranges and centers images on a page with multi-row layout support
 * @param {Array} images - Array of images to arrange
 * @param {number} availableWidth - Available width for images
 * @param {number} availableHeight - Available height for images
 * @param {number} pageMargin - Page margin
 * @param {number} imageGap - Gap between images
 * @param {Object} settings - Layout settings including imagesPerRow
 * @returns {Array} Array of images with updated positions and dimensions
 */
export function arrangeAndCenterImages(
  images,
  availableWidth,
  availableHeight,
  pageMargin,
  imageGap,
  settings,
  sameHeight = true,
) {}
