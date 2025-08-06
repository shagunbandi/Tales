import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { storageManager } from '../utils/storageUtils.js';

/**
 * Hook for managing album storage operations
 * Provides save, load, delete, and list functionality for albums
 */
export const useAlbumStorage = () => {
  const [albums, setAlbums] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load all albums metadata on initialization
  useEffect(() => {
    loadAllAlbums();
  }, []);

  const loadAllAlbums = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const allAlbums = await storageManager.getAllAlbums();
      setAlbums(allAlbums);
      setIsInitialized(true);
    } catch (error) {
      console.error('Error loading albums:', error);
      toast.error('Failed to load saved albums');
      setAlbums([]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  /**
   * Save current state as an album
   * @param {Object} albumData - Album data containing pages, availableImages, settings
   * @param {string} albumName - Name for the album
   * @param {string} albumDescription - Optional description
   * @param {string} existingId - Optional ID if updating existing album
   */
  const saveAlbum = useCallback(async (albumData, albumName, albumDescription = '', existingId = null) => {
    if (!albumName?.trim()) {
      toast.error('Please provide a name for the album');
      return null;
    }

    setIsLoading(true);
    try {
      // Generate thumbnail from first page
      const thumbnail = await storageManager.generateThumbnail(albumData.pages);
      
      const albumToSave = {
        id: existingId || storageManager.generateAlbumId(),
        name: albumName.trim(),
        description: albumDescription.trim(),
        created: existingId ? albums.find(a => a.id === existingId)?.created || Date.now() : Date.now(),
        modified: Date.now(),
        settings: albumData.settings,
        pages: albumData.pages,
        availableImages: albumData.availableImages,
        totalImages: albumData.totalImages,
        thumbnail
      };

      const savedId = await storageManager.saveAlbum(albumToSave);
      
      // Update local albums list
      if (existingId) {
        setAlbums(prev => prev.map(album => 
          album.id === existingId ? albumToSave : album
        ));
        toast.success(`Album "${albumName}" updated successfully!`);
      } else {
        setAlbums(prev => [albumToSave, ...prev]);
        toast.success(`Album "${albumName}" saved successfully!`);
      }

      return savedId;
    } catch (error) {
      console.error('Error saving album:', error);
      toast.error('Failed to save album. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [albums]);

  /**
   * Load a specific album by ID
   * @param {string} albumId - The album ID to load
   */
  const loadAlbum = useCallback(async (albumId) => {
    setIsLoading(true);
    try {
      const album = await storageManager.getAlbum(albumId);
      
      if (!album) {
        toast.error('Album not found');
        return null;
      }

      toast.success(`Album "${album.name}" loaded successfully!`);
      return album;
    } catch (error) {
      console.error('Error loading album:', error);
      toast.error('Failed to load album');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Delete an album
   * @param {string} albumId - The album ID to delete
   * @param {string} albumName - The album name for confirmation message
   */
  const deleteAlbum = useCallback(async (albumId, albumName) => {
    setIsLoading(true);
    try {
      await storageManager.deleteAlbum(albumId);
      
      // Remove from local albums list
      setAlbums(prev => prev.filter(album => album.id !== albumId));
      toast.success(`Album "${albumName}" deleted successfully!`);
      
      return true;
    } catch (error) {
      console.error('Error deleting album:', error);
      toast.error('Failed to delete album');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Duplicate an existing album
   * @param {string} albumId - The album ID to duplicate
   * @param {string} newName - Name for the duplicated album
   */
  const duplicateAlbum = useCallback(async (albumId, newName) => {
    setIsLoading(true);
    try {
      const originalAlbum = await storageManager.getAlbum(albumId);
      
      if (!originalAlbum) {
        toast.error('Original album not found');
        return null;
      }

      // Create new album data with new ID and name
      const duplicatedAlbum = {
        ...originalAlbum,
        id: storageManager.generateAlbumId(),
        name: newName,
        created: Date.now(),
        modified: Date.now()
      };

      const savedId = await storageManager.saveAlbum(duplicatedAlbum);
      
      // Add to local albums list
      setAlbums(prev => [duplicatedAlbum, ...prev]);
      toast.success(`Album duplicated as "${newName}"!`);
      
      return savedId;
    } catch (error) {
      console.error('Error duplicating album:', error);
      toast.error('Failed to duplicate album');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get album metadata without loading full album data
   * @param {string} albumId - The album ID
   */
  const getAlbumMetadata = useCallback((albumId) => {
    return albums.find(album => album.id === albumId);
  }, [albums]);

  /**
   * Search albums by name
   * @param {string} query - Search query
   */
  const searchAlbums = useCallback((query) => {
    if (!query?.trim()) return albums;
    
    const searchTerm = query.toLowerCase();
    return albums.filter(album => 
      album.name.toLowerCase().includes(searchTerm) ||
      album.description.toLowerCase().includes(searchTerm)
    );
  }, [albums]);

  /**
   * Get albums sorted by different criteria
   * @param {string} sortBy - 'name', 'created', 'modified', 'totalImages'
   * @param {string} direction - 'asc' or 'desc'
   */
  const getSortedAlbums = useCallback((sortBy = 'modified', direction = 'desc') => {
    const sorted = [...albums].sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'created':
          aVal = a.created;
          bVal = b.created;
          break;
        case 'modified':
          aVal = a.modified;
          bVal = b.modified;
          break;
        case 'totalImages':
          aVal = a.totalImages || 0;
          bVal = b.totalImages || 0;
          break;
        default:
          aVal = a.modified;
          bVal = b.modified;
      }
      
      if (direction === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });
    
    return sorted;
  }, [albums]);

  /**
   * Export album data as JSON file
   * @param {string} albumId - The album ID to export
   */
  const exportAlbum = useCallback(async (albumId) => {
    try {
      const album = await storageManager.getAlbum(albumId);
      
      if (!album) {
        toast.error('Album not found');
        return;
      }

      const dataStr = JSON.stringify(album, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${album.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`Album "${album.name}" exported successfully!`);
    } catch (error) {
      console.error('Error exporting album:', error);
      toast.error('Failed to export album');
    }
  }, []);

  /**
   * Import album from JSON file
   * @param {File} file - The JSON file containing album data
   */
  const importAlbum = useCallback(async (file) => {
    if (!file) return null;

    setIsLoading(true);
    try {
      const text = await file.text();
      const albumData = JSON.parse(text);
      
      // Validate album data structure
      if (!albumData.pages || !Array.isArray(albumData.pages)) {
        throw new Error('Invalid album file format');
      }

      // Generate new ID and update timestamps
      const importedAlbum = {
        ...albumData,
        id: storageManager.generateAlbumId(),
        name: `${albumData.name} (Imported)`,
        created: Date.now(),
        modified: Date.now()
      };

      const savedId = await storageManager.saveAlbum(importedAlbum);
      
      // Add to local albums list
      setAlbums(prev => [importedAlbum, ...prev]);
      toast.success(`Album imported successfully as "${importedAlbum.name}"!`);
      
      return savedId;
    } catch (error) {
      console.error('Error importing album:', error);
      toast.error('Failed to import album. Please check the file format.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // State
    albums,
    isLoading,
    isInitialized,
    
    // Actions
    saveAlbum,
    loadAlbum,
    deleteAlbum,
    duplicateAlbum,
    loadAllAlbums,
    
    // Utilities
    getAlbumMetadata,
    searchAlbums,
    getSortedAlbums,
    exportAlbum,
    importAlbum,
  };
};