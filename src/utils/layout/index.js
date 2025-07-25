// Re-export all layout utilities for backward compatibility
export { getRandomColor } from './colorUtils.js'
export { previewToMm } from './measurementUtils.js'
export { calculateOptimalLayout, tryLayout } from './layoutCalculationUtils.js'
export {
  normalizeImageHeights,
  arrangeAndCenterImages,
  arrangeSimpleRowWithUniformHeight,
  arrangeImagesOnPage,
} from './imageArrangementUtils.js'
export {
  autoArrangeImages,
  findCorrectInsertPosition,
} from './pageManagementUtils.js'
