/**
 * Layout Cycling Utility - Clean implementation for cycling through layout options
 */

import { arrangeImages } from "./layoutUtils.js";
import { getPreviewDimensions } from "../constants.js";
import { arrangeImagesFullCover, FULL_COVER_LAYOUT_TYPES } from "./fullCoverLayoutUtils.js";

// Store the current layout index for each page
const pageLayoutState = new Map();

/**
 * Generate all valid layout combinations for a given number of images
 * @param {number} totalImages - Number of images to arrange
 * @param {number} maxImagesPerRow - Maximum images per row
 * @param {number} maxNumberOfRows - Maximum number of rows
 * @returns {Array} Array of layout arrays like [[4], [1,3], [2,2], [3,1]]
 */
function generateAllValidLayouts(
  totalImages,
  maxImagesPerRow,
  maxNumberOfRows,
) {
  if (totalImages === 0) return [];
  if (totalImages === 1) return [[1]];

  const validLayouts = [];

  // Try different numbers of rows
  for (
    let numRows = 1;
    numRows <= Math.min(maxNumberOfRows, totalImages);
    numRows++
  ) {
    const layouts = generateLayoutsForRows(
      totalImages,
      numRows,
      maxImagesPerRow,
    );
    validLayouts.push(...layouts);
  }

  // Remove duplicates and return
  return validLayouts.filter(
    (layout, index, self) =>
      index ===
      self.findIndex((l) => JSON.stringify(l) === JSON.stringify(layout)),
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
    const maxImagesThisRow = Math.min(
      maxImagesPerRow,
      remainingImages - (remainingRows - 1),
    );

    // Try all valid numbers of images for this row
    for (
      let imagesInRow = minImagesThisRow;
      imagesInRow <= maxImagesThisRow;
      imagesInRow++
    ) {
      currentLayout[rowIndex] = imagesInRow;
      generateCombination(
        rowIndex + 1,
        remainingImages - imagesInRow,
        currentLayout,
      );
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
      layouts: availableLayouts,
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

  // Check if we're in full cover mode
  if (settings?.designStyle === 'full_cover') {
    return await cycleFullCoverLayout(images, settings, pageId, direction);
  }

  // Classic layout cycling (original implementation)
  const maxImagesPerRow = settings?.maxImagesPerRow || 4;
  const maxNumberOfRows = settings?.maxNumberOfRows || 2;
  const availableLayouts = generateAllValidLayouts(
    images.length,
    maxImagesPerRow,
    maxNumberOfRows,
  );

  if (availableLayouts.length === 0) {
    return images;
  }

  // Get current state and move to next/previous
  const state = getLayoutState(pageId, availableLayouts);
  state.currentIndex =
    (state.currentIndex + direction + availableLayouts.length) %
    availableLayouts.length;

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
  const { width: previewWidth, height: previewHeight } =
    getPreviewDimensions(settings);

  // Create settings with forced layout
  const forcedSettings = {
    ...settings,
    _forcedLayout: layout,
  };

  try {
    const result = await arrangeImages(
      images,
      previewWidth,
      previewHeight,
      forcedSettings,
    );
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

  arrangedImages.forEach((img) => {
    if (img.rowIndex !== undefined) {
      rows[img.rowIndex] = (rows[img.rowIndex] || 0) + 1;
    }
  });

  const actualLayout = Object.keys(rows)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .map((key) => rows[key]);

  const isCorrect =
    JSON.stringify(actualLayout) === JSON.stringify(expectedLayout);

  return {
    isCorrect,
    actualLayout,
    expectedLayout,
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
    totalLayouts: state.layouts.length,
  };
}

/**
 * Re-apply the current layout template to a new set of images
 * @param {Array} images - New images to arrange
 * @param {Object} settings - Layout settings
 * @param {string} pageId - Page identifier
 * @returns {Promise<Array>} Arranged images with current layout preserved
 */
export async function reapplyCurrentLayout(images, settings, pageId) {
  if (!images || images.length === 0) {
    return [];
  }

  // Check if we're in full cover mode
  if (settings?.designStyle === 'full_cover') {
    const fullCoverPageId = `fullcover_${pageId}`;
    const state = pageLayoutState.get(fullCoverPageId);
    
    if (state && state.layouts && state.layouts[state.currentIndex]) {
      const selectedOption = state.layouts[state.currentIndex];
      
      // Apply the same layout that was previously selected
      const layoutSettings = { ...settings };
      
      if (selectedOption.type === FULL_COVER_LAYOUT_TYPES.GRID) {
        // Re-apply grid layout
        layoutSettings._forcedLayout = selectedOption.layout;
        layoutSettings._fullCoverLayoutType = FULL_COVER_LAYOUT_TYPES.GRID;
      } else {
        // Re-apply flexible layout
        layoutSettings._fullCoverLayoutType = FULL_COVER_LAYOUT_TYPES.FLEXIBLE;
        layoutSettings._forcedFlexibleLayout = selectedOption.layoutIndex;
      }
      
      const { width: previewWidth, height: previewHeight } = getPreviewDimensions(settings);
      
      try {
        const result = await arrangeImagesFullCover(
          images,
          previewWidth,
          previewHeight,
          layoutSettings
        );
        return result;
      } catch (error) {
        console.error("Error reapplying current layout:", error);
      }
    }
  }
  
  // Fallback to classic layout cycling for non-full-cover or if no state found
  const state = getLayoutState(pageId, []);
  if (state && state.layouts && state.layouts[state.currentIndex]) {
    const selectedLayout = state.layouts[state.currentIndex];
    return await applyLayoutToImages(images, selectedLayout, settings);
  }
  
  // Final fallback - return images as-is
  return images;
}

/**
 * Cycle through full cover layout options (grid and flexible)
 * @param {Array} images - Images to arrange
 * @param {Object} settings - Layout settings
 * @param {string} pageId - Page identifier
 * @param {number} direction - 1 for next, -1 for previous
 * @returns {Promise<Array>} Arranged images with new layout
 */
async function cycleFullCoverLayout(images, settings, pageId, direction) {
  const { width: previewWidth, height: previewHeight } = getPreviewDimensions(settings);
  
  // Create state key specific to full cover layouts
  const fullCoverPageId = `fullcover_${pageId}`;
  
  // Get available layout types: grid and flexible
  const layoutTypes = [
    { type: FULL_COVER_LAYOUT_TYPES.GRID, name: 'Grid' },
    { type: FULL_COVER_LAYOUT_TYPES.FLEXIBLE, name: 'Flexible' }
  ];
  
  // Get current grid layouts for this number of images (for grid type)
  const maxImagesPerRow = settings?.maxImagesPerRow || 4;
  const maxNumberOfRows = settings?.maxNumberOfRows || 2;
  const gridLayouts = generateAllValidLayouts(images.length, maxImagesPerRow, maxNumberOfRows);
  
  // Build all available options
  const allOptions = [];
  
  // Add grid options
  gridLayouts.forEach((layout, index) => {
    allOptions.push({
      type: FULL_COVER_LAYOUT_TYPES.GRID,
      layoutIndex: index,
      layout: layout,
      name: `Grid ${index + 1}`
    });
  });
  
  // Add flexible options (we'll cycle through different flexible layouts)
  const flexibleCount = getFlexibleLayoutCount(images.length);
  for (let i = 0; i < flexibleCount; i++) {
    allOptions.push({
      type: FULL_COVER_LAYOUT_TYPES.FLEXIBLE,
      layoutIndex: i,
      name: `Flexible ${i + 1}`
    });
  }
  
  if (allOptions.length === 0) {
    return images;
  }
  
  // Get current state and move to next/previous
  const state = getLayoutState(fullCoverPageId, allOptions);
  state.currentIndex = (state.currentIndex + direction + allOptions.length) % allOptions.length;
  
  const selectedOption = allOptions[state.currentIndex];
  
  // Apply the selected layout
  const layoutSettings = { ...settings };
  
  if (selectedOption.type === FULL_COVER_LAYOUT_TYPES.GRID) {
    // Use grid layout with forced distribution
    layoutSettings._forcedLayout = selectedOption.layout;
    layoutSettings._fullCoverLayoutType = FULL_COVER_LAYOUT_TYPES.GRID;
  } else {
    // Use flexible layout with specific option index
    layoutSettings._fullCoverLayoutType = FULL_COVER_LAYOUT_TYPES.FLEXIBLE;
    layoutSettings._forcedFlexibleLayout = selectedOption.layoutIndex;
  }
  
  try {
    const result = await arrangeImagesFullCover(
      images,
      previewWidth,
      previewHeight,
      layoutSettings
    );
    return result;
  } catch (error) {
    console.error("Error applying full cover layout:", error);
    return images;
  }
}

/**
 * Get the number of flexible layout variations for a given number of images
 * @param {number} imageCount - Number of images
 * @returns {number} Number of flexible layout options
 */
function getFlexibleLayoutCount(imageCount) {
  if (imageCount === 1) return 1;
  if (imageCount === 2) return 3; // 3 variations for 2 images (equal side, equal stacked, 70/30)
  if (imageCount === 3) return 4; // 4 variations for 3 images (large left, large right, large top, large center)
  if (imageCount === 4) return 4; // 4 variations for 4 images (large left, large right, large top, large center)
  if (imageCount === 5) return 2; // 2 variations for 5 images (large + four others, 2-1-2 pattern)
  if (imageCount === 6) return 5; // 5 variations for 6 images (large in different positions)
  return 1; // Default grid for larger numbers
}
