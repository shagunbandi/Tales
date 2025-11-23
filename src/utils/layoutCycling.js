/**
 * Layout Cycling Utility - Clean implementation for cycling through layout options
 */

import { getPreviewDimensions, getHardcodedLayoutsKey, getPreviewBorderWidth } from "../constants.js";
import {
  arrangeImagesFullCover,
  FULL_COVER_LAYOUT_TYPES,
} from "./fullCoverLayoutUtils.js";
import { getLayoutOptions, convertToFullCoverFormat } from "./hardcodedLayouts.js";

// Store the current layout index for each page
const pageLayoutState = new Map();

/**
 * Reset layout state for a page (useful when images change)
 * @param {string} pageId - Page identifier
 */
export function resetPageLayoutState(pageId) {
  pageLayoutState.delete(pageId);
}

function ensureFullCoverState(pageId, images, settings) {
  const fullCoverPageId = `fullcover_${pageId}`.startsWith("fullcover_")
    ? pageId
    : `fullcover_${pageId}`;

  if (pageLayoutState.has(fullCoverPageId)) {
    return pageLayoutState.get(fullCoverPageId);
  }

  const paperSize = getHardcodedLayoutsKey(settings?.pageSize || "a4");
  const imageCount = images?.length || 0;
  const isPortrait = settings?.orientation === "portrait";

  const state = {
    currentIndex: 0,
    layouts: [],
  };

  if (imageCount > 0) {
    // GRID options from hardcoded layouts
    const hardcodedLayouts = getLayoutOptions(paperSize, imageCount, isPortrait) || [];
    for (const layout of hardcodedLayouts) {
      state.layouts.push({ type: FULL_COVER_LAYOUT_TYPES.GRID, layout });
    }

    // Only add flexible options if no hardcoded layouts are available
    // This avoids the empty cell errors in flexible layout generation
    if (hardcodedLayouts.length === 0) {

      // Instead of flexible layouts, just use different grid arrangements
      // For now, provide a single basic grid option
      state.layouts.push({ 
        type: "BASIC_GRID", 
        description: `Grid arrangement for ${imageCount} images` 
      });
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
    // No images/settings provided: no info
    return null;
  }

  if (!images || images.length === 0) {
    return { currentIndex: 0, totalLayouts: 0 };
  }

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

  const fullCoverPageId = `fullcover_${pageId}`;
  const state = pageLayoutState.get(fullCoverPageId);

  if (state && state.layouts && state.layouts[state.currentIndex]) {
    const selectedOption = state.layouts[state.currentIndex];

    // Re-apply previously selected hardcoded layout
    if (selectedOption.type === "HARDCODED" && selectedOption.hardcodedLayout) {
      const { width: previewWidth, height: previewHeight } = getPreviewDimensions(settings);
      const borderWidth = getPreviewBorderWidth(settings);
      try {
        return convertToFullCoverFormat(
          selectedOption.hardcodedLayout,
          images,
          previewWidth - (2 * borderWidth),
          previewHeight - (2 * borderWidth),
          borderWidth,
        );
      } catch (error) {

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

      // Return null to indicate failure
      return null;
    }
  }

  // Final fallback - return images as-is
  return images;
}

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
  const borderWidth = getPreviewBorderWidth(settings);
  const expectedImages = convertToFullCoverFormat(
    layout, 
    images, 
    previewWidth - (2 * borderWidth), 
    previewHeight - (2 * borderWidth),
    borderWidth
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
  const paperSize = getHardcodedLayoutsKey(settings?.pageSize || "a4");
  const isPortrait = settings?.orientation === "portrait";
  const hardcodedLayouts = getLayoutOptions(paperSize, images.length, isPortrait);
  
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
