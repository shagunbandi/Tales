# E2E Test Suite for Tales App

This comprehensive E2E test suite covers all major functionality of the Tales image-to-PDF application using Cypress.

## Table of Contents

- [Overview](#overview)
- [Setup and Installation](#setup-and-installation)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Test Coverage](#test-coverage)
- [Custom Commands](#custom-commands)
- [Utilities](#utilities)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

The Tales E2E test suite provides comprehensive coverage of the application's functionality including:
- Image upload and processing
- Tab navigation and workflow
- Settings configuration
- Drag and drop operations
- PDF generation and download
- Album save/load functionality
- Image editing (cropping and resizing)
- Auto-arrangement features
- Error handling and edge cases

## Setup and Installation

### Prerequisites

- Node.js 24.4.1 (as specified in package.json)
- npm or yarn package manager

### Installation

The test dependencies are already included in the project. To install:

```bash
npm install
```

This will install:
- Cypress 14.5.3
- start-server-and-test for coordinating dev server and tests
- @cypress/webpack-preprocessor for advanced preprocessing

### Configuration

The Cypress configuration is located in `cypress.config.js`:

- **Base URL**: http://localhost:5173 (Vite dev server)
- **Viewport**: 1280x720
- **Test files**: `cypress/e2e/**/*.cy.{js,jsx,ts,tsx}`
- **Videos**: Disabled for faster execution
- **Screenshots**: Enabled on test failure

## Running Tests

### Development Mode (Interactive)

Run tests in Cypress Test Runner for development:

```bash
npm run e2e:dev
```

This command:
1. Starts the Vite dev server on port 5173
2. Opens Cypress Test Runner
3. Allows you to run tests interactively

### Headless Mode (CI/Production)

Run all tests headlessly:

```bash
npm run e2e:run
```

This command:
1. Starts the Vite dev server
2. Runs all tests in headless mode
3. Generates test reports

### Individual Commands

```bash
# Start dev server only
npm run dev

# Open Cypress Test Runner (requires dev server running)
npm run cypress:open

# Run tests headlessly (requires dev server running)
npm run cypress:run
```

## Test Structure

### Test Files Organization

```
cypress/
├── e2e/                          # Test specifications
│   ├── 01-image-upload.cy.js     # Image upload functionality
│   ├── 02-navigation-layout.cy.js # Tab navigation and layout switching
│   ├── 03-settings-config.cy.js  # Settings configuration
│   ├── 04-drag-and-drop.cy.js    # Drag and drop operations
│   ├── 05-pdf-generation.cy.js   # PDF generation and download
│   ├── 06-save-load-albums.cy.js # Album management
│   ├── 07-image-resizing-cropping.cy.js # Image editing
│   ├── 08-auto-arrangement.cy.js # Auto-arrangement features
│   └── 09-error-handling.cy.js   # Error handling and edge cases
├── support/
│   ├── commands.js               # Custom Cypress commands
│   ├── e2e.js                   # Global test configuration
│   └── utils.js                 # Utility functions
├── fixtures/
│   └── test-data.json           # Test data and constants
└── README.md                    # This file
```

### Test Naming Convention

- **Files**: Numbered with descriptive names (e.g., `01-image-upload.cy.js`)
- **Describe blocks**: Feature-focused (e.g., "Image Upload Functionality")
- **Test cases**: Action-focused (e.g., "should upload multiple images successfully")

## Test Coverage

### 1. Image Upload Functionality (`01-image-upload.cy.js`)

**Covers:**
- Single and multiple file uploads
- File format validation (JPEG, PNG, WebP, GIF)
- Image size handling (small, large, different orientations)
- Upload progress and feedback
- Error handling for unsupported formats
- Memory management during upload
- Adding more images to existing collections

**Key Test Scenarios:**
- ✅ Upload single image
- ✅ Upload multiple images in batch
- ✅ Handle different image formats
- ✅ Process various image sizes
- ✅ Show upload progress indicators
- ✅ Validate file type restrictions
- ✅ Handle upload errors gracefully
- ✅ Add more images after initial upload

### 2. Tab Navigation and Layout Switching (`02-navigation-layout.cy.js`)

**Covers:**
- Tab workflow progression
- Design style selection (Classic vs Full Cover)
- Navigation state management
- Responsive navigation
- Accessibility features
- Browser history integration

**Key Test Scenarios:**
- ✅ Follow proper workflow: Upload → Design Style → Settings → Design
- ✅ Switch between Classic and Full Cover layouts
- ✅ Navigate freely between completed tabs
- ✅ Maintain state when switching tabs
- ✅ Handle navigation on different screen sizes
- ✅ Support keyboard navigation
- ✅ Manage disabled states appropriately

### 3. Settings Configuration (`03-settings-configuration.cy.js`)

**Covers:**
- Page size and orientation settings
- Margin and gap configuration
- Layout parameters (rows, columns, images per page)
- Color palette selection
- Image quality settings
- Settings validation and error handling
- Real-time preview updates

**Key Test Scenarios:**
- ✅ Configure page sizes (A4, Letter, Legal)
- ✅ Switch between landscape and portrait
- ✅ Adjust margins and gaps with validation
- ✅ Set layout constraints
- ✅ Select background colors from palette
- ✅ Validate input ranges and show errors
- ✅ Update previews in real-time
- ✅ Persist settings between sessions

### 4. Drag and Drop Operations (`04-drag-and-drop.cy.js`)

**Covers:**
- Image dragging from available to pages
- Moving images between pages
- Returning images to available collection
- Visual feedback during drag operations
- Touch/mobile drag support
- Drag validation and constraints
- Performance with many images

**Key Test Scenarios:**
- ✅ Drag images from available to pages
- ✅ Move images between different pages
- ✅ Return images to available collection
- ✅ Show drop zone highlighting
- ✅ Handle invalid drop locations
- ✅ Support touch-based dragging
- ✅ Maintain performance with large image sets
- ✅ Provide alternative interaction methods

### 5. PDF Generation and Download (`05-pdf-generation.cy.js`)

**Covers:**
- PDF creation with current layout
- Download functionality
- Different page sizes and orientations
- Quality settings impact
- Progress indication
- Error handling during generation
- Metadata inclusion
- Batch processing

**Key Test Scenarios:**
- ✅ Generate PDF with Classic layout
- ✅ Generate PDF with Full Cover layout
- ✅ Handle multiple pages
- ✅ Apply different page sizes and orientations
- ✅ Show generation progress
- ✅ Download with appropriate filenames
- ✅ Handle generation errors
- ✅ Include proper PDF metadata
- ✅ Optimize for different quality settings

### 6. Album Save/Load Functionality (`06-save-load-albums.cy.js`)

**Covers:**
- Album creation and saving
- Loading saved albums
- Album management (delete, search)
- Auto-save functionality
- Data persistence
- Import/export features
- Version control
- Storage management

**Key Test Scenarios:**
- ✅ Save albums with name and description
- ✅ Load albums and restore full state
- ✅ Manage multiple albums
- ✅ Auto-save changes periodically
- ✅ Handle storage quota issues
- ✅ Export/import album data
- ✅ Update existing albums
- ✅ Validate album data integrity

### 7. Image Resizing and Cropping (`07-image-resizing-cropping.cy.js`)

**Covers:**
- Image edit modal functionality
- Cropping with handles and aspect ratios
- Resizing by percentage or dimensions
- Quality and format options
- Combined crop and resize operations
- Undo/redo capabilities
- Full Cover mode specific editing

**Key Test Scenarios:**
- ✅ Open image editing modal
- ✅ Crop images with different aspect ratios
- ✅ Resize images by percentage and dimensions
- ✅ Maintain aspect ratios when locked
- ✅ Apply quality and format settings
- ✅ Combine cropping and resizing
- ✅ Undo/redo editing operations
- ✅ Handle Full Cover mode positioning

### 8. Auto-Arrangement Features (`08-auto-arrangement.cy.js`)

**Covers:**
- Global auto-arrangement across pages
- Page-level arrangement optimization
- Layout pattern cycling
- Randomization features
- Smart arrangement algorithms
- Layout templates
- Performance with many images

**Key Test Scenarios:**
- ✅ Auto-arrange all images across pages
- ✅ Optimize individual page layouts
- ✅ Cycle through different layout patterns
- ✅ Randomize layouts with different styles
- ✅ Apply smart arrangement algorithms
- ✅ Use predefined layout templates
- ✅ Handle large numbers of images
- ✅ Undo/redo arrangement operations

### 9. Error Handling and Edge Cases (`09-error-handling.cy.js`)

**Covers:**
- File upload error handling
- Memory and performance limitations
- Network connectivity issues
- Data corruption and recovery
- Browser compatibility
- Input validation
- Concurrent operations
- Graceful degradation

**Key Test Scenarios:**
- ✅ Handle unsupported file types
- ✅ Manage memory limitations
- ✅ Work offline and recover when online
- ✅ Recover from corrupted data
- ✅ Support different browsers
- ✅ Validate and sanitize user input
- ✅ Handle concurrent operations
- ✅ Provide fallback options
- ✅ Guide users through error recovery

## Custom Commands

The test suite includes extensive custom Cypress commands for reusability:

### Navigation Commands
- `cy.visitTales()` - Visit the app and wait for initialization
- `cy.navigateToTab(tabName)` - Navigate to specific tab

### Image Upload Commands
- `cy.uploadTestImages(count)` - Upload test images
- `cy.uploadSpecificTestImage(width, height, color, text)` - Upload custom test image

### Settings Commands
- `cy.selectDesignStyle(style)` - Select Classic or Full Cover style
- `cy.configureSettings(settings)` - Configure multiple settings at once

### Drag and Drop Commands
- `cy.dragImageToPage(imageIndex, pageIndex)` - Drag image to specific page
- `cy.dragImageBetweenPages(fromPage, imageIndex, toPage)` - Move image between pages

### Layout Commands
- `cy.autoArrangeImages()` - Auto-arrange all images
- `cy.randomizeLayout()` - Randomize layout
- `cy.nextLayout(pageIndex)` - Cycle to next layout pattern

### PDF and Album Commands
- `cy.generatePDF()` - Generate PDF
- `cy.saveAsAlbum(name, description)` - Save as album
- `cy.loadAlbum(name)` - Load existing album

### Validation Commands
- `cy.verifyImageCount(count)` - Verify total image count
- `cy.verifyPageLayout(pageIndex, expectedImages)` - Verify page layout
- `cy.verifySettingsValue(setting, value)` - Verify setting value
- `cy.verifyToastMessage(message, type)` - Verify toast notification

## Utilities

### Test Data Generation
- `generateTestImage(width, height, color, text)` - Create test images dynamically
- `createTestImageSet(count)` - Generate multiple varied test images

### UI Helpers
- `waitForStability(selector)` - Wait for animations to complete
- `verifyCSS(selector, properties)` - Verify CSS properties
- `dragToCoordinates(source, x, y)` - Precise drag operations

### Environment Setup
- `setupTestEnvironment()` - Initialize clean test state
- `clearBrowserStorage()` - Clear all storage
- `testResponsiveBreakpoints(testFn)` - Test across viewports

### Monitoring
- `monitorConsoleErrors()` - Track console errors
- `verifyNoConsoleErrors()` - Assert no errors occurred
- `verifyBasicAccessibility(selector)` - Basic a11y checks

## Best Practices

### Test Organization
1. **Group related tests** using descriptive `describe` blocks
2. **Use beforeEach** for common setup to ensure test isolation
3. **Keep tests focused** on single functionality
4. **Use data-testid** attributes for reliable element selection

### Test Data Management
1. **Generate test data** dynamically rather than using static files
2. **Clean up after tests** to prevent interference
3. **Use realistic test data** that matches real user scenarios
4. **Parameterize tests** for different input combinations

### Assertions and Waits
1. **Use appropriate waits** for async operations
2. **Assert on meaningful states** rather than implementation details
3. **Provide clear error messages** in custom assertions
4. **Test both success and failure paths**

### Performance Considerations
1. **Minimize test execution time** with efficient selectors
2. **Use custom commands** to reduce code duplication
3. **Run tests in parallel** when possible
4. **Mock heavy operations** in appropriate tests

## Troubleshooting

### Common Issues

#### Tests Failing Due to Timing
```javascript
// Instead of fixed waits
cy.wait(5000)

// Use proper assertions
cy.get('[data-testid="element"]').should('be.visible')
cy.get('[data-testid="processing"]').should('not.exist')
```

#### Element Not Found
```javascript
// Check data-testid attributes exist in components
// Use more flexible selectors when needed
cy.get('[data-testid="element"]').should('exist')
```

#### Memory Issues with Large Tests
```javascript
// Clear data between tests
beforeEach(() => {
  cy.clearAllData()
})

// Use smaller test datasets when possible
cy.uploadTestImages(3) // Instead of 20
```

#### Flaky Drag and Drop Tests
```javascript
// Ensure elements are stable before dragging
cy.get('[data-testid="source"]').should('be.visible')
cy.get('[data-testid="target"]').should('be.visible')
cy.dragImageToPage(0, 0)
```

### Debug Mode

To debug failing tests:

1. **Use Cypress Test Runner** in development mode
2. **Add cy.debug()** statements to pause execution
3. **Take screenshots** at key points
4. **Check browser console** for errors
5. **Use cy.pause()** for manual inspection

### Environment Variables

Set environment variables for different test configurations:

```bash
# Run with different viewport
CYPRESS_viewportWidth=1920 CYPRESS_viewportHeight=1080 npm run e2e:run

# Enable video recording
CYPRESS_video=true npm run e2e:run

# Set base URL
CYPRESS_baseUrl=http://localhost:3000 npm run e2e:run
```

## Test Maintenance

### Adding New Tests

1. **Identify the feature** to test
2. **Choose appropriate test file** or create new one
3. **Write descriptive test name**
4. **Set up test data** in beforeEach
5. **Use existing custom commands** where possible
6. **Add new commands** for reusable functionality
7. **Update this README** with new coverage

### Updating Existing Tests

1. **Run affected tests** after code changes
2. **Update selectors** if UI changes
3. **Modify expectations** if behavior changes
4. **Add new test cases** for new functionality
5. **Remove obsolete tests** for removed features

### Performance Monitoring

Monitor test execution times and optimize:

1. **Identify slow tests** with Cypress dashboard
2. **Optimize selectors** and waits
3. **Reduce test data size** where appropriate
4. **Parallelize test execution**
5. **Use test filtering** for development

---

## Contributing

When contributing to the test suite:

1. **Follow naming conventions**
2. **Add comprehensive test coverage**
3. **Update documentation**
4. **Test across different scenarios**
5. **Ensure tests are reliable and maintainable**

For questions or issues with the test suite, please refer to the main project documentation or create an issue in the project repository.