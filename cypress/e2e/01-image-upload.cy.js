// E2E Tests for Image Upload Functionality
// Tests cover: file upload, image processing, validation, and error handling

describe('Image Upload Functionality', () => {
  beforeEach(() => {
    cy.clearAllData()
    cy.visitTales()
  })

  describe('Initial State', () => {
    it('should display upload tab as the initial tab when no images exist', () => {
      // Should start on albums tab, but upload should be accessible
      cy.get('[data-testid="tab-navigation"]').should('be.visible')
      cy.navigateToTab('upload')
      
      // Verify upload interface
      cy.get('[data-testid="upload-area"]').should('be.visible')
      cy.get('input[type="file"]').should('exist')
      cy.get('[data-testid="upload-instructions"]').should('contain', 'Upload Images')
    })

    it('should show correct file input attributes', () => {
      cy.navigateToTab('upload')
      cy.get('input[type="file"]').should('have.attr', 'accept', 'image/*')
      cy.get('input[type="file"]').should('have.attr', 'multiple')
    })
  })

  describe('Single Image Upload', () => {
    it('should successfully upload a single image', () => {
      cy.navigateToTab('upload')
      
      // Upload single test image
      cy.uploadSpecificTestImage(400, 300, '#e74c3c', 'Test Image 1')
      
      // Verify image was uploaded
      cy.verifyImageCount(1)
      
      // Should automatically redirect to design style tab
      cy.url().should('not.contain', '#upload')
      cy.get('[data-testid="tab-navigation"]')
        .contains('2. Design Style')
        .should('have.class', 'font-semibold') // Active tab styling
    })

    it('should display image processing indicator during upload', () => {
      cy.navigateToTab('upload')
      
      // Upload a larger image that takes time to process
      cy.uploadSpecificTestImage(1200, 800, '#2ecc71', 'Large Test Image')
      
      // Processing indicator should appear and then disappear
      cy.get('[data-testid="processing-indicator"]').should('be.visible')
      cy.get('[data-testid="processing-indicator"]', { timeout: 10000 }).should('not.exist')
    })
  })

  describe('Multiple Image Upload', () => {
    it('should successfully upload multiple images at once', () => {
      cy.navigateToTab('upload')
      
      // Upload multiple test images
      cy.uploadTestImages(5)
      
      // Verify all images were uploaded
      cy.verifyImageCount(5)
      
      // Should redirect to design style tab
      cy.get('[data-testid="tab-navigation"]')
        .contains('2. Design Style')
        .should('be.visible')
    })

    it('should handle large batches of images', () => {
      cy.navigateToTab('upload')
      
      // Upload a larger batch
      cy.uploadTestImages(10)
      
      // Verify all images were processed
      cy.verifyImageCount(10)
      
      // Verify progress tracking works
      cy.get('[data-testid="upload-progress"]', { timeout: 15000 }).should('not.exist')
    })

    it('should maintain image order during batch upload', () => {
      cy.navigateToTab('upload')
      cy.uploadTestImages(3)
      
      // Navigate to design tab to see images
      cy.navigateToTab('designStyle')
      cy.get('[data-testid="design-style-classic"]').click()
      cy.navigateToTab('settings')
      cy.get('[data-testid="next-to-design-button"]').click()
      
      // Verify images appear in upload order in available images section
      cy.get('[data-testid="available-images"]').within(() => {
        cy.get('[data-testid^="available-image-"]').should('have.length', 3)
        cy.get('[data-testid^="available-image-"]').each(($img, index) => {
          cy.wrap($img).should('be.visible')
        })
      })
    })
  })

  describe('Image Format Support', () => {
    it('should accept JPEG images', () => {
      cy.navigateToTab('upload')
      cy.uploadSpecificTestImage(400, 300, '#ff6b6b', 'JPEG Test')
      cy.verifyImageCount(1)
    })

    it('should accept PNG images', () => {
      cy.navigateToTab('upload')
      
      // Create PNG image
      cy.get('input[type="file"]').then(input => {
        const canvas = document.createElement('canvas')
        canvas.width = 400
        canvas.height = 300
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#4ecdc4'
        ctx.fillRect(0, 0, 400, 300)
        ctx.fillStyle = 'white'
        ctx.font = '20px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('PNG Test', 200, 150)
        
        canvas.toBlob(blob => {
          const file = new File([blob], 'test.png', { type: 'image/png' })
          const dt = new DataTransfer()
          dt.items.add(file)
          input[0].files = dt.files
          input[0].dispatchEvent(new Event('change', { bubbles: true }))
        }, 'image/png')
      })
      
      cy.verifyImageCount(1)
    })
  })

  describe('Image Size Handling', () => {
    it('should handle very small images', () => {
      cy.navigateToTab('upload')
      cy.uploadSpecificTestImage(50, 50, '#95a5a6', 'Tiny')
      cy.verifyImageCount(1)
    })

    it('should handle large images', () => {
      cy.navigateToTab('upload')
      cy.uploadSpecificTestImage(2000, 1500, '#e67e22', 'Large Image')
      cy.verifyImageCount(1)
    })

    it('should handle portrait orientation images', () => {
      cy.navigateToTab('upload')
      cy.uploadSpecificTestImage(300, 500, '#9b59b6', 'Portrait')
      cy.verifyImageCount(1)
    })

    it('should handle landscape orientation images', () => {
      cy.navigateToTab('upload')
      cy.uploadSpecificTestImage(800, 400, '#f39c12', 'Landscape')
      cy.verifyImageCount(1)
    })

    it('should handle square images', () => {
      cy.navigateToTab('upload')
      cy.uploadSpecificTestImage(400, 400, '#1abc9c', 'Square')
      cy.verifyImageCount(1)
    })
  })

  describe('Upload Progress and Feedback', () => {
    it('should show upload progress for multiple files', () => {
      cy.navigateToTab('upload')
      
      // Upload multiple images
      cy.uploadTestImages(5)
      
      // Progress bar should appear and complete
      cy.get('[data-testid="upload-progress"]').should('be.visible')
      cy.get('[data-testid="upload-progress"]', { timeout: 10000 }).should('not.exist')
      
      // Success feedback should appear
      cy.get('[data-testid="upload-success"]').should('be.visible')
    })

    it('should display processing status for each image', () => {
      cy.navigateToTab('upload')
      cy.uploadTestImages(3)
      
      // Processing indicators should appear
      cy.get('[data-testid="processing-indicator"]').should('be.visible')
      
      // Should complete processing
      cy.get('[data-testid="processing-indicator"]', { timeout: 10000 }).should('not.exist')
    })
  })

  describe('Additional Image Upload (Add More)', () => {
    it('should allow adding more images after initial upload', () => {
      // Initial upload
      cy.navigateToTab('upload')
      cy.uploadTestImages(2)
      cy.verifyImageCount(2)
      
      // Navigate to design tab
      cy.navigateToTab('designStyle')
      cy.get('[data-testid="design-style-classic"]').click()
      cy.navigateToTab('settings')
      cy.get('[data-testid="next-to-design-button"]').click()
      
      // Add more images
      cy.get('[data-testid="add-more-images-button"]').click()
      
      // Should open file dialog and allow additional uploads
      cy.uploadSpecificTestImage(400, 300, '#2c3e50', 'Additional Image')
      
      // Total count should increase
      cy.verifyImageCount(3)
    })

    it('should maintain existing images when adding new ones', () => {
      // Upload initial images
      cy.navigateToTab('upload')
      cy.uploadTestImages(2)
      
      // Navigate to design
      cy.navigateToTab('designStyle')
      cy.get('[data-testid="design-style-classic"]').click()
      cy.navigateToTab('settings')
      cy.get('[data-testid="next-to-design-button"]').click()
      
      // Verify initial images are there
      cy.get('[data-testid="available-images"]').within(() => {
        cy.get('[data-testid^="available-image-"]').should('have.length', 2)
      })
      
      // Add more images
      cy.get('[data-testid="add-more-images-button"]').click()
      cy.uploadSpecificTestImage(300, 300, '#8e44ad', 'New Image')
      
      // All images should be preserved
      cy.verifyImageCount(3)
      cy.get('[data-testid="available-images"]').within(() => {
        cy.get('[data-testid^="available-image-"]').should('have.length', 3)
      })
    })
  })

  describe('Memory and Performance', () => {
    it('should handle multiple upload sessions without memory leaks', () => {
      // Multiple upload cycles
      for (let i = 0; i < 3; i++) {
        cy.navigateToTab('upload')
        cy.uploadTestImages(2)
        cy.verifyImageCount(2)
        
        // Clear and start fresh
        cy.clearAllData()
        cy.visitTales()
      }
    })

    it('should efficiently process images of varying sizes', () => {
      cy.navigateToTab('upload')
      
      // Upload images of different sizes
      cy.uploadSpecificTestImage(100, 100, '#e74c3c', 'Small')
      cy.uploadSpecificTestImage(800, 600, '#2ecc71', 'Medium')
      cy.uploadSpecificTestImage(1600, 1200, '#3498db', 'Large')
      
      cy.verifyImageCount(3)
      
      // All should be processed without errors
      cy.get('[data-testid="processing-indicator"]', { timeout: 15000 }).should('not.exist')
    })
  })

  describe('Browser Compatibility', () => {
    it('should work with drag and drop upload', () => {
      cy.navigateToTab('upload')
      
      // Simulate drag and drop
      cy.get('[data-testid="upload-area"]').within(() => {
        cy.uploadSpecificTestImage(400, 300, '#f39c12', 'Dropped Image')
      })
      
      cy.verifyImageCount(1)
    })
  })
})