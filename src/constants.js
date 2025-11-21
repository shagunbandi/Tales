export const COLOR_PALETTE = [
  // Darks
  { name: "Black", color: "#000000" },
  { name: "Oxford Blue", color: "#002147" },
  { name: "Slate Gray", color: "#708090" },
  { name: "Steel Blue", color: "#4682B4" },
  { name: "Sky Blue", color: "#87CEEB" },
  { name: "Pastel Green", color: "#77DD77" },
  { name: "Seafoam Green", color: "#9FE2BF" },
  { name: "Pale Turquoise", color: "#AFEEEE" },
  { name: "Pastel Blue", color: "#BFD8FF" },
  { name: "Light Steel Blue", color: "#B0C4DE" },
  { name: "Powder Blue", color: "#B0E0E6" },
  { name: "Lavender Mist", color: "#E6E6FA" },
  { name: "Thistle", color: "#D8BFD8" },
  { name: "Pale Lavender", color: "#E7D6F7" },

  // Mids
  { name: "Powder Gray", color: "#E9ECEF" },
  { name: "Sky Gray-Blue", color: "#E3F2FD" },
  { name: "Light Cyan", color: "#E0FFFF" },
  { name: "Light Khaki", color: "#F0E68C" },
  { name: "Pale Goldenrod", color: "#EEE8AA" },
  { name: "Light Pink", color: "#FFB6C1" },
  { name: "Light Coral", color: "#F08080" },
  { name: "Powder Pink", color: "#FADADD" },
  { name: "Blush Pink", color: "#F9E0E8" },

  // Lights and Pastels
  { name: "Honeydew", color: "#F0FFF0" },
  { name: "Alice Blue", color: "#F0F8FF" },
  { name: "Mint Cream", color: "#F5FFFA" },
  { name: "Old Lace", color: "#FDF5E6" },
  { name: "Cornsilk", color: "#FFF8DC" },
  { name: "Antique White", color: "#FAEBD7" },
  { name: "Cream", color: "#FFF8E1" },
  { name: "Peach Puff", color: "#FFDAB9" },
  { name: "Papaya Whip", color: "#FFEFD5" },
  { name: "Soft Apricot", color: "#FFDAB9" },
  { name: "Light Peach", color: "#FFE5B4" },
  { name: "Misty Rose", color: "#FFE4E1" },
  { name: "Lavender Blush", color: "#FFF0F5" },
  { name: "Lemon Chiffon", color: "#FFFACD" },
  { name: "Seashell", color: "#FFF5EE" },
  { name: "White", color: "#FFFFFF" },
];

export const PAGE_SIZES = {
  a4: { width: 297, height: 210, name: "A4" },
  a3: { width: 420, height: 297, name: "A3" },
  letter: { width: 279, height: 216, name: "Letter" },
  legal: { width: 356, height: 216, name: "Legal" },
};

export const ORIENTATIONS = {
  LANDSCAPE: "landscape",
  PORTRAIT: "portrait",
};

export const ORIENTATION_LABELS = {
  [ORIENTATIONS.LANDSCAPE]: "Landscape",
  [ORIENTATIONS.PORTRAIT]: "Portrait",
};

export const PAGE_SIZE_LABELS = {
  a4: "A4",
  a3: "A3", 
  letter: "Letter",
  legal: "Legal",
};

export const DESIGN_STYLES = {
  CLASSIC: "classic",
  FULL_COVER: "full_cover",
};

export const DESIGN_STYLE_LABELS = {
  [DESIGN_STYLES.CLASSIC]: "Classic",
  [DESIGN_STYLES.FULL_COVER]: "Full Cover",
};

export const DESIGN_STYLE_DESCRIPTIONS = {
  [DESIGN_STYLES.CLASSIC]: "Traditional layout with gaps and margins",
  [DESIGN_STYLES.FULL_COVER]: "Images cover the entire page without gaps",
};

export const DEFAULT_SETTINGS = {
  pageSize: "a4",
  orientation: "landscape",
  designStyle: DESIGN_STYLES.CLASSIC,
  pageMargin: 20,
  imageGap: 10,
  imageQuality: 0.9,
  maxImagesPerRow: 4,
  maxNumberOfRows: 4,
  maxNumberOfPages: 4,
  imagesPerPage: 10,
  _fullCoverLayoutType: "hardcoded", // Use hardcoded layouts for full cover mode
  pictureBorderWidth: 0, // Border width in mm for borders around individual pictures (0 = no border)
  fullCoverBorderColor: "#FFFFFF", // Border color for full cover images (deprecated - use per-page imageBorderColor)
  pageBorderWidth: 0, // Page border width in mm - creates a frame around entire page content (full cover mode only)
};

export const PREVIEW_SCALE = 0.8;

export const getHardcodedLayoutsKey = (pageSize) => {
  const mapping = {
    'a4': 'A4',
    'a3': 'A3', 
    'letter': 'Letter',
    'legal': 'Legal'
  };
  return mapping[pageSize] || 'A4';
};

export const getPreviewDimensions = (settings) => {
  const pageSize = PAGE_SIZES[settings?.pageSize || "a4"];
  const isLandscape = settings?.orientation !== "portrait";

  let width, height;
  if (isLandscape) {
    width = pageSize.width;
    height = pageSize.height;
  } else {
    width = pageSize.height;
    height = pageSize.width;
  }

  const previewWidth = 600 * PREVIEW_SCALE;
  const previewHeight = (height / width) * previewWidth;

  return { width: previewWidth, height: previewHeight };
};

/**
 * Converts page border width from mm to preview pixels
 * @param {Object} settings - The current settings object
 * @param {boolean} borderEnabled - Whether border is enabled for this page (optional, defaults to true)
 * @returns {number} The border width in preview pixels
 */
export const getPreviewBorderWidth = (settings, borderEnabled = true) => {
  if (!settings || settings.designStyle !== DESIGN_STYLES.FULL_COVER || !borderEnabled) {
    return 0;
  }
  
  const borderWidthMm = settings.pageBorderWidth || 0;
  if (borderWidthMm <= 0) {
    return 0;
  }

  const pageSize = PAGE_SIZES[settings.pageSize || "a4"];
  const isLandscape = settings.orientation !== "portrait";
  const pageSizeWidth = isLandscape ? pageSize.width : pageSize.height;
  
  const previewDimensions = getPreviewDimensions(settings);
  const mmToPreviewPx = previewDimensions.width / pageSizeWidth;
  
  const borderWidthPx = borderWidthMm * mmToPreviewPx;
  
  return borderWidthPx;
};

export const SUPPORTED_FORMATS = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];
