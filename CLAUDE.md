# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based image-to-PDF generator called "Tales" that allows users to upload multiple images and arrange them into PDFs with customizable layouts and background colors. The app is frontend-only with no backend dependencies.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Format code with prettier
npm run format

# Check formatting
npm run format:check

# Preview production build
npm run preview
```

## Key Architecture

### Core State Management

- **useImageManagement hook** (`src/hooks/useImageManagement.js`): Central state management for images, pages, and PDF generation
- **Settings system**: Centralized in `src/constants.js` with validation in `App.jsx`

### Layout System

The app supports two design styles:

- **Classic**: Traditional layout with gaps and margins
- **Full Cover**: Images cover entire page without gaps

Layout logic is split across:

- `src/utils/layoutUtils.js`: Main layout coordination and classic layout
- `src/utils/fullCoverLayoutUtils.js`: Full cover layout implementation
- `src/utils/autoArrangeUtils.js`: Auto-arrangement algorithms

### Image Processing Pipeline

1. File upload and processing (`src/utils/imageUtils.js`)
2. Layout calculation and arrangement (utils/layout\*.js)
3. PDF generation (`src/utils/pdfUtils.js`) using jsPDF

### Component Structure

- **Tab-based navigation**: Upload → Design Style → Settings → Design
- **Drag & drop system**: Uses @dnd-kit for moving images between pages and available images
- **Real-time preview**: Shows page layouts with background colors before PDF generation

## Technical Stack

- **React 19** with Vite build system
- **Tailwind CSS 4** for styling
- **Flowbite React** for UI components
- **jsPDF** for PDF generation
- **@dnd-kit** for drag and drop functionality
- **CropperJS** for image cropping in full cover mode

## Key Files to Understand

- `src/App.jsx`: Main component with tab navigation and settings validation
- `src/constants.js`: All configuration constants including color palette and default settings
- `src/hooks/useImageManagement.js`: Core business logic and state management
- `src/utils/pdfUtils.js`: PDF generation with support for both layout styles
- `src/utils/layoutUtils.js`: Multi-row image arrangement with area optimization

## Development Notes

- Uses Node.js 24.4.1 (specified in engines)
- Supports TypeScript but components are primarily JSX
- Dark mode support via Flowbite React
- All image processing happens client-side in browser memory
- PDF generation converts preview dimensions to mm for accurate printing
