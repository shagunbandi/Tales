export const COLOR_PALETTE = [
  { name: "Oxford Blue", color: "#002147" },
  { name: "Slate Gray", color: "#708090" },
  { name: "Steel Blue", color: "#4682B4" },
  { name: "Cornsilk", color: "#FFF8DC" },
  { name: "Antique White", color: "#FAEBD7" },
  { name: "Pastel Green", color: "#77DD77" },
  { name: "Light Khaki", color: "#F0E68C" },
  { name: "Powder Blue", color: "#B0E0E6" },
  { name: "Pastel Blue", color: "#BFD8FF" },
  { name: "Pale Lavender", color: "#E7D6F7" },
  { name: "Cream", color: "#FFF8E1" },
  { name: "Blush Pink", color: "#F9E0E8" },
  { name: "Light Peach", color: "#FFE5B4" },
  { name: "Sky Gray-Blue", color: "#E3F2FD" },
  { name: "Powder Gray", color: "#E9ECEF" },
  { name: "Lavender Mist", color: "#E6E6FA" },
  { name: "Seafoam Green", color: "#9FE2BF" },
  { name: "Soft Apricot", color: "#FFDAB9" },
  { name: "Light Coral", color: "#F08080" },
  { name: "Pale Turquoise", color: "#AFEEEE" },
  { name: "Honeydew", color: "#F0FFF0" },
  { name: "Misty Rose", color: "#FFE4E1" },
  { name: "Thistle", color: "#D8BFD8" },
  { name: "Alice Blue", color: "#F0F8FF" },
  { name: "Papaya Whip", color: "#FFEFD5" },
  { name: "Lavender Blush", color: "#FFF0F5" },
  { name: "Light Steel Blue", color: "#B0C4DE" },
  { name: "Peach Puff", color: "#FFDAB9" },
  { name: "Sky Blue", color: "#87CEEB" },
  { name: "Light Cyan", color: "#E0FFFF" },
  { name: "Pale Goldenrod", color: "#EEE8AA" },
  { name: "Mint Cream", color: "#F5FFFA" },
  { name: "Seashell", color: "#FFF5EE" },
  { name: "Old Lace", color: "#FDF5E6" },
  { name: "Lemon Chiffon", color: "#FFFACD" },
  { name: "Light Pink", color: "#FFB6C1" },
  { name: "Powder Pink", color: "#FADADD" },
];

export const PAGE_SIZES = {
  a4: { width: 297, height: 210, name: "A4" },
  letter: { width: 279, height: 216, name: "Letter" },
  legal: { width: 356, height: 216, name: "Legal" },
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
};

export const PREVIEW_SCALE = 0.8;

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

export const SUPPORTED_FORMATS = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];
