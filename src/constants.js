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

export const PAGE_SIZES = {
  a4: { width: 297, height: 210, name: 'A4' },
  letter: { width: 279, height: 216, name: 'Letter' },
  legal: { width: 356, height: 216, name: 'Legal' },
}

export const DEFAULT_SETTINGS = {
  pageSize: 'a4',
  orientation: 'landscape',
  pageMargin: 20,
  imageGap: 10,
  imageQuality: 0.9,
  maxImagesPerRow: 3,
  maxNumberOfRows: 2,
  minImagesPerRow: 0,
  minNumberOfRows: 0,
}

export const PREVIEW_SCALE = 0.8

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

  const previewWidth = 600 * PREVIEW_SCALE
  const previewHeight = (height / width) * previewWidth

  return { width: previewWidth, height: previewHeight }
}

export const SUPPORTED_FORMATS = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
]
