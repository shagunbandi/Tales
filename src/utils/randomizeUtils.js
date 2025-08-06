import { arrangeImages } from "./layoutUtils.js";
import { getPreviewDimensions } from "../constants.js";

/**
 * Shuffles images within the exact same layout structure (keeps positions, swaps images)
 * @param {Array} images - Array of images with current positions to shuffle
 * @param {Object} settings - Layout settings (not used, but kept for consistency)
 * @returns {Promise<Array>} Array of images with shuffled assignments to same positions
 */
export async function shuffleImagesInLayout(images, settings) {
  if (!images || images.length === 0) {
    return [];
  }

  console.log("Shuffling images in same layout structure");
  console.log(
    "Original images:",
    images.map((img) => ({ id: img.id, x: img.x, y: img.y })),
  );

  // Extract the current layout positions (x, y, width, height, rowIndex, colIndex)
  const layoutPositions = images.map((img) => ({
    x: img.x,
    y: img.y,
    previewWidth: img.previewWidth,
    previewHeight: img.previewHeight,
    rowIndex: img.rowIndex,
    colIndex: img.colIndex,
  }));

  // Create a shuffled version of just the image data (without position info)
  const imageDataOnly = images.map((img) => {
    const {
      x,
      y,
      previewWidth,
      previewHeight,
      rowIndex,
      colIndex,
      ...imageData
    } = img;
    return imageData;
  });

  const shuffledImageData = shuffleArray([...imageDataOnly]);

  // Combine shuffled image data with original positions
  const result = layoutPositions.map((position, index) => ({
    ...shuffledImageData[index],
    ...position, // This overwrites any position data with the preserved layout
  }));

  console.log(
    "Shuffled result:",
    result.map((img) => ({ id: img.id, x: img.x, y: img.y })),
  );

  return result;
}

// Store layout indices per page for circular navigation
const pageLayoutIndices = new Map();

/**
 * Cycles through layout structures in circular navigation (next layout)
 * @param {Array} images - Array of images to arrange with next layout
 * @param {Object} settings - Layout settings including maxNumberOfRows and maxImagesPerRow
 * @param {string} pageId - Unique page identifier for tracking layout index
 * @param {number} direction - Navigation direction: 1 for next, -1 for previous
 * @returns {Promise<Array>} Array of images with next/previous layout structure
 */
export async function cycleLayoutStructure(images, settings, pageId, direction = 1) {
  if (!images || images.length === 0) {
    return [];
  }

  const maxImagesPerRow = settings.maxImagesPerRow || 4;
  const maxNumberOfRows = settings.maxNumberOfRows || 2;
  const maxImagesPerPage = maxImagesPerRow * maxNumberOfRows;

  // Only cycle images that can fit within the page constraints
  const imagesToCycle = images.slice(0, maxImagesPerPage);

  // Generate all possible valid layout combinations
  const validCombinations = generateValidLayoutCombinations(
    imagesToCycle.length,
    maxNumberOfRows,
    maxImagesPerRow,
  );


  if (validCombinations.length === 0) {
    // Fallback to original arrangement if no valid combinations found
    const { width: previewWidth, height: previewHeight } =
      getPreviewDimensions(settings);
    return await arrangeImages(
      imagesToCycle,
      previewWidth,
      previewHeight,
      settings,
    );
  }

  // Get or initialize the current layout index for this page
  let currentIndex = pageLayoutIndices.get(pageId) || 0;
  
  // Move to next/previous layout with circular navigation
  currentIndex = (currentIndex + direction + validCombinations.length) % validCombinations.length;
  
  // Update the stored index
  pageLayoutIndices.set(pageId, currentIndex);

  const selectedCombination = validCombinations[currentIndex];

  // Use the images in their current order but apply the selected layout structure
  const { width: previewWidth, height: previewHeight } =
    getPreviewDimensions(settings);

  // Create a custom arrangement by forcing the specific layout combination
  return await arrangeImagesWithForcedLayout(
    imagesToCycle,
    selectedCombination.layout,
    previewWidth,
    previewHeight,
    settings,
  );
}

/**
 * Legacy function - now calls cycleLayoutStructure for next layout
 * @deprecated Use cycleLayoutStructure instead
 */
