// Utility functions for Tales E2E tests

/**
 * Generate test images with specific properties
 */
export const generateTestImage = (width = 400, height = 300, color = '#3498db', text = 'Test Image') => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    
    // Fill background with color
    ctx.fillStyle = color
    ctx.fillRect(0, 0, width, height)
    
    // Add text
    ctx.fillStyle = 'white'
    ctx.font = `${Math.max(16, Math.min(width, height) / 20)}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, width / 2, height / 2)
    
    // Add border
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 2
    ctx.strokeRect(1, 1, width - 2, height - 2)
    
    canvas.toBlob((blob) => {
      const file = new File([blob], `test-${width}x${height}.jpg`, { 
        type: 'image/jpeg',
        lastModified: Date.now()
      })
      resolve(file)
    }, 'image/jpeg', 0.9)
  })
}

/**
 * Create a set of test images with different dimensions
 */
export const createTestImageSet = (count = 5) => {
  const imageSpecs = [
    { width: 400, height: 300, color: '#e74c3c', text: 'Image 1' },
    { width: 300, height: 400, color: '#2ecc71', text: 'Image 2' },
    { width: 500, height: 300, color: '#3498db', text: 'Image 3' },
    { width: 350, height: 350, color: '#f39c12', text: 'Image 4' },
    { width: 600, height: 400, color: '#9b59b6', text: 'Image 5' },
    { width: 400, height: 250, color: '#1abc9c', text: 'Image 6' },
    { width: 450, height: 350, color: '#e67e22', text: 'Image 7' },
    { width: 350, height: 450, color: '#34495e', text: 'Image 8' },
  ]
  
  return Promise.all(
    imageSpecs.slice(0, count).map((spec, index) => 
      generateTestImage(spec.width, spec.height, spec.color, spec.text)
    )
  )
}

/**
 * Wait for elements to be stable (useful for animations and transitions)
 */
export const waitForStability = (selector, timeout = 5000) => {
  return cy.get(selector, { timeout }).should('be.visible').wait(100)
}

/**
 * Check if an element has specific CSS properties
 */
export const verifyCSS = (selector, properties) => {
  cy.get(selector).should('be.visible').then($el => {
    Object.entries(properties).forEach(([property, expectedValue]) => {
      expect($el.css(property)).to.equal(expectedValue)
    })
  })
}

/**
 * Simulate drag and drop with specific coordinates
 */
export const dragToCoordinates = (sourceSelector, targetX, targetY) => {
  cy.get(sourceSelector).then($source => {
    const sourceRect = $source[0].getBoundingClientRect()
    const sourceX = sourceRect.left + sourceRect.width / 2
    const sourceY = sourceRect.top + sourceRect.height / 2
    
    cy.get(sourceSelector)
      .trigger('mousedown', { which: 1, pageX: sourceX, pageY: sourceY })
      .trigger('mousemove', { which: 1, pageX: targetX, pageY: targetY })
      .trigger('mouseup', { pageX: targetX, pageY: targetY })
  })
}

/**
 * Verify page layout structure
 */
export const verifyPageLayout = (pageIndex, expectedImages) => {
  cy.get(`[data-testid="page-${pageIndex}"]`).within(() => {
    cy.get('[data-testid^="page-image-"]').should('have.length', expectedImages)
    
    // Verify images are properly positioned
    cy.get('[data-testid^="page-image-"]').each(($img, index) => {
      cy.wrap($img).should('be.visible').and('have.attr', 'src')
    })
  })
}

/**
 * Verify PDF download functionality
 */
export const verifyPDFDownload = (expectedFileName) => {
  const downloadsFolder = Cypress.config('downloadsFolder')
  
  // Wait a bit for download to complete
  cy.wait(2000)
  
  cy.readFile(`${downloadsFolder}/${expectedFileName}`, { timeout: 10000 })
    .should('exist')
    .then((content) => {
      // Basic PDF validation - check for PDF signature
      expect(content.toString().substring(0, 4)).to.equal('%PDF')
    })
}

/**
 * Clear browser storage completely
 */
export const clearBrowserStorage = () => {
  cy.window().then((win) => {
    win.localStorage.clear()
    win.sessionStorage.clear()
    // Clear IndexedDB if used
    if (win.indexedDB) {
      win.indexedDB.databases().then(databases => {
        databases.forEach(db => {
          win.indexedDB.deleteDatabase(db.name)
        })
      })
    }
  })
}

/**
 * Setup test environment with clean state
 */
export const setupTestEnvironment = () => {
  clearBrowserStorage()
  cy.visitTales()
}

/**
 * Verify responsive behavior
 */
export const testResponsiveBreakpoints = (testFunction) => {
  const viewports = [
    { width: 1280, height: 720, name: 'desktop' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 375, height: 667, name: 'mobile' }
  ]
  
  viewports.forEach(viewport => {
    cy.viewport(viewport.width, viewport.height)
    testFunction(viewport.name)
  })
}

/**
 * Monitor console for errors during test execution
 */
export const monitorConsoleErrors = () => {
  cy.window().then((win) => {
    cy.stub(win.console, 'error').as('consoleError')
    cy.stub(win.console, 'warn').as('consoleWarn')
  })
}

/**
 * Verify no console errors occurred
 */
export const verifyNoConsoleErrors = () => {
  cy.get('@consoleError').should('not.have.been.called')
}

/**
 * Generate unique test identifiers
 */
export const generateTestId = (prefix = 'test') => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Wait for React components to finish rendering
 */
export const waitForReactRender = (timeout = 3000) => {
  cy.window().then((win) => {
    return new Cypress.Promise((resolve) => {
      if (win.requestIdleCallback) {
        win.requestIdleCallback(resolve, { timeout })
      } else {
        win.setTimeout(resolve, 100)
      }
    })
  })
}

/**
 * Verify accessibility basics
 */
export const verifyBasicAccessibility = (selector) => {
  cy.get(selector).should('be.visible').within(() => {
    // Check for alt text on images
    cy.get('img').each($img => {
      cy.wrap($img).should('have.attr', 'alt')
    })
    
    // Check for proper button/link accessibility
    cy.get('button, a').each($el => {
      const text = $el.text().trim()
      if (!text) {
        cy.wrap($el).should('have.attr', 'aria-label')
      }
    })
  })
}