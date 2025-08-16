import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { cropImageWithScaleAndPosition } from './imageCropUtils.js';

/**
 * Convert base64 data URL to blob
 * @param {string} dataURL - Base64 data URL
 * @returns {Blob} - Blob object
 */
function dataURLToBlob(dataURL) {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Get file extension from MIME type
 * @param {string} mimeType - MIME type
 * @returns {string} - File extension
 */
function getExtensionFromMimeType(mimeType) {
  const mimeToExt = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp'
  };
  return mimeToExt[mimeType] || 'jpg';
}

/**
 * Create project metadata object
 * @param {Array} pages - Array of page objects
 * @param {Array} availableImages - Array of available images
 * @param {Object} settings - Application settings
 * @returns {Object} - Project metadata
 */
function createProjectMetadata(pages, availableImages, settings) {
  const metadata = {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    settings: settings,
    pages: pages.map(page => ({
      id: page.id,
      color: page.color,
      images: page.images.map(image => ({
        id: image.id,
        filename: `image_${image.id}.${getExtensionFromMimeType(image.src.split(';')[0].split(':')[1])}`,
        originalIndex: image.originalIndex,
        position: {
          x: image.x,
          y: image.y,
          rowIndex: image.rowIndex,
          colIndex: image.colIndex
        },
        dimensions: {
          previewWidth: image.previewWidth,
          previewHeight: image.previewHeight,
          originalWidth: image.width,
          originalHeight: image.height
        },
        cropping: {
          scale: image.scale || 1,
          cropOffsetX: image.cropOffsetX || 0,
          cropOffsetY: image.cropOffsetY || 0,
          hasOriginalImage: !!image.originalSrc
        },
        fullCoverMode: image.fullCoverMode || false,
        originalFileName: image.name || '',
        uploadTimestamp: image.uploadTimestamp || null
      }))
    })),
    availableImages: availableImages.map(image => ({
      id: image.id,
      filename: `image_${image.id}.${getExtensionFromMimeType((image.originalSrc || image.src).split(';')[0].split(':')[1])}`,
      originalIndex: image.originalIndex,
      dimensions: {
        originalWidth: image.width,
        originalHeight: image.height
      },
      originalFileName: image.name || '',
      uploadTimestamp: image.uploadTimestamp || null
    }))
  };
  
  return metadata;
}

/**
 * Export project as zip file
 * @param {Array} pages - Array of page objects
 * @param {Array} availableImages - Array of available images
 * @param {Object} settings - Application settings
 * @param {Function} onProgress - Progress callback
 * @returns {Promise} - Promise that resolves when export is complete
 */
export async function exportProject(pages, availableImages, settings, onProgress = null) {
  if (!pages || pages.length === 0) {
    if (!availableImages || availableImages.length === 0) {
      throw new Error('No images or pages to export');
    }
  }

  const zip = new JSZip();
  
  // Create metadata
  const metadata = createProjectMetadata(pages || [], availableImages || [], settings);
  
  // Add metadata to zip
  zip.file('project.json', JSON.stringify(metadata, null, 2));
  
  // Create images folder
  const imagesFolder = zip.folder('images');
  
  // Collect all unique images from pages and available images
  const allImages = new Map();
  
  // Add images from pages
  pages.forEach(page => {
    page.images.forEach(image => {
      if (!allImages.has(image.id)) {
        allImages.set(image.id, image);
      }
    });
  });
  
  // Add available images
  availableImages.forEach(image => {
    if (!allImages.has(image.id)) {
      allImages.set(image.id, image);
    }
  });
  
  const imageArray = Array.from(allImages.values());
  
  // Add images to zip
  for (let i = 0; i < imageArray.length; i++) {
    const image = imageArray[i];
    let filename = `image_${image.id}.jpg`; // Default filename
    let processedSuccessfully = false;
    
    try {
      if (!image.src || !image.src.startsWith('data:')) {
        console.warn(`Skipping image ${image.id}: invalid data URL`);
      } else {
        // Use original image if available, otherwise use current src
        const imageSource = image.originalSrc || image.src;
        filename = `image_${image.id}.${getExtensionFromMimeType(imageSource.split(';')[0].split(':')[1])}`;
        const blob = dataURLToBlob(imageSource);
        
        imagesFolder.file(filename, blob);
        processedSuccessfully = true;
      }
    } catch (error) {
      console.warn(`Failed to process image ${image.id}:`, error);
    }
    
    if (onProgress) {
      onProgress({
        current: i + 1,
        total: imageArray.length,
        message: processedSuccessfully ? 'Adding images to archive...' : 'Skipping invalid image...',
        currentFileName: image.name || filename
      });
    }
  }
  
  if (onProgress) {
    onProgress({
      current: imageArray.length,
      total: imageArray.length,
      message: 'Creating zip file...',
      currentFileName: ''
    });
  }
  
  // Generate zip file
  const blob = await zip.generateAsync({ type: 'blob' });
  
  // Download the file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const filename = `tales-project-${timestamp}.zip`;
  saveAs(blob, filename);
  
  if (onProgress) {
    onProgress({
      current: imageArray.length,
      total: imageArray.length,
      message: 'Export complete!',
      currentFileName: ''
    });
  }
}

/**
 * Load project from zip file
 * @param {File} file - Zip file to load
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>} - Promise that resolves with project data
 */
