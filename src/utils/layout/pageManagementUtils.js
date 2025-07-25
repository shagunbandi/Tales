import { getPreviewDimensions, DEFAULT_SETTINGS } from '../../constants.js'
import { getRandomColor } from './colorUtils.js'
import { arrangeAndCenterImages } from './imageArrangementUtils.js'
import { calculateOptimalLayout } from './layoutCalculationUtils.js'

export const autoArrangeImages = (newImages, pages, settings = null) => {
  const arrangedPages = [...pages]
  const remainingImages = []

  const pageMargin = settings?.pageMargin || DEFAULT_SETTINGS.pageMargin
  const imageGap = settings?.imageGap || DEFAULT_SETTINGS.imageGap
  const maxImagesPerPage =
    settings?.maxImagesPerPage || DEFAULT_SETTINGS.maxImagesPerPage
  const { width: previewWidth, height: previewHeight } =
    getPreviewDimensions(settings)
  const availableWidth = previewWidth - pageMargin * 2
  const availableHeight = previewHeight - pageMargin * 2

  let currentPageIndex = 0
  let imagesForCurrentPage = []

  // Process images in batches of maxImagesPerPage (6 for 3x2 layout)
  for (let i = 0; i < newImages.length; i += maxImagesPerPage) {
    const batchImages = newImages.slice(i, i + maxImagesPerPage)

    // Create a new page for this batch
    while (currentPageIndex >= arrangedPages.length) {
      arrangedPages.push({
        id: `page-${Date.now()}-${currentPageIndex}`,
        images: [],
        color: getRandomColor(),
      })
    }

    // Arrange the batch of images using the fixed grid layout
    const arrangedImagesOnPage = arrangeAndCenterImages(
      batchImages,
      availableWidth,
      availableHeight,
      pageMargin,
      imageGap,
    )
    arrangedPages[currentPageIndex].images = arrangedImagesOnPage

    currentPageIndex++
  }

  return { arrangedPages, remainingImages }
}

export const findCorrectInsertPosition = (availableImages, originalIndex) => {
  for (let i = 0; i < availableImages.length; i++) {
    if (availableImages[i].originalIndex > originalIndex) {
      return i
    }
  }
  return availableImages.length
}
