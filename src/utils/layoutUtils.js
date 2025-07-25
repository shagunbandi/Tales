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
 * @param {number} totalWidth - Total width of the page (including margins)
 * @param {number} totalHeight - Total height of the page (including margins)
 * @param {number} pageMargin - Page margin
 * @param {number} imageGap - Gap between images
 * @param {Object} settings - Layout settings including maxImagesPerRow
 * @returns {Array} Array of images with updated positions and dimensions
 */
export function arrangeAndCenterImages(
  images,
  totalWidth,
  totalHeight,
  pageMargin,
  imageGap,
  settings,
  sameHeight = true,
) {
  if (!images || images.length === 0) {
    return []
  }

  const maxImagesPerRow = settings.maxImagesPerRow
  const maxNumberOfRows = settings.maxNumberOfRows
  const minImagesPerRow = settings.minImagesPerRow
  const minNumberOfRows = settings.minNumberOfRows

  // Calculate usable area (excluding margins)
  const usableWidth = totalWidth - 2 * pageMargin
  const usableHeight = totalHeight - 2 * pageMargin

  // Generate all possible combinations of rows and images per row
  const combinations = generateLayoutCombinations(
    images.length,
    minNumberOfRows,
    maxNumberOfRows,
    minImagesPerRow,
    maxImagesPerRow,
  )

  let bestLayout = null
  let maxAreaCovered = 0

  // Try each combination and find the one with maximum area coverage
  for (const combination of combinations) {
    const layoutResult = calculateLayoutForCombination(
      images,
      combination,
      usableWidth,
      usableHeight,
      imageGap,
      sameHeight,
    )

    const areaCovered = calculatePageAreaCoveredByImages(
      layoutResult,
      usableWidth,
      usableHeight,
    )

    if (areaCovered > maxAreaCovered) {
      maxAreaCovered = areaCovered
      bestLayout = layoutResult
    }
  }

  // If no valid layout found, use a simple single-row layout
  if (!bestLayout) {
    return arrangeImagesInSingleRow(
      images,
      usableWidth,
      usableHeight,
      imageGap,
      sameHeight,
    )
  }

  // Apply the best layout with proper positioning
  const finalResult = applyLayoutWithPositioning(
    bestLayout,
    pageMargin,
    imageGap,
    totalWidth,
    totalHeight,
  )

  return finalResult
}

/**
 * Calculates how much area is covered by the images in the page
 * @param {Array} images - Array of images with positions and dimensions
 * @param {number} usableWidth - Usable width of the page
 * @param {number} usableHeight - Usable height of the page
 * @returns {number} Percentage of area covered (0-1)
 */
export function calculatePageAreaCoveredByImages(
  images,
  usableWidth,
  usableHeight,
) {
  if (!images || images.length === 0) {
    return 0
  }

  const totalPageArea = usableWidth * usableHeight
  let totalImageArea = 0

  for (const image of images) {
    if (image.previewWidth && image.previewHeight) {
      totalImageArea += image.previewWidth * image.previewHeight
    }
  }

  return totalImageArea / totalPageArea
}

/**
 * Generates all possible layout combinations for arranging images.
 * @param {number} totalImages - Total number of images.
 * @param {number} minRows - Minimum number of rows.
 * @param {number} maxRows - Maximum number of rows.
 * @param {number} minImagesPerRow - Minimum images per row.
 * @param {number} maxImagesPerRow - Maximum images per row.
 * @returns {Array} Array of layout combinations.
 */
function generateLayoutCombinations(
  totalImages,
  minRows,
  maxRows,
  minImagesPerRow,
  maxImagesPerRow,
) {
  const results = []

  for (let rows = minRows; rows <= Math.min(maxRows, totalImages); rows++) {
    const layouts = []

    function backtrack(row = 0, remaining = totalImages, layout = []) {
      if (row === rows) {
        if (remaining === 0) {
          layouts.push([...layout])
        }
        return
      }

      const min = Math.max(minImagesPerRow, 1)
      const max = Math.min(maxImagesPerRow, remaining)

      for (let count = min; count <= max; count++) {
        backtrack(row + 1, remaining - count, [...layout, count])
      }
    }

    backtrack()

    for (const layout of layouts) {
      results.push({
        numRows: rows,
        imagesPerRow: Math.max(...layout),
        layout,
      })
    }
  }

  return results
}

