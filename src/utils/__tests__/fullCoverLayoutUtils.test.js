import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  arrangeImagesFullCover,
  FULL_COVER_LAYOUT_TYPES
} from '../fullCoverLayoutUtils.js'

// Mock the dependencies
vi.mock('../constants.js', () => ({
  getPreviewDimensions: vi.fn(() => ({ width: 600, height: 400 })),
  PAGE_SIZES: {
    a4: { width: 297, height: 210, name: "A4" }
  }
}))

vi.mock('../imageCropUtils.js', () => ({
  cropForFullCover: vi.fn(),
  cropImagesForGrid: vi.fn()
}))

describe('Full Cover Layout Utils', () => {
  const mockImages = [
    { id: '1', naturalWidth: 1920, naturalHeight: 1080 },
    { id: '2', naturalWidth: 1080, naturalHeight: 1920 },
    { id: '3', naturalWidth: 1200, naturalHeight: 1200 },
    { id: '4', naturalWidth: 800, naturalHeight: 600 },
    { id: '5', naturalWidth: 600, naturalHeight: 800 },
    { id: '6', naturalWidth: 1000, naturalHeight: 1000 }
  ]

  describe('arrangeImagesFullCover', () => {
    it('should return empty array for no images', async () => {
      const result = await arrangeImagesFullCover([], 600, 400, {})
      expect(result).toEqual([])
    })

    it('should return empty array for null images', async () => {
      const result = await arrangeImagesFullCover(null, 600, 400, {})
      expect(result).toEqual([])
    })

    it('should use grid layout by default', async () => {
      const settings = {}
      const result = await arrangeImagesFullCover(
        mockImages.slice(0, 4), 
        600, 
        400, 
        settings
      )

      expect(result).toHaveLength(4)
      expect(result[0]).toHaveProperty('x')
      expect(result[0]).toHaveProperty('y')
      expect(result[0]).toHaveProperty('previewWidth')
      expect(result[0]).toHaveProperty('previewHeight')
      expect(result[0]).toHaveProperty('fullCoverMode', true)
    })

    it('should use flexible layout when specified', async () => {
      const settings = {
        _fullCoverLayoutType: FULL_COVER_LAYOUT_TYPES.FLEXIBLE,
        _forcedFlexibleLayout: 0
      }
      const result = await arrangeImagesFullCover(
        mockImages.slice(0, 3), 
        600, 
        400, 
        settings
      )

      expect(result).toHaveLength(3)
      // Flexible layouts should have varying dimensions
      const widths = result.map(img => img.previewWidth)
      const heights = result.map(img => img.previewHeight)
      
      // At least one image should have different dimensions
      const uniqueWidths = [...new Set(widths)]
      const uniqueHeights = [...new Set(heights)]
      expect(uniqueWidths.length + uniqueHeights.length).toBeGreaterThan(2)
    })

    it('should fill entire page area', async () => {
      const pageWidth = 600
      const pageHeight = 400
      const result = await arrangeImagesFullCover(
        mockImages.slice(0, 4), 
        pageWidth, 
        pageHeight, 
        {}
      )

      // Calculate total area covered
      const totalArea = result.reduce((sum, img) => {
        return sum + (img.previewWidth * img.previewHeight)
      }, 0)

      const pageArea = pageWidth * pageHeight
      expect(totalArea).toBe(pageArea) // Should cover exactly the page area
    })

    it('should handle single image correctly', async () => {
      const settings = {
        _fullCoverLayoutType: FULL_COVER_LAYOUT_TYPES.FLEXIBLE
      }
      const result = await arrangeImagesFullCover(
        [mockImages[0]], 
        600, 
        400, 
        settings
      )

      expect(result).toHaveLength(1)
      expect(result[0].x).toBe(0)
      expect(result[0].y).toBe(0)
      expect(result[0].previewWidth).toBe(600)
      expect(result[0].previewHeight).toBe(400)
    })
  })

  describe('Grid Templates Validation', () => {
    it('should not have overlapping assignments', async () => {
      // Test various image counts to ensure no overlaps
      for (let count = 2; count <= 6; count++) {
        const testImages = mockImages.slice(0, count)
        const settings = {
          _fullCoverLayoutType: FULL_COVER_LAYOUT_TYPES.FLEXIBLE
        }
        
        // Test multiple flexible layout variations
        for (let layoutIndex = 0; layoutIndex < 3; layoutIndex++) {
          settings._forcedFlexibleLayout = layoutIndex
          
          const result = await arrangeImagesFullCover(
            testImages, 
            600, 
            400, 
            settings
          )

          // Should return correct number of images
          expect(result.length).toBe(count)
          
          // Check for overlaps by examining gridSpan if available
          if (result[0].gridSpan) {
            const occupiedCells = new Set()
            
            result.forEach(img => {
              const span = img.gridSpan
              if (span) {
                for (let r = span.rowStart; r < span.rowEnd; r++) {
                  for (let c = span.colStart; c < span.colEnd; c++) {
                    const cellKey = `${r},${c}`
                    expect(occupiedCells.has(cellKey)).toBe(false)
                    occupiedCells.add(cellKey)
                  }
                }
              }
            })
          }
        }
      }
    })

    it('should maintain image order', async () => {
      const result = await arrangeImagesFullCover(
        mockImages.slice(0, 4), 
        600, 
        400, 
        {}
      )

      expect(result[0].id).toBe('1')
      expect(result[1].id).toBe('2')
      expect(result[2].id).toBe('3')
      expect(result[3].id).toBe('4')
    })

    it('should handle forced layout correctly', async () => {
      const settings = {
        _forcedLayout: [2, 2] // 2x2 grid
      }
      const result = await arrangeImagesFullCover(
        mockImages.slice(0, 4), 
        600, 
        400, 
        settings
      )

      expect(result).toHaveLength(4)
      
      // Should arrange in 2x2 pattern
      const positions = result.map(img => ({ x: img.x, y: img.y }))
      const uniqueX = [...new Set(positions.map(p => p.x))]
      const uniqueY = [...new Set(positions.map(p => p.y))]
      
      expect(uniqueX).toHaveLength(2) // 2 columns
      expect(uniqueY).toHaveLength(2) // 2 rows
    })
  })

  describe('Flexible Layout Variations', () => {
    it('should generate different layouts for 2 images', async () => {
      const twoImages = mockImages.slice(0, 2)
      const layouts = []
      
      // Test multiple flexible variations
      for (let i = 0; i < 3; i++) {
        const settings = {
          _fullCoverLayoutType: FULL_COVER_LAYOUT_TYPES.FLEXIBLE,
          _forcedFlexibleLayout: i
        }
        
        const result = await arrangeImagesFullCover(twoImages, 600, 400, settings)
        layouts.push(result)
      }

      // Each layout should be different
      expect(layouts).toHaveLength(3)
      
      // At least some layouts should have different arrangements
      const firstLayout = layouts[0]
      const hasVariation = layouts.some(layout => {
        return layout[0].x !== firstLayout[0].x || 
               layout[0].y !== firstLayout[0].y ||
               layout[0].previewWidth !== firstLayout[0].previewWidth ||
               layout[0].previewHeight !== firstLayout[0].previewHeight
      })
      
      expect(hasVariation).toBe(true)
    })

    it('should generate different layouts for 3 images', async () => {
      const threeImages = mockImages.slice(0, 3)
      const layouts = []
      
      // Test multiple flexible variations
      for (let i = 0; i < 4; i++) {
        const settings = {
          _fullCoverLayoutType: FULL_COVER_LAYOUT_TYPES.FLEXIBLE,
          _forcedFlexibleLayout: i
        }
        
        const result = await arrangeImagesFullCover(threeImages, 600, 400, settings)
        layouts.push(result)
      }

      expect(layouts).toHaveLength(4)
      
      // Should have variations in large image placement
      const largestImagePositions = layouts.map(layout => {
        // Find the image with largest area
        let largestImg = layout[0]
        let largestArea = layout[0].previewWidth * layout[0].previewHeight
        
        layout.forEach(img => {
          const area = img.previewWidth * img.previewHeight
          if (area > largestArea) {
            largestArea = area
            largestImg = img
          }
        })
        
        return { x: largestImg.x, y: largestImg.y, area: largestArea }
      })

      // At least some layouts should have the large image in different positions
      const uniquePositions = new Set(
        largestImagePositions.map(pos => `${pos.x},${pos.y}`)
      )
      expect(uniquePositions.size).toBeGreaterThan(1)
    })

    it('should handle 6 images with multiple variations', async () => {
      const settings = {
        _fullCoverLayoutType: FULL_COVER_LAYOUT_TYPES.FLEXIBLE
      }
      
      // Test that we can generate multiple layouts for 6 images
      for (let i = 0; i < 5; i++) {
        settings._forcedFlexibleLayout = i
        
        const result = await arrangeImagesFullCover(mockImages, 600, 400, settings)
        
        expect(result).toHaveLength(6)
        
        // Should fill entire page
        const totalArea = result.reduce((sum, img) => {
          return sum + (img.previewWidth * img.previewHeight)
        }, 0)
        
        expect(totalArea).toBe(600 * 400)
      }
    })
  })

  describe('Edge Cases', () => {
    it('should handle images with missing dimensions', async () => {
      const imagesWithMissingDims = [
        { id: '1' }, // No dimensions
        { id: '2', naturalWidth: 1920 }, // Missing height
        { id: '3', naturalHeight: 1080 } // Missing width
      ]
      
      const result = await arrangeImagesFullCover(
        imagesWithMissingDims, 
        600, 
        400, 
        { _fullCoverLayoutType: FULL_COVER_LAYOUT_TYPES.FLEXIBLE }
      )
      
      expect(result).toHaveLength(3)
      // Should still assign positions and dimensions
      result.forEach(img => {
        expect(img.x).toBeDefined()
        expect(img.y).toBeDefined()
        expect(img.previewWidth).toBeGreaterThan(0)
        expect(img.previewHeight).toBeGreaterThan(0)
      })
    })

    it('should handle zero dimensions gracefully', async () => {
      const result = await arrangeImagesFullCover(mockImages.slice(0, 2), 0, 0, {})
      
      expect(result).toHaveLength(2)
      result.forEach(img => {
        expect(img.previewWidth).toBe(0)
        expect(img.previewHeight).toBe(0)
      })
    })
  })
})