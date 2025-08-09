import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  nextPageLayout, 
  previousPageLayout, 
  resetPageLayoutState,
  reapplyCurrentLayout,
  getCurrentLayoutInfo
} from '../layoutCycling.js'
import { FULL_COVER_LAYOUT_TYPES } from '../fullCoverLayoutUtils.js'

// Mock the dependencies
vi.mock('../fullCoverLayoutUtils.js', () => ({
  arrangeImagesFullCover: vi.fn(),
  FULL_COVER_LAYOUT_TYPES: {
    GRID: 'grid',
    FLEXIBLE: 'flexible'
  }
}))

vi.mock('../layoutUtils.js', () => ({
  arrangeImages: vi.fn()
}))

vi.mock('../constants.js', () => ({
  getPreviewDimensions: vi.fn(() => ({ width: 600, height: 400 }))
}))

describe('Layout Cycling', () => {
  beforeEach(() => {
    // Clear all layout state before each test
    resetPageLayoutState('test-page')
    resetPageLayoutState('fullcover_test-page')
    vi.clearAllMocks()
  })

  describe('reapplyCurrentLayout', () => {
    const mockImages = [
      { id: '1', naturalWidth: 1920, naturalHeight: 1080 },
      { id: '2', naturalWidth: 1080, naturalHeight: 1920 },
      { id: '3', naturalWidth: 1200, naturalHeight: 1200 }
    ]

    it('should return empty array for empty images', async () => {
      const result = await reapplyCurrentLayout([], { designStyle: 'full_cover' }, 'test-page')
      expect(result).toEqual([])
    })

    it('should return empty array for null images', async () => {
      const result = await reapplyCurrentLayout(null, { designStyle: 'full_cover' }, 'test-page')
      expect(result).toEqual([])
    })

    it('should reapply flexible layout when state exists', async () => {
      const settings = { designStyle: 'full_cover' }
      const pageId = 'test-page'
      
      // First, establish a flexible layout by calling nextLayout
      const { arrangeImagesFullCover } = await import('../fullCoverLayoutUtils.js')
      arrangeImagesFullCover.mockResolvedValue([
        { ...mockImages[0], x: 0, y: 0, previewWidth: 400, previewHeight: 400 },
        { ...mockImages[1], x: 400, y: 0, previewWidth: 200, previewHeight: 200 },
        { ...mockImages[2], x: 400, y: 200, previewWidth: 200, previewHeight: 200 }
      ])
      
      // Cycle through layouts to get to a flexible one
      await nextPageLayout(mockImages, settings, pageId)
      
      // Now test reapplying the current layout with different images
      const newImages = [
        { id: '4', naturalWidth: 800, naturalHeight: 600 },
        { id: '5', naturalWidth: 600, naturalHeight: 800 },
        { id: '6', naturalWidth: 1000, naturalHeight: 1000 }
      ]
      
      const result = await reapplyCurrentLayout(newImages, settings, pageId)
      
      // Should have called arrangeImagesFullCover - check that it was called with the right type of arguments
      expect(arrangeImagesFullCover).toHaveBeenCalledWith(
        expect.any(Array), // Images array
        expect.any(Number), // Width
        expect.any(Number), // Height
        expect.objectContaining({
          designStyle: 'full_cover'
        })
      )
    })

    it('should fallback to returning images if no layout state exists', async () => {
      const settings = { designStyle: 'full_cover' }
      const result = await reapplyCurrentLayout(mockImages, settings, 'non-existent-page')
      
      expect(result).toBe(mockImages)
    })

    it('should handle classic layout reapplication', async () => {
      const settings = { designStyle: 'classic' }
      const { arrangeImages } = await import('../layoutUtils.js')
      arrangeImages.mockResolvedValue([
        { ...mockImages[0], x: 0, y: 0, previewWidth: 200, previewHeight: 200 },
        { ...mockImages[1], x: 200, y: 0, previewWidth: 200, previewHeight: 200 },
        { ...mockImages[2], x: 400, y: 0, previewWidth: 200, previewHeight: 200 }
      ])
      
      // First establish a layout
      await nextPageLayout(mockImages, settings, 'test-page')
      
      // Then reapply it
      const result = await reapplyCurrentLayout(mockImages, settings, 'test-page')
      
      expect(result).toBeDefined()
    })
  })

  describe('Layout State Management', () => {
    it('should track layout state across cycles', async () => {
      const mockImages = [
        { id: '1', naturalWidth: 1920, naturalHeight: 1080 },
        { id: '2', naturalWidth: 1080, naturalHeight: 1920 }
      ]
      const settings = { designStyle: 'full_cover' }
      const pageId = 'test-page'

      const { arrangeImagesFullCover } = await import('../fullCoverLayoutUtils.js')
      arrangeImagesFullCover.mockResolvedValue([
        { ...mockImages[0], x: 0, y: 0, previewWidth: 300, previewHeight: 400 },
        { ...mockImages[1], x: 300, y: 0, previewWidth: 300, previewHeight: 400 }
      ])

      // First layout
      await nextPageLayout(mockImages, settings, pageId)
      let info1 = getCurrentLayoutInfo(`fullcover_${pageId}`)
      
      // Second layout
      await nextPageLayout(mockImages, settings, pageId)
      let info2 = getCurrentLayoutInfo(`fullcover_${pageId}`)

      // Should have different indices
      expect(info1?.currentIndex).not.toBe(info2?.currentIndex)
    })

    it('should reset state correctly', () => {
      const pageId = 'test-page'
      
      // This should not throw
      resetPageLayoutState(pageId)
      resetPageLayoutState(`fullcover_${pageId}`)
      
      const info = getCurrentLayoutInfo(pageId)
      expect(info).toBeNull()
    })
  })

  describe('Flexible Layout Variations', () => {
    it('should generate multiple layout options for different image counts', async () => {
      const settings = { designStyle: 'full_cover' }
      const pageId = 'test-page'

      const { arrangeImagesFullCover } = await import('../fullCoverLayoutUtils.js')
      arrangeImagesFullCover.mockResolvedValue([])

      // Test with 3 images - should have multiple flexible variations
      const threeImages = [
        { id: '1', naturalWidth: 1920, naturalHeight: 1080 },
        { id: '2', naturalWidth: 1080, naturalHeight: 1920 },
        { id: '3', naturalWidth: 1200, naturalHeight: 1200 }
      ]

      await nextPageLayout(threeImages, settings, pageId)
      const info = getCurrentLayoutInfo(`fullcover_${pageId}`)
      
      expect(info?.totalLayouts).toBeGreaterThan(1)
    })

    it('should cycle through both grid and flexible layouts', async () => {
      const settings = { designStyle: 'full_cover' }
      const pageId = 'test-page'
      
      const mockImages = [
        { id: '1', naturalWidth: 1920, naturalHeight: 1080 },
        { id: '2', naturalWidth: 1080, naturalHeight: 1920 },
        { id: '3', naturalWidth: 1200, naturalHeight: 1200 },
        { id: '4', naturalWidth: 800, naturalHeight: 600 }
      ]

      const { arrangeImagesFullCover } = await import('../fullCoverLayoutUtils.js')
      arrangeImagesFullCover.mockResolvedValue([])

      // Cycle through multiple layouts
      await nextPageLayout(mockImages, settings, pageId)
      const info1 = getCurrentLayoutInfo(`fullcover_${pageId}`)
      
      await nextPageLayout(mockImages, settings, pageId)
      const info2 = getCurrentLayoutInfo(`fullcover_${pageId}`)
      
      await nextPageLayout(mockImages, settings, pageId)
      const info3 = getCurrentLayoutInfo(`fullcover_${pageId}`)

      // Should be different layouts
      expect(info1?.currentIndex).not.toBe(info2?.currentIndex)
      expect(info2?.currentIndex).not.toBe(info3?.currentIndex)
    })
  })

  describe('Error Handling', () => {
    it('should handle arrangeImagesFullCover errors gracefully', async () => {
      const settings = { designStyle: 'full_cover' }
      const mockImages = [{ id: '1', naturalWidth: 1920, naturalHeight: 1080 }]

      const { arrangeImagesFullCover } = await import('../fullCoverLayoutUtils.js')
      arrangeImagesFullCover.mockRejectedValue(new Error('Layout failed'))

      // Should not throw
      const result = await reapplyCurrentLayout(mockImages, settings, 'test-page')
      expect(result).toBe(mockImages) // Should fallback to original images
    })

    it('should handle missing layout state gracefully', async () => {
      const settings = { designStyle: 'full_cover' }
      const mockImages = [{ id: '1', naturalWidth: 1920, naturalHeight: 1080 }]

      const result = await reapplyCurrentLayout(mockImages, settings, 'non-existent-page')
      expect(result).toBe(mockImages)
    })
  })
})