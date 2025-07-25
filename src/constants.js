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

export const LAYOUT_CONSTRAINTS = {
  MAX_IMAGE_HEIGHT_RATIO: 0.8,
  MAX_IMAGE_WIDTH_RATIO: 0.9,
  IMAGE_GAP_RATIO: 0.5,
  MAX_COLUMNS: 2,
  IMAGES_PER_ROW: 3,
  NUMBER_OF_ROWS: 2,
}

export const DEFAULT_SETTINGS = {
  pageSize: 'a4',
  orientation: 'landscape',
  pageMargin: 20,
  imageGap: 10,
  maxImagesPerPage: 6,
  imageQuality: 0.9,
  maxImageHeight: 80,
  maxImageWidth: 90,
  maxImageHeightRatio: LAYOUT_CONSTRAINTS.MAX_IMAGE_HEIGHT_RATIO,
  maxImageWidthRatio: LAYOUT_CONSTRAINTS.MAX_IMAGE_WIDTH_RATIO,
  imageGapRatio: LAYOUT_CONSTRAINTS.IMAGE_GAP_RATIO,
}

export const A4_WIDTH_MM = 297
export const A4_HEIGHT_MM = 210
export const MARGIN_PX = 20
export const IMAGE_GAP_PX = 10

export const PREVIEW_SCALE = 0.8
export const PREVIEW_WIDTH = 600 * PREVIEW_SCALE
export const PREVIEW_HEIGHT = (210 / 297) * PREVIEW_WIDTH

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
