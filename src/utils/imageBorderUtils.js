/**
 * Utility functions for determining which borders should be applied to images
 * Borders act as dividers between adjacent images, not as frames around each image
 */

/**
 * Determines which edges of an image should have borders
 * Only edges adjacent to other images get borders, not edges touching page boundaries
 * 
 * @param {Object} image - The image object with x, y, previewWidth, previewHeight
 * @param {Array} allImages - All images on the page
 * @param {Object} pageDimensions - Page dimensions {width, height}
 * @param {number} tolerance - Tolerance in pixels for edge adjacency detection (default: 1)
 * @returns {Object} - { top, right, bottom, left } boolean flags indicating which borders to apply
 */
export const getImageBorderEdges = (image, allImages, pageDimensions, tolerance = 1) => {
  if (!image || !allImages || !pageDimensions) {
    return { top: false, right: false, bottom: false, left: false };
  }

  const imgLeft = image.x ?? 0;
  const imgTop = image.y ?? 0;
  const imgRight = imgLeft + (image.previewWidth ?? 0);
  const imgBottom = imgTop + (image.previewHeight ?? 0);

  // Check if edges are at page boundaries
  const atPageLeft = Math.abs(imgLeft - 0) <= tolerance;
  const atPageTop = Math.abs(imgTop - 0) <= tolerance;
  const atPageRight = Math.abs(imgRight - pageDimensions.width) <= tolerance;
  const atPageBottom = Math.abs(imgBottom - pageDimensions.height) <= tolerance;

  // Find adjacent images for each edge
  const hasAdjacentImageOnLeft = !atPageLeft && allImages.some(otherImg => {
    if (otherImg.id === image.id) return false;
    const otherRight = (otherImg.x ?? 0) + (otherImg.previewWidth ?? 0);
    const otherTop = otherImg.y ?? 0;
    const otherBottom = otherTop + (otherImg.previewHeight ?? 0);
    
    // Check if other image's right edge touches this image's left edge
    const edgesAlign = Math.abs(otherRight - imgLeft) <= tolerance;
    // Check if they overlap vertically
    const verticalOverlap = !(otherBottom <= imgTop || otherTop >= imgBottom);
    
    return edgesAlign && verticalOverlap;
  });

  const hasAdjacentImageOnTop = !atPageTop && allImages.some(otherImg => {
    if (otherImg.id === image.id) return false;
    const otherBottom = (otherImg.y ?? 0) + (otherImg.previewHeight ?? 0);
    const otherLeft = otherImg.x ?? 0;
    const otherRight = otherLeft + (otherImg.previewWidth ?? 0);
    
    // Check if other image's bottom edge touches this image's top edge
    const edgesAlign = Math.abs(otherBottom - imgTop) <= tolerance;
    // Check if they overlap horizontally
    const horizontalOverlap = !(otherRight <= imgLeft || otherLeft >= imgRight);
    
    return edgesAlign && horizontalOverlap;
  });

  const hasAdjacentImageOnRight = !atPageRight && allImages.some(otherImg => {
    if (otherImg.id === image.id) return false;
    const otherLeft = otherImg.x ?? 0;
    const otherTop = otherImg.y ?? 0;
    const otherBottom = otherTop + (otherImg.previewHeight ?? 0);
    
    // Check if other image's left edge touches this image's right edge
    const edgesAlign = Math.abs(otherLeft - imgRight) <= tolerance;
    // Check if they overlap vertically
    const verticalOverlap = !(otherBottom <= imgTop || otherTop >= imgBottom);
    
    return edgesAlign && verticalOverlap;
  });

  const hasAdjacentImageOnBottom = !atPageBottom && allImages.some(otherImg => {
    if (otherImg.id === image.id) return false;
    const otherTop = otherImg.y ?? 0;
    const otherLeft = otherImg.x ?? 0;
    const otherRight = otherLeft + (otherImg.previewWidth ?? 0);
    
    // Check if other image's top edge touches this image's bottom edge
    const edgesAlign = Math.abs(otherTop - imgBottom) <= tolerance;
    // Check if they overlap horizontally
    const horizontalOverlap = !(otherRight <= imgLeft || otherLeft >= imgRight);
    
    return edgesAlign && horizontalOverlap;
  });

  return {
    top: hasAdjacentImageOnTop,
    right: hasAdjacentImageOnRight,
    bottom: hasAdjacentImageOnBottom,
    left: hasAdjacentImageOnLeft,
  };
};

/**
 * Converts border edges to CSS border string
 * @param {Object} borderEdges - { top, right, bottom, left } boolean flags
 * @param {number} borderWidthPx - Border width in pixels
 * @param {string} borderColor - Border color
 * @returns {string} - CSS border string
 */
export const getBorderStyle = (borderEdges, borderWidthPx, borderColor) => {
  if (!borderEdges || borderWidthPx <= 0) {
    return 'none';
  }

  const parts = [];
  if (borderEdges.top) parts.push(`border-top: ${borderWidthPx}px solid ${borderColor}`);
  if (borderEdges.right) parts.push(`border-right: ${borderWidthPx}px solid ${borderColor}`);
  if (borderEdges.bottom) parts.push(`border-bottom: ${borderWidthPx}px solid ${borderColor}`);
  if (borderEdges.left) parts.push(`border-left: ${borderWidthPx}px solid ${borderColor}`);

  return parts.length > 0 ? parts.join('; ') : 'none';
};

/**
 * Gets individual border properties for inline styles
 * @param {Object} borderEdges - { top, right, bottom, left } boolean flags
 * @param {number} borderWidthPx - Border width in pixels
 * @param {string} borderColor - Border color
 * @returns {Object} - Object with borderTop, borderRight, borderBottom, borderLeft properties
 */
export const getBorderStyleObject = (borderEdges, borderWidthPx, borderColor) => {
  if (!borderEdges || borderWidthPx <= 0) {
    return {};
  }

  const style = {};
  const borderValue = `${borderWidthPx}px solid ${borderColor}`;
  
  if (borderEdges.top) style.borderTop = borderValue;
  if (borderEdges.right) style.borderRight = borderValue;
  if (borderEdges.bottom) style.borderBottom = borderValue;
  if (borderEdges.left) style.borderLeft = borderValue;

  return style;
};