/**
 * Distributes images across rows (legacy function, kept for compatibility)
 * @param {number} totalImages - Total number of images
 * @param {number} numRows - Number of rows
 * @param {number} imagesPerRow - Images per row
 * @returns {Array} Array of row layouts
 */
function distributeImages(totalImages, numRows, imagesPerRow) {
  const layout = []
  let remainingImages = totalImages

  for (let row = 0; row < numRows; row++) {
    const imagesInThisRow = Math.min(imagesPerRow, remainingImages)
    layout.push(imagesInThisRow)
    remainingImages -= imagesInThisRow
  }

  return layout
}

/**
 * Calculates layout for a specific combination
 * @param {Array} images - Array of images
 * @param {Object} combination - Layout combination
 * @param {number} usableWidth - Usable width
 * @param {number} usableHeight - Usable height
 * @param {number} imageGap - Gap between images
 * @param {boolean} sameHeight - Whether all images should have same height
 * @returns {Array} Array of images with calculated dimensions
 */
function calculateLayoutForCombination(
  images,
  combination,
  usableWidth,
  usableHeight,
  imageGap,
  sameHeight,
) {
  const { layout } = combination
  const result = []
  let imageIndex = 0

  for (let rowIndex = 0; rowIndex < layout.length; rowIndex++) {
    const imagesInRow = layout[rowIndex]

    if (imagesInRow === 0) continue

    // Get images for this row
    const rowImages = []
    for (let i = 0; i < imagesInRow; i++) {
      if (imageIndex + i < images.length) {
        rowImages.push({ ...images[imageIndex + i] })
      }
    }

    if (rowImages.length === 0) continue

    // Calculate dimensions for this row
    let rowHeight, imageWidths

    if (sameHeight) {
      // All images have same height, calculate widths based on aspect ratio
      // Account for gaps between rows when calculating row height
      const totalGapsBetweenRows = imageGap * (layout.length - 1)
      const availableHeightForImages = usableHeight - totalGapsBetweenRows
      rowHeight = availableHeightForImages / layout.length

      // Calculate total width needed for all images at this height
      let totalWidthNeeded = 0
      imageWidths = []

      for (const image of rowImages) {
        const aspectRatio = image.originalWidth / image.originalHeight
        const imageWidth = rowHeight * aspectRatio
        imageWidths.push(imageWidth)
        totalWidthNeeded += imageWidth
      }

      // Add gaps
      totalWidthNeeded += imageGap * (rowImages.length - 1)

      // If total width exceeds available width, scale down proportionally
      if (totalWidthNeeded > usableWidth) {
        const scaleFactor = usableWidth / totalWidthNeeded
        rowHeight *= scaleFactor

        // Recalculate widths with new height
        imageWidths = []
        for (const image of rowImages) {
          const aspectRatio = image.originalWidth / image.originalHeight
          const imageWidth = rowHeight * aspectRatio
          imageWidths.push(imageWidth)
        }
      }
    } else {
      // Each image maintains its own aspect ratio
      const imageWidth =
        (usableWidth - imageGap * (imagesInRow - 1)) / imagesInRow
      rowHeight = imageWidth
      imageWidths = Array(rowImages.length).fill(imageWidth)
    }

    // Assign dimensions to images
    for (let colIndex = 0; colIndex < rowImages.length; colIndex++) {
      const image = rowImages[colIndex]
      image.previewWidth = imageWidths[colIndex]
      image.previewHeight = rowHeight
      image.rowIndex = rowIndex
      image.colIndex = colIndex

      result.push(image)
      imageIndex++
    }
  }

  return result
}

/**
 * Arranges images in a single row as fallback
 * @param {Array} images - Array of images
 * @param {number} usableWidth - Usable width
 * @param {number} usableHeight - Usable height
 * @param {number} imageGap - Gap between images
 * @param {boolean} sameHeight - Whether all images should have same height
 * @returns {Array} Array of images with calculated dimensions
 */
