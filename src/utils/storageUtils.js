/**
 * Storage utilities for Tales app
 * Supports IndexedDB for web, Capacitor for mobile platforms
 */

// Storage schema constants
export const STORAGE_CONFIG = {
  DB_NAME: "TalesAlbums",
  DB_VERSION: 1,
  STORES: {
    ALBUMS: "albums",
    IMAGES: "images",
    THUMBNAILS: "thumbnails",
  },
};

export const ALBUM_SCHEMA = {
  id: "string", // UUID
  name: "string",
  description: "string",
  created: "timestamp",
  modified: "timestamp",
  settings: {
    pageSize: "string",
    orientation: "string",
    designStyle: "string",
    pageMargin: "number",
    imageGap: "number",
    imageQuality: "number",
    maxImagesPerRow: "number",
    maxNumberOfRows: "number",
    maxNumberOfPages: "number",
    imagesPerPage: "number",
  },
  pages: [
    {
      id: "string",
      images: [
        {
          id: "string",
          name: "string",
          originalIndex: "number",
          src: "string", // Data URL or file reference
          originalSrc: "string", // For cropped images
          x: "number",
          y: "number",
          previewWidth: "number",
          previewHeight: "number",
          rowIndex: "number",
          colIndex: "number",
          naturalWidth: "number",
          naturalHeight: "number",
        },
      ],
      color: "string",
    },
  ],
  availableImages: [], // Same structure as page images
  totalImages: "number",
  thumbnail: "string", // Data URL of first page thumbnail
};

// Platform detection
export const getPlatform = () => {
  if (typeof window === "undefined") return "node";
  if (window.Capacitor) {
    return window.Capacitor.getPlatform();
  }
  return "web";
};

// IndexedDB utilities for web platform
class IndexedDBStorage {
  constructor() {
    this.db = null;
  }

