/**
 * Layout Cycling Utility - Clean implementation for cycling through layout options
 */

import { arrangeImages } from "./layoutUtils.js";
import { getPreviewDimensions } from "../constants.js";
import {
  arrangeImagesFullCover,
  FULL_COVER_LAYOUT_TYPES,
} from "./fullCoverLayoutUtils.js";
import { getLayoutOptions, convertToFullCoverFormat } from "./hardcodedLayouts.js";

// Store the current layout index for each page
const pageLayoutState = new Map();

// Cache for valid layout combinations keyed by totalImages/maxImagesPerRow/maxNumberOfRows
const validLayoutsCache = new Map();

function getCachedValidLayouts(totalImages, maxImagesPerRow, maxNumberOfRows) {
  const key = `${totalImages}|${maxImagesPerRow}|${maxNumberOfRows}`;
  if (validLayoutsCache.has(key)) {
    return validLayoutsCache.get(key);
  }
  const layouts = generateAllValidLayouts(
    totalImages,
    maxImagesPerRow,
    maxNumberOfRows,
  );
  validLayoutsCache.set(key, layouts);
  return layouts;
}

function ensureFullCoverState(pageId, images, settings) {
  const fullCoverPageId = `fullcover_${pageId}`.startsWith("fullcover_")
    ? pageId
    : `fullcover_${pageId}`;

  if (pageLayoutState.has(fullCoverPageId)) {
    return pageLayoutState.get(fullCoverPageId);
  }

  const paperSize = settings?.pageSize?.toUpperCase() || "A4";
  const imageCount = images?.length || 0;

  const state = {
    currentIndex: 0,
    layouts: [],
  };

  if (imageCount > 0) {
    // GRID options from hardcoded layouts
    const hardcodedLayouts = getLayoutOptions(paperSize, imageCount) || [];
    for (const layout of hardcodedLayouts) {
      state.layouts.push({ type: FULL_COVER_LAYOUT_TYPES.GRID, layout });
    }

    // FLEXIBLE options from count helper
    const flexibleCount = getFlexibleLayoutCount(imageCount);
    for (let i = 0; i < flexibleCount; i++) {
      state.layouts.push({ type: FULL_COVER_LAYOUT_TYPES.FLEXIBLE, layoutIndex: i });
    }
  }

  pageLayoutState.set(fullCoverPageId, state);
  return state;
}

function isFullCoverStateId(id) {
  return typeof id === "string" && id.startsWith("fullcover_");
}

/**
 * Store the currently selected hardcoded layout for a full cover page
 * This enables consistent reapplication when images are moved between pages
 * @param {string} pageId
 * @param {Object} layout - Hardcoded layout object from hardcodedLayouts
 */
export function setCurrentHardcodedLayout(pageId, layout) {
  const fullCoverPageId = `fullcover_${pageId}`;
  pageLayoutState.set(fullCoverPageId, {
    currentIndex: 0,
    layouts: [
      {
        type: "HARDCODED",
        hardcodedLayout: layout,
      },
    ],
  });
}

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
 * Get current layout information for a page
 * @param {string} pageId - Page identifier
 * @param {Array} images - Images to get layouts for
 * @param {Object} settings - Layout settings
 * @returns {Object} Current layout info with index and total count
 */
