import { getPreviewDimensions, PAGE_SIZES, getHardcodedLayoutsKey, getPreviewBorderWidth } from "../constants.js";
import { cropForFullCover, cropImagesForGrid } from "./imageCropUtils.js";
import { getLayoutOptions, convertToFullCoverFormat } from "./hardcodedLayouts.js";

/**
 * Full Cover Layout utility functions
 * Arranges images to cover the entire page without gaps or margins
 */

// Layout type constants
export const FULL_COVER_LAYOUT_TYPES = {
  GRID: "grid", // Current row/column grid
  FLEXIBLE: "flexible", // New flexible layout with variable sizes
  HARDCODED: "hardcoded", // Predefined hardcoded layout templates
};

/**
 * Arranges images in full cover layout - images cover the entire page
 * @param {Array} images - Array of images to arrange
 * @param {number} totalWidth - Total width of the page
 * @param {number} totalHeight - Total height of the page
 * @param {Object} settings - Layout settings
 * @returns {Promise<Array>} Array of images with updated positions and dimensions
 */
export async function arrangeImagesFullCover(
  images,
  totalWidth,
  totalHeight,
  settings,
  pageData = null,
) {
  if (!images || images.length === 0) {
    return [];
  }

  // Calculate page border offset - reduces usable space on all sides
  // Check if this page has borders enabled (default to true if not specified)
  const borderEnabled = pageData?.enablePageBorder !== false;
  const borderWidth = getPreviewBorderWidth(settings, borderEnabled);
  
  // For full cover, we use the entire page (no margins or gaps)
  // But subtract border space if page border is enabled
  const usableWidth = totalWidth - (2 * borderWidth);
  const usableHeight = totalHeight - (2 * borderWidth);

  // Check which layout type to use
  const layoutType =
    settings?._fullCoverLayoutType || FULL_COVER_LAYOUT_TYPES.HARDCODED;

  if (layoutType === FULL_COVER_LAYOUT_TYPES.FLEXIBLE) {
    return await arrangeImagesFlexible(
      images,
      usableWidth,
      usableHeight,
      settings,
    );
  } else if (layoutType === FULL_COVER_LAYOUT_TYPES.HARDCODED) {
    return await arrangeImagesHardcoded(
      images,
      usableWidth,
      usableHeight,
      settings,
      pageData,
    );
  } else {
    // Default grid layout
    return await arrangeImagesGrid(images, usableWidth, usableHeight, settings, pageData);
  }
}

/**
 * Hardcoded layout arrangement using predefined templates
 */
async function arrangeImagesHardcoded(images, usableWidth, usableHeight, settings, pageData = null) {
  if (!images || images.length === 0) {
    return [];
  }

  // Get paper size from settings
  const pageSize = getHardcodedLayoutsKey(settings?.pageSize || "a4");
  const isPortrait = settings?.orientation === "portrait";
  
  // Get available layouts for this paper size and number of images
  const availableLayouts = getLayoutOptions(pageSize, images.length, isPortrait);
  
  if (availableLayouts.length === 0) {
    // Fall back to simple grid layout if no hardcoded layout exists

    return await arrangeImagesGrid(images, usableWidth, usableHeight, settings, pageData);
  }

  // Check if user has specified a particular layout
  let selectedLayout = availableLayouts[0]; // Default to first layout
  
  if (settings?._hardcodedLayoutId) {
    const userLayout = availableLayouts.find(layout => layout.id === settings._hardcodedLayoutId);
    if (userLayout) {
      selectedLayout = userLayout;
    }
  }

  // Get border offset to properly position images
  const borderEnabled = pageData?.enablePageBorder !== false;
  const borderWidth = getPreviewBorderWidth(settings, borderEnabled);

  // Convert the hardcoded layout to the full cover format with border offset
  return convertToFullCoverFormat(selectedLayout, images, usableWidth, usableHeight, borderWidth);
}

/**
 * Grid-based arrangement (original implementation)
 */
