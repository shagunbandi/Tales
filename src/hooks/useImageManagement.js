import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { processFiles } from "../utils/imageUtils.js";
import {
  getRandomColor,
  findCorrectInsertPosition,
  arrangeImages,
} from "../utils/layoutUtils.js";
import { autoArrangeImages } from "../utils/autoArrangeUtils.js";
import { generatePDF } from "../utils/pdfUtils.js";
import {
  randomizePageLayout,
  shuffleImagesInLayout,
  randomizeLayoutStructure,
  cycleLayoutStructure,
} from "../utils/randomizeUtils.js";
import {
  nextPageLayout,
  previousPageLayout,
  resetPageLayoutState,
} from "../utils/layoutCycling.js";
import { COLOR_PALETTE, getPreviewDimensions } from "../constants.js";
import { storageManager } from "../utils/storageUtils.js";

export const useImageManagement = (settings = null) => {
  const [pages, setPages] = useState([]);
  const [availableImages, setAvailableImages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(null);

  /**
   * Detect the current layout structure from positioned images
   * @param {Array} images - Array of images with position data
   * @returns {Array} Layout structure like [2, 2, 1] for 2 images in row 0, 2 in row 1, 1 in row 2
   */
  const detectCurrentLayout = useCallback((images) => {
    if (!images || images.length === 0) return [];
    
    // Group images by row index
    const rowGroups = {};
    images.forEach(image => {
      const row = image.rowIndex || 0;
      rowGroups[row] = (rowGroups[row] || 0) + 1;
    });
    
    // Convert to layout array
    const maxRow = Math.max(...Object.keys(rowGroups).map(Number));
    const layout = [];
    for (let i = 0; i <= maxRow; i++) {
      layout.push(rowGroups[i] || 0);
    }
    
    return layout;
  }, []);

  /**
   * Place images in specific order while maintaining exact layout structure
   * @param {Array} images - Array of images in desired order
   * @param {Array} layoutStructure - Layout structure like [2, 2, 1]
   * @returns {Array} Images positioned according to the fixed layout structure
   */
  const placeImagesInOrder = useCallback((images, layoutStructure) => {
    if (!images || images.length === 0 || !layoutStructure || layoutStructure.length === 0) {
      return images;
    }
    
    const { width: previewWidth, height: previewHeight } = getPreviewDimensions(settings);
    const numRows = layoutStructure.length;
    const rowHeight = previewHeight / numRows;
    
    const positionedImages = [];
    let imageIndex = 0;
    
    for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
      const imagesInRow = layoutStructure[rowIndex];
      const cellWidth = previewWidth / imagesInRow;
      
      for (let colIndex = 0; colIndex < imagesInRow; colIndex++) {
        if (imageIndex < images.length) {
          const image = images[imageIndex];
          positionedImages.push({
            ...image,
            x: colIndex * cellWidth,
            y: rowIndex * rowHeight,
            previewWidth: cellWidth,
            previewHeight: rowHeight,
            rowIndex,
            colIndex,
          });
          imageIndex++;
        }
      }
    }
    
    return positionedImages;
  }, [settings]);

  /**
   * Arrange images using the appropriate layout method based on design style
   * For classical: uses proper margins, gaps, and centering
   * For full cover: maintains current layout structure
   */
  const arrangeImagesWithCorrectLayout = useCallback(async (images, preserveLayoutStructure = false) => {
    if (!images || images.length === 0) return [];
    
    const { width: previewWidth, height: previewHeight } = getPreviewDimensions(settings);
    
    if (settings.designStyle === "full_cover" && preserveLayoutStructure) {
      // For full cover with structure preservation (button movements)
      const currentLayout = detectCurrentLayout(images);
      return placeImagesInOrder(images, currentLayout);
    } else {
      // For both classical (always) and full cover (when not preserving structure)
      // This properly handles margins, gaps, and layout calculations
      return await arrangeImages(images, previewWidth, previewHeight, settings);
    }
  }, [settings, detectCurrentLayout, placeImagesInOrder]);

  /**
   * Preserve manual image positions without auto-arranging
   * Used for drag and drop operations where user controls positioning
   */
  const preserveManualLayout = useCallback((images) => {
    const { width: previewWidth, height: previewHeight } = getPreviewDimensions(settings);
    
    // Simple grid positioning that preserves order but doesn't use smart algorithms
    return images.map((image, index) => {
      const maxImagesPerRow = settings?.maxImagesPerRow || 4;
      const rowIndex = Math.floor(index / maxImagesPerRow);
      const colIndex = index % maxImagesPerRow;
      const imagesInThisRow = Math.min(maxImagesPerRow, images.length - rowIndex * maxImagesPerRow);
      
      const cellWidth = previewWidth / imagesInThisRow;
      const cellHeight = previewHeight / Math.ceil(images.length / maxImagesPerRow);
      
      return {
        ...image,
        x: colIndex * cellWidth,
        y: rowIndex * cellHeight,
        previewWidth: cellWidth,
        previewHeight: cellHeight,
        rowIndex,
        colIndex,
      };
    });
  }, [settings]);

  const handleFiles = useCallback(
    async (files) => {
      setIsProcessing(true);

      try {
        const processedImages = await processFiles(
          files,
          availableImages.length,
          settings,
        );
        setAvailableImages((prev) => [...prev, ...processedImages]);
        toast.success(`Successfully processed ${processedImages.length} image${processedImages.length !== 1 ? 's' : ''}!`);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setIsProcessing(false);
      }
    },
    [availableImages.length, settings],
  );

  const handleDragEnd = useCallback(
    async (event) => {
      const { active, over } = event;

      if (!over) return;

      // Extract source and destination information from the new API
      const sourceId = active.data.current?.sourceId;
      const sourceIndex = active.data.current?.sourceIndex;
      const destinationId = over.id;

      // Only allow dragging from available images to pages
      if (
        sourceId === "available-images" &&
        destinationId.startsWith("page-")
      ) {
        const imageIndex = sourceIndex;
        const pageId = destinationId;
        const imageToMove = availableImages[imageIndex];

        // First check if we can add the image to the target page
        const targetPage = pages.find((p) => p.id === pageId);

        // Calculate max images per page considering both settings
        const maxImagesPerRow = settings.maxImagesPerRow || 4;
        const maxNumberOfRows = settings.maxNumberOfRows || 2;
        const maxImagesFromGrid = maxImagesPerRow * maxNumberOfRows;
        const maxImagesPerPage = Math.min(
          maxImagesFromGrid,
          settings.imagesPerPage || maxImagesFromGrid,
        );

        if (
          settings.designStyle === "full_cover" &&
          targetPage &&
          targetPage.images.length >= maxImagesPerPage
        ) {
          // Show error toast and don't move the image
          toast.error(`Cannot add image: Page already has the maximum of ${maxImagesPerPage} images. Please remove some images first or add a new page.`);
          return;
        }

        // If we get here, we can move the image
        setAvailableImages((prev) =>
          prev.filter((_, index) => index !== imageIndex),
        );

        setPages((prev) => {
          // Normal behavior - add to existing page
          return prev.map((page) => {
            if (page.id === pageId) {
              const newImages = [...page.images];
              // Add to the end of the page images
              newImages.push(imageToMove);

              // Preserve manual layout without auto-arranging
              const arrangedImages = preserveManualLayout(newImages);

              return {
                ...page,
                images: arrangedImages,
              };
            }
            return page;
          });
        });
      }
    },
    [availableImages, pages, settings, preserveManualLayout],
  );

  const addPage = useCallback(() => {
    const newPage = {
      id: `page-${Date.now()}`,
      images: [],
      color: getRandomColor(),
    };
    setPages((prev) => [...prev, newPage]);
  }, []);

  const addPageBetween = useCallback((afterPageId) => {
    const newPage = {
      id: `page-${Date.now()}`,
      images: [],
      color: getRandomColor(),
    };
    setPages((prev) => {
      if (afterPageId === "start") {
        return [newPage, ...prev];
      }

      const afterIndex = prev.findIndex((p) => p.id === afterPageId);
      if (afterIndex === -1) return [...prev, newPage];

      const newPages = [...prev];
      newPages.splice(afterIndex + 1, 0, newPage);
      return newPages;
    });
  }, []);

  const removePage = useCallback(
    (pageId) => {
      const currentPages = pages;
      const pageToRemove = currentPages.find((p) => p.id === pageId);

      if (pageToRemove && pageToRemove.images.length > 0) {
        const sortedImages = [...pageToRemove.images].sort(
          (a, b) => a.originalIndex - b.originalIndex,
        );

        setAvailableImages((current) => {
          let newAvailable = [...current];

          sortedImages.forEach((image) => {
            const insertIndex = findCorrectInsertPosition(
              newAvailable,
              image.originalIndex,
            );
            newAvailable.splice(insertIndex, 0, image);
          });

          return newAvailable;
        });
      }

      setPages((prev) => prev.filter((p) => p.id !== pageId));
    },
    [pages.length, pages],
  );

  const changePageColor = useCallback((pageId) => {
    setPages((prev) =>
      prev.map((page) =>
        page.id === pageId ? { ...page, color: getRandomColor() } : page,
      ),
    );
  }, []);

  const removeAvailableImage = useCallback((index) => {
    setAvailableImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const autoArrangeImagesToPages = useCallback(async () => {
    if (availableImages.length === 0) return;

    setIsProcessing(true);
    setProgress(null);
    try {
      const { arrangedPages, remainingImages } = await autoArrangeImages(
        availableImages,
        pages,
        settings,
        (progressData) => {
          setProgress(progressData);
        },
      );

      setPages((prevPages) => [...prevPages, ...arrangedPages]);
      setAvailableImages(remainingImages);
      toast.success(`Successfully arranged images into ${arrangedPages.length} page${arrangedPages.length !== 1 ? 's' : ''}!`);
    } catch (err) {
      toast.error(`Failed to auto-arrange images: ${err.message}`);
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  }, [availableImages, pages, settings]);

  const moveImageBack = useCallback(
    async (pageId, imageIndex) => {
      const currentPages = pages;
      const currentPage = currentPages.find((p) => p.id === pageId);

      if (currentPage && currentPage.images[imageIndex]) {
        const imageToRemove = currentPage.images[imageIndex];

        // Restore original image if it was cropped
        const originalImage = imageToRemove.originalSrc
          ? {
              ...imageToRemove,
              src: imageToRemove.originalSrc,
              originalSrc: undefined,
              previewWidth: undefined,
              previewHeight: undefined,
              x: undefined,
              y: undefined,
              rowIndex: undefined,
              colIndex: undefined,
            }
          : imageToRemove;

        setAvailableImages((current) => {
          const newAvailable = [...current];
          const insertIndex = findCorrectInsertPosition(
            newAvailable,
            originalImage.originalIndex,
          );
          newAvailable.splice(insertIndex, 0, originalImage);
          return newAvailable;
        });

        // Remove image and arrange remaining images
        const newImages = [...currentPage.images];
        newImages.splice(imageIndex, 1);

        try {
          // Use correct layout method for remaining images
          const arrangedImages = newImages.length > 0 
            ? await arrangeImagesWithCorrectLayout(newImages, false)
            : [];

          setPages((prev) =>
            prev.map((page) =>
              page.id === pageId
                ? { ...page, images: arrangedImages }
                : page
            )
          );
        } catch (error) {
          console.error("Error in moveImageBack:", error);
          // Fallback to just removing the image
          setPages((prev) =>
            prev.map((page) =>
              page.id === pageId
                ? { ...page, images: newImages }
                : page
            )
          );
        }
      }
    },
    [pages, arrangeImagesWithCorrectLayout],
  );

  const moveAllImagesBack = useCallback(
    (pageId) => {
      const currentPages = pages;
      const pageToEmpty = currentPages.find((p) => p.id === pageId);

      if (pageToEmpty && pageToEmpty.images.length > 0) {
        const sortedImages = [...pageToEmpty.images].sort(
          (a, b) => a.originalIndex - b.originalIndex,
        );

        setAvailableImages((current) => {
          let newAvailable = [...current];

          sortedImages.forEach((image) => {
            // Restore original image if it was cropped
            const originalImage = image.originalSrc
              ? {
                  ...image,
                  src: image.originalSrc,
                  originalSrc: undefined,
                  previewWidth: undefined,
                  previewHeight: undefined,
                  x: undefined,
                  y: undefined,
                  rowIndex: undefined,
                  colIndex: undefined,
                }
              : image;

            const insertIndex = findCorrectInsertPosition(
              newAvailable,
              originalImage.originalIndex,
            );
            newAvailable.splice(insertIndex, 0, originalImage);
          });

          return newAvailable;
        });

        setPages((prev) =>
          prev.map((page) =>
            page.id === pageId ? { ...page, images: [] } : page,
          ),
        );
      }
    },
    [pages],
  );

  const autoArrangePage = useCallback(
    async (pageId) => {
      setPages((prev) =>
        prev.map((page) => {
          if (page.id === pageId && page.images.length > 0) {
            const { width: previewWidth, height: previewHeight } =
              getPreviewDimensions(settings);
            arrangeImages(
              page.images,
              previewWidth,
              previewHeight,
              settings,
            ).then((arrangedImages) => {
              setPages((currentPages) =>
                currentPages.map((currentPage) =>
                  currentPage.id === pageId
                    ? { ...currentPage, images: arrangedImages }
                    : currentPage,
                ),
              );
            });

            // Return current state while async operation completes
            return page;
          }
          return page;
        }),
      );
    },
    [settings],
  );

  const randomizePage = useCallback(
    async (pageId) => {
      setPages((prev) =>
        prev.map((page) => {
          if (page.id === pageId && page.images.length > 0) {
            shuffleImagesInLayout(page.images, settings).then(
              (shuffledImages) => {
                setPages((currentPages) =>
                  currentPages.map((currentPage) =>
                    currentPage.id === pageId
                      ? { ...currentPage, images: shuffledImages }
                      : currentPage,
                  ),
                );
              },
            );

            // Return current state while async operation completes
            return page;
          }
          return page;
        }),
      );
    },
    [settings],
  );

  const nextLayout = useCallback(
    async (pageId) => {
      const targetPage = pages.find(page => page.id === pageId);
      if (!targetPage || targetPage.images.length === 0) return;

      try {
        const newLayoutImages = await nextPageLayout(targetPage.images, settings, pageId);
        
        setPages(currentPages =>
          currentPages.map(page =>
            page.id === pageId
              ? { ...page, images: newLayoutImages }
              : page
          )
        );
      } catch (error) {
        console.error("Error in nextLayout:", error);
      }
    },
    [pages, settings],
  );

  const previousLayout = useCallback(
    async (pageId) => {
      const targetPage = pages.find(page => page.id === pageId);
      if (!targetPage || targetPage.images.length === 0) return;

      try {
        const newLayoutImages = await previousPageLayout(targetPage.images, settings, pageId);
        
        setPages(currentPages =>
          currentPages.map(page =>
            page.id === pageId
              ? { ...page, images: newLayoutImages }
              : page
          )
        );
      } catch (error) {
        console.error("Error in previousLayout:", error);
      }
    },
    [pages, settings],
  );

  // Legacy function - now calls nextLayout for backward compatibility
  const randomizeLayout = useCallback(
    async (pageId) => {
      return await nextLayout(pageId);
    },
    [nextLayout],
  );

  const updateImagePosition = useCallback((pageId, imageIndex, positionData) => {
    setPages((prev) =>
      prev.map((page) => {
        if (page.id === pageId) {
          const newImages = [...page.images];
          if (newImages[imageIndex]) {
            newImages[imageIndex] = {
              ...newImages[imageIndex],
              ...positionData,
            };
          }
          return { ...page, images: newImages };
        }
        return page;
      }),
    );
  }, []);

  const moveImageToPreviousPage = useCallback(async (sourcePageId, imageIndex, destPageId) => {
    const currentPages = pages;
    const sourcePage = currentPages.find((p) => p.id === sourcePageId);
    const destPage = currentPages.find((p) => p.id === destPageId);

    if (sourcePage && destPage && sourcePage.images[imageIndex]) {
      const imageToMove = sourcePage.images[imageIndex];

      // Calculate max images per page for destination
      const maxImagesPerRow = settings.maxImagesPerRow || 4;
      const maxNumberOfRows = settings.maxNumberOfRows || 2;
      const maxImagesFromGrid = maxImagesPerRow * maxNumberOfRows;
      const maxImagesPerPage = Math.min(
        maxImagesFromGrid,
        settings.imagesPerPage || maxImagesFromGrid,
      );

      // Check if destination page has space
      if (destPage.images.length >= maxImagesPerPage && settings.designStyle === "full_cover") {
        toast.error(`Cannot move image: Destination page already has the maximum of ${maxImagesPerPage} images. Please remove some images first.`);
        return;
      }

      try {
        // Prepare new image arrays
        const sourceNewImages = [...sourcePage.images];
        sourceNewImages.splice(imageIndex, 1);
        const destNewImages = [...destPage.images, imageToMove];

        // Arrange both pages with correct layout
        const [sourceArrangedImages, destArrangedImages] = await Promise.all([
          sourceNewImages.length > 0 
            ? arrangeImagesWithCorrectLayout(sourceNewImages, false)
            : Promise.resolve([]),
          arrangeImagesWithCorrectLayout(destNewImages, false)
        ]);

        setPages((prev) => 
          prev.map((page) => {
            if (page.id === sourcePageId) {
              return { ...page, images: sourceArrangedImages };
            } else if (page.id === destPageId) {
              return { ...page, images: destArrangedImages };
            }
            return page;
          })
        );
      } catch (error) {
        console.error("Error in moveImageToPreviousPage:", error);
      }
    }
  }, [pages, settings, arrangeImagesWithCorrectLayout]);

  const moveImageToNextPage = useCallback((sourcePageId, imageIndex, destPageId) => {
    // Same logic as moveImageToPreviousPage
    moveImageToPreviousPage(sourcePageId, imageIndex, destPageId);
  }, [moveImageToPreviousPage]);

  const swapImagesInPage = useCallback(async (pageId, index1, index2) => {
    const targetPage = pages.find(page => page.id === pageId);
    if (!targetPage || !targetPage.images[index1] || !targetPage.images[index2]) return;
    
    const newImages = [...targetPage.images];
    // Swap the images
    [newImages[index1], newImages[index2]] = [newImages[index2], newImages[index1]];
    
    try {
      // Use correct layout method based on design style
      const arrangedImages = await arrangeImagesWithCorrectLayout(newImages, true);
      
      setPages((prev) =>
        prev.map((page) =>
          page.id === pageId
            ? { ...page, images: arrangedImages }
            : page
        )
      );
    } catch (error) {
      console.error("Error in swapImagesInPage:", error);
    }
  }, [pages, arrangeImagesWithCorrectLayout]);

  const handleGeneratePDF = useCallback(async () => {
    if (pages.length === 0) return;

    setIsProcessing(true);
    setProgress(null);
    try {
      await generatePDF(pages, settings, (progressData) => {
        setProgress(progressData);
      });
      toast.success("PDF generated successfully!");
    } catch (err) {
      toast.error(`Failed to generate PDF: ${err.message}`);
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  }, [pages, settings]);

  // Album storage functionality - with auto-overwrite support
  const saveCurrentAsAlbum = useCallback(async (albumName, albumDescription = '', existingId = null) => {
    if (!albumName?.trim()) {
      toast.error('Please provide a name for the album');
      return null;
    }

    if (pages.length === 0 && availableImages.length === 0) {
      toast.error('No images to save. Please add some images first.');
      return null;
    }

    setIsProcessing(true);
    try {
      // Generate thumbnail from first page
      const thumbnail = await storageManager.generateThumbnail(pages);
      
      let albumId = existingId;
      let originalCreatedTime = Date.now();
      
      // If we have an existing ID, preserve the original created time
      if (existingId) {
        try {
          const existingAlbum = await storageManager.getAlbum(existingId);
          if (existingAlbum) {
            originalCreatedTime = existingAlbum.created;
          }
        } catch (error) {
          console.warn('Could not fetch existing album for created time:', error);
        }
      } else {
        // Generate new ID for new albums
        albumId = storageManager.generateAlbumId();
      }
      
      const albumToSave = {
        id: albumId,
        name: albumName.trim(),
        description: albumDescription.trim(),
        created: originalCreatedTime,
        modified: Date.now(),
        settings: settings || {},
        pages: pages,
        availableImages: availableImages,
        totalImages: pages.reduce((sum, page) => sum + page.images.length, 0) + availableImages.length,
        thumbnail
      };

      const savedId = await storageManager.saveAlbum(albumToSave);
      
      if (existingId) {
        toast.success(`💾 Album "${albumName}" updated successfully!`, {
          icon: '✅',
        });
      } else {
        toast.success(`💾 Album "${albumName}" saved successfully!`, {
          icon: '🎉',
        });
      }

      return savedId;
    } catch (error) {
      console.error('Error saving album:', error);
      toast.error('Failed to save album. Please try again.');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [pages, availableImages, settings]);

  const loadAlbumById = useCallback(async (albumId) => {
    setIsProcessing(true);
    try {
      const album = await storageManager.getAlbum(albumId);
      
      if (!album) {
        toast.error('Album not found');
        return false;
      }

      // Replace current state with loaded album data
      setPages(album.pages || []);
      setAvailableImages(album.availableImages || []);
      
      toast.success(`Album "${album.name}" loaded successfully!`);
      return album;
    } catch (error) {
      console.error('Error loading album:', error);
      toast.error('Failed to load album');
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const clearCurrentWork = useCallback(() => {
    setPages([]);
    setAvailableImages([]);
    toast.success('Work area cleared');
  }, []);

  const getCurrentAlbumData = useCallback(() => {
    return {
      pages,
      availableImages,
      totalImages: pages.reduce((sum, page) => sum + page.images.length, 0) + availableImages.length,
      settings: settings || {}
    };
  }, [pages, availableImages, settings]);

  const loadAlbumData = useCallback((albumData) => {
    if (!albumData) {
      toast.error('Invalid album data');
      return false;
    }

    try {
      setPages(albumData.pages || []);
      setAvailableImages(albumData.availableImages || []);
      return true;
    } catch (error) {
      console.error('Error loading album data:', error);
      toast.error('Failed to load album data');
      return false;
    }
  }, []);

  // Auto-save functionality (optional)
  const enableAutoSave = useCallback((albumId, intervalMs = 30000) => {
    let autoSaveInterval;
    
    const performAutoSave = async () => {
      if (pages.length > 0 || availableImages.length > 0) {
        try {
          const album = await storageManager.getAlbum(albumId);
          if (album) {
            await saveCurrentAsAlbum(album.name, album.description, albumId);
          }
        } catch (error) {
          console.error('Auto-save failed:', error);
          // Don't show error toast for auto-save failures
        }
      }
    };

    autoSaveInterval = setInterval(performAutoSave, intervalMs);
    
    // Return cleanup function
    return () => {
      if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
      }
    };
  }, [pages, availableImages, saveCurrentAsAlbum]);

  const totalImages =
    pages.reduce((sum, page) => sum + page.images.length, 0) +
    availableImages.length;

  return {
    pages,
    availableImages,
    isProcessing,
    progress,
    totalImages,
    handleFiles,
    handleDragEnd,
    addPage,
    addPageBetween,
    removePage,
    changePageColor,
    removeAvailableImage,
    autoArrangeImagesToPages,
    moveImageBack,
    moveAllImagesBack,
    autoArrangePage,
    randomizePage,
    randomizeLayout,
    nextLayout,
    previousLayout,
    updateImagePosition,
    moveImageToPreviousPage,
    moveImageToNextPage,
    swapImagesInPage,
    handleGeneratePDF,
    
    // Album storage methods
    saveCurrentAsAlbum,
    loadAlbumById,
    clearCurrentWork,
    getCurrentAlbumData,
    loadAlbumData,
    enableAutoSave,
  };
};
