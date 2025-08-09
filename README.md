# Image to PDF Generator

A simple frontend-only web application that allows users to select multiple images and generate a PDF with them arranged on A4 landscape pages with random sober background colors.

## Features

- ✅ **Multi-image upload**: Select multiple images via file picker or drag & drop
- ✅ **Format support**: JPG, PNG, GIF, WebP image formats
- ✅ **Smart layout**: Images automatically arranged left-to-right on A4 landscape pages
- ✅ **Proportional sizing**: Images resized to fit page height while preserving aspect ratio
- ✅ **EXIF orientation handling**: Automatically corrects image rotation from camera metadata
- ✅ **Smart centering**: Images are centered both horizontally and vertically on each page
- ✅ **Automatic pagination**: Images wrap to new pages when they don't fit horizontally
- ✅ **Sober color palette**: Random background colors from a curated palette
- ✅ **Progress tracking**: Real-time progress indicators during processing
- ✅ **Page preview**: Visual preview showing page count and colors
- ✅ **PDF generation**: Creates downloadable PDF files using jsPDF

## Color Palette

The application uses a carefully selected palette of sober English colors:

- Oxford Blue (#002147)
- Slate Gray (#708090)
- Steel Blue (#4682B4)
- Cornsilk (#FFF8DC)
- Antique White (#FAEBD7)
- Pastel Green (#77DD77)
- Light Khaki (#F0E68C)
- Powder Blue (#B0E0E6)

## Technical Details

### Page Layout

- **Format**: A4 landscape (297mm × 210mm)
- **Margins**: 30px uniform margin on all sides for optimal space utilization
- **Image sizing**: Height scaled to 75% of available page height for optimal page utilization
- **Arrangement**: Centered horizontally and vertically with 12px gaps between images
- **Page breaks**: Automatic when images don't fit remaining horizontal space
- **Optimization**: Flexible sizing allows more images per page while maintaining proportions
- **EXIF handling**: Automatically corrects image orientation from camera metadata

### Technology Stack

- **Frontend**: React 18 with Vite
- **PDF Generation**: jsPDF library
- **File Handling**: File System Access API and FileReader
- **Styling**: CSS with clean, minimal design

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone or download the project
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the displayed local URL (typically `http://localhost:5173`)

### Usage

1. **Upload Images**:
   - Click the upload area or drag & drop image files
   - Select multiple images (JPG, PNG, GIF, WebP)
   - Images are automatically sorted by filename

2. **Review Layout**:
   - See how many pages will be created
   - Preview the background color for each page
   - Check the image count per page

3. **Generate PDF**:
   - Click "Generate PDF" button
   - Wait for processing to complete
   - PDF will automatically download

### Error Handling

The application includes error handling for:

- Unsupported file formats
- File reading errors
- Image loading failures
- PDF generation issues

## Testing

The application includes comprehensive test coverage with both unit tests and end-to-end tests.

### Quick Start

The easiest way to run tests is using the justfile commands:

```bash
# Run all tests (unit + e2e)
just test-all

# Run only unit tests (fastest)
just test-quick

# Run only e2e tests
just e2e
```

### Test Types

#### Unit Tests (Vitest)

- **39 tests** covering core functionality
- Layout preservation system
- Flexible grid layout generation
- Image arrangement algorithms
- Error handling and edge cases

#### End-to-End Tests (Cypress)

- **3 tests** covering complete user workflows
- Album creation and navigation
- Image upload and arrangement
- PDF generation

### Available Test Commands

Using justfile (recommended):

```bash
just test          # Run unit tests in watch mode
just test-run      # Run unit tests once
just test-ui       # Run unit tests with UI
just e2e           # Run e2e tests (headless)
just e2e-open      # Open Cypress interactive mode
just test-all      # Run both unit and e2e tests
just test-quick    # Run unit tests only (fastest)
```

Using npm directly:

```bash
npm test           # Unit tests in watch mode
npm run test:run   # Unit tests once
npm run test:ui    # Unit tests with UI
npm run e2e:run    # E2e tests
npm run e2e:dev    # E2e tests in dev mode
```

### Test Coverage

The test suite covers:

- ✅ **Layout Systems**: Grid and flexible layout generation
- ✅ **Image Operations**: Swapping, moving, and arranging images
- ✅ **State Management**: Layout preservation across operations
- ✅ **Template Validation**: Grid coverage verification
- ✅ **Error Scenarios**: Fallback behavior and edge cases
- ✅ **User Workflows**: Complete app functionality via e2e tests

### Running Tests in CI/CD

For automated testing in pipelines:

```bash
# Fast unit tests only
just test-quick

# Full test suite
just test-all
```

## Build for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory and can be served from any static file server.

## Browser Compatibility

- Modern browsers with File API support
- Tested on Chrome, Firefox, Safari, Edge
- Requires JavaScript enabled

## Limitations

- Frontend-only (no backend required)
- File processing happens in browser memory
- Large numbers of high-resolution images may impact performance
- Maximum file size limited by browser memory constraints

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the MIT License.
