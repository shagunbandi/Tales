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
export async function arrangeImagesFullCover(
  images,
  totalWidth,
  totalHeight,
  settings,
) {
  if (!images || images.length === 0) {
    return [];
  }

  // For full cover, we use the entire page (no margins or gaps)
  const usableWidth = totalWidth;
  const usableHeight = totalHeight;

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
  if (settings._forcedLayout) {
    return [...settings._forcedLayout]; // Return a copy of the forced layout
  }

  // Get constraints from settings, with fallbacks matching constants.js
  const maxImagesPerRow = settings?.maxImagesPerRow || 4;
  const maxNumberOfRows = settings?.maxNumberOfRows || 2;

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
