/**
 * Layout Cycling Utility - Clean implementation for cycling through layout options
 */

import { arrangeImages } from "./layoutUtils.js";
import { getPreviewDimensions } from "../constants.js";

// Store the current layout index for each page
const pageLayoutState = new Map();

/**
 * Generate all valid layout combinations for a given number of images
 * @param {number} totalImages - Number of images to arrange
 * @param {number} maxImagesPerRow - Maximum images per row
 * @param {number} maxNumberOfRows - Maximum number of rows
 * @returns {Array} Array of layout arrays like [[4], [1,3], [2,2], [3,1]]
 */
function generateAllValidLayouts(totalImages, maxImagesPerRow, maxNumberOfRows) {
  if (totalImages === 0) return [];
  if (totalImages === 1) return [[1]];

  const validLayouts = [];

  // Try different numbers of rows
  for (let numRows = 1; numRows <= Math.min(maxNumberOfRows, totalImages); numRows++) {
    const layouts = generateLayoutsForRows(totalImages, numRows, maxImagesPerRow);
    validLayouts.push(...layouts);
  }

  // Remove duplicates and return
  return validLayouts.filter((layout, index, self) => 
    index === self.findIndex(l => JSON.stringify(l) === JSON.stringify(layout))
  );
}

/**
 * Generate all valid layouts for a specific number of rows
 * @param {number} totalImages - Total images to distribute
 * @param {number} numRows - Number of rows
 * @param {number} maxImagesPerRow - Max images per row
 * @returns {Array} Array of valid layouts
 */
function generateLayoutsForRows(totalImages, numRows, maxImagesPerRow) {
  const layouts = [];

  function generateCombination(rowIndex, remainingImages, currentLayout) {
    // Base case: we've filled all rows
    if (rowIndex === numRows) {
      if (remainingImages === 0) {
        layouts.push([...currentLayout]);
      }
      return;
    }

    // Calculate constraints for this row
    const remainingRows = numRows - rowIndex;
    const minImagesThisRow = 1; // Allow at least 1 image per row
    const maxImagesThisRow = Math.min(maxImagesPerRow, remainingImages - (remainingRows - 1));

    // Try all valid numbers of images for this row
    for (let imagesInRow = minImagesThisRow; imagesInRow <= maxImagesThisRow; imagesInRow++) {
      currentLayout[rowIndex] = imagesInRow;
      generateCombination(rowIndex + 1, remainingImages - imagesInRow, currentLayout);
    }
  }

  generateCombination(0, totalImages, new Array(numRows));
  return layouts;
}

/**
 * Get or initialize the layout state for a page
 * @param {string} pageId - Page identifier
 * @param {Array} availableLayouts - Array of available layouts
 * @returns {Object} Layout state object
 */
function getLayoutState(pageId, availableLayouts) {
  if (!pageLayoutState.has(pageId)) {
    pageLayoutState.set(pageId, {
      currentIndex: 0,
      layouts: availableLayouts
    });
  }
  return pageLayoutState.get(pageId);
}

/**
 * Cycle to the next layout for a page
 * @param {Array} images - Images to arrange
 * @param {Object} settings - Layout settings
 * @param {string} pageId - Page identifier
 * @returns {Promise<Array>} Arranged images with new layout
 */
export async function nextPageLayout(images, settings, pageId) {
  return await cyclePageLayout(images, settings, pageId, 1);
}

/**
 * Cycle to the previous layout for a page
 * @param {Array} images - Images to arrange
 * @param {Object} settings - Layout settings
 * @param {string} pageId - Page identifier
 * @returns {Promise<Array>} Arranged images with new layout
 */
export async function previousPageLayout(images, settings, pageId) {
  return await cyclePageLayout(images, settings, pageId, -1);
}

/**
 * Core layout cycling function
 * @param {Array} images - Images to arrange
 * @param {Object} settings - Layout settings
 * @param {string} pageId - Page identifier
 * @param {number} direction - 1 for next, -1 for previous
 * @returns {Promise<Array>} Arranged images with new layout
 */
async function cyclePageLayout(images, settings, pageId, direction) {
  if (!images || images.length === 0) {
    return [];
  }

  // Generate available layouts for this number of images
  const maxImagesPerRow = settings?.maxImagesPerRow || 4;
  const maxNumberOfRows = settings?.maxNumberOfRows || 2;
  const availableLayouts = generateAllValidLayouts(images.length, maxImagesPerRow, maxNumberOfRows);

  if (availableLayouts.length === 0) {
    return images;
  }

  // Get current state and move to next/previous
  const state = getLayoutState(pageId, availableLayouts);
  state.currentIndex = (state.currentIndex + direction + availableLayouts.length) % availableLayouts.length;
  
  const selectedLayout = availableLayouts[state.currentIndex];

  // Apply the selected layout
  return await applyLayoutToImages(images, selectedLayout, settings);
}

/**
 * Apply a specific layout to images
 * @param {Array} images - Images to arrange
 * @param {Array} layout - Layout structure like [2, 2] or [1, 3]
 * @param {Object} settings - Layout settings
 * @returns {Promise<Array>} Arranged images
 */
async function applyLayoutToImages(images, layout, settings) {
  const { width: previewWidth, height: previewHeight } = getPreviewDimensions(settings);
  
  // Create settings with forced layout
  const forcedSettings = {
    ...settings,
    _forcedLayout: layout
  };
  
  try {
    const result = await arrangeImages(images, previewWidth, previewHeight, forcedSettings);
    return result;
  } catch (error) {
    console.error("Error applying layout:", error);
    return images; // Fallback to original images
  }
}

/**
 * Verify that a layout was applied correctly
 * @param {Array} arrangedImages - Images after layout application
 * @param {Array} expectedLayout - Expected layout structure
 * @returns {Object} Verification result
 */
function verifyLayoutApplication(arrangedImages, expectedLayout) {
  const rows = {};
  
  arrangedImages.forEach(img => {
    if (img.rowIndex !== undefined) {
      rows[img.rowIndex] = (rows[img.rowIndex] || 0) + 1;
    }
  });
  
  const actualLayout = Object.keys(rows)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .map(key => rows[key]);
  
  const isCorrect = JSON.stringify(actualLayout) === JSON.stringify(expectedLayout);
  
  return {
    isCorrect,
    actualLayout,
    expectedLayout
  };
}

/**
 * Reset layout state for a page (useful when images change)
 * @param {string} pageId - Page identifier
 */
export function resetPageLayoutState(pageId) {
  pageLayoutState.delete(pageId);
}

/**
 * Get current layout info for a page
 * @param {string} pageId - Page identifier
 * @returns {Object|null} Current layout info
 */
export function getCurrentLayoutInfo(pageId) {
  const state = pageLayoutState.get(pageId);
  if (!state) return null;
  
  return {
    currentIndex: state.currentIndex,
    currentLayout: state.layouts[state.currentIndex],
    totalLayouts: state.layouts.length
  };
}