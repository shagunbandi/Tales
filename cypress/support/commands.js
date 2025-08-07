// Custom commands for Tales E2E tests

// **********************************
// Navigation Commands
// **********************************

Cypress.Commands.add('visitTales', () => {
  cy.visit('/')
  cy.wait(1000) // Allow app to initialize
})

Cypress.Commands.add('navigateToTab', (tabName) => {
  const tabSelectors = {
    albums: '[href="#"]:contains("📁 My Albums")',
    upload: '[href="#"]:contains("1. Upload Images")',
    designStyle: '[href="#"]:contains("2. Design Style")',
    settings: '[href="#"]:contains("3. Settings")',
    design: '[href="#"]:contains("4. Design Layout")'
  }
  
  cy.get(tabSelectors[tabName]).should('be.visible').click()
  cy.wait(500) // Allow tab content to load
})

// **********************************
// Image Upload Commands
// **********************************

Cypress.Commands.add('uploadTestImages', (imageCount = 3) => {
  // Create test images dynamically
  const images = []
  for (let i = 0; i < imageCount; i++) {
    images.push(`test-image-${i + 1}.jpg`)
  }
  
  cy.get('input[type="file"]').then(input => {
    const files = images.map((name, index) => {
      // Create a simple test image blob
      const canvas = document.createElement('canvas')
      canvas.width = 200 + (index * 50)
      canvas.height = 200 + (index * 50)
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = `hsl(${index * 60}, 70%, 50%)`
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = 'white'
      ctx.font = '20px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(`Image ${index + 1}`, canvas.width/2, canvas.height/2)
      
      return new Promise(resolve => {
        canvas.toBlob(resolve, 'image/jpeg', 0.9)
      }).then(blob => {
        const file = new File([blob], name, { type: 'image/jpeg' })
        return file
      })
    })
    
    return Promise.all(files).then(fileList => {
      const dt = new DataTransfer()
      fileList.forEach(file => dt.items.add(file))
      input[0].files = dt.files
      input[0].dispatchEvent(new Event('change', { bubbles: true }))
    })
  })
  
  // Wait for images to be processed
  cy.get('[data-testid="processing-indicator"]', { timeout: 10000 }).should('not.exist')
})

Cypress.Commands.add('uploadSpecificTestImage', (width, height, color = '#ff0000', text = 'Test') => {
  cy.get('input[type="file"]').then(input => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = color
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'white'
    ctx.font = '20px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(text, canvas.width/2, canvas.height/2)
    
    canvas.toBlob(blob => {
      const file = new File([blob], `test-${width}x${height}.jpg`, { type: 'image/jpeg' })
      const dt = new DataTransfer()
      dt.items.add(file)
      input[0].files = dt.files
      input[0].dispatchEvent(new Event('change', { bubbles: true }))
    }, 'image/jpeg', 0.9)
  })
})

// **********************************
// Settings and Configuration Commands
// **********************************

Cypress.Commands.add('selectDesignStyle', (style) => {
  const styleSelectors = {
    classic: '[data-testid="design-style-classic"]',
    fullCover: '[data-testid="design-style-full-cover"]'
  }
  
  cy.get(styleSelectors[style]).should('be.visible').click()
})

Cypress.Commands.add('configureSettings', (settings) => {
  if (settings.pageSize) {
    cy.get('[data-testid="page-size-select"]').select(settings.pageSize)
  }
  
  if (settings.orientation) {
    cy.get(`[data-testid="orientation-${settings.orientation}"]`).click()
  }
  
  if (settings.pageMargin) {
    cy.get('[data-testid="page-margin-input"]').clear().type(settings.pageMargin.toString())
  }
  
  if (settings.imageGap) {
    cy.get('[data-testid="image-gap-input"]').clear().type(settings.imageGap.toString())
  }
  
  if (settings.maxImagesPerRow) {
    cy.get('[data-testid="max-images-per-row-input"]').clear().type(settings.maxImagesPerRow.toString())
  }
  
  if (settings.maxNumberOfRows) {
    cy.get('[data-testid="max-number-of-rows-input"]').clear().type(settings.maxNumberOfRows.toString())
  }
  
  if (settings.backgroundColor) {
    cy.get(`[data-testid="color-${settings.backgroundColor}"]`).click()
  }
})

// **********************************
// Drag and Drop Commands
// **********************************

Cypress.Commands.add('dragImageToPage', (imageIndex, pageIndex) => {
  cy.get('[data-testid="available-images"]')
    .find('[data-testid^="available-image-"]')
    .eq(imageIndex)
    .drag(`[data-testid="page-${pageIndex}"]`)
})

