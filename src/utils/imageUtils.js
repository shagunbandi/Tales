import { SUPPORTED_FORMATS, getPreviewDimensions } from '../constants.js'

export const loadImage = (file, settings = null) => {
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
        const correctedSrc = canvas.toDataURL(
          'image/jpeg',
          settings?.imageQuality || 0.9,
        )

        const { width: previewWidth, height: previewHeight } =
          getPreviewDimensions(settings)
        const maxHeight =
          previewHeight * ((settings?.maxImageHeight || 80) / 100)
        const maxWidth = previewWidth * ((settings?.maxImageWidth || 90) / 100)
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

export const processFiles = async (
  files,
  availableImagesLength,
  settings = null,
) => {
  const imageFiles = files
    .filter((file) => SUPPORTED_FORMATS.includes(file.type))
    .sort((a, b) => a.name.localeCompare(b.name))

  if (imageFiles.length === 0) {
    throw new Error(
      'No supported image files found. Please select JPG, PNG, GIF, or WebP files.',
    )
  }

  const processedImages = []
  for (const file of imageFiles) {
    try {
      const imageData = await loadImage(file, settings)
      processedImages.push({
        ...imageData,
        id: `img-${Date.now()}-${Math.random()}`,
        originalIndex: availableImagesLength + processedImages.length,
      })
    } catch (err) {
      console.warn(`Failed to load image ${file.name}:`, err)
    }
  }

  return processedImages
}
