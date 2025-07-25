import { LAYOUT_CONSTRAINTS } from '../../constants.js'

export const calculateOptimalLayout = (
  images,
  availableWidth,
  availableHeight,
  imageGap,
) => {
  if (images.length === 0) return { fits: true, rows: [] }

  const totalImages = images.length
  const imagesPerRow = LAYOUT_CONSTRAINTS.IMAGES_PER_ROW
  const numberOfRows = LAYOUT_CONSTRAINTS.NUMBER_OF_ROWS
  const maxImagesPerPage = imagesPerRow * numberOfRows

  // Always create the fixed layout, even if we have fewer images
  // This ensures the 2-row structure is always maintained
  const layout = tryFixedLayout(
    images,
    imagesPerRow,
    numberOfRows,
    availableWidth,
    availableHeight,
    imageGap,
  )

  return layout
}

export const tryFixedLayout = (
  images,
  imagesPerRow,
  numberOfRows,
  availableWidth,
  availableHeight,
  imageGap,
) => {
  const rows = []
  const maxImagesPerPage = imagesPerRow * numberOfRows

  // First, collect all images and find the global maximum height
  const allImages = []
  for (let rowIndex = 0; rowIndex < numberOfRows; rowIndex++) {
    for (let colIndex = 0; colIndex < imagesPerRow; colIndex++) {
      const imageIndex = rowIndex * imagesPerRow + colIndex
      if (imageIndex < images.length) {
        allImages.push(images[imageIndex])
      }
    }
  }

  // Find the global maximum height across all images
  const globalMaxHeight =
    allImages.length > 0
      ? Math.max(...allImages.map((img) => img.previewHeight))
      : 0

  // Create fixed number of rows
  for (let rowIndex = 0; rowIndex < numberOfRows; rowIndex++) {
    const rowImages = []

    // Add images to this row
    for (let colIndex = 0; colIndex < imagesPerRow; colIndex++) {
      const imageIndex = rowIndex * imagesPerRow + colIndex

      if (imageIndex < images.length) {
        const image = images[imageIndex]
        rowImages.push(image)
      }
    }

    // Normalize image sizes using the global maximum height
    if (rowImages.length > 0) {
      // Calculate total width needed for this row
      let totalRowWidth = 0
      const normalizedRowImages = rowImages.map((image, index) => {
        const aspectRatio = image.previewWidth / image.previewHeight
        const newWidth = globalMaxHeight * aspectRatio
        totalRowWidth += newWidth + (index > 0 ? imageGap : 0)

        return {
          ...image,
          previewWidth: newWidth,
          previewHeight: globalMaxHeight,
        }
      })

      // Scale down if the row is too wide
      if (totalRowWidth > availableWidth) {
        const scaleFactor = availableWidth / totalRowWidth
        const finalRowImages = normalizedRowImages.map((image) => ({
          ...image,
          previewWidth: image.previewWidth * scaleFactor,
          previewHeight: image.previewHeight * scaleFactor,
        }))

        rows.push({
          images: finalRowImages,
          width: availableWidth,
          height: globalMaxHeight * scaleFactor,
        })
      } else {
        rows.push({
          images: normalizedRowImages,
          width: totalRowWidth,
          height: globalMaxHeight,
        })
      }
    } else {
      // Empty row
      rows.push({
        images: [],
        width: 0,
        height: 0,
      })
    }
  }

  const totalHeight = rows.reduce((sum, row, index) => {
    return sum + row.height + (index > 0 ? imageGap : 0)
  }, 0)

  const fits = totalHeight <= availableHeight
  const totalImages = rows.reduce((sum, row) => sum + row.images.length, 0)

  return { fits, rows, totalHeight, totalImages }
}

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

  if (currentRow.length > 0) {
    rows.push({
      images: [...currentRow],
      width: currentRowWidth,
      height: Math.max(...currentRow.map((img) => img.previewHeight)),
    })
  }

  const totalHeight = rows.reduce((sum, row, index) => {
    return sum + row.height + (index > 0 ? imageGap : 0)
  }, 0)

  const fits = totalHeight <= availableHeight
  const totalImages = rows.reduce((sum, row) => sum + row.images.length, 0)

  return { fits, rows, totalHeight, totalImages }
}