function arrangeImagesInSingleRow(
  images,
  usableWidth,
  usableHeight,
  imageGap,
  sameHeight,
) {
  const imageWidth =
    (usableWidth - imageGap * (images.length - 1)) / images.length
  const imageHeight = sameHeight ? usableHeight : imageWidth

  return images.map((image, index) => ({
    ...image,
    previewWidth: imageWidth,
    previewHeight: imageHeight,
    rowIndex: 0,
    colIndex: index,
  }))
}

/**
 * Applies positioning to the layout
 * @param {Array} layoutImages - Images with calculated dimensions
 * @param {number} pageMargin - Page margin
 * @param {number} imageGap - Gap between images
 * @param {number} totalWidth - Total page width
 * @returns {Array} Array of images with final positions
 */
function applyLayoutWithPositioning(
  layoutImages,
  pageMargin,
  imageGap,
  totalWidth,
  totalHeight,
) {
  // Calculate consistent row height for all rows
  // TODO: SHAGUN try with number of rows logic
  const maxRowHeight = Math.max(...layoutImages.map((img) => img.previewHeight))

  // Calculate total number of rows for vertical centering
  const maxRowIndex = Math.max(...layoutImages.map((img) => img.rowIndex))
  const totalRows = maxRowIndex + 1
  const totalRowsHeight = totalRows * maxRowHeight + (totalRows - 1) * imageGap
  const usableHeight = totalHeight - 2 * pageMargin
  const verticalOffset = (usableHeight - totalRowsHeight) / 2

  const result = []
  let currentRow = 0
  let currentRowImages = []

  // Group images by row
  for (const image of layoutImages) {
    if (image.rowIndex !== currentRow) {
      // Process previous row
      if (currentRowImages.length > 0) {
        result.push(
          ...positionImagesInRow(
            currentRowImages,
            pageMargin,
            imageGap,
            currentRow,
            totalWidth,
            totalHeight,
            maxRowHeight,
            verticalOffset,
          ),
        )
      }
      currentRowImages = []
      currentRow = image.rowIndex
    }
    currentRowImages.push(image)
  }

  // Process last row
  if (currentRowImages.length > 0) {
    result.push(
      ...positionImagesInRow(
        currentRowImages,
        pageMargin,
        imageGap,
        currentRow,
        totalWidth,
        totalHeight,
        maxRowHeight,
        verticalOffset,
      ),
    )
  }

  return result
}

/**
 * Positions images within a row
 * @param {Array} rowImages - Images in the current row
 * @param {number} pageMargin - Page margin
 * @param {number} imageGap - Gap between images
 * @param {number} rowIndex - Current row index
 * @param {number} totalWidth - Total page width
 * @returns {Array} Array of images with final positions
 */
function positionImagesInRow(
  rowImages,
  pageMargin,
  imageGap,
  rowIndex,
  totalWidth,
  totalHeight,
  consistentRowHeight,
  verticalOffset,
) {
  const result = []

  // Calculate total width of all images in this row plus gaps
  let totalRowWidth = 0
  for (const image of rowImages) {
    totalRowWidth += image.previewWidth
  }
  totalRowWidth += imageGap * (rowImages.length - 1)

  // TODO: SHAGUN: check if this is correct I think we can simplify this
  // For single image, center it within the total page width
  let currentX
  if (rowImages.length === 1) {
    currentX = (totalWidth - rowImages[0].previewWidth) / 2
  } else {
    // For multiple images, center the entire row
    currentX = (totalWidth - totalRowWidth) / 2
  }

  // Calculate vertical positioning for the row
  const rowHeight = rowImages[0].previewHeight

  let rowY

  // Center all rows vertically within the page using the pre-calculated offset
  const previousRowsHeight = rowIndex * (consistentRowHeight + imageGap)
  rowY = pageMargin + verticalOffset + previousRowsHeight

  for (const image of rowImages) {
    const finalImage = {
      ...image,
      x: currentX,
      y: rowY,
    }

    result.push(finalImage)
    currentX += image.previewWidth + imageGap
  }

  return result
}