async function arrangeImagesGrid(images, usableWidth, usableHeight, settings, pageData = null) {
  // Calculate flexible grid layout for full cover with smart algorithm
  const rowDistribution = calculateFlexibleRowDistribution(
    images.length,
    settings,
    images,
    usableWidth,
    usableHeight,
  );

  const arrangedImages = [];
  let imageIndex = 0;
  
  // Get border offset to properly position images
  const borderEnabled = pageData?.enablePageBorder !== false;
  const borderWidth = getPreviewBorderWidth(settings, borderEnabled);

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
          x: colIdx * cellWidth + borderWidth,
          y: rowIdx * cellHeight + borderWidth,
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
 * Calculates flexible row distribution for full cover mode using smart layout algorithm
 * Considers image aspect ratios and page dimensions to choose optimal layout
 * @param {number} totalImages - Total number of images
 * @param {Object} settings - Layout settings with maxImagesPerRow and maxNumberOfRows
 * @param {Array} images - Array of images with dimension data (optional)
 * @param {number} pageWidth - Page width for layout optimization (optional)
 * @param {number} pageHeight - Page height for layout optimization (optional)
 * @returns {Array} Array of numbers indicating images per row [3, 2] for 5 images
 */
function calculateFlexibleRowDistribution(
  totalImages,
  settings,
  images = null,
  pageWidth = null,
  pageHeight = null,
) {
  if (totalImages === 0) return [];
  if (totalImages === 1) return [1];

  // Check if we have a forced layout structure
  if (settings._forcedLayout && Array.isArray(settings._forcedLayout)) {
    return [...settings._forcedLayout]; // Return a copy of the forced layout
  }

  // Get constraints from settings, with fallbacks matching constants.js
  const maxImagesPerRow = settings?.maxImagesPerRow || 4;
  const maxNumberOfRows = settings?.maxNumberOfRows || 4;

  // Calculate maximum images that can fit on this page
  const maxImagesThisPage = maxImagesPerRow * maxNumberOfRows;
  const imagesToArrange = Math.min(totalImages, maxImagesThisPage);

  // If we have image dimensions and page dimensions, use smart algorithm
  if (images && pageWidth && pageHeight && images.length >= imagesToArrange) {
    const smartLayout = calculateSmartLayout(
      images.slice(0, imagesToArrange),
      maxImagesPerRow,
      maxNumberOfRows,
      pageWidth,
      pageHeight,
    );
    if (smartLayout) {
      return smartLayout;
    }
  }

  // Fall back to original balanced distribution algorithm
  const idealRows = Math.ceil(imagesToArrange / maxImagesPerRow);
  const actualRows = Math.min(idealRows, maxNumberOfRows);

  // Distribute images across rows as evenly as possible
  const distribution = [];
  let remainingImages = imagesToArrange;

  for (let row = 0; row < actualRows; row++) {
    const remainingRows = actualRows - row;
    const imagesInThisRow = Math.min(
      Math.ceil(remainingImages / remainingRows),
      maxImagesPerRow,
    );
    distribution.push(imagesInThisRow);
    remainingImages -= imagesInThisRow;
  }

  return distribution;
}

/**
 * Smart layout algorithm that considers image aspect ratios and page dimensions
 * @param {Array} images - Array of images with naturalWidth/naturalHeight
 * @param {number} maxImagesPerRow - Maximum images per row constraint
 * @param {number} maxNumberOfRows - Maximum number of rows constraint
 * @param {number} pageWidth - Page width
 * @param {number} pageHeight - Page height
 * @returns {Array|null} Optimal row distribution or null if fallback needed
 */
function calculateSmartLayout(
  images,
  maxImagesPerRow,
  maxNumberOfRows,
  pageWidth,
  pageHeight,
) {
  const totalImages = images.length;

  // Generate all valid layout combinations
  const validLayouts = generateValidLayouts(
    totalImages,
    maxImagesPerRow,
    maxNumberOfRows,
  );

  if (validLayouts.length === 0) {
    return null; // Fallback to original algorithm
  }

  // Score each layout and find the best one
  let bestLayout = null;
  let bestScore = -1;

  for (const layout of validLayouts) {
    const score = scoreLayout(images, layout, pageWidth, pageHeight);
    if (score > bestScore) {
      bestScore = score;
      bestLayout = layout;
    }
  }

  return bestLayout;
}

/**
 * Generate all valid layout combinations that respect constraints
 * @param {number} totalImages - Total number of images
 * @param {number} maxImagesPerRow - Maximum images per row
 * @param {number} maxNumberOfRows - Maximum number of rows
 * @returns {Array} Array of valid layouts, each layout is an array of images per row
 */
function generateValidLayouts(totalImages, maxImagesPerRow, maxNumberOfRows) {
  const layouts = [];

  // Generate layouts by trying different numbers of rows
  for (
    let numRows = 1;
    numRows <= Math.min(maxNumberOfRows, totalImages);
    numRows++
  ) {
    const distributions = generateRowDistributions(
      totalImages,
      numRows,
      maxImagesPerRow,
    );
    layouts.push(...distributions);
  }

  // Remove duplicates
  const uniqueLayouts = layouts.filter(
    (layout, index, self) =>
      index === self.findIndex((l) => l.join(",") === layout.join(",")),
  );

  return uniqueLayouts;
}

/**
 * Generate all valid row distributions for a given number of rows
 * @param {number} totalImages - Total images to distribute
 * @param {number} numRows - Number of rows
 * @param {number} maxImagesPerRow - Maximum images per row
 * @returns {Array} Array of valid distributions
 */
function generateRowDistributions(totalImages, numRows, maxImagesPerRow) {
  const distributions = [];

  function backtrack(currentDistribution, remainingImages, remainingRows) {
    if (remainingRows === 0) {
      if (remainingImages === 0) {
        distributions.push([...currentDistribution]);
      }
      return;
    }

    // Calculate range of images this row can have
    const minForThisRow = Math.max(
      1,
      remainingImages - maxImagesPerRow * (remainingRows - 1),
    );
    const maxForThisRow = Math.min(
      maxImagesPerRow,
      remainingImages - (remainingRows - 1),
    );

    for (
      let imagesInRow = minForThisRow;
      imagesInRow <= maxForThisRow;
      imagesInRow++
    ) {
      currentDistribution.push(imagesInRow);
      backtrack(
        currentDistribution,
        remainingImages - imagesInRow,
        remainingRows - 1,
      );
      currentDistribution.pop();
    }
  }

  backtrack([], totalImages, numRows);
  return distributions;
}

/**
 * Score a layout based on image compatibility and page dimensions
 * @param {Array} images - Array of images with naturalWidth/naturalHeight
 * @param {Array} rowDistribution - Layout to score [3, 2] means 3 images in row 1, 2 in row 2
 * @param {number} pageWidth - Page width
 * @param {number} pageHeight - Page height
 * @returns {number} Score between 0 and 1+ (higher is better)
 */
function scoreLayout(images, rowDistribution, pageWidth, pageHeight) {
  const pageAspectRatio = pageWidth / pageHeight;
  const isLandscapePage = pageAspectRatio > 1.2;
  const isPortraitPage = pageAspectRatio < 0.8;

  const numRows = rowDistribution.length;
  const rowHeight = pageHeight / numRows;

  let totalScore = 0;
  let imageIndex = 0;

  for (let row = 0; row < numRows; row++) {
    const imagesInRow = rowDistribution[row];
    const cellWidth = pageWidth / imagesInRow;
    const cellHeight = rowHeight;
    const cellAspectRatio = cellWidth / cellHeight;

    // Factor 1: Cell dimensions adequacy (avoid tiny cells and overly wide/tall cells)
    const minCellDimension = Math.min(pageWidth, pageHeight) / 6;
    const maxCellDimension = Math.max(pageWidth, pageHeight) / 2;

    // Score based on both minimum size (avoid tiny cells) and reasonable maximum size
    const minSizeScore = Math.min(
      Math.min(cellWidth, cellHeight) / minCellDimension,
      1.0,
    );
    const maxSizeScore = Math.min(
      maxCellDimension / Math.max(cellWidth, cellHeight),
      1.0,
    );
    const cellSizeScore = (minSizeScore + maxSizeScore) / 2;

    // Factor 2: Page orientation compatibility
    let pageOrientationScore = 1.0;
    const avgImagesPerRow = images.length / numRows;
    if (isLandscapePage && imagesInRow > avgImagesPerRow) {
      // Landscape page with more columns - good
      pageOrientationScore = 1.1;
    } else if (isPortraitPage && numRows > avgImagesPerRow) {
      // Portrait page with more rows - good
      pageOrientationScore = 1.1;
    } else if (isLandscapePage && numRows > imagesInRow * 1.5) {
      // Landscape page but too many rows - penalty
      pageOrientationScore = 0.9;
    } else if (isPortraitPage && imagesInRow > numRows * 1.5) {
      // Portrait page but too many columns - penalty
      pageOrientationScore = 0.9;
    }

    // Factor 3: Image aspect ratio compatibility
    let aspectScore = 0;
    for (let i = 0; i < imagesInRow; i++) {
      const image = images[imageIndex++];
      if (image.naturalWidth && image.naturalHeight) {
        const imageAspectRatio = image.naturalWidth / image.naturalHeight;
        const aspectFit = Math.min(
          imageAspectRatio / cellAspectRatio,
          cellAspectRatio / imageAspectRatio,
        );
        aspectScore += aspectFit;
      } else {
        aspectScore += 0.6; // neutral score for unknown dimensions
      }
    }
    const avgAspectScore = aspectScore / imagesInRow;

    // Factor 4: Layout balance (prefer balanced distributions)
    const targetImagesPerRow = images.length / numRows;
    const balanceScore =
      1.0 -
      Math.abs(imagesInRow - targetImagesPerRow) /
        Math.max(targetImagesPerRow, 1);

    // Factor 5: Cell aspect ratio reasonableness (penalize extremely wide or tall cells)
    const idealCellAspectRatio = 1.0; // Square cells are generally good
    const cellAspectPenalty = Math.min(
      cellAspectRatio / idealCellAspectRatio,
      idealCellAspectRatio / cellAspectRatio,
    );
    // Apply stronger penalty for extreme ratios
    const cellAspectScore =
      cellAspectPenalty > 0.3 ? cellAspectPenalty : cellAspectPenalty * 0.5;

    // Weighted combination
    const rowScore =
      cellSizeScore * 0.25 +
      pageOrientationScore * 0.2 +
      avgAspectScore * 0.3 +
      balanceScore * 0.1 +
      cellAspectScore * 0.15;

    totalScore += rowScore * imagesInRow;
  }

  return totalScore / images.length;
}

/**
 * Flexible layout arrangement - images can take variable sizes to fill page optimally
 * Uses a dynamic allocation algorithm that minimizes cropping
 */
async function arrangeImagesFlexible(
  images,
  usableWidth,
  usableHeight,
  settings,
) {
  if (images.length === 1) {
    // Single image takes full page
    return [
      {
        ...images[0],
        x: 0,
        y: 0,
        previewWidth: usableWidth,
        previewHeight: usableHeight,
        fullCoverMode: true,
      },
    ];
  }

  // Generate multiple flexible layout options
  const layoutOptions = generateFlexibleLayouts(
    images,
    usableWidth,
    usableHeight,
  );

  // Check if we have a forced layout option
  if (settings?._forcedFlexibleLayout) {
    const forcedIndex = settings._forcedFlexibleLayout;
    if (forcedIndex >= 0 && forcedIndex < layoutOptions.length) {
      return layoutOptions[forcedIndex];
    }
  }

  // Score each layout and pick the best one
  const bestLayout = selectBestFlexibleLayout(layoutOptions, images);
  
  if (!bestLayout) {
    // Fallback to simple grid layout when flexible layouts fail

    return await arrangeImagesGrid(images, usableWidth, usableHeight, settings);
  }
  
  return bestLayout;
}

/**
 * Generate multiple flexible layout options using grid-based spanning
 */
function generateFlexibleLayouts(images, pageWidth, pageHeight) {
  const layouts = [];
  const numImages = images.length;

  // Generate all possible grid-based spanning layouts
  layouts.push(...generateSpanningLayouts(images, pageWidth, pageHeight));

  return layouts;
}

/**
 * Generate layouts using grid-based spanning system
 */
function generateSpanningLayouts(images, pageWidth, pageHeight) {
  const layouts = [];
  const numImages = images.length;

  // Define different grid templates and how images span across them
  const gridTemplates = getGridTemplates(numImages);

  for (const template of gridTemplates) {
    const layout = applyGridTemplate(images, template, pageWidth, pageHeight);
    if (layout) {
      layouts.push(layout);
    }
  }
  return layouts;
}

/**
 * Get grid templates for different numbers of images
 */
function getGridTemplates(numImages) {
  const templates = [];

  if (numImages === 2) {
    // Template 1: Side by side equal
    templates.push({
      rows: 1,
      cols: 2,
      assignments: [
        { imageIndex: 0, startRow: 0, endRow: 1, startCol: 0, endCol: 1 },
        { imageIndex: 1, startRow: 0, endRow: 1, startCol: 1, endCol: 2 },
      ],
    });

    // Template 2: Top and bottom
    templates.push({
      rows: 2,
      cols: 1,
      assignments: [
        { imageIndex: 0, startRow: 0, endRow: 1, startCol: 0, endCol: 1 },
        { imageIndex: 1, startRow: 1, endRow: 2, startCol: 0, endCol: 1 },
      ],
    });

    // Template 3: 70/30 split horizontal
    templates.push({
      rows: 1,
      cols: 10, // Fine grid for precise ratios
      assignments: [
        { imageIndex: 0, startRow: 0, endRow: 1, startCol: 0, endCol: 7 },
        { imageIndex: 1, startRow: 0, endRow: 1, startCol: 7, endCol: 10 },
      ],
    });
  }

  if (numImages === 3) {
    // Template 1: Large left
    templates.push({
      rows: 2,
      cols: 3,
      assignments: [
        { imageIndex: 0, startRow: 0, endRow: 2, startCol: 0, endCol: 2 }, // Large left (2x2)
        { imageIndex: 1, startRow: 0, endRow: 1, startCol: 2, endCol: 3 }, // Top right
        { imageIndex: 2, startRow: 1, endRow: 2, startCol: 2, endCol: 3 }, // Bottom right
      ],
    });

    // Template 2: Large right
    templates.push({
      rows: 2,
      cols: 3,
      assignments: [
        { imageIndex: 0, startRow: 0, endRow: 1, startCol: 0, endCol: 1 }, // Top left
        { imageIndex: 1, startRow: 1, endRow: 2, startCol: 0, endCol: 1 }, // Bottom left
        { imageIndex: 2, startRow: 0, endRow: 2, startCol: 1, endCol: 3 }, // Large right (2x2)
      ],
    });

    // Template 3: Large top
    templates.push({
      rows: 3,
      cols: 2,
      assignments: [
        { imageIndex: 0, startRow: 0, endRow: 2, startCol: 0, endCol: 2 }, // Large top (2x2)
        { imageIndex: 1, startRow: 2, endRow: 3, startCol: 0, endCol: 1 }, // Bottom left
        { imageIndex: 2, startRow: 2, endRow: 3, startCol: 1, endCol: 2 }, // Bottom right
      ],
    });

    // Template 4: Large center
    templates.push({
      rows: 3,
      cols: 3,
      assignments: [
        { imageIndex: 0, startRow: 0, endRow: 1, startCol: 0, endCol: 3 }, // Top strip
        { imageIndex: 1, startRow: 1, endRow: 3, startCol: 0, endCol: 2 }, // Large center (2x2)
        { imageIndex: 2, startRow: 1, endRow: 3, startCol: 2, endCol: 3 }, // Right strip
      ],
    });
  }

  if (numImages === 4) {
    // Template 1: Large left, three stacked right
    templates.push({
      rows: 3,
      cols: 2,
      assignments: [
        { imageIndex: 0, startRow: 0, endRow: 3, startCol: 0, endCol: 1 }, // Large left (3x1)
        { imageIndex: 1, startRow: 0, endRow: 1, startCol: 1, endCol: 2 }, // Top right
        { imageIndex: 2, startRow: 1, endRow: 2, startCol: 1, endCol: 2 }, // Middle right
        { imageIndex: 3, startRow: 2, endRow: 3, startCol: 1, endCol: 2 }, // Bottom right
      ],
    });

    // Template 2: Large right, three stacked left
    templates.push({
      rows: 3,
      cols: 2,
      assignments: [
        { imageIndex: 0, startRow: 0, endRow: 1, startCol: 0, endCol: 1 }, // Top left
        { imageIndex: 1, startRow: 1, endRow: 2, startCol: 0, endCol: 1 }, // Middle left
        { imageIndex: 2, startRow: 2, endRow: 3, startCol: 0, endCol: 1 }, // Bottom left
        { imageIndex: 3, startRow: 0, endRow: 3, startCol: 1, endCol: 2 }, // Large right (3x1)
      ],
    });

    // Template 3: Large top, three bottom
    templates.push({
      rows: 2,
      cols: 3,
      assignments: [
        { imageIndex: 0, startRow: 0, endRow: 1, startCol: 0, endCol: 3 }, // Large top (1x3)
        { imageIndex: 1, startRow: 1, endRow: 2, startCol: 0, endCol: 1 }, // Bottom left
        { imageIndex: 2, startRow: 1, endRow: 2, startCol: 1, endCol: 2 }, // Bottom center
        { imageIndex: 3, startRow: 1, endRow: 2, startCol: 2, endCol: 3 }, // Bottom right
      ],
    });

    // Template 4: Large bottom, three top
    templates.push({
      rows: 2,
      cols: 3,
      assignments: [
        { imageIndex: 0, startRow: 0, endRow: 1, startCol: 0, endCol: 1 }, // Top left
        { imageIndex: 1, startRow: 0, endRow: 1, startCol: 1, endCol: 2 }, // Top center
        { imageIndex: 2, startRow: 0, endRow: 1, startCol: 2, endCol: 3 }, // Top right
        { imageIndex: 3, startRow: 1, endRow: 2, startCol: 0, endCol: 3 }, // Large bottom (1x3)
      ],
    });
  }

  if (numImages === 5) {
    // Template 1: Large image spanning 4 cells, 4 smaller images filling rest (similar to your example)
    templates.push({
      rows: 3,
      cols: 3,
      assignments: [
        { imageIndex: 0, startRow: 0, endRow: 2, startCol: 0, endCol: 2 }, // Large image spans top-left 2x2
        { imageIndex: 1, startRow: 0, endRow: 1, startCol: 2, endCol: 3 }, // Top-right
        { imageIndex: 2, startRow: 1, endRow: 2, startCol: 2, endCol: 3 }, // Middle-right
        { imageIndex: 3, startRow: 2, endRow: 3, startCol: 0, endCol: 1 }, // Bottom-left
        { imageIndex: 4, startRow: 2, endRow: 3, startCol: 1, endCol: 3 }, // Bottom-right (spans 1x2)
      ],
    });

    // Template 2: Alternative - 2 on top, 1 large in middle, 2 on bottom
    templates.push({
      rows: 3,
      cols: 4,
      assignments: [
        { imageIndex: 0, startRow: 0, endRow: 1, startCol: 0, endCol: 2 },
        { imageIndex: 1, startRow: 0, endRow: 1, startCol: 2, endCol: 4 },
        { imageIndex: 2, startRow: 1, endRow: 2, startCol: 0, endCol: 4 }, // Large middle spans full width
        { imageIndex: 3, startRow: 2, endRow: 3, startCol: 0, endCol: 2 },
        { imageIndex: 4, startRow: 2, endRow: 3, startCol: 2, endCol: 4 },
      ],
    });
  }

  if (numImages === 6) {
    // Template 1: Large top-left with bottom strip
    templates.push({
      rows: 3,
      cols: 4,
      assignments: [
        { imageIndex: 0, startRow: 0, endRow: 2, startCol: 0, endCol: 2 }, // Large top-left (2x2)
        { imageIndex: 1, startRow: 0, endRow: 1, startCol: 2, endCol: 3 }, // Top-middle
        { imageIndex: 2, startRow: 0, endRow: 1, startCol: 3, endCol: 4 }, // Top-right
        { imageIndex: 3, startRow: 1, endRow: 2, startCol: 2, endCol: 4 }, // Middle-right spanning 2 cols
        { imageIndex: 4, startRow: 2, endRow: 3, startCol: 0, endCol: 2 }, // Bottom-left spanning 2 cols
        { imageIndex: 5, startRow: 2, endRow: 3, startCol: 2, endCol: 4 }, // Bottom-right spanning 2 cols
      ],
    });

    // Template 2: Large top-right with bottom strip
    templates.push({
      rows: 3,
      cols: 4,
      assignments: [
        { imageIndex: 0, startRow: 0, endRow: 1, startCol: 0, endCol: 1 }, // Top-left
        { imageIndex: 1, startRow: 0, endRow: 1, startCol: 1, endCol: 2 }, // Top-middle-left
        { imageIndex: 2, startRow: 0, endRow: 2, startCol: 2, endCol: 4 }, // Large top-right (2x2)
        { imageIndex: 3, startRow: 1, endRow: 2, startCol: 0, endCol: 2 }, // Middle-left spanning 2 cols
        { imageIndex: 4, startRow: 2, endRow: 3, startCol: 0, endCol: 2 }, // Bottom-left spanning 2 cols
        { imageIndex: 5, startRow: 2, endRow: 3, startCol: 2, endCol: 4 }, // Bottom-right spanning 2 cols
      ],
    });

    // Template 3: Large left column
    templates.push({
      rows: 3,
      cols: 3,
      assignments: [
        { imageIndex: 0, startRow: 0, endRow: 3, startCol: 0, endCol: 1 }, // Large left (3x1)
        { imageIndex: 1, startRow: 0, endRow: 1, startCol: 1, endCol: 2 }, // Top-middle
        { imageIndex: 2, startRow: 0, endRow: 1, startCol: 2, endCol: 3 }, // Top-right
        { imageIndex: 3, startRow: 1, endRow: 2, startCol: 1, endCol: 2 }, // Middle-middle
        { imageIndex: 4, startRow: 1, endRow: 2, startCol: 2, endCol: 3 }, // Middle-right
        { imageIndex: 5, startRow: 2, endRow: 3, startCol: 1, endCol: 3 }, // Bottom spans 2 cols
      ],
    });

    // Template 4: Large right column
    templates.push({
      rows: 3,
      cols: 3,
      assignments: [
        { imageIndex: 0, startRow: 0, endRow: 1, startCol: 0, endCol: 1 }, // Top-left
        { imageIndex: 1, startRow: 0, endRow: 1, startCol: 1, endCol: 2 }, // Top-middle
        { imageIndex: 2, startRow: 0, endRow: 3, startCol: 2, endCol: 3 }, // Large right (3x1)
        { imageIndex: 3, startRow: 1, endRow: 2, startCol: 0, endCol: 1 }, // Middle-left
        { imageIndex: 4, startRow: 1, endRow: 2, startCol: 1, endCol: 2 }, // Middle-middle
        { imageIndex: 5, startRow: 2, endRow: 3, startCol: 0, endCol: 2 }, // Bottom spans 2 cols
      ],
    });

    // Template 5: Two large horizontal (verified complete coverage)
    templates.push({
      rows: 2,
      cols: 4,
      assignments: [
        { imageIndex: 0, startRow: 0, endRow: 1, startCol: 0, endCol: 2 }, // Large top-left
        { imageIndex: 1, startRow: 0, endRow: 1, startCol: 2, endCol: 4 }, // Large top-right
        { imageIndex: 2, startRow: 1, endRow: 2, startCol: 0, endCol: 1 }, // Bottom-left
        { imageIndex: 3, startRow: 1, endRow: 2, startCol: 1, endCol: 2 }, // Bottom-middle-left
        { imageIndex: 4, startRow: 1, endRow: 2, startCol: 2, endCol: 3 }, // Bottom-middle-right
        { imageIndex: 5, startRow: 1, endRow: 2, startCol: 3, endCol: 4 }, // Bottom-right
      ],
    });
  }

  // For more images, create dynamic templates
  if (numImages > 6) {
    templates.push(...generateDynamicGridTemplates(numImages));
  }

  return templates;
}

/**
 * Apply a grid template to images
 */
function applyGridTemplate(images, template, pageWidth, pageHeight) {
  const { rows, cols, assignments } = template;
  const cellWidth = pageWidth / cols;
  const cellHeight = pageHeight / rows;

  const layout = [];

  for (const assignment of assignments) {
    if (assignment.imageIndex >= images.length) continue;

    const image = images[assignment.imageIndex];
    const x = assignment.startCol * cellWidth;
    const y = assignment.startRow * cellHeight;
    const width = (assignment.endCol - assignment.startCol) * cellWidth;
    const height = (assignment.endRow - assignment.startRow) * cellHeight;

    layout.push({
      ...image,
      x,
      y,
      previewWidth: width,
      previewHeight: height,
      fullCoverMode: true,
      gridSpan: {
        rowStart: assignment.startRow,
        rowEnd: assignment.endRow,
        colStart: assignment.startCol,
        colEnd: assignment.endCol,
      },
    });
  }

  // Verify the layout covers all images
  if (layout.length !== images.length) {
    return null;
  }

  // Verify complete grid coverage (no empty cells)
  if (!verifyGridCoverage(template, layout)) {
    // Only warn in development, not in tests
    if (typeof process !== "undefined" && process.env.NODE_ENV !== "test") {

    }
    return null;
  }

  return layout;
}

/**
 * Generate dynamic grid templates for larger numbers of images
 */
function generateDynamicGridTemplates(numImages) {
  const templates = [];

  // Simple grid template as fallback
  const cols = Math.ceil(Math.sqrt(numImages));
  const rows = Math.ceil(numImages / cols);

  const assignments = [];
  for (let i = 0; i < numImages; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    assignments.push({
      imageIndex: i,
      startRow: row,
      endRow: row + 1,
      startCol: col,
      endCol: col + 1,
    });
  }

  templates.push({
    rows,
    cols,
    assignments,
  });

  return templates;
}

/**
 * Select best layout based on image aspect ratios and minimal cropping
 */
function selectBestFlexibleLayout(layoutOptions, images) {
  if (layoutOptions.length === 0) {
    // No valid layouts available, return fallback layout

    return null;
  }
  
  if (layoutOptions.length === 1) {
    return layoutOptions[0];
  }

  let bestLayout = layoutOptions[0];
  let bestScore = -1;

  for (const layout of layoutOptions) {
    const score = scoreFlexibleLayout(layout, images);
    if (score > bestScore) {
      bestScore = score;
      bestLayout = layout;
    }
  }

  return bestLayout;
}

/**
 * Score a flexible layout based on aspect ratio compatibility
 */
function scoreFlexibleLayout(layout, images) {
  let totalScore = 0;

  for (let i = 0; i < layout.length; i++) {
    const image = images[i];
    const placement = layout[i];

    if (image.naturalWidth && image.naturalHeight) {
      const imageAspectRatio = image.naturalWidth / image.naturalHeight;
      const cellAspectRatio = placement.previewWidth / placement.previewHeight;

      // Calculate aspect ratio compatibility (closer to 1 is better)
      const aspectFit = Math.min(
        imageAspectRatio / cellAspectRatio,
        cellAspectRatio / imageAspectRatio,
      );

      totalScore += aspectFit;
    } else {
      // Unknown dimensions get neutral score
      totalScore += 0.7;
    }
  }

  return totalScore / layout.length;
}

/**
 * Verify that a grid template has complete coverage with no empty cells
 */
function verifyGridCoverage(template, layout) {
  const { rows, cols } = template;
  const grid = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(false));

  // Mark all covered cells
  for (const assignment of template.assignments) {
    for (let r = assignment.startRow; r < assignment.endRow; r++) {
      for (let c = assignment.startCol; c < assignment.endCol; c++) {
        if (r >= rows || c >= cols) {
          return false;
        }
        if (grid[r][c]) {
          return false;
        }
        grid[r][c] = true;
      }
    }
  }

  // Check for any uncovered cells
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!grid[r][c]) {
        return false;
      }
    }
  }

  return true;
}
