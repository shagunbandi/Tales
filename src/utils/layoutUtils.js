import {
  PREVIEW_WIDTH,
  PREVIEW_HEIGHT,
  COLOR_PALETTE,
  getPreviewDimensions,
  PAGE_SIZES,
} from '../constants.js'

// Get random color from palette
export const getRandomColor = () => {
  return COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)]
}

// Convert preview px to PDF mm
export const previewToMm = (px, settings = null) => {
  const { width: previewWidth } = getPreviewDimensions(settings)
  const pageSize = PAGE_SIZES[settings?.pageSize || 'a4']
  const orientation = settings?.orientation || 'landscape'
  const pageWidth =
    orientation === 'landscape' ? pageSize.width : pageSize.height
  return (px / previewWidth) * pageWidth
}

// Check if an image can fit on the current page with existing images
export const canImageFitOnPage = (
  existingImages,
  newImage,
  availableWidth,
  availableHeight,
  imageGap,
) => {
  const allImages = [...existingImages, newImage]
  const layout = calculateOptimalLayout(
    allImages,
    availableWidth,
    availableHeight,
    imageGap,
  )
  return layout.fits
}

// Calculate optimal layout for images
export const calculateOptimalLayout = (
  images,
  availableWidth,
  availableHeight,
  imageGap,
) => {
  if (images.length === 0) return { fits: true, rows: [] }

  // Try different row configurations to find the best fit
  const totalImages = images.length
  let bestLayout = null

  // Try layouts from 1 column up to reasonable maximum (prefer fewer columns for larger images)
  const maxColumns = Math.min(totalImages, 3) // Allow up to 3 columns but prefer fewer
  for (let maxCols = 1; maxCols <= maxColumns; maxCols++) {
    const layout = tryLayout(
      images,
      maxCols,
      availableWidth,
      availableHeight,
      imageGap,
    )
    if (layout.fits) {
      // Prefer layouts with fewer columns (larger images) by weighting efficiency
      const columnPenalty = maxCols > 2 ? 0.7 : 1 // Penalize 3+ columns
      const adjustedEfficiency = layout.efficiency * columnPenalty

      if (!bestLayout || adjustedEfficiency > bestLayout.adjustedEfficiency) {
        bestLayout = { ...layout, adjustedEfficiency }
      }
    }
  }

  return bestLayout || { fits: false, rows: [] }
}

// Try a specific layout configuration
export const tryLayout = (
  images,
  maxCols,
  availableWidth,
  availableHeight,
  imageGap,
) => {
  const rows = []
  let currentRow = []
  let currentRowWidth = 0

  for (const image of images) {
    const gapWidth = currentRow.length > 0 ? imageGap : 0
    const requiredWidth = currentRowWidth + gapWidth + image.previewWidth

    if (requiredWidth <= availableWidth && currentRow.length < maxCols) {
      currentRow.push(image)
      currentRowWidth = requiredWidth
    } else {
      if (currentRow.length > 0) {
        rows.push({
          images: [...currentRow],
          width: currentRowWidth,
          height: Math.max(...currentRow.map((img) => img.previewHeight)),
        })
      }
      currentRow = [image]
      currentRowWidth = image.previewWidth
    }
  }

  // Add the last row
  if (currentRow.length > 0) {
    rows.push({
      images: [...currentRow],
      width: currentRowWidth,
      height: Math.max(...currentRow.map((img) => img.previewHeight)),
    })
  }

  // Calculate total height
  const totalHeight = rows.reduce((sum, row, index) => {
    return sum + row.height + (index > 0 ? imageGap : 0)
  }, 0)

  const fits = totalHeight <= availableHeight
  const efficiency = fits
    ? (rows.length * maxCols) / (totalHeight * availableWidth)
    : 0

  return { fits, rows, efficiency, totalHeight }
}

