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

// A4 landscape dimensions in mm and px (for preview)
export const A4_WIDTH_MM = 297
export const A4_HEIGHT_MM = 210
export const MARGIN_PX = 20
export const IMAGE_GAP_PX = 10

// Preview dimensions (scaled down for UI)
export const PREVIEW_SCALE = 0.8
export const PREVIEW_WIDTH = 600 * PREVIEW_SCALE
export const PREVIEW_HEIGHT = (210 / 297) * PREVIEW_WIDTH

// Supported image formats
export const SUPPORTED_FORMATS = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
]
