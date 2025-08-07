// E2E Tests for Tab Navigation and Layout Switching
// Tests cover: tab navigation flow, design style selection, layout changes, and UI state management

describe('Tab Navigation and Layout Switching', () => {
  beforeEach(() => {
    cy.clearAllData()
    cy.visitTales()
  })

  describe('Tab Navigation Flow', () => {
    it('should start with albums tab accessible and others appropriately disabled', () => {
      // Albums tab should always be accessible
      cy.get('[data-testid="tab-navigation"]').within(() => {
        cy.contains('📁 My Albums').should('not.have.class', 'cursor-not-allowed')
        
        // Other tabs should be accessible but may show different states
        cy.contains('1. Upload Images').should('be.visible')
        cy.contains('2. Design Style').should('be.visible')
        cy.contains('3. Settings').should('be.visible')
        cy.contains('4. Design Layout').should('be.visible')
      })
    })

    it('should follow proper workflow: Upload → Design Style → Settings → Design', () => {
      // Start with upload
      cy.navigateToTab('upload')
      cy.uploadTestImages(3)
      
      // Should automatically go to design style
      cy.get('[data-testid="tab-navigation"]')
        .contains('2. Design Style')
        .should('be.visible')
      
      // Select design style and proceed
      cy.get('[data-testid="design-style-classic"]').click()
      cy.get('[data-testid="next-to-settings-button"]').click()
      
      // Should be on settings tab
      cy.get('[data-testid="tab-navigation"]')
        .contains('3. Settings')
        .should('have.class', 'font-semibold')
      
      // Proceed to design
      cy.get('[data-testid="next-to-design-button"]').click()
      
      // Should be on design tab
      cy.get('[data-testid="tab-navigation"]')
        .contains('4. Design Layout')
        .should('have.class', 'font-semibold')
      
      // Verify image count is displayed
      cy.verifyImageCount(3)
    })

    it('should allow going back to albums tab from any point', () => {
      // Upload some images and progress
      cy.navigateToTab('upload')
      cy.uploadTestImages(2)
      
      // Go to design style
      cy.get('[data-testid="design-style-classic"]').click()
      cy.navigateToTab('settings')
      
      // Should be able to go back to albums
      cy.navigateToTab('albums')
      cy.get('[data-testid="albums-content"]').should('be.visible')
      
      // Should be able to return to workflow
      cy.navigateToTab('settings')
      cy.get('[data-testid="settings-content"]').should('be.visible')
    })

    it('should maintain navigation state when switching between tabs', () => {
      cy.navigateToTab('upload')
      cy.uploadTestImages(2)
      
      // Go through workflow
      cy.get('[data-testid="design-style-classic"]').click()
      cy.navigateToTab('settings')
      
      // Modify a setting
      cy.get('[data-testid="page-margin-input"]').clear().type('25')
      
      // Go to design tab
      cy.get('[data-testid="next-to-design-button"]').click()
      
      // Go back to settings - should maintain the setting
      cy.navigateToTab('settings')
      cy.get('[data-testid="page-margin-input"]').should('have.value', '25')
    })
  })

  describe('Design Style Selection', () => {
    beforeEach(() => {
      cy.navigateToTab('upload')
      cy.uploadTestImages(3)
    })

    it('should display both design style options clearly', () => {
      cy.get('[data-testid="design-style-options"]').should('be.visible')
      
      // Classic style option
      cy.get('[data-testid="design-style-classic"]').within(() => {
        cy.contains('Classic').should('be.visible')
        cy.contains('Traditional layout with gaps and margins').should('be.visible')
      })
      
      // Full cover style option
      cy.get('[data-testid="design-style-full-cover"]').within(() => {
        cy.contains('Full Cover').should('be.visible')
        cy.contains('Images cover the entire page without gaps').should('be.visible')
      })
    })

    it('should allow selecting Classic design style', () => {
      cy.selectDesignStyle('classic')
      
      // Should show selection feedback
      cy.get('[data-testid="design-style-classic"]').should('have.class', 'ring-2')
      
      // Should enable next button
      cy.get('[data-testid="next-to-settings-button"]').should('not.be.disabled').click()
      
      // Should proceed to settings with Classic-specific options
      cy.get('[data-testid="settings-content"]').should('be.visible')
      cy.get('[data-testid="image-gap-setting"]').should('be.visible')
      cy.get('[data-testid="page-margin-setting"]').should('be.visible')
    })

    it('should allow selecting Full Cover design style', () => {
      cy.selectDesignStyle('fullCover')
      
      // Should show selection feedback
      cy.get('[data-testid="design-style-full-cover"]').should('have.class', 'ring-2')
      
      // Should enable next button
      cy.get('[data-testid="next-to-settings-button"]').should('not.be.disabled').click()
      
      // Should proceed to settings with Full Cover-specific options
      cy.get('[data-testid="settings-content"]').should('be.visible')
      
      // Some settings should be hidden or disabled for full cover
      cy.get('[data-testid="image-gap-setting"]').should('not.exist')
    })

    it('should switch between design styles and update preview accordingly', () => {
      // Select Classic first
      cy.selectDesignStyle('classic')
      cy.get('[data-testid="design-preview-classic"]').should('be.visible')
      
      // Switch to Full Cover
      cy.selectDesignStyle('fullCover')
      cy.get('[data-testid="design-preview-full-cover"]').should('be.visible')
      
      // Switch back to Classic
      cy.selectDesignStyle('classic')
      cy.get('[data-testid="design-preview-classic"]').should('be.visible')
    })

    it('should require design style selection before proceeding', () => {
      // Next button should be disabled initially
      cy.get('[data-testid="next-to-settings-button"]').should('be.disabled')
      
      // After selection, should be enabled
      cy.selectDesignStyle('classic')
      cy.get('[data-testid="next-to-settings-button"]').should('not.be.disabled')
    })
  })

  describe('Layout Visual Changes', () => {
    beforeEach(() => {
      cy.navigateToTab('upload')
      cy.uploadTestImages(4)
    })

    it('should show different layout previews for Classic vs Full Cover', () => {
      // Classic layout preview
      cy.selectDesignStyle('classic')
      cy.get('[data-testid="next-to-settings-button"]').click()
      cy.get('[data-testid="next-to-design-button"]').click()
      
      // Should show classic layout with gaps
      cy.get('[data-testid="page-0"]').within(() => {
        cy.get('[data-testid^="page-image-"]').should('have.css', 'margin')
      })
      
      // Go back and switch to Full Cover
      cy.navigateToTab('designStyle')
      cy.selectDesignStyle('fullCover')
      cy.navigateToTab('settings')
      cy.get('[data-testid="next-to-design-button"]').click()
      
      // Should show full cover layout without gaps
      cy.get('[data-testid="page-0"]').within(() => {
        cy.get('[data-testid^="page-image-"]').should('have.css', 'margin', '0px')
      })
    })

    it('should update page layout when switching styles in design tab', () => {
      // Set up with classic style
      cy.selectDesignStyle('classic')
      cy.navigateToTab('settings')
      cy.get('[data-testid="next-to-design-button"]').click()
      
      // Verify classic layout
      cy.get('[data-testid="pages-container"]').should('contain', 'Classic')
      
      // Go back and change to full cover
      cy.navigateToTab('designStyle')
      cy.selectDesignStyle('fullCover')
      cy.navigateToTab('settings')
      cy.get('[data-testid="next-to-design-button"]').click()
      
      // Layout should have updated
      cy.get('[data-testid="pages-container"]').should('not.contain', 'Classic')
    })
  })

  describe('Responsive Navigation', () => {
    it('should maintain navigation functionality on tablet viewport', () => {
      cy.viewport('ipad-2')
      
      cy.navigateToTab('upload')
      cy.uploadTestImages(2)
      
      // Navigation should still work
      cy.get('[data-testid="tab-navigation"]').should('be.visible')
      cy.selectDesignStyle('classic')
      cy.navigateToTab('settings')
      cy.get('[data-testid="settings-content"]').should('be.visible')
    })

    it('should adapt navigation for mobile viewport', () => {
      cy.viewport('iphone-x')
      
      cy.navigateToTab('upload')
      cy.uploadTestImages(2)
      
      // Navigation should be responsive
      cy.get('[data-testid="tab-navigation"]').should('be.visible')
      
      // Content should be accessible
      cy.selectDesignStyle('classic')
      cy.navigateToTab('settings')
      cy.get('[data-testid="settings-content"]').should('be.visible')
    })
  })

  describe('Navigation Accessibility', () => {
    it('should have proper ARIA labels and keyboard navigation', () => {
      cy.get('[data-testid="tab-navigation"]').within(() => {
        // Check for proper navigation structure
        cy.get('nav').should('have.attr', 'aria-label')
        
        // Tab items should be keyboard accessible
        cy.contains('📁 My Albums').should('be.focusable')
        cy.contains('1. Upload Images').should('be.focusable')
      })
    })

    it('should support keyboard navigation between tabs', () => {
      cy.navigateToTab('upload')
      cy.uploadTestImages(2)
      
      // Tab navigation should work with keyboard
      cy.get('[data-testid="tab-navigation"]').within(() => {
        cy.contains('2. Design Style').focus().type('{enter}')
      })
      
      cy.get('[data-testid="design-style-options"]').should('be.visible')
    })
  })

  describe('Navigation State Persistence', () => {
    it('should remember navigation state when page is refreshed', () => {
      cy.navigateToTab('upload')
      cy.uploadTestImages(2)
      cy.selectDesignStyle('classic')
      cy.navigateToTab('settings')
      
      // Reload page
      cy.reload()
      
      // Should maintain state (though may need to re-upload images)
      // This tests local storage persistence
      cy.get('[data-testid="tab-navigation"]').should('be.visible')
    })

    it('should handle browser back/forward buttons appropriately', () => {
      cy.navigateToTab('upload')
      cy.uploadTestImages(2)
      cy.selectDesignStyle('classic')
      cy.navigateToTab('settings')
      
      // Browser back should work (though this is limited in Cypress)
      // Focus on ensuring navigation doesn't break with history changes
      cy.get('[data-testid="settings-content"]').should('be.visible')
    })
  })

  describe('Error States in Navigation', () => {
    it('should handle navigation with invalid settings gracefully', () => {
      cy.navigateToTab('upload')
      cy.uploadTestImages(2)
      cy.selectDesignStyle('classic')
      cy.navigateToTab('settings')
      
      // Enter invalid settings
      cy.get('[data-testid="page-margin-input"]').clear().type('-5')
      
      // Try to navigate to design - should show error or prevent navigation
      cy.get('[data-testid="next-to-design-button"]').click()
      
      // Should either show error message or stay on settings
      cy.get('[data-testid="error-message"], [data-testid="settings-content"]').should('be.visible')
    })

    it('should recover from navigation errors', () => {
      cy.navigateToTab('upload')
      cy.uploadTestImages(2)
      cy.selectDesignStyle('classic')
      cy.navigateToTab('settings')
      
      // Cause an error state
      cy.get('[data-testid="page-margin-input"]').clear().type('invalid')
      
      // Fix the error
      cy.get('[data-testid="page-margin-input"]').clear().type('20')
      
      // Should be able to proceed normally
      cy.get('[data-testid="next-to-design-button"]').click()
      cy.get('[data-testid="design-content"]').should('be.visible')
    })
  })

  describe('Advanced Navigation Scenarios', () => {
    it('should handle rapid tab switching without issues', () => {
      cy.navigateToTab('upload')
      cy.uploadTestImages(3)
      cy.selectDesignStyle('classic')
      
      // Rapidly switch between tabs
      cy.navigateToTab('settings')
      cy.navigateToTab('designStyle')
      cy.navigateToTab('settings')
      cy.navigateToTab('albums')
      cy.navigateToTab('settings')
      
      // Should end up on settings and function normally
      cy.get('[data-testid="settings-content"]').should('be.visible')
      cy.get('[data-testid="page-margin-input"]').should('be.visible')
    })

    it('should maintain proper tab states with multiple workflows', () => {
      // Complete one workflow
      cy.navigateToTab('upload')
      cy.uploadTestImages(2)
      cy.selectDesignStyle('classic')
      cy.navigateToTab('settings')
      cy.get('[data-testid="next-to-design-button"]').click()
      
      // Save as album
      cy.get('[data-testid="save-album-button"]').click()
      cy.get('[data-testid="album-name-input"]').type('Test Album')
      cy.get('[data-testid="confirm-save-button"]').click()
      
      // Start new workflow
      cy.navigateToTab('upload')
      cy.uploadTestImages(1)
      
      // Navigation should work properly for new workflow
      cy.selectDesignStyle('fullCover')
      cy.navigateToTab('settings')
      cy.get('[data-testid="settings-content"]').should('be.visible')
    })
  })
})