// Normalize image heights and calculate new dimensions
export const normalizeImageHeights = (
  images,
  availableWidth,
  availableHeight,
  imageGap,
) => {
  if (images.length <= 1) return images

  // Calculate the optimal uniform height that allows all images to fit
  const maxAvailableHeight = availableHeight * 0.8 // Use 80% of available height

  // Calculate total width needed if all images had the same height
  let bestHeight = 0
  let bestFit = null

  // Try different heights to find the best fit
  for (
    let testHeight = maxAvailableHeight;
    testHeight > maxAvailableHeight * 0.3;
    testHeight -= 10
  ) {
    let totalWidth = 0
    const scaledImages = []

    for (let i = 0; i < images.length; i++) {
      const image = images[i]
      const aspectRatio = image.originalWidth / image.originalHeight
      const newWidth = testHeight * aspectRatio

      scaledImages.push({
        ...image,
        previewWidth: newWidth,
        previewHeight: testHeight,
      })

      totalWidth += newWidth
      if (i > 0) totalWidth += imageGap // Add gaps between images
    }

    if (totalWidth <= availableWidth) {
      bestHeight = testHeight
      bestFit = scaledImages
      break
    }
  }

  return bestFit || images // Return normalized images or original if no fit found
}

// Arrange and center images on a page
export const arrangeAndCenterImages = (
  images,
  availableWidth,
  availableHeight,
  pageMargin,
  imageGap,
) => {
  // First normalize heights if multiple images
  const normalizedImages = normalizeImageHeights(
    images,
    availableWidth,
    availableHeight,
    imageGap,
  )

  const layout = calculateOptimalLayout(
    normalizedImages,
    availableWidth,
    availableHeight,
    imageGap,
  )

  if (!layout.fits) {
    // Fallback: arrange in a single row with uniform height
    return arrangeSimpleRowWithUniformHeight(
      normalizedImages,
      availableWidth,
      availableHeight,
      pageMargin,
      imageGap,
    )
  }

  const arrangedImages = []
  let currentY = pageMargin

  // Calculate vertical centering offset
  const totalContentHeight = layout.totalHeight
  const verticalCenterOffset = (availableHeight - totalContentHeight) / 2

  for (const row of layout.rows) {
    // Calculate horizontal centering offset for this row
    const horizontalCenterOffset = (availableWidth - row.width) / 2

    let currentX = pageMargin + horizontalCenterOffset
    const rowY = currentY + verticalCenterOffset

    for (let i = 0; i < row.images.length; i++) {
      const image = row.images[i]

      // Add gap before image (except for first image in row)
      if (i > 0) {
        currentX += imageGap
      }

      // All images in normalized set should have same height, so no need for vertical centering in row
      arrangedImages.push({
        ...image,
        x: currentX,
        y: rowY,
      })

      currentX += image.previewWidth
    }

    currentY += row.height + imageGap
  }

  return arrangedImages
}

// Fallback simple row arrangement with uniform height
export const arrangeSimpleRowWithUniformHeight = (
  images,
  availableWidth,
  availableHeight,
  pageMargin,
  imageGap,
) => {
  const arrangedImages = []

  // Calculate total width needed
  const totalWidth = images.reduce((sum, img, index) => {
    return sum + img.previewWidth + (index > 0 ? imageGap : 0)
  }, 0)

  // Center horizontally
  const startX = pageMargin + (availableWidth - totalWidth) / 2

  // Center vertically - use the height of first image (they should all be same height)
  const imageHeight = images[0]?.previewHeight || 0
  const startY = pageMargin + (availableHeight - imageHeight) / 2

  let currentX = startX

  for (let i = 0; i < images.length; i++) {
    const image = images[i]

    if (i > 0) {
      currentX += imageGap
    }

    arrangedImages.push({
      ...image,
      x: currentX,
      y: startY,
    })

    currentX += image.previewWidth
  }

  return arrangedImages
}