export async function loadProject(file, onProgress = null) {
  const zip = new JSZip();
  
  if (onProgress) {
    onProgress({
      current: 0,
      total: 100,
      message: 'Reading zip file...',
      currentFileName: file.name
    });
  }
  
  const zipData = await zip.loadAsync(file);
  
  // Read metadata
  const metadataFile = zipData.file('project.json');
  if (!metadataFile) {
    throw new Error('Invalid project file: missing project.json');
  }
  
  const metadataContent = await metadataFile.async('string');
  const metadata = JSON.parse(metadataContent);
  
  if (onProgress) {
    onProgress({
      current: 10,
      total: 100,
      message: 'Loading project metadata...',
      currentFileName: 'project.json'
    });
  }
  
  // Load images
  const imagesFolder = zipData.folder('images');
  if (!imagesFolder) {
    throw new Error('Invalid project file: missing images folder');
  }
  
  const imageFiles = [];
  imagesFolder.forEach((relativePath, file) => {
    if (!file.dir) {
      imageFiles.push({ path: relativePath, file });
    }
  });
  
  const loadedImages = new Map();
  
  for (let i = 0; i < imageFiles.length; i++) {
    const { path, file } = imageFiles[i];
    const imageData = await file.async('blob');
    const dataURL = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(imageData);
    });
    
    // Extract image ID from filename
    const imageId = path.replace(/^image_/, '').replace(/\.[^.]+$/, '');
    loadedImages.set(imageId, dataURL);
    
    if (onProgress) {
      onProgress({
        current: 10 + (i + 1) * 80 / imageFiles.length,
        total: 100,
        message: 'Loading images...',
        currentFileName: path
      });
    }
  }
  
  // Reconstruct pages with loaded images
  const reconstructedPages = await Promise.all(metadata.pages.map(async page => ({
    id: page.id,
    color: page.color,
    images: await Promise.all(page.images.map(async imageMetadata => {
      const imageData = loadedImages.get(imageMetadata.id);
      if (!imageData) {
        console.warn(`Image not found: ${imageMetadata.id}`);
        return null;
      }
      
      const hasCropping = imageMetadata.cropping && (
        imageMetadata.cropping.cropOffsetX !== 0 || 
        imageMetadata.cropping.cropOffsetY !== 0 || 
        imageMetadata.cropping.scale !== 1
      );
      
      let processedImageSrc = imageData;
      let originalSrc = undefined;
      
      // If the image has cropping data and we stored the original, apply cropping
      // For new format: only apply cropping if hasOriginalImage is true
      // For old format: don't apply cropping as the stored image is already processed
      const isNewFormat = imageMetadata.cropping && typeof imageMetadata.cropping.hasOriginalImage === 'boolean';
      const shouldApplyCropping = hasCropping && isNewFormat && imageMetadata.cropping.hasOriginalImage;
      
      if (shouldApplyCropping) {
        try {
          // The loaded imageData is the original, so we need to apply cropping to get the display version
          originalSrc = imageData;
          processedImageSrc = await cropImageWithScaleAndPosition(
            imageData,
            imageMetadata.dimensions.previewWidth,
            imageMetadata.dimensions.previewHeight,
            {
              scale: imageMetadata.cropping.scale,
              cropOffsetX: imageMetadata.cropping.cropOffsetX,
              cropOffsetY: imageMetadata.cropping.cropOffsetY
            }
          );
        } catch (error) {
          console.warn(`Failed to apply cropping to image ${imageMetadata.id}:`, error);
          // Fallback to using the loaded image as-is
          processedImageSrc = imageData;
        }
      }
      
      return {
        id: imageMetadata.id,
        src: processedImageSrc,
        originalSrc: originalSrc,
        name: imageMetadata.originalFileName,
        originalIndex: imageMetadata.originalIndex,
        x: imageMetadata.position.x,
        y: imageMetadata.position.y,
        rowIndex: imageMetadata.position.rowIndex,
        colIndex: imageMetadata.position.colIndex,
        previewWidth: imageMetadata.dimensions.previewWidth,
        previewHeight: imageMetadata.dimensions.previewHeight,
        width: imageMetadata.dimensions.originalWidth,
        height: imageMetadata.dimensions.originalHeight,
        scale: imageMetadata.cropping.scale,
        cropOffsetX: imageMetadata.cropping.cropOffsetX,
        cropOffsetY: imageMetadata.cropping.cropOffsetY,
        fullCoverMode: imageMetadata.fullCoverMode,
        uploadTimestamp: imageMetadata.uploadTimestamp
      };
    })).then(results => results.filter(Boolean))
  })));
  
  // Reconstruct available images
  const reconstructedAvailableImages = metadata.availableImages.map(imageMetadata => {
    const imageData = loadedImages.get(imageMetadata.id);
    if (!imageData) {
      console.warn(`Available image not found: ${imageMetadata.id}`);
      return null;
    }
    
    return {
      id: imageMetadata.id,
      src: imageData,
      name: imageMetadata.originalFileName,
      originalIndex: imageMetadata.originalIndex,
      width: imageMetadata.dimensions.originalWidth,
      height: imageMetadata.dimensions.originalHeight,
      uploadTimestamp: imageMetadata.uploadTimestamp
    };
  }).filter(Boolean);
  
  if (onProgress) {
    onProgress({
      current: 100,
      total: 100,
      message: 'Project loaded successfully!',
      currentFileName: ''
    });
  }
  
  return {
    pages: reconstructedPages,
    availableImages: reconstructedAvailableImages,
    settings: metadata.settings || null,
    version: metadata.version,
    exportDate: metadata.exportDate
  };
} 