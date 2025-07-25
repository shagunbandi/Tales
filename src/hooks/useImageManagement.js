import { useState, useCallback } from 'react'
import { processFiles } from '../utils/imageUtils.js'
import {
  autoArrangeImages,
  getRandomColor,
  findCorrectInsertPosition,
  arrangeAndCenterImages,
} from '../utils/layoutUtils.js'
import { generatePDF } from '../utils/pdfUtils.js'
import { COLOR_PALETTE, getPreviewDimensions } from '../constants.js'

export const useImageManagement = (settings = null) => {
  const [pages, setPages] = useState([
    { id: 'page-1', images: [], color: COLOR_PALETTE[0] },
  ])
  const [availableImages, setAvailableImages] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  const handleFiles = useCallback(
    async (files) => {
      setError('')
      setIsProcessing(true)

      try {
        const processedImages = await processFiles(
          files,
          availableImages.length,
          settings,
        )
        setAvailableImages((prev) => [...prev, ...processedImages])
      } catch (err) {
        setError(err.message)
      } finally {
        setIsProcessing(false)
      }
    },
    [availableImages.length],
  )

  const handleDragEnd = useCallback(
    (result) => {
      if (!result.destination) return

      const { source, destination } = result

      if (
        source.droppableId === 'available-images' &&
        destination.droppableId.startsWith('page-')
      ) {
        const imageIndex = source.index
        const pageId = destination.droppableId
        const imageToMove = availableImages[imageIndex]

        setAvailableImages((prev) =>
          prev.filter((_, index) => index !== imageIndex),
        )

        setPages((prev) =>
          prev.map((page) => {
            if (page.id === pageId) {
              const newImages = [...page.images]
              newImages.splice(destination.index, 0, imageToMove)

              // Use arrangeAndCenterImages for multi-row layout
              const pageMargin = settings?.pageMargin
              const imageGap = settings?.imageGap
              const { width: previewWidth, height: previewHeight } =
                getPreviewDimensions(settings)

              const arrangedImages = arrangeAndCenterImages(
                newImages,
                previewWidth,
                previewHeight,
                pageMargin,
                imageGap,
                settings,
              )
              return { ...page, images: arrangedImages }
            }
            return page
          }),
        )
      } else if (
        source.droppableId === destination.droppableId &&
        source.droppableId.startsWith('page-')
      ) {
        const pageId = source.droppableId
        setPages((prev) =>
          prev.map((page) => {
            if (page.id === pageId) {
              const newImages = [...page.images]
              const [moved] = newImages.splice(source.index, 1)
              newImages.splice(destination.index, 0, moved)

              // Use arrangeAndCenterImages for multi-row layout
              const pageMargin = settings?.pageMargin
              const imageGap = settings?.imageGap
              const { width: previewWidth, height: previewHeight } =
                getPreviewDimensions(settings)

              const arrangedImages = arrangeAndCenterImages(
                newImages,
                previewWidth,
                previewHeight,
                pageMargin,
                imageGap,
                settings,
              )
              return { ...page, images: arrangedImages }
            }
            return page
          }),
        )
      } else if (
        source.droppableId.startsWith('page-') &&
        destination.droppableId === 'available-images'
      ) {
        const pageId = source.droppableId
        const imageIndex = source.index
        const currentPages = pages
        const currentPage = currentPages.find((p) => p.id === pageId)

        if (currentPage && currentPage.images[imageIndex]) {
          const imageToRemove = currentPage.images[imageIndex]

          setAvailableImages((current) => {
            const newAvailable = [...current]
            const insertIndex = findCorrectInsertPosition(
              newAvailable,
              imageToRemove.originalIndex,
            )
            newAvailable.splice(insertIndex, 0, imageToRemove)
            return newAvailable
          })
        }

        setPages((prev) =>
          prev.map((page) => {
            if (page.id === pageId) {
              const newImages = page.images.filter(
                (_, index) => index !== imageIndex,
              )
              return { ...page, images: newImages }
            }
            return page
          }),
        )
      }
    },
    [availableImages, pages, settings],
  )

  const addPage = useCallback(() => {
    const newPage = {
      id: `page-${Date.now()}`,
      images: [],
      color: getRandomColor(),
    }
    setPages((prev) => [...prev, newPage])
  }, [])

  const addPageBetween = useCallback((afterPageId) => {
    const newPage = {
      id: `page-${Date.now()}`,
      images: [],
      color: getRandomColor(),
    }
    setPages((prev) => {
      if (afterPageId === 'start') {
        return [newPage, ...prev]
      }

      const afterIndex = prev.findIndex((p) => p.id === afterPageId)
      if (afterIndex === -1) return [...prev, newPage]

      const newPages = [...prev]
      newPages.splice(afterIndex + 1, 0, newPage)
      return newPages
    })
  }, [])

  const removePage = useCallback(
    (pageId) => {
      const currentPages = pages
      const pageToRemove = currentPages.find((p) => p.id === pageId)

      if (pageToRemove && pageToRemove.images.length > 0) {
        const sortedImages = [...pageToRemove.images].sort(
          (a, b) => a.originalIndex - b.originalIndex,
        )

        setAvailableImages((current) => {
          let newAvailable = [...current]

          sortedImages.forEach((image) => {
            const insertIndex = findCorrectInsertPosition(
              newAvailable,
              image.originalIndex,
            )
            newAvailable.splice(insertIndex, 0, image)
          })

          return newAvailable
        })
      }

      setPages((prev) => prev.filter((p) => p.id !== pageId))
    },
    [pages.length, pages],
  )

  const changePageColor = useCallback((pageId) => {
    setPages((prev) =>
      prev.map((page) =>
        page.id === pageId ? { ...page, color: getRandomColor() } : page,
      ),
    )
  }, [])

  const removeAvailableImage = useCallback((index) => {
    setAvailableImages((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const autoArrangeImagesToPages = useCallback(async () => {
    if (availableImages.length === 0) return

    setIsProcessing(true)
    try {
      const { arrangedPages, remainingImages } = autoArrangeImages(
        availableImages,
        [],
        settings,
      )

      setPages((prevPages) => [...prevPages, ...arrangedPages])
      setAvailableImages(remainingImages)
    } catch (err) {
      setError(`Failed to auto-arrange images: ${err.message}`)
    } finally {
      setIsProcessing(false)
    }
  }, [availableImages, pages])

  const handleGeneratePDF = useCallback(async () => {
    if (pages.length === 0) return

    setIsProcessing(true)
    try {
      await generatePDF(pages, settings)
    } catch (err) {
      setError(`Failed to generate PDF: ${err.message}`)
    } finally {
      setIsProcessing(false)
    }
  }, [pages, settings])

  const totalImages =
    pages.reduce((sum, page) => sum + page.images.length, 0) +
    availableImages.length

  return {
    pages,
    availableImages,
    isProcessing,
    error,
    totalImages,
    handleFiles,
    handleDragEnd,
    addPage,
    addPageBetween,
    removePage,
    changePageColor,
    removeAvailableImage,
    autoArrangeImagesToPages,
    handleGeneratePDF,
    setError,
  }
}