export async function randomizeLayoutStructure(images, settings, pageId = 'default') {
  return await cycleLayoutStructure(images, settings, pageId, 1);
}

/**
 * Arranges images with a forced layout structure by temporarily modifying settings
 * @param {Array} images - Array of images to arrange
 * @param {Array} layoutStructure - Array defining images per row [2, 1, 3] means 2 in row 1, 1 in row 2, 3 in row 3
 * @param {number} previewWidth - Preview width
 * @param {number} previewHeight - Preview height
 * @param {Object} settings - Layout settings
 * @returns {Promise<Array>} Array of images with forced layout structure
 */
async function arrangeImagesWithForcedLayout(
  images,
  layoutStructure,
  previewWidth,
  previewHeight,
  settings,
) {

  if (!images || images.length === 0) {
    return [];
  }

  if (!layoutStructure || layoutStructure.length === 0) {
    return await arrangeImages(images, previewWidth, previewHeight, settings);
  }

  try {
    // Create a modified settings object that will force the specific layout
    const forcedSettings = {
      ...settings,
      _forcedLayout: layoutStructure, // Add our forced layout as a special property
    };

    // Use the existing arrangeImages function with our forced layout
    const result = await arrangeImages(
      images,
      previewWidth,
      previewHeight,
      forcedSettings,
    );

    return result;
  } catch (error) {
    console.error("Error in arrangeImagesWithForcedLayout:", error);
    // Fallback to regular arrangement if there's an error
    return await arrangeImages(images, previewWidth, previewHeight, settings);
  }
}

/**
 * Legacy function for backward compatibility - now calls shuffleImagesInLayout
 * @deprecated Use shuffleImagesInLayout or randomizeLayoutStructure instead
 */
export async function randomizePageLayout(images, settings) {
  return await shuffleImagesInLayout(images, settings);
}

/**
 * Generates all valid layout combinations for the given constraints
 * @param {number} totalImages - Total number of images to arrange
 * @param {number} maxRows - Maximum number of rows allowed
 * @param {number} maxImagesPerRow - Maximum images per row allowed
 * @returns {Array} Array of valid layout combinations
 */
function generateValidLayoutCombinations(
  totalImages,
  maxRows,
  maxImagesPerRow,
) {
  const combinations = [];

  // Generate all possible ways to distribute images across rows
  for (let numRows = 1; numRows <= Math.min(maxRows, totalImages); numRows++) {
    const rowCombinations = generateRowCombinations(
      totalImages,
      numRows,
      maxImagesPerRow,
    );
    // Convert plain arrays to objects with layout property
    for (const layout of rowCombinations) {
      combinations.push({
        numRows: numRows,
        layout: layout,
      });
    }
  }

  return combinations;
}

/**
 * Generates all possible ways to distribute images across a specific number of rows
 * @param {number} totalImages - Total number of images
 * @param {number} numRows - Number of rows to use
 * @param {number} maxImagesPerRow - Maximum images per row
 * @returns {Array} Array of row distribution combinations
 */
function generateRowCombinations(totalImages, numRows, maxImagesPerRow) {
  const combinations = [];

  function backtrack(
    rowIndex = 0,
    remainingImages = totalImages,
    currentCombination = [],
  ) {
    if (rowIndex === numRows) {
      if (remainingImages === 0) {
        combinations.push([...currentCombination]);
      }
      return;
    }

    // Calculate min and max images for this row
    // Ensure no empty rows: each remaining row must have at least 1 image
    const remainingRows = numRows - rowIndex;
    const minImagesThisRow = remainingImages > 0 ? 1 : 0;
    const maxImagesThisRow = Math.min(maxImagesPerRow, remainingImages - (remainingRows - 1));

    for (
      let imagesInRow = minImagesThisRow;
      imagesInRow <= maxImagesThisRow;
      imagesInRow++
    ) {
      backtrack(rowIndex + 1, remainingImages - imagesInRow, [
        ...currentCombination,
        imagesInRow,
      ]);
    }
  }

  backtrack();

  // Filter out combinations where all rows are empty (shouldn't happen with totalImages > 0)
  return combinations.filter((combo) => combo.some((count) => count > 0));
}

/**
 * Shuffles an array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled copy of the array
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
