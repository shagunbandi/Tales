# Layout Utilities

This directory contains modular layout utilities broken down by functionality:

## Files

### `colorUtils.js`
- **Purpose**: Color-related utilities
- **Exports**: `getRandomColor()`

### `measurementUtils.js`
- **Purpose**: Measurement and conversion utilities
- **Exports**: `previewToMm(px, settings)`

### `layoutCalculationUtils.js`
- **Purpose**: Core layout calculation algorithms
- **Exports**: 
  - `calculateOptimalLayout(images, availableWidth, availableHeight, imageGap)`
  - `tryLayout(images, maxCols, availableWidth, availableHeight, imageGap)`

### `imageArrangementUtils.js`
- **Purpose**: Image positioning and arrangement utilities
- **Exports**:
  - `normalizeImageHeights(images, availableWidth, availableHeight, imageGap)`
  - `arrangeAndCenterImages(images, availableWidth, availableHeight, pageMargin, imageGap)`
  - `arrangeSimpleRowWithUniformHeight(images, availableWidth, availableHeight, pageMargin, imageGap)`
  - `arrangeImagesOnPage(images, settings)`

### `pageManagementUtils.js`
- **Purpose**: Page-level management and auto-arrangement
- **Exports**:
  - `autoArrangeImages(newImages, pages, settings)`
  - `findCorrectInsertPosition(availableImages, originalIndex)`

### `index.js`
- **Purpose**: Re-exports all utilities for easy importing
- **Usage**: `import { getRandomColor, arrangeImagesOnPage } from '../utils/layout/index.js'`

## Backward Compatibility

The original `layoutUtils.js` file now re-exports all utilities from this modular structure, ensuring existing imports continue to work without changes. 