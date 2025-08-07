// E2E Tests for Image Resizing and Cropping
// Tests cover: image editing modal, cropping functionality, resize operations, aspect ratio handling, and quality preservation

describe('Image Resizing and Cropping', () => {
  beforeEach(() => {
    cy.clearAllData()
    cy.visitTales()
    
    // Setup: Upload images and navigate to design tab
    cy.navigateToTab('upload')
    cy.uploadTestImages(4)
    cy.selectDesignStyle('classic')
    cy.navigateToTab('settings')
    cy.get('[data-testid="next-to-design-button"]').click()
    
    // Place images on pages for editing
    cy.dragImageToPage(0, 0)
    cy.dragImageToPage(0, 0)
  })

  describe('Image Edit Modal Access', () => {
    it('should open image edit modal when clicking on image', () => {
      cy.get('[data-testid="page-0"]').within(() => {
        cy.get('[data-testid^="page-image-"]').first().click()
      })
      
      // Image edit modal should open
      cy.get('[data-testid="image-edit-modal"]').should('be.visible')
      cy.get('[data-testid="image-editor-canvas"]').should('be.visible')
      cy.get('[data-testid="crop-controls"]').should('be.visible')
      cy.get('[data-testid="resize-controls"]').should('be.visible')
    })

    it('should open edit modal from available images', () => {
      cy.get('[data-testid="available-images"]').within(() => {
        cy.get('[data-testid^="available-image-"]').first().within(() => {
          cy.get('[data-testid="edit-image-button"]').click()
        })
      })
      
      cy.get('[data-testid="image-edit-modal"]').should('be.visible')
    })

    it('should show image details in edit modal', () => {
      cy.get('[data-testid="page-0"]').within(() => {
        cy.get('[data-testid^="page-image-"]').first().click()
      })
      
      cy.get('[data-testid="image-edit-modal"]').within(() => {
        cy.get('[data-testid="image-dimensions"]').should('contain', 'x')
        cy.get('[data-testid="image-size"]').should('contain', 'KB')
        cy.get('[data-testid="image-format"]').should('be.visible')
      })
    })

    it('should close modal with escape key or close button', () => {
      cy.get('[data-testid="page-0"]').within(() => {
        cy.get('[data-testid^="page-image-"]').first().click()
      })
      
      // Close with escape
      cy.get('body').type('{esc}')
      cy.get('[data-testid="image-edit-modal"]').should('not.exist')
      
      // Reopen and close with button
      cy.get('[data-testid="page-0"]').within(() => {
        cy.get('[data-testid^="page-image-"]').first().click()
      })
      cy.get('[data-testid="close-edit-modal-button"]').click()
      cy.get('[data-testid="image-edit-modal"]').should('not.exist')
    })
  })

  describe('Image Cropping Functionality', () => {
    beforeEach(() => {
      // Open edit modal
      cy.get('[data-testid="page-0"]').within(() => {
        cy.get('[data-testid^="page-image-"]').first().click()
      })
    })

    it('should display crop overlay on image', () => {
      cy.get('[data-testid="crop-overlay"]').should('be.visible')
      cy.get('[data-testid="crop-handles"]').should('have.length', 8) // 4 corners + 4 sides
      cy.get('[data-testid="crop-selection-area"]').should('be.visible')
    })

    it('should allow dragging crop handles to resize selection', () => {
      // Get initial crop area
      cy.get('[data-testid="crop-selection-area"]').then($area => {
        const initialWidth = $area.width()
        const initialHeight = $area.height()
        
        // Drag corner handle to resize
        cy.get('[data-testid="crop-handle-se"]') // Southeast corner
          .trigger('mousedown', { which: 1 })
          .trigger('mousemove', { clientX: 100, clientY: 100 })
          .trigger('mouseup')
        
        // Crop area should have changed
        cy.get('[data-testid="crop-selection-area"]').should(($newArea) => {
          expect($newArea.width()).to.not.equal(initialWidth)
          expect($newArea.height()).to.not.equal(initialHeight)
        })
      })
    })

    it('should allow moving crop selection area', () => {
      // Get initial position
      cy.get('[data-testid="crop-selection-area"]').then($area => {
        const initialLeft = parseInt($area.css('left'))
        const initialTop = parseInt($area.css('top'))
        
        // Drag selection area to move
        cy.get('[data-testid="crop-selection-area"]')
          .trigger('mousedown', { which: 1 })
          .trigger('mousemove', { clientX: 50, clientY: 50 })
          .trigger('mouseup')
        
        // Position should have changed
        cy.get('[data-testid="crop-selection-area"]').should(($newArea) => {
          expect(parseInt($newArea.css('left'))).to.not.equal(initialLeft)
          expect(parseInt($newArea.css('top'))).to.not.equal(initialTop)
        })
      })
    })

    it('should provide preset aspect ratio options', () => {
      cy.get('[data-testid="aspect-ratio-controls"]').should('be.visible')
      
      // Test different aspect ratios
      cy.get('[data-testid="aspect-ratio-1-1"]').click() // Square
      cy.get('[data-testid="crop-selection-area"]').should('have.class', 'aspect-square')
      
      cy.get('[data-testid="aspect-ratio-4-3"]').click() // 4:3
      cy.get('[data-testid="crop-selection-area"]').should('have.class', 'aspect-4-3')
      
      cy.get('[data-testid="aspect-ratio-16-9"]').click() // 16:9
      cy.get('[data-testid="crop-selection-area"]').should('have.class', 'aspect-16-9')
      
      cy.get('[data-testid="aspect-ratio-free"]').click() // Free form
      cy.get('[data-testid="crop-selection-area"]').should('not.have.class', 'aspect-locked')
    })

    it('should maintain aspect ratio when locked', () => {
      cy.get('[data-testid="aspect-ratio-1-1"]').click() // Lock to square
      
      // Drag corner handle - should maintain square aspect
      cy.get('[data-testid="crop-handle-se"]')
        .trigger('mousedown', { which: 1 })
        .trigger('mousemove', { clientX: 100, clientY: 50 }) // Try to make rectangle
        .trigger('mouseup')
      
      // Should remain square
      cy.get('[data-testid="crop-selection-area"]').then($area => {
        const width = $area.width()
        const height = $area.height()
        expect(Math.abs(width - height)).to.be.lessThan(5) // Allow small rounding differences
      })
    })

    it('should show crop preview', () => {
      cy.get('[data-testid="crop-preview"]').should('be.visible')
      
      // Adjust crop area
      cy.get('[data-testid="crop-handle-se"]')
        .trigger('mousedown', { which: 1 })
        .trigger('mousemove', { clientX: 50, clientY: 50 })
        .trigger('mouseup')
      
      // Preview should update
      cy.get('[data-testid="crop-preview"]').should('be.visible')
      cy.get('[data-testid="crop-preview-dimensions"]').should('be.visible')
    })

    it('should apply crop when confirmed', () => {
      // Set crop area
      cy.get('[data-testid="crop-handle-se"]')
        .trigger('mousedown', { which: 1 })
        .trigger('mousemove', { clientX: 50, clientY: 50 })
        .trigger('mouseup')
      
      // Apply crop
      cy.get('[data-testid="apply-crop-button"]').click()
      
      // Should show processing
      cy.get('[data-testid="processing-crop"]').should('be.visible')
      cy.get('[data-testid="processing-crop"]', { timeout: 10000 }).should('not.exist')
      
      // Should close modal and show success
      cy.get('[data-testid="image-edit-modal"]').should('not.exist')
      cy.verifyToastMessage('Image cropped successfully!')
    })

    it('should reset crop area to original', () => {
      // Modify crop area
      cy.get('[data-testid="crop-handle-se"]')
        .trigger('mousedown', { which: 1 })
        .trigger('mousemove', { clientX: 50, clientY: 50 })
        .trigger('mouseup')
      
      // Reset crop
      cy.get('[data-testid="reset-crop-button"]').click()
      
      // Should return to full image selection
      cy.get('[data-testid="crop-selection-area"]').should('have.class', 'full-image')
    })
  })

  describe('Image Resizing Functionality', () => {
    beforeEach(() => {
      // Open edit modal
      cy.get('[data-testid="page-0"]').within(() => {
        cy.get('[data-testid^="page-image-"]').first().click()
      })
    })

    it('should show current image dimensions', () => {
      cy.get('[data-testid="current-dimensions"]').should('be.visible')
      cy.get('[data-testid="current-width"]').should('contain', 'px')
      cy.get('[data-testid="current-height"]').should('contain', 'px')
    })

    it('should allow resizing by percentage', () => {
      cy.get('[data-testid="resize-method-percentage"]').click()
      
      cy.get('[data-testid="resize-percentage-input"]').clear().type('75')
      
      // Should show new dimensions
      cy.get('[data-testid="new-dimensions"]').should('be.visible')
      cy.get('[data-testid="new-width"]').should('not.equal', cy.get('[data-testid="current-width"]'))
    })

    it('should allow resizing by specific dimensions', () => {
      cy.get('[data-testid="resize-method-dimensions"]').click()
      
      cy.get('[data-testid="resize-width-input"]').clear().type('800')
      cy.get('[data-testid="resize-height-input"]').clear().type('600')
      
      // Should show preview of new size
      cy.get('[data-testid="new-dimensions"]').within(() => {
        cy.contains('800').should('be.visible')
        cy.contains('600').should('be.visible')
      })
    })

    it('should maintain aspect ratio when locked', () => {
      cy.get('[data-testid="resize-method-dimensions"]').click()
      cy.get('[data-testid="lock-aspect-ratio-checkbox"]').check()
      
      // Change width - height should adjust automatically
      cy.get('[data-testid="resize-width-input"]').clear().type('800')
      cy.get('[data-testid="resize-width-input"]').blur()
      
      // Height should have been calculated to maintain aspect ratio
      cy.get('[data-testid="resize-height-input"]').should('not.have.value', '600')
    })

    it('should allow independent width/height when aspect ratio unlocked', () => {
      cy.get('[data-testid="resize-method-dimensions"]').click()
      cy.get('[data-testid="lock-aspect-ratio-checkbox"]').uncheck()
      
      cy.get('[data-testid="resize-width-input"]').clear().type('800')
      cy.get('[data-testid="resize-height-input"]').clear().type('400')
      
      // Should accept independent values
      cy.get('[data-testid="resize-width-input"]').should('have.value', '800')
      cy.get('[data-testid="resize-height-input"]').should('have.value', '400')
    })

    it('should provide preset size options', () => {
      cy.get('[data-testid="preset-sizes"]').should('be.visible')
      
      // Test different presets
      cy.get('[data-testid="preset-small"]').click() // 400x300
      cy.get('[data-testid="resize-width-input"]').should('have.value', '400')
      
      cy.get('[data-testid="preset-medium"]').click() // 800x600
      cy.get('[data-testid="resize-width-input"]').should('have.value', '800')
      
      cy.get('[data-testid="preset-large"]').click() // 1200x900
      cy.get('[data-testid="resize-width-input"]').should('have.value', '1200')
    })

    it('should validate resize dimensions', () => {
      cy.get('[data-testid="resize-method-dimensions"]').click()
      
      // Test minimum bounds
      cy.get('[data-testid="resize-width-input"]').clear().type('10')
      cy.get('[data-testid="resize-width-input"]').blur()
      cy.verifyErrorMessage('Width must be at least 50 pixels')
      
      // Test maximum bounds
      cy.get('[data-testid="resize-width-input"]').clear().type('5000')
      cy.get('[data-testid="resize-width-input"]').blur()
      cy.verifyErrorMessage('Width cannot exceed 4000 pixels')
    })

    it('should apply resize when confirmed', () => {
      cy.get('[data-testid="resize-method-percentage"]').click()
      cy.get('[data-testid="resize-percentage-input"]').clear().type('50')
      
      cy.get('[data-testid="apply-resize-button"]').click()
      
      // Should show processing
      cy.get('[data-testid="processing-resize"]').should('be.visible')
      cy.get('[data-testid="processing-resize"]', { timeout: 10000 }).should('not.exist')
      
      // Should close modal and show success
      cy.get('[data-testid="image-edit-modal"]').should('not.exist')
      cy.verifyToastMessage('Image resized successfully!')
    })
  })

  describe('Combined Crop and Resize Operations', () => {
    beforeEach(() => {
      // Open edit modal
      cy.get('[data-testid="page-0"]').within(() => {
        cy.get('[data-testid^="page-image-"]').first().click()
      })
    })

    it('should allow cropping then resizing', () => {
      // First crop
      cy.get('[data-testid="crop-handle-se"]')
        .trigger('mousedown', { which: 1 })
        .trigger('mousemove', { clientX: 50, clientY: 50 })
        .trigger('mouseup')
      
      cy.get('[data-testid="apply-crop-button"]').click()
      cy.get('[data-testid="processing-crop"]', { timeout: 10000 }).should('not.exist')
      
      // Then resize
      cy.get('[data-testid="resize-method-percentage"]').click()
      cy.get('[data-testid="resize-percentage-input"]').clear().type('150')
      
      cy.get('[data-testid="apply-resize-button"]').click()
      cy.get('[data-testid="processing-resize"]', { timeout: 10000 }).should('not.exist')
      
      cy.verifyToastMessage('Image edited successfully!')
    })

    it('should allow resizing then cropping', () => {
      // First resize
      cy.get('[data-testid="resize-method-dimensions"]').click()
      cy.get('[data-testid="resize-width-input"]').clear().type('1000')
      
      cy.get('[data-testid="apply-resize-button"]').click()
      cy.get('[data-testid="processing-resize"]', { timeout: 10000 }).should('not.exist')
      
      // Then crop
      cy.get('[data-testid="aspect-ratio-1-1"]').click() // Square crop
      cy.get('[data-testid="apply-crop-button"]').click()
      cy.get('[data-testid="processing-crop"]', { timeout: 10000 }).should('not.exist')
      
      cy.verifyToastMessage('Image edited successfully!')
    })

    it('should show preview of combined operations', () => {
      // Set crop
      cy.get('[data-testid="crop-handle-se"]')
        .trigger('mousedown', { which: 1 })
        .trigger('mousemove', { clientX: 50, clientY: 50 })
        .trigger('mouseup')
      
      // Set resize
      cy.get('[data-testid="resize-method-percentage"]').click()
      cy.get('[data-testid="resize-percentage-input"]').clear().type('75')
      
      // Should show combined preview
      cy.get('[data-testid="combined-preview"]').should('be.visible')
      cy.get('[data-testid="final-dimensions"]').should('be.visible')
    })

    it('should allow applying both operations together', () => {
      // Set crop
      cy.get('[data-testid="aspect-ratio-1-1"]').click()
      
      // Set resize
      cy.get('[data-testid="resize-method-dimensions"]').click()
      cy.get('[data-testid="resize-width-input"]').clear().type('500')
      
      // Apply both
      cy.get('[data-testid="apply-both-button"]').click()
      
      cy.get('[data-testid="processing-operations"]').should('be.visible')
      cy.get('[data-testid="processing-operations"]', { timeout: 10000 }).should('not.exist')
      
      cy.verifyToastMessage('Image cropped and resized successfully!')
    })
  })

  describe('Quality and Format Options', () => {
    beforeEach(() => {
      // Open edit modal
      cy.get('[data-testid="page-0"]').within(() => {
        cy.get('[data-testid^="page-image-"]').first().click()
      })
    })

    it('should allow adjusting output quality', () => {
      cy.get('[data-testid="quality-slider"]').should('be.visible')
      
      // Adjust quality
      cy.get('[data-testid="quality-slider"]')
        .invoke('val', 70)
        .trigger('input')
      
      cy.get('[data-testid="quality-value"]').should('contain', '70%')
      
      // Should show file size estimate
      cy.get('[data-testid="estimated-file-size"]').should('be.visible')
    })

    it('should show different format options', () => {
      cy.get('[data-testid="output-format-select"]').should('be.visible')
      
      // Test format options
      cy.get('[data-testid="output-format-select"]').select('jpeg')
      cy.get('[data-testid="quality-controls"]').should('be.visible')
      
      cy.get('[data-testid="output-format-select"]').select('png')
      cy.get('[data-testid="quality-controls"]').should('not.exist') // PNG doesn't use quality
      
      cy.get('[data-testid="output-format-select"]').select('webp')
      cy.get('[data-testid="quality-controls"]').should('be.visible')
    })

    it('should preserve original format by default', () => {
      // Should default to original format
      cy.get('[data-testid="output-format-select"]').should('have.value', 'original')
      cy.get('[data-testid="original-format-info"]').should('contain', 'JPEG')
    })
  })

  describe('Error Handling and Edge Cases', () => {
    beforeEach(() => {
      // Open edit modal
      cy.get('[data-testid="page-0"]').within(() => {
        cy.get('[data-testid^="page-image-"]').first().click()
      })
    })

    it('should handle very small crop selections', () => {
      // Try to create very small crop
      cy.get('[data-testid="crop-handle-se"]')
        .trigger('mousedown', { which: 1 })
        .trigger('mousemove', { clientX: 5, clientY: 5 })
        .trigger('mouseup')
      
      cy.get('[data-testid="apply-crop-button"]').click()
      
      // Should show error for too small crop
      cy.verifyErrorMessage('Crop area is too small. Minimum size is 50x50 pixels.')
    })

    it('should handle invalid resize values', () => {
      cy.get('[data-testid="resize-method-dimensions"]').click()
      
      // Invalid values
      cy.get('[data-testid="resize-width-input"]').clear().type('abc')
      cy.get('[data-testid="apply-resize-button"]').click()
      
      cy.verifyErrorMessage('Please enter valid numeric dimensions')
    })

    it('should handle memory limitations gracefully', () => {
      // Try to resize to very large dimensions
      cy.get('[data-testid="resize-method-dimensions"]').click()
      cy.get('[data-testid="resize-width-input"]').clear().type('8000')
      cy.get('[data-testid="resize-height-input"]').clear().type('8000')
      
      cy.get('[data-testid="apply-resize-button"]').click()
      
      // Should warn about memory usage
      cy.get('[data-testid="memory-warning"]').should('contain', 'Large image may affect performance')
    })

    it('should recover from processing errors', () => {
      // Simulate processing error
      cy.window().then((win) => {
        cy.stub(win.HTMLCanvasElement.prototype, 'toBlob').throws(new Error('Canvas processing failed'))
      })
      
      cy.get('[data-testid="apply-crop-button"]').click()
      
      // Should show error and allow retry
      cy.verifyErrorMessage('Processing failed. Please try again.')
      cy.get('[data-testid="retry-processing-button"]').should('be.visible')
    })
  })

  describe('Full Cover Mode Image Editing', () => {
    beforeEach(() => {
      // Switch to full cover mode
      cy.navigateToTab('designStyle')
      cy.selectDesignStyle('fullCover')
      cy.navigateToTab('design')
      
      // Add image to page
      cy.dragImageToPage(0, 0)
    })

    it('should show full cover specific crop options', () => {
      cy.get('[data-testid="page-0"]').within(() => {
        cy.get('[data-testid^="page-image-"]').first().click()
      })
      
      // Should show page aspect ratio option
      cy.get('[data-testid="crop-to-page-aspect"]').should('be.visible')
      cy.get('[data-testid="crop-to-page-aspect"]').click()
      
      // Should set crop to match page dimensions
      cy.get('[data-testid="crop-selection-area"]').should('have.class', 'page-aspect-ratio')
    })

    it('should handle full cover image positioning', () => {
      cy.get('[data-testid="page-0"]').within(() => {
        cy.get('[data-testid^="page-image-"]').first().click()
      })
      
      // Should show positioning controls
      cy.get('[data-testid="image-position-controls"]').should('be.visible')
      cy.get('[data-testid="position-center"]').click()
      cy.get('[data-testid="position-top-left"]').click()
      cy.get('[data-testid="position-bottom-right"]').click()
      
      // Apply positioning
      cy.get('[data-testid="apply-position-button"]').click()
      cy.verifyToastMessage('Image positioned successfully!')
    })
  })

  describe('Undo/Redo for Edit Operations', () => {
    beforeEach(() => {
      // Open edit modal
      cy.get('[data-testid="page-0"]').within(() => {
        cy.get('[data-testid^="page-image-"]').first().click()
      })
    })

    it('should support undo for crop operations', () => {
      // Original state
      cy.get('[data-testid="original-dimensions"]').then($orig => {
        const originalDims = $orig.text()
        
        // Perform crop
        cy.get('[data-testid="crop-handle-se"]')
          .trigger('mousedown', { which: 1 })
          .trigger('mousemove', { clientX: 50, clientY: 50 })
          .trigger('mouseup')
        
        cy.get('[data-testid="apply-crop-button"]').click()
        cy.get('[data-testid="processing-crop"]', { timeout: 10000 }).should('not.exist')
        
        // Undo crop
        cy.get('[data-testid="undo-crop-button"]').click()
        
        // Should restore original
        cy.get('[data-testid="current-dimensions"]').should('contain', originalDims)
      })
    })

    it('should support undo for resize operations', () => {
      // Get original size
      cy.get('[data-testid="current-width"]').then($width => {
        const originalWidth = $width.text()
        
        // Resize
        cy.get('[data-testid="resize-method-percentage"]').click()
        cy.get('[data-testid="resize-percentage-input"]').clear().type('50')
        cy.get('[data-testid="apply-resize-button"]').click()
        cy.get('[data-testid="processing-resize"]', { timeout: 10000 }).should('not.exist')
        
        // Undo resize
        cy.get('[data-testid="undo-resize-button"]').click()
        
        // Should restore original size
        cy.get('[data-testid="current-width"]').should('contain', originalWidth)
      })
    })

    it('should support redo after undo', () => {
      // Perform operation
      cy.get('[data-testid="resize-method-percentage"]').click()
      cy.get('[data-testid="resize-percentage-input"]').clear().type('75')
      cy.get('[data-testid="apply-resize-button"]').click()
      cy.get('[data-testid="processing-resize"]', { timeout: 10000 }).should('not.exist')
      
      // Undo
      cy.get('[data-testid="undo-resize-button"]').click()
      
      // Redo
      cy.get('[data-testid="redo-resize-button"]').click()
      
      // Should reapply the resize
      cy.get('[data-testid="current-dimensions"]').should('not.contain', 'Original')
    })
  })
})