  async init() {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(
        STORAGE_CONFIG.DB_NAME,
        STORAGE_CONFIG.DB_VERSION,
      );

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Albums store
        if (!db.objectStoreNames.contains(STORAGE_CONFIG.STORES.ALBUMS)) {
          const albumStore = db.createObjectStore(
            STORAGE_CONFIG.STORES.ALBUMS,
            { keyPath: "id" },
          );
          albumStore.createIndex("name", "name", { unique: false });
          albumStore.createIndex("created", "created", { unique: false });
          albumStore.createIndex("modified", "modified", { unique: false });
        }

        // Images store (for large image blobs)
        if (!db.objectStoreNames.contains(STORAGE_CONFIG.STORES.IMAGES)) {
          db.createObjectStore(STORAGE_CONFIG.STORES.IMAGES, { keyPath: "id" });
        }

        // Thumbnails store (for quick preview)
        if (!db.objectStoreNames.contains(STORAGE_CONFIG.STORES.THUMBNAILS)) {
          db.createObjectStore(STORAGE_CONFIG.STORES.THUMBNAILS, {
            keyPath: "albumId",
          });
        }
      };
    });
  }

  async saveAlbum(albumData) {
    await this.init();

    // First compress album data (this may take time with async operations)
    const compressedAlbum = await this.compressAlbumData(albumData);

    // Then start a new transaction for the actual save operation
    const transaction = this.db.transaction(
      [STORAGE_CONFIG.STORES.ALBUMS],
      "readwrite",
    );
    const store = transaction.objectStore(STORAGE_CONFIG.STORES.ALBUMS);

    return new Promise((resolve, reject) => {
      const request = store.put(compressedAlbum);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAlbum(albumId) {
    await this.init();

    const transaction = this.db.transaction(
      [STORAGE_CONFIG.STORES.ALBUMS],
      "readonly",
    );
    const store = transaction.objectStore(STORAGE_CONFIG.STORES.ALBUMS);

    return new Promise((resolve, reject) => {
      const request = store.get(albumId);
      request.onsuccess = async () => {
        if (request.result) {
          const decompressedAlbum = await this.decompressAlbumData(
            request.result,
          );
          resolve(decompressedAlbum);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAllAlbums() {
    await this.init();

    const transaction = this.db.transaction(
      [STORAGE_CONFIG.STORES.ALBUMS],
      "readonly",
    );
    const store = transaction.objectStore(STORAGE_CONFIG.STORES.ALBUMS);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = async () => {
        const albums = await Promise.all(
          request.result.map((album) => this.decompressAlbumData(album)),
        );
        // Sort by modified date (most recent first)
        albums.sort((a, b) => b.modified - a.modified);
        resolve(albums);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteAlbum(albumId) {
    await this.init();

    try {
      // First get the album to find all its images
      const album = await this.getAlbum(albumId);

      if (album) {
        // Collect all image references to delete
        const imagesToDelete = [];

        // Collect page images
        for (const page of album.pages) {
          for (const image of page.images) {
            if (image.imageRef) {
              imagesToDelete.push(image.imageRef);
            }
            if (image.originalImageRef) {
              imagesToDelete.push(image.originalImageRef);
            }
          }
        }

        // Collect available images
        for (const image of album.availableImages) {
          if (image.imageRef) {
            imagesToDelete.push(image.imageRef);
          }
        }

        // Delete all associated images
        if (imagesToDelete.length > 0) {
          await this.deleteImagesBatch(imagesToDelete);
        }
      }

      // Then delete the album metadata
      const transaction = this.db.transaction(
        [STORAGE_CONFIG.STORES.ALBUMS],
        "readwrite",
      );
      const store = transaction.objectStore(STORAGE_CONFIG.STORES.ALBUMS);

      return new Promise((resolve, reject) => {
        const request = store.delete(albumId);
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("Error deleting album:", error);
      throw error;
    }
  }

  async compressAlbumData(albumData) {
    // Create a clean metadata-only copy (small JSON)
    const album = {
      id: albumData.id,
      name: albumData.name,
      description: albumData.description,
      created: albumData.created,
      modified: albumData.modified,
      settings: albumData.settings,
      totalImages: albumData.totalImages,
      thumbnail: albumData.thumbnail,
      pages: [],
      availableImages: [],
    };

    // Collect all images to be stored separately
    const imagesToSave = [];

    // Process pages - store only metadata, not image data
    for (let pageIndex = 0; pageIndex < albumData.pages.length; pageIndex++) {
      const originalPage = albumData.pages[pageIndex];
      const cleanPage = {
        id: originalPage.id,
        color: originalPage.color,
        images: [],
      };

      // Process each image in the page
      for (const originalImage of originalPage.images) {
        const imageId = `${album.id}_page_${pageIndex}_${originalImage.id}`;

        // Store only metadata in the album JSON
        const cleanImage = {
          id: originalImage.id,
          name: originalImage.name,
          originalIndex: originalImage.originalIndex,
          x: originalImage.x,
          y: originalImage.y,
          previewWidth: originalImage.previewWidth,
          previewHeight: originalImage.previewHeight,
          rowIndex: originalImage.rowIndex,
          colIndex: originalImage.colIndex,
          naturalWidth: originalImage.naturalWidth,
          naturalHeight: originalImage.naturalHeight,
          originalWidth: originalImage.originalWidth,
          originalHeight: originalImage.originalHeight,
          // Preserve file metadata for UI compatibility
          file: originalImage.file
            ? {
                name: originalImage.file.name,
                size: originalImage.file.size,
                type: originalImage.file.type,
                lastModified: originalImage.file.lastModified,
              }
            : null,
          imageRef: imageId, // Reference to separate image storage
          originalImageRef: null, // Will be set if there's an original version
        };

        // Store the actual image data separately
        if (originalImage.src && originalImage.src.startsWith("data:")) {
          const compressedImage = await this.compressImageLossless(
            originalImage.src,
          );
          imagesToSave.push({ id: imageId, blob: compressedImage });

          // Handle original (uncropped) version if present
          if (
            originalImage.originalSrc &&
            originalImage.originalSrc.startsWith("data:")
          ) {
            const originalId = `${imageId}_original`;
            const compressedOriginal = await this.compressImageLossless(
              originalImage.originalSrc,
            );
            imagesToSave.push({ id: originalId, blob: compressedOriginal });
            cleanImage.originalImageRef = originalId;
          }
        }

        cleanPage.images.push(cleanImage);
      }

      album.pages.push(cleanPage);
    }

    // Process available images
    for (const originalImage of albumData.availableImages) {
      const imageId = `${album.id}_available_${originalImage.id}`;

      // Store only metadata
      const cleanImage = {
        id: originalImage.id,
        name: originalImage.name,
        originalIndex: originalImage.originalIndex,
        naturalWidth: originalImage.naturalWidth,
        naturalHeight: originalImage.naturalHeight,
        originalWidth: originalImage.originalWidth,
        originalHeight: originalImage.originalHeight,
        // Preserve file metadata for UI compatibility
        file: originalImage.file
          ? {
              name: originalImage.file.name,
              size: originalImage.file.size,
              type: originalImage.file.type,
              lastModified: originalImage.file.lastModified,
            }
          : null,
        imageRef: imageId,
      };

      // Store the actual image data separately
      if (originalImage.src && originalImage.src.startsWith("data:")) {
        const compressedImage = await this.compressImageLossless(
          originalImage.src,
        );
        imagesToSave.push({ id: imageId, blob: compressedImage });
      }

      album.availableImages.push(cleanImage);
    }

    // Save all images in batch
    if (imagesToSave.length > 0) {
      await this.saveImagesBatch(imagesToSave);
    }

    return album;
  }

  async decompressAlbumData(albumData) {
    // Create a copy of the album metadata
    const album = JSON.parse(JSON.stringify(albumData));

    // Reconstruct page images with actual image data
    for (const page of album.pages) {
      for (const image of page.images) {
        // Load the main image using the reference
        if (image.imageRef) {
          try {
            const imageBlob = await this.getImageBlob(image.imageRef);
            image.src = await this.blobToDataURL(imageBlob);
          } catch (error) {
            console.warn(`Failed to load image ${image.imageRef}:`, error);
            image.src = ""; // Fallback to empty string
          }
        }

        // Load original (uncropped) version if exists
        if (image.originalImageRef) {
          try {
            const originalBlob = await this.getImageBlob(
              image.originalImageRef,
            );
            image.originalSrc = await this.blobToDataURL(originalBlob);
          } catch (error) {
            console.warn(
              `Failed to load original image ${image.originalImageRef}:`,
              error,
            );
            image.originalSrc = "";
          }
        }

        // Clean up the reference fields (not needed in working data)
        delete image.imageRef;
        delete image.originalImageRef;
      }
    }

    // Reconstruct available images
    for (const image of album.availableImages) {
      if (image.imageRef) {
        try {
          const imageBlob = await this.getImageBlob(image.imageRef);
          image.src = await this.blobToDataURL(imageBlob);
        } catch (error) {
          console.warn(
            `Failed to load available image ${image.imageRef}:`,
            error,
          );
          image.src = "";
        }
      }

      // Clean up reference field
      delete image.imageRef;
    }

    return album;
  }

  async compressImageLossless(dataURL) {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);

        // Convert to PNG for lossless compression
        canvas.toBlob(resolve, "image/png");
      };

      img.src = dataURL;
    });
  }

  async saveImagesBatch(imagesToSave) {
    if (imagesToSave.length === 0) return true;

    // Process in smaller chunks to avoid transaction limits
    const CHUNK_SIZE = 10;

    for (let i = 0; i < imagesToSave.length; i += CHUNK_SIZE) {
      const chunk = imagesToSave.slice(i, i + CHUNK_SIZE);

      const transaction = this.db.transaction(
        [STORAGE_CONFIG.STORES.IMAGES],
        "readwrite",
      );
      const store = transaction.objectStore(STORAGE_CONFIG.STORES.IMAGES);

      await new Promise((resolve, reject) => {
        let completed = 0;
        const total = chunk.length;

        const checkCompletion = () => {
          completed++;
          if (completed === total) {
            resolve(true);
          }
        };

        transaction.onerror = () => reject(transaction.error);

        for (const imageData of chunk) {
          try {
            const request = store.put({
              id: imageData.id,
              blob: imageData.blob,
            });
            request.onsuccess = checkCompletion;
            request.onerror = () => reject(request.error);
          } catch (error) {
            console.warn(`Failed to save image ${imageData.id}:`, error);
            checkCompletion(); // Continue with other images
          }
        }
      });
    }

    return true;
  }

  async deleteImagesBatch(imageIds) {
    if (imageIds.length === 0) return true;

    const CHUNK_SIZE = 10;

    for (let i = 0; i < imageIds.length; i += CHUNK_SIZE) {
      const chunk = imageIds.slice(i, i + CHUNK_SIZE);

      const transaction = this.db.transaction(
        [STORAGE_CONFIG.STORES.IMAGES],
        "readwrite",
      );
      const store = transaction.objectStore(STORAGE_CONFIG.STORES.IMAGES);

      await new Promise((resolve, reject) => {
        let completed = 0;
        const total = chunk.length;

        const checkCompletion = () => {
          completed++;
          if (completed === total) {
            resolve(true);
          }
        };

        transaction.onerror = () => reject(transaction.error);

        for (const imageId of chunk) {
          try {
            const request = store.delete(imageId);
            request.onsuccess = checkCompletion;
            request.onerror = () => {
              console.warn(`Failed to delete image ${imageId}`);
              checkCompletion(); // Continue with other images
            };
          } catch (error) {
            console.warn(`Failed to delete image ${imageId}:`, error);
            checkCompletion(); // Continue with other images
          }
        }
      });
    }

    return true;
  }

  async saveImageBlob(imageId, blob) {
    const transaction = this.db.transaction(
      [STORAGE_CONFIG.STORES.IMAGES],
      "readwrite",
    );
    const store = transaction.objectStore(STORAGE_CONFIG.STORES.IMAGES);

    return new Promise((resolve, reject) => {
      const request = store.put({ id: imageId, blob });
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  async getImageBlob(imageId) {
    const transaction = this.db.transaction(
      [STORAGE_CONFIG.STORES.IMAGES],
      "readonly",
    );
    const store = transaction.objectStore(STORAGE_CONFIG.STORES.IMAGES);

    return new Promise((resolve, reject) => {
      const request = store.get(imageId);
      request.onsuccess = () => {
        if (request.result && request.result.blob) {
          resolve(request.result.blob);
        } else {
          reject(new Error(`Image not found: ${imageId}`));
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async blobToDataURL(blob) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }

  // Manual deep copy for large objects that can't be JSON.stringify'd
  manualDeepCopy(obj) {
    if (obj === null || typeof obj !== "object") return obj;
    if (obj instanceof Date) return new Date(obj);
    if (Array.isArray(obj)) return obj.map((item) => this.manualDeepCopy(item));

    const copy = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        copy[key] = this.manualDeepCopy(obj[key]);
      }
    }
    return copy;
  }
}

// LocalStorage fallback for basic metadata
class LocalStorageManager {
  constructor() {
    this.key = "tales_albums_metadata";
  }

  saveAlbumMetadata(album) {
    const metadata = {
      id: album.id,
      name: album.name,
      description: album.description,
      created: album.created,
      modified: album.modified,
      totalImages: album.totalImages,
      thumbnail: album.thumbnail,
    };

    const existingData = this.getAllAlbumsMetadata();
    const existingIndex = existingData.findIndex((a) => a.id === album.id);

    if (existingIndex >= 0) {
      existingData[existingIndex] = metadata;
    } else {
      existingData.push(metadata);
    }

    localStorage.setItem(this.key, JSON.stringify(existingData));
  }

  getAllAlbumsMetadata() {
    try {
      const data = localStorage.getItem(this.key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error reading albums metadata from localStorage:", error);
      return [];
    }
  }

  deleteAlbumMetadata(albumId) {
    const existingData = this.getAllAlbumsMetadata();
    const filteredData = existingData.filter((a) => a.id !== albumId);
    localStorage.setItem(this.key, JSON.stringify(filteredData));
  }
}

// Main storage manager that handles platform-specific storage
export class StorageManager {
  constructor() {
    this.platform = getPlatform();
    this.indexedDB = new IndexedDBStorage();
    this.localStorage = new LocalStorageManager();
  }

  async saveAlbum(albumData) {
    const albumWithMetadata = {
      ...albumData,
      modified: Date.now(),
      created: albumData.created || Date.now(),
    };

    try {
      if (this.platform === "web") {
        // Save full album to IndexedDB
        await this.indexedDB.saveAlbum(albumWithMetadata);

        // Save metadata to localStorage as backup
        this.localStorage.saveAlbumMetadata(albumWithMetadata);

        return albumWithMetadata.id;
      } else {
        // Mobile platform - will implement Capacitor storage
        return await this.saveMobileAlbum(albumWithMetadata);
      }
    } catch (error) {
      console.error("Error saving album:", error);
      throw error;
    }
  }

  async getAlbum(albumId) {
    try {
      if (this.platform === "web") {
        return await this.indexedDB.getAlbum(albumId);
      } else {
        return await this.getMobileAlbum(albumId);
      }
    } catch (error) {
      console.error("Error getting album:", error);
      throw error;
    }
  }

  async getAllAlbums() {
    try {
      if (this.platform === "web") {
        return await this.indexedDB.getAllAlbums();
      } else {
        return await this.getAllMobileAlbums();
      }
    } catch (error) {
      console.error("Error getting all albums:", error);
      return [];
    }
  }

  async deleteAlbum(albumId) {
    try {
      if (this.platform === "web") {
        await this.indexedDB.deleteAlbum(albumId);
        this.localStorage.deleteAlbumMetadata(albumId);
        return true;
      } else {
        return await this.deleteMobileAlbum(albumId);
      }
    } catch (error) {
      console.error("Error deleting album:", error);
      throw error;
    }
  }

  // Mobile platform methods using Capacitor
  async saveMobileAlbum(albumData) {
    const { capacitorStorage } = await import("./capacitorStorage.js");
    return await capacitorStorage.saveAlbum(albumData);
  }

  async getMobileAlbum(albumId) {
    const { capacitorStorage } = await import("./capacitorStorage.js");
    return await capacitorStorage.getAlbum(albumId);
  }

  async getAllMobileAlbums() {
    const { capacitorStorage } = await import("./capacitorStorage.js");
    return await capacitorStorage.getAllAlbums();
  }

  async deleteMobileAlbum(albumId) {
    const { capacitorStorage } = await import("./capacitorStorage.js");
    return await capacitorStorage.deleteAlbum(albumId);
  }

  // Utility methods
  generateAlbumId() {
    return (
      "album_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
    );
  }

  async generateThumbnail(pages) {
    if (!pages || pages.length === 0) return null;

    const firstPage = pages[0];
    if (!firstPage.images || firstPage.images.length === 0) return null;

    // Create a small canvas to generate thumbnail
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 200;
    canvas.height = 150;

    // Draw background color
    ctx.fillStyle = firstPage.color || "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw first image as thumbnail
    const firstImage = firstPage.images[0];
    if (firstImage.src) {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const aspectRatio = img.naturalWidth / img.naturalHeight;
          let drawWidth = canvas.width;
          let drawHeight = canvas.height;

          if (aspectRatio > canvas.width / canvas.height) {
            drawHeight = canvas.width / aspectRatio;
          } else {
            drawWidth = canvas.height * aspectRatio;
          }

          const x = (canvas.width - drawWidth) / 2;
          const y = (canvas.height - drawHeight) / 2;

          ctx.drawImage(img, x, y, drawWidth, drawHeight);
          resolve(canvas.toDataURL("image/jpeg", 0.8));
        };
        img.src = firstImage.src;
      });
    }

    return canvas.toDataURL("image/jpeg", 0.8);
  }

  // Utility method to clean up orphaned images
  async cleanupOrphanedImages() {
    try {
      if (this.platform === "web") {
        return await this.cleanupOrphanedImagesWeb();
      } else {
        return await this.cleanupOrphanedImagesMobile();
      }
    } catch (error) {
      console.error("Error cleaning up orphaned images:", error);
      return { deleted: 0, errors: 1 };
    }
  }

  async cleanupOrphanedImagesWeb() {
    const albums = await this.indexedDB.getAllAlbums();
    const activeImageRefs = new Set();

    // Collect all active image references
    for (const album of albums) {
      for (const page of album.pages) {
        for (const image of page.images) {
          if (image.imageRef) activeImageRefs.add(image.imageRef);
          if (image.originalImageRef)
            activeImageRefs.add(image.originalImageRef);
        }
      }
      for (const image of album.availableImages) {
        if (image.imageRef) activeImageRefs.add(image.imageRef);
      }
    }

    // Get all stored images and find orphans
    await this.indexedDB.init();
    const transaction = this.indexedDB.db.transaction(
      [STORAGE_CONFIG.STORES.IMAGES],
      "readonly",
    );
    const store = transaction.objectStore(STORAGE_CONFIG.STORES.IMAGES);

    return new Promise((resolve) => {
      const request = store.getAllKeys();
      request.onsuccess = async () => {
        const allImageIds = request.result;
        const orphanedImages = allImageIds.filter(
          (id) => !activeImageRefs.has(id),
        );

        if (orphanedImages.length > 0) {
          await this.indexedDB.deleteImagesBatch(orphanedImages);
          console.log(`Cleaned up ${orphanedImages.length} orphaned images`);
        }

        resolve({ deleted: orphanedImages.length, errors: 0 });
      };
      request.onerror = () => resolve({ deleted: 0, errors: 1 });
    });
  }

  async cleanupOrphanedImagesMobile() {
    // For mobile, orphaned images are cleaned up automatically
    // since each album has its own directory
    return { deleted: 0, errors: 0 };
  }
}

// Create a singleton instance
export const storageManager = new StorageManager();