Cypress.Commands.add('dragImageBetweenPages', (fromPageIndex, imageIndex, toPageIndex) => {
  cy.get(`[data-testid="page-${fromPageIndex}"]`)
    .find('[data-testid^="page-image-"]')
    .eq(imageIndex)
    .drag(`[data-testid="page-${toPageIndex}"]`)
})

// **********************************
// Page Management Commands
// **********************************

Cypress.Commands.add('addNewPage', () => {
  cy.get('[data-testid="add-page-button"]').click()
})

Cypress.Commands.add('removePage', (pageIndex) => {
  cy.get(`[data-testid="page-${pageIndex}"]`)
    .find('[data-testid="remove-page-button"]')
    .click()
})

Cypress.Commands.add('changePageBackgroundColor', (pageIndex, colorName) => {
  cy.get(`[data-testid="page-${pageIndex}"]`)
    .find('[data-testid="page-color-selector"]')
    .click()
  
  cy.get(`[data-testid="color-${colorName}"]`).click()
})

// **********************************
// Layout and Arrangement Commands
// **********************************

Cypress.Commands.add('autoArrangeImages', () => {
  cy.get('[data-testid="auto-arrange-button"]').click()
})

Cypress.Commands.add('randomizeLayout', () => {
  cy.get('[data-testid="randomize-layout-button"]').click()
})

Cypress.Commands.add('autoArrangePage', (pageIndex) => {
  cy.get(`[data-testid="page-${pageIndex}"]`)
    .find('[data-testid="auto-arrange-page-button"]')
    .click()
})

Cypress.Commands.add('nextLayout', (pageIndex) => {
  cy.get(`[data-testid="page-${pageIndex}"]`)
    .find('[data-testid="next-layout-button"]')
    .click()
})

Cypress.Commands.add('previousLayout', (pageIndex) => {
  cy.get(`[data-testid="page-${pageIndex}"]`)
    .find('[data-testid="previous-layout-button"]')
    .click()
})

// **********************************
// PDF Generation Commands
// **********************************

Cypress.Commands.add('generatePDF', () => {
  cy.get('[data-testid="generate-pdf-button"]').click()
})

Cypress.Commands.add('waitForPDFGeneration', () => {
  cy.get('[data-testid="pdf-generating"]', { timeout: 30000 }).should('not.exist')
})

// **********************************
// Album/Save/Load Commands
// **********************************

Cypress.Commands.add('saveAsAlbum', (albumName, description = '') => {
  cy.get('[data-testid="save-album-button"]').click()
  cy.get('[data-testid="album-name-input"]').type(albumName)
  if (description) {
    cy.get('[data-testid="album-description-input"]').type(description)
  }
  cy.get('[data-testid="confirm-save-button"]').click()
})

Cypress.Commands.add('loadAlbum', (albumName) => {
  cy.navigateToTab('albums')
  cy.get('[data-testid="album-list"]')
    .contains(albumName)
    .parent()
    .find('[data-testid="load-album-button"]')
    .click()
})

Cypress.Commands.add('deleteAlbum', (albumName) => {
  cy.navigateToTab('albums')
  cy.get('[data-testid="album-list"]')
    .contains(albumName)
    .parent()
    .find('[data-testid="delete-album-button"]')
    .click()
  cy.get('[data-testid="confirm-delete-button"]').click()
})

// **********************************
// Validation and Assertion Commands
// **********************************

Cypress.Commands.add('verifyImageCount', (expectedCount) => {
  cy.get('[data-testid="tab-navigation"]')
    .contains(`(${expectedCount} images)`)
    .should('be.visible')
})

Cypress.Commands.add('verifyPageCount', (expectedCount) => {
  cy.get('[data-testid^="page-"]').should('have.length', expectedCount)
})

Cypress.Commands.add('verifySettingsValue', (setting, expectedValue) => {
  const settingSelectors = {
    pageMargin: '[data-testid="page-margin-input"]',
    imageGap: '[data-testid="image-gap-input"]',
    maxImagesPerRow: '[data-testid="max-images-per-row-input"]',
    maxNumberOfRows: '[data-testid="max-number-of-rows-input"]'
  }
  
  cy.get(settingSelectors[setting]).should('have.value', expectedValue.toString())
})

Cypress.Commands.add('verifyToastMessage', (message, type = 'success') => {
  cy.get('[data-testid="toast"]')
    .should('be.visible')
    .and('contain', message)
    .and('have.attr', 'data-type', type)
})

// **********************************
// Error Handling Commands
// **********************************

Cypress.Commands.add('verifyErrorMessage', (message) => {
  cy.get('[data-testid="error-message"]')
    .should('be.visible')
    .and('contain', message)
})

Cypress.Commands.add('clearAllData', () => {
  cy.window().then((win) => {
    win.localStorage.clear()
    win.sessionStorage.clear()
  })
})