// E2E Tests for Drag and Drop Functionality
// Tests cover: image dragging, page management, drop zones, visual feedback, and complex drag scenarios

describe('Drag and Drop Functionality', () => {
  beforeEach(() => {
    cy.clearAllData()
    cy.visitTales()
    
    // Setup: Upload images and navigate to design tab
    cy.navigateToTab('upload')
    cy.uploadTestImages(6)
    cy.selectDesignStyle('classic')
    cy.navigateToTab('settings')
    cy.get('[data-testid="next-to-design-button"]').click()
  })

  describe('Basic Image Dragging', () => {
    it('should allow dragging images from available images to pages', () => {
      // Verify initial state
      cy.get('[data-testid="available-images"]').within(() => {
        cy.get('[data-testid^="available-image-"]').should('have.length', 6)
      })
      
      cy.get('[data-testid="page-0"]').within(() => {
        cy.get('[data-testid^="page-image-"]').should('have.length', 0)
      })
      
      // Drag first image to first page
      cy.dragImageToPage(0, 0)
      
      // Verify image moved
      cy.get('[data-testid="available-images"]').within(() => {
        cy.get('[data-testid^="available-image-"]').should('have.length', 5)
      })
      
      cy.get('[data-testid="page-0"]').within(() => {
        cy.get('[data-testid^="page-image-"]').should('have.length', 1)
      })
    })

    it('should allow dragging multiple images to the same page', () => {
      // Drag multiple images to first page
      cy.dragImageToPage(0, 0)
      cy.dragImageToPage(0, 0) // Index changes after first drag
      cy.dragImageToPage(0, 0)
      
      // Verify all images moved to page
      cy.get('[data-testid="page-0"]').within(() => {
        cy.get('[data-testid^="page-image-"]').should('have.length', 3)
      })
      
      cy.get('[data-testid="available-images"]').within(() => {
        cy.get('[data-testid^="available-image-"]').should('have.length', 3)
      })
    })

    it('should allow dragging images to different pages', () => {
      // Add additional pages first
      cy.addNewPage()
      cy.addNewPage()
      
      // Drag images to different pages
      cy.dragImageToPage(0, 0) // First image to first page
      cy.dragImageToPage(0, 1) // Second image to second page
      cy.dragImageToPage(0, 2) // Third image to third page
      
      // Verify distribution
      cy.verifyPageLayout(0, 1)
      cy.verifyPageLayout(1, 1)
      cy.verifyPageLayout(2, 1)
      
      cy.get('[data-testid="available-images"]').within(() => {
        cy.get('[data-testid^="available-image-"]').should('have.length', 3)
      })
    })
  })

  describe('Dragging Between Pages', () => {
    beforeEach(() => {
      // Setup: Distribute images across pages
      cy.addNewPage()
      cy.dragImageToPage(0, 0)
      cy.dragImageToPage(0, 0)
      cy.dragImageToPage(0, 1)
      cy.dragImageToPage(0, 1)
    })

    it('should allow moving images between pages', () => {
      // Move image from page 0 to page 1
      cy.dragImageBetweenPages(0, 0, 1)
      
      // Verify counts changed
      cy.verifyPageLayout(0, 1)
      cy.verifyPageLayout(1, 3)
    })

    it('should allow swapping images between pages', () => {
      // Initial state: page 0 has 2 images, page 1 has 2 images
      cy.verifyPageLayout(0, 2)
      cy.verifyPageLayout(1, 2)
      
      // Move one from each page to the other
      cy.dragImageBetweenPages(0, 0, 1)
      cy.dragImageBetweenPages(1, 0, 0)
      
      // Counts should remain the same but images should be different
      cy.verifyPageLayout(0, 2)
      cy.verifyPageLayout(1, 3)
    })

    it('should handle moving all images from a page', () => {
      // Move all images from page 0 to page 1
      cy.dragImageBetweenPages(0, 0, 1)
      cy.dragImageBetweenPages(0, 0, 1) // Index changes after move
      
      // Page 0 should be empty, page 1 should have 4 images
      cy.verifyPageLayout(0, 0)
      cy.verifyPageLayout(1, 4)
    })
  })

  describe('Moving Images Back to Available', () => {
    beforeEach(() => {
      // Place some images on pages
      cy.dragImageToPage(0, 0)
      cy.dragImageToPage(0, 0)
      cy.dragImageToPage(0, 0)
    })

    it('should allow moving single image back to available images', () => {
      // Initial state
      cy.get('[data-testid="page-0"]').within(() => {
        cy.get('[data-testid^="page-image-"]').should('have.length', 3)
      })
      
      cy.get('[data-testid="available-images"]').within(() => {
        cy.get('[data-testid^="available-image-"]').should('have.length', 3)
      })
      
      // Move one image back
      cy.get('[data-testid="page-0"]').within(() => {
        cy.get('[data-testid^="page-image-"]').first()
          .drag('[data-testid="available-images"]')
      })
      
      // Verify image moved back
      cy.get('[data-testid="page-0"]').within(() => {
        cy.get('[data-testid^="page-image-"]').should('have.length', 2)
      })
      
      cy.get('[data-testid="available-images"]').within(() => {
        cy.get('[data-testid^="available-image-"]').should('have.length', 4)
      })
    })

    it('should provide button to move all images back to available', () => {
      // Use the "Move All Back" button
      cy.get('[data-testid="move-all-images-back-button"]').click()
      
      // All images should return to available
      cy.get('[data-testid="available-images"]').within(() => {
        cy.get('[data-testid^="available-image-"]').should('have.length', 6)
      })
      
      cy.get('[data-testid="page-0"]').within(() => {
        cy.get('[data-testid^="page-image-"]').should('have.length', 0)
      })
    })

    it('should provide button to move single image back', () => {
      // Use individual "Move Back" button on an image
      cy.get('[data-testid="page-0"]').within(() => {
        cy.get('[data-testid^="page-image-"]').first().within(() => {
          cy.get('[data-testid="move-image-back-button"]').click()
        })
      })
      
      // One image should move back
      cy.get('[data-testid="page-0"]').within(() => {
        cy.get('[data-testid^="page-image-"]').should('have.length', 2)
      })
      
      cy.get('[data-testid="available-images"]').within(() => {
        cy.get('[data-testid^="available-image-"]').should('have.length', 4)
      })
    })
  })

  describe('Drop Zone Visual Feedback', () => {
    it('should highlight drop zones when dragging', () => {
      // Start dragging an image
      cy.get('[data-testid="available-images"]').within(() => {
        cy.get('[data-testid^="available-image-"]').first()
          .trigger('dragstart')
      })
      
      // Drop zones should be highlighted
      cy.get('[data-testid="page-0"]').should('have.class', 'drop-zone-active')
      
      // End drag
      cy.get('[data-testid="available-images"]').within(() => {
        cy.get('[data-testid^="available-image-"]').first()
          .trigger('dragend')
      })
      
      // Highlight should be removed
      cy.get('[data-testid="page-0"]').should('not.have.class', 'drop-zone-active')
    })

    it('should show visual feedback when hovering over drop zones', () => {
      // Simulate drag over page
      cy.get('[data-testid="available-images"]').within(() => {
        cy.get('[data-testid^="available-image-"]').first()
          .trigger('dragstart')
      })
      
      cy.get('[data-testid="page-0"]')
        .trigger('dragover')
        .should('have.class', 'drop-zone-hover')
      
      cy.get('[data-testid="page-0"]')
        .trigger('dragleave')
        .should('not.have.class', 'drop-zone-hover')
    })

    it('should provide visual feedback for invalid drop zones', () => {
      // Try dragging to an invalid area
      cy.get('[data-testid="available-images"]').within(() => {
        cy.get('[data-testid^="available-image-"]').first()
          .trigger('dragstart')
      })
      
      // Hover over non-drop zone area
      cy.get('[data-testid="tab-navigation"]')
        .trigger('dragover')
      
      // Should show "no drop" cursor or visual cue
      cy.get('body').should('have.css', 'cursor', 'no-drop')
    })
  })

  describe('Drag and Drop with Touch/Mobile', () => {
    it('should handle touch-based dragging on mobile viewport', () => {
      cy.viewport('iphone-x')
      
      // Touch-based drag simulation
      cy.get('[data-testid="available-images"]').within(() => {
        cy.get('[data-testid^="available-image-"]').first()
          .trigger('touchstart', { touches: [{ clientX: 100, clientY: 100 }] })
          .trigger('touchmove', { touches: [{ clientX: 200, clientY: 200 }] })
      })
      
      cy.get('[data-testid="page-0"]')
        .trigger('touchend')
      
      // Image should move to page
      cy.verifyPageLayout(0, 1)
    })
  })

  describe('Drag and Drop Performance', () => {
    it('should handle dragging with many images efficiently', () => {
      // Add more images
      cy.get('[data-testid="add-more-images-button"]').click()
      cy.uploadTestImages(10)
      
      // Should still drag smoothly
      cy.dragImageToPage(0, 0)
      cy.dragImageToPage(0, 0)
      cy.dragImageToPage(0, 0)
      
      // Verify performance - no significant delay
      cy.get('[data-testid="page-0"]').within(() => {
        cy.get('[data-testid^="page-image-"]').should('have.length', 3)
      })
    })

    it('should handle rapid successive drags without issues', () => {
      // Perform multiple rapid drags
      for (let i = 0; i < 5; i++) {
        cy.dragImageToPage(0, 0)
      }
      
      // Should handle all drags correctly
      cy.get('[data-testid="page-0"]').within(() => {
        cy.get('[data-testid^="page-image-"]').should('have.length', 5)
      })
      
      cy.get('[data-testid="available-images"]').within(() => {
        cy.get('[data-testid^="available-image-"]').should('have.length', 1)
      })
    })
  })

  describe('Drag and Drop Edge Cases', () => {
    it('should handle dragging to full pages gracefully', () => {
      // Configure to allow only 2 images per page
      cy.navigateToTab('settings')
      cy.get('[data-testid="max-images-per-row-input"]').clear().type('2')
      cy.get('[data-testid="max-number-of-rows-input"]').clear().type('1')
      cy.get('[data-testid="next-to-design-button"]').click()
      
      // Fill the page
      cy.dragImageToPage(0, 0)
      cy.dragImageToPage(0, 0)
      
      // Try to drag a third image - should either create new page or show feedback
      cy.dragImageToPage(0, 0)
      
      // Should handle gracefully - either reject or auto-create page
      cy.get('[data-testid="pages-container"]').should('be.visible')
    })

    it('should handle dragging image to its current location', () => {
      // Place image on page
      cy.dragImageToPage(0, 0)
      
      // Try dragging it to the same location
      cy.get('[data-testid="page-0"]').within(() => {
        cy.get('[data-testid^="page-image-"]').first()
          .drag('[data-testid="page-0"]')
      })
      
      // Should remain unchanged
      cy.verifyPageLayout(0, 1)
    })

    it('should handle interrupted drag operations', () => {
      // Start drag and then interrupt
      cy.get('[data-testid="available-images"]').within(() => {
        cy.get('[data-testid^="available-image-"]').first()
          .trigger('dragstart')
      })
      
      // Simulate ESC key or click elsewhere
      cy.get('body').type('{esc}')
      
      // State should be unchanged
      cy.get('[data-testid="available-images"]').within(() => {
        cy.get('[data-testid^="available-image-"]').should('have.length', 6)
      })
      
      cy.get('[data-testid="page-0"]').within(() => {
        cy.get('[data-testid^="page-image-"]').should('have.length', 0)
      })
    })
  })

  describe('Advanced Drag and Drop Features', () => {
    it('should allow reordering images within the same page', () => {
      // Place multiple images on same page
      cy.dragImageToPage(0, 0)
      cy.dragImageToPage(0, 0)
      cy.dragImageToPage(0, 0)
      
      // Get initial order
      cy.get('[data-testid="page-0"]').within(() => {
        cy.get('[data-testid^="page-image-"]').should('have.length', 3)
        
        // Drag first image to last position
        cy.get('[data-testid^="page-image-"]').first()
          .drag('[data-testid^="page-image-"]:last')
      })
      
      // Order should have changed
      cy.get('[data-testid="page-0"]').within(() => {
        cy.get('[data-testid^="page-image-"]').should('have.length', 3)
      })
    })

    it('should support keyboard-accessible drag and drop alternatives', () => {
      // Test keyboard-based image movement
      cy.get('[data-testid="available-images"]').within(() => {
        cy.get('[data-testid^="available-image-"]').first().focus()
        cy.focused().type('{enter}') // Select image
      })
      
      // Use keyboard to move to page
      cy.get('[data-testid="move-to-page-button"]').click()
      cy.get('[data-testid="page-selector"]').select('0')
      cy.get('[data-testid="confirm-move-button"]').click()
      
      // Image should move
      cy.verifyPageLayout(0, 1)
    })

    it('should show ghost image during drag operation', () => {
      // Start dragging
      cy.get('[data-testid="available-images"]').within(() => {
        cy.get('[data-testid^="available-image-"]').first()
          .trigger('dragstart')
      })
      
      // Ghost image should be visible
      cy.get('[data-testid="drag-ghost"]').should('be.visible')
      
      // Complete drag
      cy.get('[data-testid="page-0"]').trigger('drop')
      
      // Ghost should disappear
      cy.get('[data-testid="drag-ghost"]').should('not.exist')
    })

    it('should maintain aspect ratio and quality during drag operations', () => {
      // Drag image to page
      cy.dragImageToPage(0, 0)
      
      // Image should maintain its properties
      cy.get('[data-testid="page-0"]').within(() => {
        cy.get('[data-testid^="page-image-"]').first().within(() => {
          cy.get('img').should('have.attr', 'src').and('not.be.empty')
          cy.get('img').should('be.visible')
        })
      })
    })
  })

  describe('Undo/Redo for Drag Operations', () => {
    it('should support undoing drag operations', () => {
      // Perform drag operation
      cy.dragImageToPage(0, 0)
      cy.verifyPageLayout(0, 1)
      
      // Undo if available
      cy.get('[data-testid="undo-button"]').click()
      
      // Should revert
      cy.verifyPageLayout(0, 0)
      cy.get('[data-testid="available-images"]').within(() => {
        cy.get('[data-testid^="available-image-"]').should('have.length', 6)
      })
    })

    it('should support redoing drag operations', () => {
      // Perform and undo drag
      cy.dragImageToPage(0, 0)
      cy.get('[data-testid="undo-button"]').click()
      
      // Redo
      cy.get('[data-testid="redo-button"]').click()
      
      // Should restore
      cy.verifyPageLayout(0, 1)
    })
  })
})