/**
 * Capacitor storage utilities for mobile platforms (iOS/Android)
 * Uses Capacitor Filesystem API for images and Preferences API for metadata
 */

import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Preferences } from "@capacitor/preferences";

export class CapacitorStorage {
  constructor() {
    this.albumsDir = "tales-albums";
    this.metadataKey = "tales_albums_metadata";
  }

  async init() {
    try {
      // Ensure albums directory exists
      await Filesystem.mkdir({
        path: this.albumsDir,
        directory: Directory.Documents,
        recursive: true,
      });
    } catch (error) {
      // Directory might already exist, which is fine
      if (!error.message.includes("File exists")) {
        console.error("Error creating albums directory:", error);
      }
    }
  }

  async saveAlbum(albumData) {
    await this.init();

    const albumId = albumData.id;
    const albumDir = `${this.albumsDir}/${albumId}`;

    try {
      // Create album directory
      await Filesystem.mkdir({
        path: albumDir,
        directory: Directory.Documents,
        recursive: true,
      });

      // Process and save images separately
      const processedAlbum = await this.processAlbumForStorage(
        albumData,
        albumDir,
      );

      // Save album metadata as JSON
      await Filesystem.writeFile({
        path: `${albumDir}/album.json`,
        data: JSON.stringify(processedAlbum),
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });

      // Update albums metadata list
      await this.updateAlbumsMetadata(albumData);

      return albumId;
    } catch (error) {
      console.error("Error saving album to mobile storage:", error);
      throw error;
    }
  }

  async processAlbumForStorage(albumData, albumDir) {
    const album = JSON.parse(JSON.stringify(albumData));

    // Process page images
    for (let pageIndex = 0; pageIndex < album.pages.length; pageIndex++) {
      const page = album.pages[pageIndex];
      for (let imgIndex = 0; imgIndex < page.images.length; imgIndex++) {
        const image = page.images[imgIndex];
        if (image.src && image.src.startsWith("data:")) {
          const filename = `page_${pageIndex}_img_${imgIndex}_${image.id}.png`;
          const filepath = await this.saveImageFile(
            image.src,
            albumDir,
            filename,
          );
          image.src = filepath;
        }
        if (image.originalSrc && image.originalSrc.startsWith("data:")) {
          const filename = `page_${pageIndex}_img_${imgIndex}_${image.id}_original.png`;
          const filepath = await this.saveImageFile(
            image.originalSrc,
            albumDir,
            filename,
          );
          image.originalSrc = filepath;
        }
      }
    }

    // Process available images
    for (
      let imgIndex = 0;
      imgIndex < album.availableImages.length;
      imgIndex++
    ) {
      const image = album.availableImages[imgIndex];
      if (image.src && image.src.startsWith("data:")) {
        const filename = `available_${imgIndex}_${image.id}.png`;
        const filepath = await this.saveImageFile(
          image.src,
          albumDir,
          filename,
        );
        image.src = filepath;
      }
    }

    return album;
  }

  async saveImageFile(dataURL, albumDir, filename) {
    try {
      // Convert data URL to base64
      const base64Data = dataURL.split(",")[1];

      const filepath = `${albumDir}/${filename}`;
      await Filesystem.writeFile({
        path: filepath,
        data: base64Data,
        directory: Directory.Documents,
      });

      return filepath;
    } catch (error) {
      console.error("Error saving image file:", error);
      throw error;
    }
  }

  async getAlbum(albumId) {
    try {
      const albumDir = `${this.albumsDir}/${albumId}`;

      // Read album JSON
      const albumFile = await Filesystem.readFile({
        path: `${albumDir}/album.json`,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });

      const album = JSON.parse(albumFile.data);

      // Load image data back to data URLs
      const processedAlbum = await this.loadAlbumImages(album, albumDir);

      return processedAlbum;
    } catch (error) {
      console.error("Error getting album from mobile storage:", error);
      if (error.message.includes("File does not exist")) {
        return null;
      }
      throw error;
    }
  }

