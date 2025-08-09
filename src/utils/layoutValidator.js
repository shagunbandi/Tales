/**
 * Layout validation utility to identify and fix problematic hardcoded layouts
 */

/**
 * Check if a layout has excessive empty spaces
 * @param {Object} layout - Layout configuration
 * @returns {Object} Validation result with details
 */
export function validateLayoutEfficiency(layout) {
  const { grid, positions } = layout;
  const totalGridSpaces = grid.rows * grid.cols;
  const imageCount = positions.length;
  
  // Calculate how many grid cells are actually used (including spans)
  const occupiedCells = new Set();
  
  positions.forEach(pos => {
    for (let r = pos.row; r < pos.row + pos.rowSpan; r++) {
      for (let c = pos.col; c < pos.col + pos.colSpan; c++) {
        occupiedCells.add(`${r}-${c}`);
      }
    }
  });
  
  const usedSpaces = occupiedCells.size;
  const emptySpaces = totalGridSpaces - usedSpaces;
  const efficiencyRatio = usedSpaces / totalGridSpaces;
  
  return {
    totalGridSpaces,
    usedSpaces,
    emptySpaces,
    imageCount,
    efficiencyRatio,
    isEfficient: efficiencyRatio >= 0.7, // At least 70% efficiency
    hasExcessiveEmptySpace: emptySpaces > imageCount * 0.5 // More than 50% extra empty spaces per image
  };
}

/**
 * Check for overlapping positions in a layout
 * @param {Object} layout - Layout configuration
 * @returns {Object} Validation result
 */
export function validateNoOverlaps(layout) {
  const { positions } = layout;
  const occupiedCells = new Map(); // cell -> imageIndex
  const overlaps = [];
  
  positions.forEach(pos => {
    for (let r = pos.row; r < pos.row + pos.rowSpan; r++) {
      for (let c = pos.col; c < pos.col + pos.colSpan; c++) {
        const cellKey = `${r}-${c}`;
        
        if (occupiedCells.has(cellKey)) {
          overlaps.push({
            cell: cellKey,
            image1: occupiedCells.get(cellKey),
            image2: pos.imageIndex
          });
        } else {
          occupiedCells.set(cellKey, pos.imageIndex);
        }
      }
    }
  });
  
  return {
    hasOverlaps: overlaps.length > 0,
    overlaps
  };
}

/**
 * Validate a complete layout
 * @param {Object} layout - Layout configuration
 * @returns {Object} Complete validation result
 */
export function validateLayout(layout) {
  const efficiency = validateLayoutEfficiency(layout);
  const overlaps = validateNoOverlaps(layout);
  
  return {
    id: layout.id,
    name: layout.name,
    isValid: !overlaps.hasOverlaps && efficiency.isEfficient && !efficiency.hasExcessiveEmptySpace,
    issues: {
      hasOverlaps: overlaps.hasOverlaps,
      hasExcessiveEmptySpace: efficiency.hasExcessiveEmptySpace,
      lowEfficiency: !efficiency.isEfficient
    },
    details: {
      efficiency,
      overlaps
    }
  };
}

/**
 * Validate all layouts and return problematic ones
 * @param {Object} layouts - HARDCODED_LAYOUTS object
 * @returns {Object} Validation results
 */
export function validateAllLayouts(layouts) {
  const results = {
    valid: [],
    invalid: [],
    summary: {
      total: 0,
      validCount: 0,
      invalidCount: 0
    }
  };
  
  Object.keys(layouts).forEach(paperSize => {
    Object.keys(layouts[paperSize]).forEach(imageCount => {
      layouts[paperSize][imageCount].forEach(layout => {
        const validation = validateLayout(layout);
        results.summary.total++;
        
        if (validation.isValid) {
          results.valid.push(validation);
          results.summary.validCount++;
        } else {
          results.invalid.push(validation);
          results.summary.invalidCount++;
        }
      });
    });
  });
  
  return results;
}

/**
 * Filter out invalid layouts from the layouts object
 * @param {Object} layouts - HARDCODED_LAYOUTS object
 * @returns {Object} Cleaned layouts object
 */
export function filterValidLayouts(layouts) {
  const cleaned = {};
  
  Object.keys(layouts).forEach(paperSize => {
    cleaned[paperSize] = {};
    
    Object.keys(layouts[paperSize]).forEach(imageCount => {
      const validLayouts = layouts[paperSize][imageCount].filter(layout => {
        const validation = validateLayout(layout);
        return validation.isValid;
      });
      
      if (validLayouts.length > 0) {
        cleaned[paperSize][imageCount] = validLayouts;
      }
    });
  });
  
  return cleaned;
}