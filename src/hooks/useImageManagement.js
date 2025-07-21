import { useState, useCallback } from 'react'
import { processFiles } from '../utils/imageUtils.js'
import {
  autoArrangeImages,
  getRandomColor,
  findCorrectInsertPosition,
} from '../utils/layoutUtils.js'
import { generatePDF } from '../utils/pdfUtils.js'
import { COLOR_PALETTE } from '../constants.js'

export const useImageManagement = () => {
  const [pages, setPages] = useState([
    { id: 'page-1', images: [], color: COLOR_PALETTE[0] },
  ])
  const [availableImages, setAvailableImages] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  // Handle file processing
  const handleFiles = useCallback(
    async (files) => {
      setError('')
      setIsProcessing(true)

      try {
        const processedImages = await processFiles(
          files,
          availableImages.length,
        )

        // Auto-arrange images onto pages
        const { arrangedPages, remainingImages } = autoArrangeImages(
          processedImages,
          pages,
        )

        // Update pages with arranged images
        setPages(arrangedPages)

        // Add remaining images to available images
        setAvailableImages((prev) => [...prev, ...remainingImages])
      } catch (err) {
        setError(err.message)
      } finally {
        setIsProcessing(false)
      }
    },
    [availableImages.length, pages],
  )

  // Handle drag end for layout
  const handleDragEnd = useCallback(
    (result) => {
      if (!result.destination) return

      const { source, destination } = result

      // Moving from available images to a page
      if (
        source.droppableId === 'available-images' &&
        destination.droppableId.startsWith('page-')
      ) {
        const imageIndex = source.index
        const pageId = destination.droppableId
        const imageToMove = availableImages[imageIndex]

        // Remove from available images
        const newAvailableImages = availableImages.filter(
          (_, index) => index !== imageIndex,
        )
        setAvailableImages(newAvailableImages)

        // Add to page
        setPages((prev) =>
          prev.map((page) => {
            if (page.id === pageId) {
              const newImages = [...page.images]
              newImages.splice(destination.index, 0, {
                ...imageToMove,
                x: 20 + destination.index * 10, // Basic positioning
                y: 20 + destination.index * 10,
              })
              return { ...page, images: newImages }
            }
            return page
          }),
        )
      }

      // Moving within the same page
      else if (
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
              return { ...page, images: newImages }
            }
            return page
          }),
        )
      }

      // Moving from page back to available images
      else if (
        source.droppableId.startsWith('page-') &&
        destination.droppableId === 'available-images'
      ) {
        const pageId = source.droppableId
        const imageIndex = source.index

        setPages((prev) =>
          prev.map((page) => {
            if (page.id === pageId) {
              const imageToRemove = page.images[imageIndex]
              const newImages = page.images.filter(
                (_, index) => index !== imageIndex,
              )

              // Add back to available images in correct position
              setAvailableImages((current) => {
                const newAvailable = [...current]
                // Find the correct position based on originalIndex
                const insertIndex = findCorrectInsertPosition(
                  newAvailable,
                  imageToRemove.originalIndex,
                )
                newAvailable.splice(insertIndex, 0, imageToRemove)
                return newAvailable
              })

              return { ...page, images: newImages }
            }
            return page
          }),
        )
      }
    },
    [availableImages],
  )

  // Add a new page
  const addPage = useCallback(() => {
    const newPage = {
      id: `page-${Date.now()}`,
      images: [],
      color: getRandomColor(),
    }
    setPages((prev) => [...prev, newPage])
  }, [])

  // Remove a page and return images to sidebar in original order
  const removePage = useCallback(
    (pageId) => {
      if (pages.length <= 1) return // Keep at least one page

      setPages((prev) => {
        const pageToRemove = prev.find((p) => p.id === pageId)
        if (pageToRemove && pageToRemove.images.length > 0) {
          // Sort images by original index before adding back
          const sortedImages = [...pageToRemove.images].sort(
            (a, b) => a.originalIndex - b.originalIndex,
          )

          // Add images back to available in correct positions
          setAvailableImages((current) => {
            let newAvailable = [...current]

            // Insert each image in the correct position
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
        return prev.filter((p) => p.id !== pageId)
      })
    },
    [pages.length],
  )

  // Change page background color
  const changePageColor = useCallback((pageId) => {
    setPages((prev) =>
      prev.map((page) =>
        page.id === pageId ? { ...page, color: getRandomColor() } : page,
      ),
    )
  }, [])

  // Remove image from available list
  const removeAvailableImage = useCallback((index) => {
    setAvailableImages((prev) => prev.filter((_, i) => i !== index))
  }, [])

  // Generate PDF
  const handleGeneratePDF = useCallback(async () => {
    if (pages.length === 0) return

    setIsProcessing(true)
    try {
      await generatePDF(pages)
    } catch (err) {
      setError(`Failed to generate PDF: ${err.message}`)
    } finally {
      setIsProcessing(false)
    }
  }, [pages])

  // Count total images across all pages and available
  const totalImages =
    pages.reduce((sum, page) => sum + page.images.length, 0) +
    availableImages.length

  return {
    // State
    pages,
    availableImages,
    isProcessing,
    error,
    totalImages,

    // Actions
    handleFiles,
    handleDragEnd,
    addPage,
    removePage,
    changePageColor,
    removeAvailableImage,
    handleGeneratePDF,
    setError,
  }
}