  async loadAlbumImages(album, albumDir) {
    // Process page images
    for (const page of album.pages) {
      for (const image of page.images) {
        if (image.src && !image.src.startsWith("data:")) {
          try {
            const imageData = await Filesystem.readFile({
              path: image.src,
              directory: Directory.Documents,
            });
            image.src = `data:image/png;base64,${imageData.data}`;
          } catch (error) {
            console.error("Error loading image:", image.src, error);
            image.src = ""; // Fallback to empty string
          }
        }

        if (image.originalSrc && !image.originalSrc.startsWith("data:")) {
          try {
            const originalData = await Filesystem.readFile({
              path: image.originalSrc,
              directory: Directory.Documents,
            });
            image.originalSrc = `data:image/png;base64,${originalData.data}`;
          } catch (error) {
            console.error(
              "Error loading original image:",
              image.originalSrc,
              error,
            );
            image.originalSrc = "";
          }
        }
      }
    }

    // Process available images
    for (const image of album.availableImages) {
      if (image.src && !image.src.startsWith("data:")) {
        try {
          const imageData = await Filesystem.readFile({
            path: image.src,
            directory: Directory.Documents,
          });
          image.src = `data:image/png;base64,${imageData.data}`;
        } catch (error) {
          console.error("Error loading available image:", image.src, error);
          image.src = "";
        }
      }
    }

    return album;
  }

  async getAllAlbums() {
    try {
      const metadata = await this.getAlbumsMetadata();

      // For mobile, we'll return metadata first for performance
      // Full albums can be loaded individually when needed
      const albums = [];

      for (const albumMeta of metadata) {
        try {
          const fullAlbum = await this.getAlbum(albumMeta.id);
          if (fullAlbum) {
            albums.push(fullAlbum);
          }
        } catch (error) {
          console.error(`Error loading album ${albumMeta.id}:`, error);
          // Continue with other albums
        }
      }

      return albums.sort((a, b) => b.modified - a.modified);
    } catch (error) {
      console.error("Error getting all albums from mobile storage:", error);
      return [];
    }
  }

  async deleteAlbum(albumId) {
    try {
      const albumDir = `${this.albumsDir}/${albumId}`;

      // Get list of files in album directory and delete them
      try {
        const files = await Filesystem.readdir({
          path: albumDir,
          directory: Directory.Documents,
        });

        // Delete all files in the album directory (including images and metadata)
        for (const file of files.files) {
          try {
            await Filesystem.deleteFile({
              path: `${albumDir}/${file.name}`,
              directory: Directory.Documents,
            });
          } catch (fileError) {
            console.warn(`Failed to delete file ${file.name}:`, fileError);
            // Continue deleting other files
          }
        }

        // Delete the album directory itself
        await Filesystem.rmdir({
          path: albumDir,
          directory: Directory.Documents,
        });

        console.log(`Successfully deleted album directory: ${albumDir}`);
      } catch (error) {
        console.warn(
          "Album directory might not exist or already deleted:",
          error,
        );
        // Continue with metadata cleanup even if directory deletion fails
      }

      // Remove from metadata
      await this.removeAlbumFromMetadata(albumId);

      return true;
    } catch (error) {
      console.error("Error deleting album from mobile storage:", error);
      throw error;
    }
  }

  async updateAlbumsMetadata(album) {
    try {
      const metadata = await this.getAlbumsMetadata();
      const albumMeta = {
        id: album.id,
        name: album.name,
        description: album.description,
        created: album.created,
        modified: album.modified,
        totalImages: album.totalImages,
        thumbnail: album.thumbnail,
      };

      const existingIndex = metadata.findIndex((a) => a.id === album.id);
      if (existingIndex >= 0) {
        metadata[existingIndex] = albumMeta;
      } else {
        metadata.push(albumMeta);
      }

      await Preferences.set({
        key: this.metadataKey,
        value: JSON.stringify(metadata),
      });
    } catch (error) {
      console.error("Error updating albums metadata:", error);
    }
  }

  async getAlbumsMetadata() {
    try {
      const result = await Preferences.get({ key: this.metadataKey });
      return result.value ? JSON.parse(result.value) : [];
    } catch (error) {
      console.error("Error getting albums metadata:", error);
      return [];
    }
  }

  async removeAlbumFromMetadata(albumId) {
    try {
      const metadata = await this.getAlbumsMetadata();
      const filteredMetadata = metadata.filter((a) => a.id !== albumId);

      await Preferences.set({
        key: this.metadataKey,
        value: JSON.stringify(filteredMetadata),
      });
    } catch (error) {
      console.error("Error removing album from metadata:", error);
    }
  }

  // Utility method to get storage info
  async getStorageInfo() {
    try {
      const stat = await Filesystem.stat({
        path: this.albumsDir,
        directory: Directory.Documents,
      });

      return {
        albumsDir: this.albumsDir,
        exists: true,
        size: stat.size,
        modified: stat.mtime,
      };
    } catch (error) {
      return {
        albumsDir: this.albumsDir,
        exists: false,
        error: error.message,
      };
    }
  }
}

export const capacitorStorage = new CapacitorStorage();
