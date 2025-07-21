import React, { useState, useCallback, useRef } from 'react'
import jsPDF from 'jspdf'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

// Sober color palette as specified
const COLOR_PALETTE = [
  { name: 'Oxford Blue', color: '#002147' },
  { name: 'Slate Gray', color: '#708090' },
  { name: 'Steel Blue', color: '#4682B4' },
  { name: 'Cornsilk', color: '#FFF8DC' },
  { name: 'Antique White', color: '#FAEBD7' },
  { name: 'Pastel Green', color: '#77DD77' },
  { name: 'Light Khaki', color: '#F0E68C' },
  { name: 'Powder Blue', color: '#B0E0E6' },
]

// A4 landscape dimensions in mm and px (for preview)
const A4_WIDTH_MM = 297
const A4_HEIGHT_MM = 210
const MARGIN_PX = 20
const IMAGE_GAP_PX = 10

// Preview dimensions (scaled down for UI)
const PREVIEW_SCALE = 0.8
const PREVIEW_WIDTH = 600 * PREVIEW_SCALE
const PREVIEW_HEIGHT = (210 / 297) * PREVIEW_WIDTH

function App() {
  const [pages, setPages] = useState([
    { id: 'page-1', images: [], color: COLOR_PALETTE[0] },
  ])
  const [availableImages, setAvailableImages] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('design')

  // Supported image formats
  const supportedFormats = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ]

  // Convert preview px to PDF mm
  const previewToMm = (px) => (px / PREVIEW_WIDTH) * A4_WIDTH_MM

  // Get random color from palette
  const getRandomColor = () => {
    return COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)]
  }

  // Handle file input change
  const handleFileChange = useCallback(async (event) => {
    const files = Array.from(event.target.files)
    await processFiles(files)
  }, [])

  // Handle drag and drop for file upload
  const handleDrop = useCallback(async (event) => {
    event.preventDefault()
    const files = Array.from(event.dataTransfer.files)
    await processFiles(files)
  }, [])

  const handleDragOver = useCallback((event) => {
    event.preventDefault()
    event.currentTarget.classList.add('dragover')
  }, [])

  const handleDragLeave = useCallback((event) => {
    event.currentTarget.classList.remove('dragover')
  }, [])

  // Process uploaded files and auto-arrange them
  const processFiles = async (files) => {
    setError('')
    setIsProcessing(true)

    try {
      const imageFiles = files
        .filter((file) => supportedFormats.includes(file.type))
        .sort((a, b) => a.name.localeCompare(b.name))

      if (imageFiles.length === 0) {
        throw new Error(
          'No supported image files found. Please select JPG, PNG, GIF, or WebP files.',
        )
      }

      const processedImages = []
      for (const file of imageFiles) {
        try {
          const imageData = await loadImage(file)
          processedImages.push({
            ...imageData,
            id: `img-${Date.now()}-${Math.random()}`,
            originalIndex: availableImages.length + processedImages.length, // Track original position
          })
        } catch (err) {
          console.warn(`Failed to load image ${file.name}:`, err)
        }
      }

      // Auto-arrange images onto pages
      const { arrangedPages, remainingImages } =
        autoArrangeImages(processedImages)

      // Update pages with arranged images
      setPages(arrangedPages)

      // Add remaining images to available images
      setAvailableImages((prev) => [...prev, ...remainingImages])
    } catch (err) {
      setError(err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  // Auto-arrange images onto pages
  const autoArrangeImages = (newImages) => {
    const arrangedPages = [...pages]
    const remainingImages = []

    // Page layout constants - maximized for 80% height, 90% width usage
    const pageMargin = 20
    const imageGap = 20
    const availableWidth = PREVIEW_WIDTH - pageMargin * 2
    const availableHeight = PREVIEW_HEIGHT - pageMargin * 2

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

          // Arrange and center images on current page
          const arrangedImages = arrangeAndCenterImages(
            imagesForCurrentPage,
            availableWidth,
            availableHeight,
            pageMargin,
            imageGap,
          )
          arrangedPages[currentPageIndex].images = [
            ...arrangedPages[currentPageIndex].images,
            ...arrangedImages,
          ]

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

      // Arrange and center images on last page
      const arrangedImages = arrangeAndCenterImages(
        imagesForCurrentPage,
        availableWidth,
        availableHeight,
        pageMargin,
        imageGap,
      )
      arrangedPages[currentPageIndex].images = [
        ...arrangedPages[currentPageIndex].images,
        ...arrangedImages,
      ]
    }

    return { arrangedPages, remainingImages }
  }

  // Check if an image can fit on the current page with existing images
  const canImageFitOnPage = (
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
  const calculateOptimalLayout = (
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
  const tryLayout = (
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
  const normalizeImageHeights = (
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
  const arrangeAndCenterImages = (
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
  const arrangeSimpleRowWithUniformHeight = (
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

  // Fallback simple grid arrangement
  const arrangeSimpleGrid = (
    images,
    availableWidth,
    availableHeight,
    pageMargin,
    imageGap,
  ) => {
    const arrangedImages = []
    let currentX = pageMargin
    let currentY = pageMargin
    let rowHeight = 0

    for (const image of images) {
      // Check if image fits on current row
      if (currentX + image.previewWidth > pageMargin + availableWidth) {
        // Move to next row
        currentX = pageMargin
        currentY += rowHeight + imageGap
        rowHeight = 0
      }

      // Check if image fits on page
      if (currentY + image.previewHeight <= pageMargin + availableHeight) {
        arrangedImages.push({
          ...image,
          x: currentX,
          y: currentY,
        })

        currentX += image.previewWidth + imageGap
        rowHeight = Math.max(rowHeight, image.previewHeight)
      }
    }

    return arrangedImages
  }

  // Load image and get its dimensions
  const loadImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          canvas.width = img.naturalWidth
          canvas.height = img.naturalHeight
          ctx.drawImage(img, 0, 0)
          const correctedSrc = canvas.toDataURL('image/jpeg', 0.9)

          // Calculate initial dimensions - these will be adjusted for uniform height later
          const maxHeight = PREVIEW_HEIGHT * 0.8 // Use 80% of page height
          const maxWidth = PREVIEW_WIDTH * 0.9 // Use 90% of page width total
          const scaleHeight = maxHeight / img.naturalHeight
          const scaleWidth = maxWidth / img.naturalWidth
          const scale = Math.min(scaleHeight, scaleWidth, 1)
          const scaledWidth = img.naturalWidth * scale
          const scaledHeight = img.naturalHeight * scale

          resolve({
            file,
            src: correctedSrc,
            originalWidth: img.naturalWidth,
            originalHeight: img.naturalHeight,
            previewWidth: scaledWidth,
            previewHeight: scaledHeight,
            x: 0,
            y: 0,
          })
        }
        img.onerror = () =>
          reject(new Error(`Failed to load image: ${file.name}`))
        img.src = event.target.result
      }
      reader.onerror = () =>
        reject(new Error(`Failed to read file: ${file.name}`))
      reader.readAsDataURL(file)
    })
  }

  // Handle drag end for the layout
  const handleDragEnd = (result) => {
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
  }

  // Find correct position to insert image back based on original index
  const findCorrectInsertPosition = (availableImages, originalIndex) => {
    for (let i = 0; i < availableImages.length; i++) {
      if (availableImages[i].originalIndex > originalIndex) {
        return i
      }
    }
    return availableImages.length // Insert at end if no larger index found
  }

  // Add a new page
  const addPage = () => {
    const newPage = {
      id: `page-${Date.now()}`,
      images: [],
      color: getRandomColor(),
    }
    setPages((prev) => [...prev, newPage])
  }

  // Remove a page and return images to sidebar in original order
  const removePage = (pageId) => {
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
  }

  // Change page background color
  const changePageColor = (pageId) => {
    setPages((prev) =>
      prev.map((page) =>
        page.id === pageId ? { ...page, color: getRandomColor() } : page,
      ),
    )
  }

  // Remove image from available list
  const removeAvailableImage = (index) => {
    setAvailableImages((prev) => prev.filter((_, i) => i !== index))
  }

  // Add more images option
  const addMoreImages = () => {
    document.getElementById('folder-input').click()
  }

  // Generate PDF
  const generatePDF = async () => {
    if (pages.length === 0) return

    setIsProcessing(true)
    try {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      })

      for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
        const page = pages[pageIndex]

        if (pageIndex > 0) {
          pdf.addPage()
        }

        // Set background color
        pdf.setFillColor(page.color.color)
        pdf.rect(0, 0, A4_WIDTH_MM, A4_HEIGHT_MM, 'F')

        // Add images to the page
        for (const image of page.images) {
          try {
            const imgWidth = previewToMm(image.previewWidth)
            const imgHeight = previewToMm(image.previewHeight)
            const imgX = previewToMm(image.x)
            const imgY = previewToMm(image.y)

            pdf.addImage(image.src, 'JPEG', imgX, imgY, imgWidth, imgHeight)
          } catch (err) {
            console.warn(`Failed to add image to PDF:`, err)
          }
        }
      }

      const filename = `images-${new Date().toISOString().slice(0, 10)}.pdf`
      pdf.save(filename)
    } catch (err) {
      setError(`Failed to generate PDF: ${err.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  // Count total images across all pages and available
  const totalImages =
    pages.reduce((sum, page) => sum + page.images.length, 0) +
    availableImages.length

  return (
    <div className="app">
      <h1 className="app-title">Interactive PDF Designer</h1>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'design' ? 'active' : ''}`}
          onClick={() => setActiveTab('design')}
        >
          Design Layout ({totalImages} images)
        </button>
        <button
          className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          Upload Images
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        {activeTab === 'design' && (
          <div className="design-tab">
            <div className="layout-container">
              {/* Available Images Panel */}
              <div className="sidebar">
                <div className="sidebar-header">
                  <h3>Available Images</h3>
                  <button className="btn btn-small" onClick={addMoreImages}>
                    + Add More
                  </button>
                </div>
                <Droppable droppableId="available-images">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="available-images"
                    >
                      {availableImages.map((image, index) => (
                        <Draggable
                          key={image.id}
                          draggableId={image.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`available-image ${
                                snapshot.isDragging ? 'dragging' : ''
                              }`}
                            >
                              <img src={image.src} alt={image.file.name} />
                              <div className="image-name">
                                {image.file.name}
                              </div>
                              <button
                                className="remove-btn"
                                onClick={() => removeAvailableImage(index)}
                              >
                                ×
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {availableImages.length === 0 && totalImages === 0 && (
                        <div className="no-images">
                          No images available. Upload some images first!
                        </div>
                      )}
                      {availableImages.length === 0 && totalImages > 0 && (
                        <div className="no-images">
                          All images are arranged on pages.
                          <br />
                          <button
                            className="btn btn-small"
                            onClick={addMoreImages}
                          >
                            Add More Images
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>

              {/* Pages Preview */}
              <div className="pages-container">
                <div className="pages-header">
                  <h3>PDF Pages Preview</h3>
                  <button className="btn btn-secondary" onClick={addPage}>
                    Add Page
                  </button>
                </div>

                <div className="pages-list">
                  {pages.map((page, pageIndex) => (
                    <div key={page.id} className="page-container">
                      <div className="page-header">
                        <span>Page {pageIndex + 1}</span>
                        <div className="page-controls">
                          <button
                            className="color-btn"
                            style={{ backgroundColor: page.color.color }}
                            onClick={() => changePageColor(page.id)}
                            title="Change background color"
                          >
                            🎨
                          </button>
                          {pages.length > 1 && (
                            <button
                              className="remove-page-btn"
                              onClick={() => removePage(page.id)}
                              title="Remove page"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </div>

                      <Droppable droppableId={page.id}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`page-preview ${
                              snapshot.isDraggingOver ? 'drag-over' : ''
                            }`}
                            style={{
                              backgroundColor: page.color.color,
                              width: PREVIEW_WIDTH,
                              height: PREVIEW_HEIGHT,
                            }}
                          >
                            {page.images.map((image, index) => (
                              <Draggable
                                key={`${page.id}-${image.id}`}
                                draggableId={`${page.id}-${image.id}`}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`page-image ${
                                      snapshot.isDragging ? 'dragging' : ''
                                    }`}
                                    style={{
                                      left: image.x,
                                      top: image.y,
                                      width: image.previewWidth,
                                      height: image.previewHeight,
                                    }}
                                  >
                                    <img
                                      src={image.src}
                                      alt={image.file.name}
                                    />
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                            {page.images.length === 0 && (
                              <div className="empty-page">
                                Drag images here to add them to this page
                              </div>
                            )}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  ))}
                </div>

                <div className="actions">
                  <button
                    className="btn btn-primary"
                    onClick={generatePDF}
                    disabled={
                      pages.every((p) => p.images.length === 0) || isProcessing
                    }
                  >
                    {isProcessing ? 'Generating PDF...' : 'Generate PDF'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="upload-tab">
            <div className="upload-section">
              <div
                className="folder-picker"
                onClick={() => document.getElementById('folder-input').click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="folder-picker-text">
                  Click here or drag & drop image files
                </div>
                <div className="folder-picker-subtext">
                  Supports JPG, PNG, GIF, WebP formats
                </div>
                <input
                  id="folder-input"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="folder-input"
                />
              </div>

              {totalImages > 0 && (
                <div className="image-count">
                  ✓ {totalImages} images total - automatically arranged on pages
                </div>
              )}
            </div>

            {isProcessing && (
              <div className="progress-section">
                <div className="progress-text">
                  Processing and arranging images...
                </div>
              </div>
            )}
          </div>
        )}
      </DragDropContext>

      {error && <div className="error">{error}</div>}
    </div>
  )
}

export default App
