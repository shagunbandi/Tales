import { getPreviewDimensions, PAGE_SIZES } from "../constants.js";
import { cropForFullCover, cropImagesForGrid } from "./imageCropUtils.js";

/**
 * Full Cover Layout utility functions
 * Arranges images to cover the entire page without gaps or margins
 */

/**
 * Arranges images in full cover layout - images cover the entire page
 * @param {Array} images - Array of images to arrange
 * @param {number} totalWidth - Total width of the page
 * @param {number} totalHeight - Total height of the page
 * @param {Object} settings - Layout settings
 * @returns {Promise<Array>} Array of images with updated positions and dimensions
 */
export async function arrangeImagesFullCover(images, totalWidth, totalHeight, settings) {
  if (!images || images.length === 0) {
    return [];
  }

  // For full cover, we use the entire page (no margins or gaps)
  const usableWidth = totalWidth;
  const usableHeight = totalHeight;

  // Calculate flexible grid layout for full cover
  const rowDistribution = calculateFlexibleRowDistribution(images.length, settings);
  
  const arrangedImages = [];
  let imageIndex = 0;

  // Arrange images row by row with flexible column counts
  for (let rowIdx = 0; rowIdx < rowDistribution.length; rowIdx++) {
    const imagesInThisRow = rowDistribution[rowIdx];
    const rowHeight = usableHeight / rowDistribution.length;
    const cellWidth = usableWidth / imagesInThisRow;
    const cellHeight = rowHeight;

    // Position images in this row
    for (let colIdx = 0; colIdx < imagesInThisRow; colIdx++) {
      if (imageIndex < images.length) {
        const image = images[imageIndex];
        
        arrangedImages.push({
          ...image,
          x: colIdx * cellWidth,
          y: rowIdx * cellHeight,
          previewWidth: cellWidth,
          previewHeight: cellHeight,
          rowIndex: rowIdx,
          colIndex: colIdx,
          fullCoverMode: true, // Flag for CSS object-cover cropping
        });

        imageIndex++;
      }
    }
  }

  return arrangedImages;
}

/**
 * Calculates flexible row distribution for full cover mode
 * Respects maxImagesPerRow and maxNumberOfRows constraints from settings
 * @param {number} totalImages - Total number of images
 * @param {Object} settings - Layout settings with maxImagesPerRow and maxNumberOfRows
 * @returns {Array} Array of numbers indicating images per row [3, 2] for 5 images
 */
function calculateFlexibleRowDistribution(totalImages, settings) {
  if (totalImages === 0) return [];
  if (totalImages === 1) return [1];
  
  // Get constraints from settings, with fallbacks
  const maxImagesPerRow = settings?.maxImagesPerRow || 4;
  const maxNumberOfRows = settings?.maxNumberOfRows || 2;
  
  // Calculate maximum images that can fit on this page
  const maxImagesThisPage = maxImagesPerRow * maxNumberOfRows;
  const imagesToArrange = Math.min(totalImages, maxImagesThisPage);
  
  // Calculate optimal number of rows
  const idealRows = Math.ceil(imagesToArrange / maxImagesPerRow);
  const actualRows = Math.min(idealRows, maxNumberOfRows);
  
  // Distribute images across rows as evenly as possible
  const distribution = [];
  let remainingImages = imagesToArrange;
  
  for (let row = 0; row < actualRows; row++) {
    const remainingRows = actualRows - row;
    const imagesInThisRow = Math.min(
      Math.ceil(remainingImages / remainingRows),
      maxImagesPerRow
    );
    distribution.push(imagesInThisRow);
    remainingImages -= imagesInThisRow;
  }
  
  return distribution;
}