// Auto-arrange images onto pages
export const autoArrangeImages = (newImages, pages, settings = null) => {
  const arrangedPages = [...pages]
  const remainingImages = []

  // Page layout constants - use settings if available
  const pageMargin = settings?.pageMargin || 20
  const imageGap = settings?.imageGap || 20
  const maxImagesPerPage = settings?.maxImagesPerPage || 5
  const { width: previewWidth, height: previewHeight } =
    getPreviewDimensions(settings)
  const availableWidth = previewWidth - pageMargin * 2
  const availableHeight = previewHeight - pageMargin * 2

  let currentPageIndex = 0
  let imagesForCurrentPage = []

  for (const image of newImages) {
    // Try to fit image on current page
    const canFitOnPage = canImageFitOnPage(
      imagesForCurrentPage,
      image,
      availableWidth,
      availableHeight,
      imageGap,
    )

    if (canFitOnPage) {
      imagesForCurrentPage.push(image)
    } else {
      // Finalize current page if it has images
      if (imagesForCurrentPage.length > 0) {
        // Ensure we have a page to work with
        while (currentPageIndex >= arrangedPages.length) {
          arrangedPages.push({
            id: `page-${Date.now()}-${currentPageIndex}`,
            images: [],
            color: getRandomColor(),
          })
        }

        // Arrange and center images on current page using new function
        const arrangedImagesOnPage = arrangeImagesOnPage(
          imagesForCurrentPage,
          settings,
        )
        arrangedPages[currentPageIndex].images = arrangedImagesOnPage

        currentPageIndex++
        imagesForCurrentPage = [image] // Start new page with current image
      } else {
        // If even a single image doesn't fit, add to remaining
        remainingImages.push(image)
      }
    }
  }

  // Handle remaining images on the last page
  if (imagesForCurrentPage.length > 0) {
    // Ensure we have a page to work with
    while (currentPageIndex >= arrangedPages.length) {
      arrangedPages.push({
        id: `page-${Date.now()}-${currentPageIndex}`,
        images: [],
        color: getRandomColor(),
      })
    }

    // Arrange and center images on last page using new function
    const arrangedImagesOnPage = arrangeImagesOnPage(
      imagesForCurrentPage,
      settings,
    )
    arrangedPages[currentPageIndex].images = arrangedImagesOnPage
  }

  return { arrangedPages, remainingImages }
}

// Find correct position to insert image back based on original index
export const findCorrectInsertPosition = (availableImages, originalIndex) => {
  for (let i = 0; i < availableImages.length; i++) {
    if (availableImages[i].originalIndex > originalIndex) {
      return i
    }
  }
  return availableImages.length // Insert at end if no larger index found
}

// Arrange images on a page with uniform height and horizontal stacking
export const arrangeImagesOnPage = (images, settings = null) => {
  if (images.length === 0) return images

  const pageMargin = settings?.pageMargin || 20
  const imageGap = settings?.imageGap || 20
  const { width: previewWidth, height: previewHeight } =
    getPreviewDimensions(settings)
  const availableWidth = previewWidth - pageMargin * 2
  const availableHeight = previewHeight - pageMargin * 2

  // If only one image, center it
  if (images.length === 1) {
    const image = images[0]
    const centerX = (availableWidth - image.previewWidth) / 2 + pageMargin
    const centerY = (availableHeight - image.previewHeight) / 2 + pageMargin
    return [{ ...image, x: centerX, y: centerY }]
  }

  // For multiple images, arrange horizontally with uniform height
  const totalWidth =
    images.reduce((sum, img) => sum + img.previewWidth, 0) +
    (images.length - 1) * imageGap

  // Calculate uniform height for all images
  const maxHeight = availableHeight
  const uniformHeight = maxHeight

  // Scale images to uniform height while maintaining aspect ratio
  const scaledImages = images.map((image) => {
    const scale = uniformHeight / image.previewHeight
    const scaledWidth = image.previewWidth * scale
    return {
      ...image,
      previewWidth: scaledWidth,
      previewHeight: uniformHeight,
    }
  })

  // Calculate total width after scaling
  const scaledTotalWidth =
    scaledImages.reduce((sum, img) => sum + img.previewWidth, 0) +
    (scaledImages.length - 1) * imageGap

  // If scaled images fit, arrange them horizontally
  if (scaledTotalWidth <= availableWidth) {
    let currentX = pageMargin
    const centerY = (availableHeight - uniformHeight) / 2 + pageMargin

    return scaledImages.map((image, index) => {
      const x = currentX
      currentX += image.previewWidth + imageGap
      return { ...image, x, y: centerY }
    })
  }

  // If images don't fit, scale them down proportionally
  const scaleFactor =
    (availableWidth - (images.length - 1) * imageGap) / scaledTotalWidth
  const finalHeight = uniformHeight * scaleFactor

  let currentX = pageMargin
  const centerY = (availableHeight - finalHeight) / 2 + pageMargin

  return scaledImages.map((image, index) => {
    const finalWidth = image.previewWidth * scaleFactor
    const x = currentX
    currentX += finalWidth + imageGap
    return {
      ...image,
      x,
      y: centerY,
      previewWidth: finalWidth,
      previewHeight: finalHeight,
    }
  })
}
