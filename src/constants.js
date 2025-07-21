// Sober color palette as specified
export const COLOR_PALETTE = [
  { name: 'Oxford Blue', color: '#002147' },
  { name: 'Slate Gray', color: '#708090' },
  { name: 'Steel Blue', color: '#4682B4' },
  { name: 'Cornsilk', color: '#FFF8DC' },
  { name: 'Antique White', color: '#FAEBD7' },
  { name: 'Pastel Green', color: '#77DD77' },
  { name: 'Light Khaki', color: '#F0E68C' },
  { name: 'Powder Blue', color: '#B0E0E6' },
]

// Page size configurations
export const PAGE_SIZES = {
  a4: { width: 297, height: 210, name: 'A4' },
  letter: { width: 279, height: 216, name: 'Letter' },
  legal: { width: 356, height: 216, name: 'Legal' },
}

// Default settings
export const DEFAULT_SETTINGS = {
  pageSize: 'a4',
  orientation: 'landscape',
  pageMargin: 20,
  imageGap: 20,
  maxImagesPerPage: 5,
  imageQuality: 0.9,
  maxImageHeight: 80,
  maxImageWidth: 90,
}

// A4 landscape dimensions in mm and px (for preview)
export const A4_WIDTH_MM = 297
export const A4_HEIGHT_MM = 210
export const MARGIN_PX = 20
export const IMAGE_GAP_PX = 10

// Preview dimensions (scaled down for UI)
export const PREVIEW_SCALE = 0.8
export const PREVIEW_WIDTH = 600 * PREVIEW_SCALE
export const PREVIEW_HEIGHT = (210 / 297) * PREVIEW_WIDTH

// Get preview dimensions based on settings
export const getPreviewDimensions = (settings) => {
  const pageSize = PAGE_SIZES[settings?.pageSize || 'a4']
  const isLandscape = settings?.orientation !== 'portrait'

  let width, height
  if (isLandscape) {
    width = pageSize.width
    height = pageSize.height
  } else {
    width = pageSize.height
    height = pageSize.width
  }

  // Convert to preview scale
  const previewWidth = 600 * PREVIEW_SCALE
  const previewHeight = (height / width) * previewWidth

  return { width: previewWidth, height: previewHeight }
}

// Supported image formats
export const SUPPORTED_FORMATS = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
]