export function getCurrentLayoutInfo(pageId, images, settings) {
  // Support calls with only pageId (tests rely on this)
  if (images === undefined && settings === undefined) {
    // If pageId refers to fullcover state, read from state directly
    if (isFullCoverStateId(pageId)) {
      const state = pageLayoutState.get(pageId);
      if (!state || !state.layouts || state.layouts.length === 0) {
        return null;
      }
      const current = state.layouts[state.currentIndex] || null;
      return {
        currentIndex: (state.currentIndex ?? 0) + 1,
        totalLayouts: state.layouts.length,
        currentLayout: current,
      };
    }
    // Classic path without images/settings: no info
    return null;
  }

  if (!images || images.length === 0) {
    return { currentIndex: 0, totalLayouts: 0 };
  }

  // Check if we're in full cover mode
  if (settings?.designStyle === "full_cover") {
    // Ensure state and return info derived from it combined with applied detection
    const fullCoverPageId = `fullcover_${pageId}`;
    const state = ensureFullCoverState(fullCoverPageId, images, settings);

    if (!state.layouts || state.layouts.length === 0) {
      return { currentIndex: 0, totalLayouts: 0, currentLayout: null };
    }

    // Attempt to detect the current applied hardcoded layout name
    const info = getCurrentFullCoverLayoutInfo(pageId, images, settings);
    // Merge with state info so consumers get current layout object/type
    const current = state.layouts[state.currentIndex] || null;
    return {
      currentIndex: Math.max(1, info.currentIndex || state.currentIndex + 1),
      totalLayouts: Math.max(info.totalLayouts || 0, state.layouts.length),
      currentLayout: current,
      currentLayoutName: info.currentLayoutName || null,
    };
  }

  // Classic layout
  const maxImagesPerRow = settings?.maxImagesPerRow || 4;
  const maxNumberOfRows = settings?.maxNumberOfRows || 4;
  const availableLayouts = getCachedValidLayouts(
    images.length,
    maxImagesPerRow,
    maxNumberOfRows,
  );

  if (availableLayouts.length === 0) {
    return { currentIndex: 0, totalLayouts: 0 };
  }

  const state = getLayoutState(pageId, availableLayouts);
  return {
    currentIndex: state.currentIndex + 1, // 1-indexed for display
    totalLayouts: availableLayouts.length,
  };
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
  if (settings?.designStyle === "full_cover") {
    return await cycleFullCoverLayout(images, settings, pageId, direction);
  }

  // Classic layout cycling (original implementation)
  const maxImagesPerRow = settings?.maxImagesPerRow || 4;
  const maxNumberOfRows = settings?.maxNumberOfRows || 4;
  const availableLayouts = getCachedValidLayouts(
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
    _forcedLayout: Array.isArray(layout) ? layout : null,
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
  if (settings?.designStyle === "full_cover") {
    const fullCoverPageId = `fullcover_${pageId}`;
    const state = pageLayoutState.get(fullCoverPageId);

    if (state && state.layouts && state.layouts[state.currentIndex]) {
      const selectedOption = state.layouts[state.currentIndex];

      // Re-apply previously selected hardcoded layout
      if (selectedOption.type === "HARDCODED" && selectedOption.hardcodedLayout) {
        const { width: previewWidth, height: previewHeight } = getPreviewDimensions(settings);
        try {
          return convertToFullCoverFormat(
            selectedOption.hardcodedLayout,
            images,
            previewWidth,
            previewHeight,
          );
        } catch (error) {
          console.error("Error reapplying hardcoded layout:", error);
          // Return null to indicate failure and allow fallback
          return null;
        }
      }

      // Legacy: grid/flexible path
      const layoutSettings = { ...settings };

      if (selectedOption.type === FULL_COVER_LAYOUT_TYPES.GRID) {
        // Re-apply grid layout
        if (Array.isArray(selectedOption.layout)) {
          layoutSettings._forcedLayout = selectedOption.layout;
        }
        layoutSettings._fullCoverLayoutType = FULL_COVER_LAYOUT_TYPES.GRID;
      } else {
        // Re-apply flexible layout
        layoutSettings._fullCoverLayoutType = FULL_COVER_LAYOUT_TYPES.FLEXIBLE;
        layoutSettings._forcedFlexibleLayout = selectedOption.layoutIndex;
      }

      const { width: previewWidth, height: previewHeight } =
        getPreviewDimensions(settings);

      try {
        const result = await arrangeImagesFullCover(
          images,
          previewWidth,
          previewHeight,
          layoutSettings,
        );
        return result;
      } catch (error) {
        console.error("Error reapplying current layout:", error);
        // Return null to indicate failure
        return null;
      }
    }
  }

  // Fallback to classic layout cycling for non-full-cover or if no state found
  try {
    const state = getLayoutState(pageId, []);
    if (state && state.layouts && state.layouts[state.currentIndex]) {
      const selectedLayout = state.layouts[state.currentIndex];
      return await applyLayoutToImages(images, selectedLayout, settings);
    }
  } catch (error) {
    console.error("Error in classic layout reapplication:", error);
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
  const fullCoverPageId = `fullcover_${pageId}`;
  const state = ensureFullCoverState(fullCoverPageId, images, settings);

  if (!state.layouts || state.layouts.length === 0) {
    return images;
  }

  state.currentIndex =
    (state.currentIndex + direction + state.layouts.length) %
    state.layouts.length;

  const selected = state.layouts[state.currentIndex];
  const { width: previewWidth, height: previewHeight } =
    getPreviewDimensions(settings);

  try {
    if (selected.type === FULL_COVER_LAYOUT_TYPES.GRID && selected.layout) {
      return convertToFullCoverFormat(
        selected.layout,
        images,
        previewWidth,
        previewHeight,
      );
    }

    // FLEXIBLE path delegates to arrangeImagesFullCover with a forced variation
    const layoutSettings = {
      ...settings,
      _fullCoverLayoutType: FULL_COVER_LAYOUT_TYPES.FLEXIBLE,
      _forcedFlexibleLayout: selected.layoutIndex ?? 0,
    };

    const { arrangeImagesFullCover } = await import("./fullCoverLayoutUtils.js");
    return await arrangeImagesFullCover(
      images,
      previewWidth,
      previewHeight,
      layoutSettings,
    );
  } catch (error) {
    console.error("Error cycling full cover layout:", error);
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

/**
 * Get current layout information for full cover layouts
 * @param {string} pageId - Page identifier
 * @param {Array} images - Images to get layouts for
 * @param {Object} settings - Layout settings
 * @returns {Object} Current layout info with index and total count
 */
/**
 * Check if a specific layout is currently applied to images
 * @param {Object} layout - Layout to check
 * @param {Array} images - Current positioned images
 * @param {Object} settings - Layout settings
 * @returns {boolean} True if layout matches current positions
 */
function isLayoutApplied(layout, images, settings) {
  if (!layout || !images || images.length === 0) return false;
  
  // Get what the layout should look like  
  const { width: previewWidth, height: previewHeight } = getPreviewDimensions(settings);
  const expectedImages = convertToFullCoverFormat(
    layout, 
    images, 
    previewWidth, 
    previewHeight
  );
  
  // Compare positions (allow some tolerance for floating point precision)
  const tolerance = 1;
  
  for (let i = 0; i < Math.min(images.length, expectedImages.length); i++) {
    const current = images[i];
    const expected = expectedImages[i];
    
    if (!current || !expected) continue;
    
    // Check if positions match within tolerance
    if (Math.abs((current.x || 0) - (expected.x || 0)) > tolerance ||
        Math.abs((current.y || 0) - (expected.y || 0)) > tolerance ||
        Math.abs((current.previewWidth || 0) - (expected.previewWidth || 0)) > tolerance ||
        Math.abs((current.previewHeight || 0) - (expected.previewHeight || 0)) > tolerance) {
      return false;
    }
  }
  
  return true;
}

function getCurrentFullCoverLayoutInfo(pageId, images, settings) {
  const paperSize = settings?.pageSize?.toUpperCase() || "A4";
  const hardcodedLayouts = getLayoutOptions(paperSize, images.length);
  
  if (hardcodedLayouts.length === 0) {
    return { currentIndex: 0, totalLayouts: 0, currentLayoutName: null, currentLayout: null };
  }

  // Try to detect which layout is currently applied by checking image positions
  let currentLayoutName = null;
  let currentLayoutIndex = 0;
  
  if (images && images.length > 0) {
    // Try to match current image positions with hardcoded layouts
    for (let i = 0; i < hardcodedLayouts.length; i++) {
      const layout = hardcodedLayouts[i];
      if (isLayoutApplied(layout, images, settings)) {
        currentLayoutName = layout.name;
        currentLayoutIndex = i + 1;
        break;
      }
    }
  }
  
  // If no layout detected, show first available layout name
  if (!currentLayoutName && hardcodedLayouts.length > 0) {
    currentLayoutName = hardcodedLayouts[0].name;
    currentLayoutIndex = 1;
  }

  // Provide current layout object/type from state if available
  const fullCoverPageId = `fullcover_${pageId}`;
  const state = pageLayoutState.get(fullCoverPageId);
  const current = state?.layouts?.[state.currentIndex] || null;

  return {
    currentIndex: currentLayoutIndex,
    totalLayouts: hardcodedLayouts.length,
    currentLayoutName,
    currentLayout: current,
  };
}
