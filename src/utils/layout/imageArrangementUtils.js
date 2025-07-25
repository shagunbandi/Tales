import { LAYOUT_CONSTRAINTS, getPreviewDimensions } from '../../constants.js'
import { calculateOptimalLayout } from './layoutCalculationUtils.js'

export const normalizeImageHeights = (
  images,
  availableWidth,
  availableHeight,
  imageGap,
) => {
  if (images.length <= 1) return images

  const maxAvailableHeight = availableHeight * 0.8

  let bestHeight = 0
  let bestFit = null

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
      if (i > 0) totalWidth += imageGap
    }

    if (totalWidth <= availableWidth) {
      bestHeight = testHeight
      bestFit = scaledImages
      break
    }
  }

  return bestFit || images
}

export const arrangeAndCenterImages = (
  images,
  availableWidth,
  availableHeight,
  pageMargin,
  imageGap,
) => {
  // Skip the normalization step as it interferes with multi-row layout
  // Our tryFixedLayout function already handles image sizing properly
  const layout = calculateOptimalLayout(
    images,
    availableWidth,
    availableHeight,
    imageGap,
  )

  // Always use the multi-row layout for fixed grid configurations
  // The layout calculation will handle the grid structure
  const arrangedImages = []
  let currentY = pageMargin

  const totalContentHeight = layout.totalHeight
  const verticalCenterOffset = (availableHeight - totalContentHeight) / 2

  for (const row of layout.rows) {
    const horizontalCenterOffset = (availableWidth - row.width) / 2

    let currentX = pageMargin + horizontalCenterOffset
    const rowY = currentY + verticalCenterOffset

    for (let i = 0; i < row.images.length; i++) {
      const image = row.images[i]

      if (i > 0) {
        currentX += imageGap
      }

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

export const arrangeSimpleRowWithUniformHeight = (
  images,
  availableWidth,
  availableHeight,
  pageMargin,
  imageGap,
) => {
  const arrangedImages = []

  const totalWidth = images.reduce((sum, img, index) => {
    return sum + img.previewWidth + (index > 0 ? imageGap : 0)
  }, 0)

  const startX = pageMargin + (availableWidth - totalWidth) / 2
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

export const arrangeImagesOnPage = (images, settings = null) => {
  if (images.length === 0) return images

  const pageMargin = settings?.pageMargin || 20
  const imageGapRatio =
    settings?.imageGapRatio || LAYOUT_CONSTRAINTS.IMAGE_GAP_RATIO
  const imageGap = pageMargin * imageGapRatio
  const maxImageHeightRatio =
    settings?.maxImageHeightRatio || LAYOUT_CONSTRAINTS.MAX_IMAGE_HEIGHT_RATIO
  const maxImageWidthRatio =
    settings?.maxImageWidthRatio || LAYOUT_CONSTRAINTS.MAX_IMAGE_WIDTH_RATIO

  const { width: previewWidth, height: previewHeight } =
    getPreviewDimensions(settings)
  const availableWidth = previewWidth - pageMargin * 2
  const availableHeight = previewHeight - pageMargin * 2

  const maxImageHeight = availableHeight * maxImageHeightRatio
  const maxImageWidth = availableWidth * maxImageWidthRatio

  if (images.length === 1) {
    const image = images[0]
    const centerX = (availableWidth - image.previewWidth) / 2 + pageMargin
    const centerY = (availableHeight - image.previewHeight) / 2 + pageMargin
    return [{ ...image, x: centerX, y: centerY }]
  }

  const totalWidth =
    images.reduce((sum, img) => sum + img.previewWidth, 0) +
    (images.length - 1) * imageGap

  const uniformHeight = Math.min(availableHeight, maxImageHeight)

  const scaledImages = images.map((image) => {
    const scale = uniformHeight / image.previewHeight
    const scaledWidth = image.previewWidth * scale
    return {
      ...image,
      previewWidth: scaledWidth,
      previewHeight: uniformHeight,
    }
  })

  const scaledTotalWidth =
    scaledImages.reduce((sum, img) => sum + img.previewWidth, 0) +
    (scaledImages.length - 1) * imageGap

  const fitsInWidth = scaledTotalWidth <= maxImageWidth

  if (fitsInWidth) {
    const startX = (availableWidth - scaledTotalWidth) / 2 + pageMargin
    let currentX = startX
    const centerY = (availableHeight - uniformHeight) / 2 + pageMargin

    return scaledImages.map((image, index) => {
      const x = currentX
      currentX += image.previewWidth + imageGap
      return { ...image, x, y: centerY }
    })
  }

  const widthScaleFactor =
    (maxImageWidth - (images.length - 1) * imageGap) / scaledTotalWidth
  const heightScaleFactor = maxImageHeight / uniformHeight
  const scaleFactor = Math.min(widthScaleFactor, heightScaleFactor, 1)

  const finalHeight = uniformHeight * scaleFactor

  const finalTotalWidth =
    scaledImages.reduce((sum, img) => sum + img.previewWidth * scaleFactor, 0) +
    (scaledImages.length - 1) * imageGap

  const startX = (availableWidth - finalTotalWidth) / 2 + pageMargin
  let currentX = startX
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
