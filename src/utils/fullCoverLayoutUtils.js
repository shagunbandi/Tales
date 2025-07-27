import { getPreviewDimensions, PAGE_SIZES } from "../constants.js";

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
 * @returns {Array} Array of images with updated positions and dimensions
 */
export function arrangeImagesFullCover(images, totalWidth, totalHeight, settings) {
  if (!images || images.length === 0) {
    return [];
  }

  // For full cover, we use the entire page (no margins)
  const usableWidth = totalWidth;
  const usableHeight = totalHeight;

  if (images.length === 1) {
    // Single image covers the entire page
    return [{
      ...images[0],
      x: 0,
      y: 0,
      previewWidth: usableWidth,
      previewHeight: usableHeight,
      rowIndex: 0,
      colIndex: 0,
    }];
  }

  // For multiple images, we need to arrange them to cover the entire page
  return arrangeMultipleImagesFullCover(images, usableWidth, usableHeight, settings);
}

/**
 * Arranges multiple images to cover the entire page
 * @param {Array} images - Array of images
 * @param {number} usableWidth - Usable width
 * @param {number} usableHeight - Usable height
 * @param {Object} settings - Layout settings
 * @returns {Array} Array of images with calculated positions
 */
function arrangeMultipleImagesFullCover(images, usableWidth, usableHeight, settings) {
  // Calculate optimal grid layout that covers the entire page
  const gridLayout = calculateOptimalGridLayout(
    images.length,
    usableWidth,
    usableHeight,
    settings.maxImagesPerRow,
    settings.maxNumberOfRows
  );

  const { rows, cols } = gridLayout;
  
  // Calculate cell dimensions to cover the entire page
  const cellWidth = usableWidth / cols;
  const cellHeight = usableHeight / rows;

  return images.map((image, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;

    return {
      ...image,
      x: col * cellWidth,
      y: row * cellHeight,
      previewWidth: cellWidth,
      previewHeight: cellHeight,
      rowIndex: row,
      colIndex: col,
    };
  });
}

/**
 * Calculates optimal grid layout for full cover
 * @param {number} totalImages - Total number of images
 * @param {number} width - Page width
 * @param {number} height - Page height
 * @param {number} maxImagesPerRow - Maximum images per row
 * @param {number} maxNumberOfRows - Maximum number of rows
 * @returns {Object} Grid layout with rows and cols
 */
function calculateOptimalGridLayout(totalImages, width, height, maxImagesPerRow, maxNumberOfRows) {
  const pageAspectRatio = width / height;
  
  // Try different grid configurations to find the best fit
  let bestLayout = { rows: 1, cols: totalImages };
  let bestScore = 0;

  for (let rows = 1; rows <= Math.min(maxNumberOfRows, totalImages); rows++) {
    const cols = Math.ceil(totalImages / rows);
    
    if (cols <= maxImagesPerRow) {
      // Calculate how well this layout fits the page aspect ratio
      const layoutAspectRatio = (cols * width) / (rows * height);
      const score = 1 / Math.abs(layoutAspectRatio - pageAspectRatio);
      
      if (score > bestScore) {
        bestScore = score;
        bestLayout = { rows, cols };
      }
    }
  }

  return bestLayout;
}
