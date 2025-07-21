import React, { useState, useCallback } from 'react'
import jsPDF from 'jspdf'

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

// A4 landscape dimensions in mm
const A4_WIDTH_MM = 297
const A4_HEIGHT_MM = 210
const MARGIN_PX = 30 // Balanced margin for good spacing while maximizing image area
const IMAGE_GAP_PX = 12 // Increased gap between images for better visual separation

function App() {
  const [images, setImages] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [pages, setPages] = useState([])
  const [error, setError] = useState('')
  const [progressText, setProgressText] = useState('')

  // Supported image formats
  const supportedFormats = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ]

  // Convert px to mm for jsPDF
  const pxToMm = (px) => px * 0.264583

  // Convert mm to px for calculations
  const mmToPx = (mm) => mm / 0.264583

  // Get random color from palette
  const getRandomColor = () => {
    return COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)]
  }

  // Handle file input change
  const handleFileChange = useCallback(async (event) => {
    const files = Array.from(event.target.files)
    await processFiles(files)
  }, [])

  // Handle drag and drop
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

  // Process uploaded files
  const processFiles = async (files) => {
    setError('')
    setIsProcessing(true)
    setProgress(0)
    setProgressText('Processing images...')

    try {
      // Filter for image files and sort by name
      const imageFiles = files
        .filter((file) => supportedFormats.includes(file.type))
        .sort((a, b) => a.name.localeCompare(b.name))

      if (imageFiles.length === 0) {
        throw new Error(
          'No supported image files found. Please select JPG, PNG, GIF, or WebP files.',
        )
      }

      const processedImages = []

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i]
        setProgressText(`Processing ${file.name}...`)

        try {
          const imageData = await loadImage(file)
          processedImages.push(imageData)
          setProgress(((i + 1) / imageFiles.length) * 50) // First 50% for loading images
        } catch (err) {
          console.warn(`Failed to load image ${file.name}:`, err)
        }
      }

      setImages(processedImages)
      setProgressText('Calculating page layout...')

      // Calculate page layout
      const calculatedPages = calculatePageLayout(processedImages)
      setPages(calculatedPages)

      setProgress(100)
      setProgressText(
        `Ready! ${processedImages.length} images arranged on ${calculatedPages.length} pages`,
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  // Load image and get its dimensions with EXIF orientation handling
  const loadImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          // Create canvas to handle EXIF orientation and ensure proper dimensions
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')

          // Set canvas size to image size (this handles orientation automatically in most browsers)
          canvas.width = img.naturalWidth
          canvas.height = img.naturalHeight

          // Draw image to canvas (this will auto-correct orientation in modern browsers)
          ctx.drawImage(img, 0, 0)

          // Get the corrected image data
          const correctedSrc = canvas.toDataURL('image/jpeg', 0.9)

          // Calculate scaled dimensions with flexible sizing for better page utilization
          const availableHeight = mmToPx(A4_HEIGHT_MM) - MARGIN_PX * 2
          const targetHeight = availableHeight * 0.75 // Use 75% of available height for more images per page
          const scale = targetHeight / img.naturalHeight
          const scaledWidth = img.naturalWidth * scale
          const scaledHeight = targetHeight

          resolve({
            file,
            src: correctedSrc, // Use the orientation-corrected image
            originalWidth: img.naturalWidth,
            originalHeight: img.naturalHeight,
            scaledWidth,
            scaledHeight,
            scale,
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

  // Calculate how images should be arranged on pages with centering
  const calculatePageLayout = (images) => {
    const pages = []
    const availableWidth = mmToPx(A4_WIDTH_MM) - MARGIN_PX * 2

    let currentPage = { images: [], color: getRandomColor() }
    let currentRowWidth = 0

    for (const image of images) {
      // Calculate required width including gap (no gap for first image on page)
      const gapWidth = currentPage.images.length > 0 ? IMAGE_GAP_PX : 0
      const requiredWidth = currentRowWidth + gapWidth + image.scaledWidth

      // Check if image fits on current page
      if (requiredWidth <= availableWidth) {
        currentPage.images.push({
          ...image,
          x: currentRowWidth + gapWidth, // Temporary position, will be adjusted for centering
          y: 0,
        })
        currentRowWidth = requiredWidth
      } else {
        // Finish current page with centering
        if (currentPage.images.length > 0) {
          centerImagesOnPage(currentPage, availableWidth)
          pages.push(currentPage)
        }

        // Start new page
        currentPage = {
          images: [
            {
              ...image,
              x: 0, // Temporary position
              y: 0,
            },
          ],
          color: getRandomColor(),
        }
        currentRowWidth = image.scaledWidth
      }
    }

    // Add the last page if it has images (with centering)
    if (currentPage.images.length > 0) {
      centerImagesOnPage(currentPage, availableWidth)
      pages.push(currentPage)
    }

    return pages
  }

  // Helper function to center images on a page (both horizontally and vertically)
  const centerImagesOnPage = (page, availableWidth) => {
    if (page.images.length === 0) return

    // Calculate total width of all images including gaps
    const totalImageWidth = page.images.reduce((sum, img, index) => {
      const gapWidth = index > 0 ? IMAGE_GAP_PX : 0
      return sum + gapWidth + img.scaledWidth
    }, 0)

    // Calculate horizontal offset to center the images
    const horizontalOffset = (availableWidth - totalImageWidth) / 2

    // Calculate vertical offset to center the images
    const availableHeight = mmToPx(A4_HEIGHT_MM) - MARGIN_PX * 2
    const imageHeight = page.images[0]?.scaledHeight || 0
    const verticalOffset = (availableHeight - imageHeight) / 2

    // Adjust all positions to center the images both horizontally and vertically
    let currentX = horizontalOffset
    page.images.forEach((img, index) => {
      if (index > 0) currentX += IMAGE_GAP_PX
      img.x = currentX
      img.y = verticalOffset // Center vertically
      currentX += img.scaledWidth
    })
  }

  // Generate PDF
  const generatePDF = async () => {
    if (pages.length === 0) return

    setIsProcessing(true)
    setProgress(0)
    setProgressText('Generating PDF...')

    try {
      // Create jsPDF instance with A4 landscape
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
          setProgressText(`Adding image to page ${pageIndex + 1}...`)

          try {
            const imgWidth = pxToMm(image.scaledWidth)
            const imgHeight = pxToMm(image.scaledHeight)
            const imgX = pxToMm(MARGIN_PX + image.x)
            const imgY = pxToMm(MARGIN_PX + image.y) // Use calculated y position for vertical centering

            pdf.addImage(image.src, 'JPEG', imgX, imgY, imgWidth, imgHeight)
          } catch (err) {
            console.warn(`Failed to add image to PDF:`, err)
          }
        }

        setProgress(((pageIndex + 1) / pages.length) * 100)
      }

      // Save the PDF
      const filename = `images-${new Date().toISOString().slice(0, 10)}.pdf`
      pdf.save(filename)
      setProgressText(`PDF saved as ${filename}`)
    } catch (err) {
      setError(`Failed to generate PDF: ${err.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="app">
      <h1 className="app-title">Image to PDF Generator</h1>

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

        {images.length > 0 && (
          <div className="image-count">✓ {images.length} images selected</div>
        )}
      </div>

      {error && <div className="error">{error}</div>}

      {(isProcessing || progress > 0) && (
        <div className="progress-section">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="progress-text">{progressText}</div>
        </div>
      )}

      {pages.length > 0 && (
        <div className="pages-preview">
          <h3>Page Preview ({pages.length} pages)</h3>
          <div className="pages-grid">
            {pages.map((page, index) => (
              <div
                key={index}
                className="page-preview"
                style={{ backgroundColor: page.color.color }}
              >
                Page {index + 1}
                <br />
                <small>{page.images.length} images</small>
                <br />
                <small>{page.color.name}</small>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="actions">
        <button
          className="btn btn-primary"
          onClick={generatePDF}
          disabled={pages.length === 0 || isProcessing}
        >
          {isProcessing ? 'Generating...' : 'Generate PDF'}
        </button>
      </div>
    </div>
  )
}

export default App
