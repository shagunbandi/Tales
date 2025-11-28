import React, { useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import ProgressToast from "../components/ProgressToast.jsx";
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
  resetPageLayoutState,
  reapplyCurrentLayout,
  setCurrentHardcodedLayout,
} from "../utils/layoutCycling.js";
import {
  applyHardcodedLayout,
  getLayoutOptions,
  hasHardcodedLayouts,
} from "../utils/hardcodedLayouts.js";
import { COLOR_PALETTE, getPreviewDimensions, getHardcodedLayoutsKey, getPreviewBorderWidth } from "../constants.js";
import { exportProject, loadProject, mergeProject } from "../utils/projectUtils.js";
import { debouncedSaveAppState, loadAppState, clearAppState } from "../utils/storageUtils.js";
import { recalculatePositionsPreservingLayout } from "../utils/fullCoverLayoutUtils.js";

export const useImageManagement = (settings = null) => {
  const [pages, setPages] = useState([]);
  const [availableImages, setAvailableImages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoadingFromStorage, setIsLoadingFromStorage] = useState(true);
  const [previousBorderWidth, setPreviousBorderWidth] = useState(settings?.pageBorderWidth || 0);
  const [previousOrientation, setPreviousOrientation] = useState(settings?.orientation || "landscape");

  // Load state from storage on initialization
  useEffect(() => {
    const loadStoredState = async () => {
      try {
        const storedState = await loadAppState();
        if (storedState && storedState.pages && storedState.availableImages) {
          // Migrate pages to ensure they have image border properties
          const migratedPages = storedState.pages.map(page => ({
            ...page,
            imageBorderColor: page.imageBorderColor || "#FFFFFF", // Default to white if not present
          }));
          setPages(migratedPages);
          setAvailableImages(storedState.availableImages);
        }
        // Small delay to ensure loading indicator is visible
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        // Failed to load stored state
      } finally {
        setIsInitialized(true);
        setIsLoadingFromStorage(false);
      }
    };

    loadStoredState();
  }, []);

  // Auto-save state changes
  useEffect(() => {
    if (isInitialized && settings) {
      debouncedSaveAppState(pages, availableImages, settings);
    }
  }, [pages, availableImages, settings, isInitialized]);

  // Auto re-arrange when page border width changes in full cover mode
  useEffect(() => {
    const currentBorderWidth = settings?.pageBorderWidth || 0;
    const isFullCover = settings?.designStyle === "full_cover";
    
    if (isInitialized && isFullCover && currentBorderWidth !== previousBorderWidth) {
      setPreviousBorderWidth(currentBorderWidth);
      
      // Re-arrange all pages with images (only those with borders enabled)
      if (pages.length > 0) {
        setPages((currentPages) => {
          // Process each page asynchronously
          currentPages.forEach(async (page) => {
            if (page.images.length === 0) return;
            // Only re-arrange if borders are enabled for this page
            if (page.enablePageBorder === false) return;
            
            try {
              const { width: previewWidth, height: previewHeight } = getPreviewDimensions(settings);
              const rearranged = await arrangeImages(
                page.images,
                previewWidth,
                previewHeight,
                settings
              );
              
              setPages((p) =>
                p.map((pg) =>
                  pg.id === page.id ? { ...pg, images: rearranged } : pg
                )
              );
            } catch (error) {
              // Failed to re-arrange page
            }
          });
          
          return currentPages;
        });
      }
    }
  }, [settings?.pageBorderWidth, settings?.designStyle, previousBorderWidth, isInitialized, pages.length, pages]);

  // Auto re-arrange when orientation changes (landscape/portrait)
  useEffect(() => {
    const currentOrientation = settings?.orientation || "landscape";
    
    if (isInitialized && currentOrientation !== previousOrientation) {
      setPreviousOrientation(currentOrientation);
      
      // Re-arrange all pages with images to apply new orientation
      if (pages.length > 0) {
        setPages((currentPages) => {
          // Process each page asynchronously
          currentPages.forEach(async (page) => {
            if (page.images.length === 0) return;
            
            try {
              const { width: previewWidth, height: previewHeight } = getPreviewDimensions(settings);
              const rearranged = await arrangeImages(
                page.images,
                previewWidth,
                previewHeight,
                settings
              );
              
              setPages((p) =>
                p.map((pg) =>
                  pg.id === page.id ? { ...pg, images: rearranged } : pg
                )
              );
            } catch (error) {
              // Failed to re-arrange page
            }
          });
          
          return currentPages;
        });
      }
    }
  }, [settings?.orientation, previousOrientation, isInitialized, pages.length, pages]);

  /**
   * Detect the current layout structure from positioned images
   * @param {Array} images - Array of images with position data
   * @returns {Array} Layout structure like [2, 2, 1] for 2 images in row 0, 2 in row 1, 1 in row 2
   */
  const detectCurrentLayout = useCallback((images) => {
    if (!images || images.length === 0) return [];

    // Group images by row index
    const rowGroups = {};
    images.forEach((image) => {
      if (image && typeof image === 'object') {
        const row = image.rowIndex || 0;
        rowGroups[row] = (rowGroups[row] || 0) + 1;
      }
    });

    // Convert to layout array
    const rowKeys = Object.keys(rowGroups);
    if (rowKeys.length === 0) return [];
    
    const maxRow = Math.max(...rowKeys.map(Number));
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
  const placeImagesInOrder = useCallback(
    (images, layoutStructure) => {
      if (
        !images ||
        images.length === 0 ||
        !layoutStructure ||
        layoutStructure.length === 0
      ) {
        return images || [];
      }

      try {
        const { width: previewWidth, height: previewHeight } =
          getPreviewDimensions(settings);
        const numRows = layoutStructure.length;
        const rowHeight = previewHeight / numRows;

        const positionedImages = [];
        let imageIndex = 0;

        for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
          const imagesInRow = layoutStructure[rowIndex];
          if (!imagesInRow || typeof imagesInRow !== 'number' || imagesInRow <= 0) {
            continue;
          }
          
          const cellWidth = previewWidth / imagesInRow;

          for (let colIndex = 0; colIndex < imagesInRow; colIndex++) {
            if (imageIndex < images.length && images[imageIndex]) {
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
      } catch (error) {

        return images || [];
      }
    },
    [settings],
  );

  /**
   * Arrange images using the appropriate layout method based on design style
   * Uses proper margins, gaps, and centering for layouts
   */
  const arrangeImagesWithCorrectLayout = useCallback(
    async (images, preserveLayoutStructure = false, pageId = null) => {
      if (!images || images.length === 0) return [];

      try {
        const { width: previewWidth, height: previewHeight } =
          getPreviewDimensions(settings);

        if (settings.designStyle === "full_cover" && preserveLayoutStructure) {
          // For full cover with structure preservation (button movements)
          // Try to reapply the current layout template
          const targetPageId = pageId || images[0]?.pageId || "default-page";
          const reappliedImages = await reapplyCurrentLayout(
            images,
            settings,
            targetPageId,
          );

          // If reapplication worked, use it; otherwise fall back to old logic
          if (reappliedImages && reappliedImages.length === images.length) {
            return reappliedImages;
          }

          // Fallback to old detection logic
          const currentLayout = detectCurrentLayout(images);
          return placeImagesInOrder(images, currentLayout);
        } else {
          // For both default layouts and full cover (when not preserving structure)
          // This properly handles margins, gaps, and layout calculations
          const result = await arrangeImages(
            images,
            previewWidth,
            previewHeight,
            settings,
          );
          return result;
        }
      } catch (error) {

        return images || [];
      }
    },
    [settings, detectCurrentLayout, placeImagesInOrder],
  );

  /**
   * Preserve manual image positions without auto-arranging
   * Used for drag and drop operations where user controls positioning
   */
  const preserveManualLayout = useCallback(
    (images) => {
      if (!images || images.length === 0) return [];

      try {
        const { width: previewWidth, height: previewHeight } =
          getPreviewDimensions(settings);

        // Simple grid positioning that preserves order but doesn't use smart algorithms
        return images.map((image, index) => {
          if (!image || typeof image !== 'object') {

            return image;
          }

          const maxImagesPerRow = settings?.maxImagesPerRow || 4;
          const rowIndex = Math.floor(index / maxImagesPerRow);
          const colIndex = index % maxImagesPerRow;
          const imagesInThisRow = Math.min(
            maxImagesPerRow,
            images.length - rowIndex * maxImagesPerRow,
          );

          const cellWidth = previewWidth / imagesInThisRow;
          const cellHeight =
            previewHeight / Math.ceil(images.length / maxImagesPerRow);

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
      } catch (error) {

        return images || [];
      }
    },
    [settings],
  );

  const handleFiles = useCallback(
    async (files) => {
      setIsProcessing(true);

      let progressToast = null;

      try {
        const processedImages = await processFiles(
          files,
          availableImages.length,
          settings,
          (progress) => {
            const progressElement = React.createElement(ProgressToast, {
              current: progress.current,
              total: progress.total,
              message: progress.message,
              currentFileName: progress.currentFileName,
            });

            if (!progressToast) {
              progressToast = toast.custom(progressElement, {
                id: "image-processing",
                duration: 0,
              });
            } else {
              toast.custom(progressElement, {
                id: "image-processing",
                duration: 0,
              });
            }
          },
        );

        toast.dismiss("image-processing");

        setAvailableImages((prev) => [...prev, ...processedImages]);
        toast.success(
          `Successfully processed ${processedImages.length} image${processedImages.length !== 1 ? "s" : ""}!`,
        );
      } catch (err) {
        toast.dismiss("image-processing");
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
      const isBatch = active.data.current?.isBatch;
      const batchImages = active.data.current?.batchImages;
      const selectedImages = active.data.current?.selectedImages;

      // Only allow dragging from available images to pages
      if (
        sourceId === "available-images" &&
        destinationId.startsWith("page-")
      ) {
        const pageId = destinationId;
        const targetPage = pages.find((p) => p.id === pageId);

        // Calculate max images per page considering both settings
        const maxImagesPerRow = settings.maxImagesPerRow || 4;
        const maxNumberOfRows = settings.maxNumberOfRows || 4;
        const maxImagesFromGrid = maxImagesPerRow * maxNumberOfRows;
        const maxImagesPerPage = Math.min(
          maxImagesFromGrid,
          settings.imagesPerPage || maxImagesFromGrid,
        );

        if (isBatch && batchImages) {
          // Handle batch drag-and-drop
          const imagesToMove = batchImages;
          
          if (
            settings.designStyle === "full_cover" &&
            targetPage &&
            targetPage.images.length + imagesToMove.length > maxImagesPerPage
          ) {
            toast.error(
              `Cannot add ${imagesToMove.length} images: Page would exceed the maximum of ${maxImagesPerPage} images. Please remove some images first or add a new page.`,
            );
            return;
          }

          // Remove selected images from available images (in reverse order to maintain indices)
          const sortedIndices = selectedImages.sort((a, b) => b - a);
          setAvailableImages((prev) => {
            let newAvailable = [...prev];
            sortedIndices.forEach(index => {
              newAvailable.splice(index, 1);
            });
            return newAvailable;
          });

          // Add batch to target page
          setPages((prev) => {
            return prev.map((page) => {
              if (page.id === pageId) {
                const newImages = [...page.images, ...imagesToMove];
                const arrangedImages = preserveManualLayout(newImages);
                return {
                  ...page,
                  images: arrangedImages,
                };
              }
              return page;
            });
          });

          toast.success(`Added ${imagesToMove.length} images to page`);
        } else {
          // Handle single image drag-and-drop (existing logic)
          const imageIndex = sourceIndex;
          const imageToMove = availableImages[imageIndex];

          if (
            settings.designStyle === "full_cover" &&
            targetPage &&
            targetPage.images.length >= maxImagesPerPage
          ) {
            toast.error(
              `Cannot add image: Page already has the maximum of ${maxImagesPerPage} images. Please remove some images first or add a new page.`,
            );
            return;
          }

          setAvailableImages((prev) =>
            prev.filter((_, index) => index !== imageIndex),
          );

          setPages((prev) => {
            return prev.map((page) => {
              if (page.id === pageId) {
                const newImages = [...page.images, imageToMove];
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
      }
    },
    [availableImages, pages, settings, preserveManualLayout],
  );

  const addPage = useCallback(() => {
    const newPage = {
      id: `page-${Date.now()}`,
      images: [],
      color: getRandomColor(),
      imageBorderColor: "#FFFFFF", // Default white picture border
      enablePageBorder: true, // Enable page border by default
    };
    setPages((prev) => [...prev, newPage]);
  }, []);

  const addPageBetween = useCallback((afterPageId) => {
    const newPage = {
      id: `page-${Date.now()}`,
      images: [],
      color: getRandomColor(),
      imageBorderColor: "#FFFFFF", // Default white picture border
      enablePageBorder: true, // Enable page border by default
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

        // Merge sortedImages back into availableImages in a single pass by originalIndex
        setAvailableImages((current) => {
          const result = [];
          let i = 0; // pointer in current
          let j = 0; // pointer in sortedImages

          while (i < current.length && j < sortedImages.length) {
            if ((current[i]?.originalIndex ?? Infinity) <= (sortedImages[j]?.originalIndex ?? Infinity)) {
              result.push(current[i]);
              i++;
            } else {
              result.push(sortedImages[j]);
              j++;
            }
          }

          while (i < current.length) {
            result.push(current[i]);
            i++;
          }
          while (j < sortedImages.length) {
            result.push(sortedImages[j]);
            j++;
          }

          return result;
        });
      }

      setPages((prev) => prev.filter((p) => p.id !== pageId));
    },
    [pages.length, pages],
  );

  const changePageColor = useCallback((pageId, color = null) => {
    setPages((prev) =>
      prev.map((page) =>
        page.id === pageId ? { ...page, color: color || getRandomColor() } : page,
      ),
    );
  }, []);

  const changeImageBorderColor = useCallback((pageId, imageBorderColor) => {
    setPages((prev) =>
      prev.map((page) =>
        page.id === pageId ? { ...page, imageBorderColor } : page,
      ),
    );
  }, []);

  const setAllPageColors = useCallback((color) => {
    setPages((prev) =>
      prev.map((page) => ({ ...page, color }))
    );
  }, []);

  const enableAllPageBorders = useCallback(async (enable) => {
    setPages((prev) =>
      prev.map((page) => ({ ...page, enablePageBorder: enable }))
    );

    // Recalculate positions for all pages with images while preserving layout
    if (pages.length > 0) {
      pages.forEach(async (page) => {
        if (page.images.length === 0) return;
        
        try {
          const { width: previewWidth, height: previewHeight } = getPreviewDimensions(settings);
          
          const modifiedSettings = enable ? settings : {
            ...settings,
            pageBorderWidth: 0,
            pictureBorderWidth: 0,
          };
          
          // Use the page data with the new border state
          const pageData = { ...page, enablePageBorder: enable };
          
          // Recalculate positions while preserving rowIndex and colIndex
          const recalculated = recalculatePositionsPreservingLayout(
            page.images,
            previewWidth,
            previewHeight,
            modifiedSettings,
            pageData
          );
          
          setPages((p) =>
            p.map((pg) =>
              pg.id === page.id ? { ...pg, images: recalculated, enablePageBorder: enable } : pg
            )
          );
        } catch (error) {

        }
      });
    }
  }, [pages, settings]);

  const togglePageBorder = useCallback(async (pageId) => {
    const targetPage = pages.find((page) => page.id === pageId);
    if (!targetPage) return;
    
    // Toggle the flag
    const newEnableState = !targetPage.enablePageBorder;
    
    // If no images, just toggle
    if (targetPage.images.length === 0) {
      setPages((prev) =>
        prev.map((page) =>
          page.id === pageId ? { ...page, enablePageBorder: newEnableState } : page,
        ),
      );
      return;
    }

    // Recalculate positions while preserving layout structure
    try {
      const { width: previewWidth, height: previewHeight } = getPreviewDimensions(settings);
      
      // Create modified settings with borders disabled if toggling off
      const modifiedSettings = newEnableState ? settings : {
        ...settings,
        pageBorderWidth: 0,
        pictureBorderWidth: 0,
      };
      
      // Use the page data with the new border state
      const pageData = { ...targetPage, enablePageBorder: newEnableState };
      
      // Recalculate positions while preserving rowIndex and colIndex
      const recalculated = recalculatePositionsPreservingLayout(
        targetPage.images,
        previewWidth,
        previewHeight,
        modifiedSettings,
        pageData
      );
      
      setPages((p) =>
        p.map((pg) =>
          pg.id === pageId ? { ...pg, images: recalculated, enablePageBorder: newEnableState } : pg
        )
      );
    } catch (error) {

    }
  }, [pages, settings]);

  const removeAvailableImage = useCallback((index) => {
    setAvailableImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const addSelectedToPage = useCallback((selectedImageData, pageId) => {
    if (!selectedImageData || selectedImageData.length === 0) return;

    const targetPage = pages.find((p) => p.id === pageId);
    
    // Calculate max images per page considering both settings
    const maxImagesPerRow = settings.maxImagesPerRow || 4;
    const maxNumberOfRows = settings.maxNumberOfRows || 4;
    const maxImagesFromGrid = maxImagesPerRow * maxNumberOfRows;
    const maxImagesPerPage = Math.min(
      maxImagesFromGrid,
      settings.imagesPerPage || maxImagesFromGrid,
    );

    if (
      settings.designStyle === "full_cover" &&
      targetPage &&
      targetPage.images.length + selectedImageData.length > maxImagesPerPage
    ) {
      toast.error(
        `Cannot add ${selectedImageData.length} images: Page would exceed the maximum of ${maxImagesPerPage} images. Please remove some images first or add a new page.`,
      );
      return;
    }

    // Get the indices of images to remove from available images
    const indicesToRemove = selectedImageData.map(imageData => 
      availableImages.findIndex(img => img.id === imageData.id)
    ).filter(index => index !== -1).sort((a, b) => b - a); // Sort in reverse order

    // Remove images from available images
    setAvailableImages((prev) => {
      let newAvailable = [...prev];
      indicesToRemove.forEach(index => {
        newAvailable.splice(index, 1);
      });
      return newAvailable;
    });

    // Add images to target page
    setPages((prev) => {
      return prev.map((page) => {
        if (page.id === pageId) {
          const newImages = [...page.images, ...selectedImageData];
          const arrangedImages = preserveManualLayout(newImages);
          return {
            ...page,
            images: arrangedImages,
          };
        }
        return page;
      });
    });

    toast.success(`Added ${selectedImageData.length} images to page`);
  }, [availableImages, pages, settings, preserveManualLayout]);

  const autoArrangeImagesToPages = useCallback(async () => {
    if (availableImages.length === 0) return;

    setIsProcessing(true);
    try {
      const { arrangedPages, remainingImages } = await autoArrangeImages(
        availableImages,
        pages,
        settings,
        (progressData) => {
          const progressElement = React.createElement(ProgressToast, {
            current: progressData.step || 0,
            total: progressData.total || 100,
            message: progressData.message || "Auto-arranging images...",
            currentFileName: "",
          });

          toast.custom(progressElement, {
            id: "auto-arrange-progress",
            duration: 0,
          });
        },
      );

      toast.dismiss("auto-arrange-progress");
      setPages((prevPages) => [...prevPages, ...arrangedPages]);
      setAvailableImages(remainingImages);
      toast.success(
        `Successfully arranged images into ${arrangedPages.length} page${arrangedPages.length !== 1 ? "s" : ""}!`,
      );
    } catch (err) {
      toast.dismiss("auto-arrange-progress");
      toast.error(`Failed to auto-arrange images: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [availableImages, pages, settings]);

  const moveImageBack = useCallback(
    async (pageId, imageIndex) => {
      try {
        const currentPages = pages;
        const currentPage = currentPages.find((p) => p.id === pageId);

        if (!currentPage || !currentPage.images || !currentPage.images[imageIndex]) {

          return;
        }

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
          const newAvailable = [...(current || [])];
          const insertIndex = findCorrectInsertPosition(
            newAvailable,
            originalImage.originalIndex,
          );
          newAvailable.splice(insertIndex, 0, originalImage);
          return newAvailable;
        });

        // Remove image and arrange remaining images
        const newImages = [...(currentPage.images || [])];
        newImages.splice(imageIndex, 1);

        try {
          // Use correct layout method for remaining images
          let arrangedImages = [];
          
          if (newImages.length > 0) {
            arrangedImages = await arrangeImagesWithCorrectLayout(newImages, false, pageId);
            
            // Safety check: if the layout function returns fewer images than we expect,
            // fall back to using preserveManualLayout
            if (!arrangedImages || arrangedImages.length !== newImages.length) {

              arrangedImages = preserveManualLayout(newImages);
            }
          }

          setPages((prev) =>
            prev.map((page) =>
              page.id === pageId ? { ...page, images: arrangedImages || [] } : page,
            ),
          );
        } catch (layoutError) {

          // Fallback to manual layout to preserve all images
          const fallbackImages = preserveManualLayout(newImages);
          setPages((prev) =>
            prev.map((page) =>
              page.id === pageId ? { ...page, images: fallbackImages || [] } : page,
            ),
          );
        }
      } catch (error) {

        // Show user-friendly error message
        toast.error("Failed to move image back. Please try again.");
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
      const targetPage = pages.find((page) => page.id === pageId);
      if (!targetPage || targetPage.images.length === 0) return;

      // Prevent multiple simultaneous operations
      if (isProcessing) return;

      setIsProcessing(true);

      const progressElement = React.createElement(ProgressToast, {
        current: 0,
        total: 100,
        message: "Arranging page layout...",
        currentFileName: "",
        showBlocking: true,
      });

      toast.custom(progressElement, {
        id: "arrange-progress",
        duration: 0,
      });

      try {
        // Show intermediate progress
        await new Promise(resolve => setTimeout(resolve, 200));
        toast.custom(
          React.createElement(ProgressToast, {
            current: 50,
            total: 100,
            message: "Calculating optimal positions...",
            currentFileName: "",
            showBlocking: true,
          }),
          {
            id: "arrange-progress",
            duration: 0,
          },
        );

        const { width: previewWidth, height: previewHeight } =
          getPreviewDimensions(settings);
        const arrangedImages = await arrangeImages(
          targetPage.images,
          previewWidth,
          previewHeight,
          settings,
        );

        setPages((currentPages) =>
          currentPages.map((page) =>
            page.id === pageId ? { ...page, images: arrangedImages } : page,
          ),
        );

        toast.dismiss("arrange-progress");
        toast.success("Page layout updated!");
      } catch (error) {

        toast.dismiss("arrange-progress");
        toast.error("Failed to arrange page layout");
      } finally {
        setIsProcessing(false);
      }
    },
    [pages, settings, isProcessing],
  );

  const randomizePage = useCallback(
    async (pageId) => {
      const targetPage = pages.find((page) => page.id === pageId);
      if (!targetPage || targetPage.images.length === 0) return;

      // Prevent multiple simultaneous operations
      if (isProcessing) return;

      setIsProcessing(true);

      const progressElement = React.createElement(ProgressToast, {
        current: 0,
        total: 100,
        message: "Shuffling images...",
        currentFileName: "",
        showBlocking: true,
      });

      toast.custom(progressElement, {
        id: "shuffle-progress",
        duration: 0,
      });

      try {
        // Show intermediate progress
        await new Promise(resolve => setTimeout(resolve, 200));
        toast.custom(
          React.createElement(ProgressToast, {
            current: 50,
            total: 100,
            message: "Reorganizing layout...",
            currentFileName: "",
            showBlocking: true,
          }),
          {
            id: "shuffle-progress",
            duration: 0,
          },
        );

        const shuffledImages = await shuffleImagesInLayout(
          targetPage.images,
          settings,
          pageId,
        );

        setPages((currentPages) =>
          currentPages.map((page) =>
            page.id === pageId ? { ...page, images: shuffledImages } : page,
          ),
        );

        toast.dismiss("shuffle-progress");
        toast.success("Images shuffled!");
      } catch (error) {

        toast.dismiss("shuffle-progress");
        toast.error("Failed to shuffle images");
      } finally {
        setIsProcessing(false);
      }
    },
    [pages, settings, isProcessing],
  );

  // Track per-page processing state for layout changes to avoid global re-renders
  const [pageProcessing, setPageProcessing] = useState(new Set());

  const markPageProcessing = useCallback((pageId, processing) => {
    setPageProcessing((prev) => {
      const next = new Set(prev);
      if (processing) {
        next.add(pageId);
      } else {
        next.delete(pageId);
      }
      return next;
    });
  }, []);

  const selectLayout = useCallback(
    async (pageId, selectedLayout) => {
      const targetPage = pages.find((page) => page.id === pageId);
      if (!targetPage || targetPage.images.length === 0 || !selectedLayout) return;

      if (pageProcessing.has(pageId)) return;

      markPageProcessing(pageId, true);

      try {
        // Get preview dimensions and border width
        const previewDimensions = getPreviewDimensions(settings);
        const borderWidth = getPreviewBorderWidth(settings);
        
        // Calculate usable dimensions with border
        const usableWidth = previewDimensions.width - (2 * borderWidth);
        const usableHeight = previewDimensions.height - (2 * borderWidth);

        // Apply the selected hardcoded layout with border
        const newLayoutImages = applyHardcodedLayout(
          selectedLayout,
          targetPage.images,
          usableWidth,
          usableHeight,
          borderWidth
        );

        // Persist the chosen hardcoded layout for future reapplication on moves
        try {
          setCurrentHardcodedLayout(pageId, selectedLayout);
        } catch (e) {

        }

        setPages((currentPages) =>
          currentPages.map((page) =>
            page.id === pageId ? { ...page, images: newLayoutImages, layoutId: selectedLayout.id } : page,
          ),
        );
      } catch (error) {

      } finally {
        markPageProcessing(pageId, false);
      }
    },
    [pages, settings, pageProcessing, markPageProcessing],
  );

  const updateImagePosition = useCallback(
    (pageId, imageIndex, positionData) => {
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
    },
    [],
  );

  const moveImageToPreviousPage = useCallback(
    async (sourcePageId, imageIndex, destPageId) => {
      const currentPages = pages;
      const sourcePage = currentPages.find((p) => p.id === sourcePageId);
      const destPage = currentPages.find((p) => p.id === destPageId);

      if (sourcePage && destPage && sourcePage.images[imageIndex]) {
        const imageToMove = sourcePage.images[imageIndex];

        // Calculate max images per page for destination
        const maxImagesPerRow = settings.maxImagesPerRow || 4;
        const maxNumberOfRows = settings.maxNumberOfRows || 4;
        const maxImagesFromGrid = maxImagesPerRow * maxNumberOfRows;
        const maxImagesPerPage = Math.min(
          maxImagesFromGrid,
          settings.imagesPerPage || maxImagesFromGrid,
        );

        // Check if destination page has space
        if (
          destPage.images.length >= maxImagesPerPage &&
          settings.designStyle === "full_cover"
        ) {
          toast.error(
            `Cannot move image: Destination page already has the maximum of ${maxImagesPerPage} images. Please remove some images first.`,
          );
          return;
        }

        try {
          // Prepare new image arrays
          const sourceNewImages = [...sourcePage.images];
          sourceNewImages.splice(imageIndex, 1);
          const destNewImages = [...destPage.images, imageToMove];

          // Arrange both pages. For full cover, switch to hardcoded layouts for new counts to avoid gaps/overlaps
          if (settings.designStyle === "full_cover") {
            const paperSize = getHardcodedLayoutsKey(settings?.pageSize || "a4");
            const isPortrait = settings?.orientation === "portrait";
            const { width, height } = getPreviewDimensions(settings);

            let sourceArrangedImages = [];
            if (sourceNewImages.length > 0) {
              const sourceLayouts = getLayoutOptions(paperSize, sourceNewImages.length, isPortrait);
              const sourceSelected = sourceLayouts[0] || null;
              sourceArrangedImages = sourceSelected
                ? applyHardcodedLayout(sourceSelected, sourceNewImages, width, height)
                : sourceNewImages;
              if (sourceSelected) {
                try { setCurrentHardcodedLayout(sourcePageId, sourceSelected); } catch {}
              }
            }

            const destLayouts = getLayoutOptions(paperSize, destNewImages.length, isPortrait);
            const destSelected = destLayouts[0] || null;
            const destArrangedImages = destSelected
              ? applyHardcodedLayout(destSelected, destNewImages, width, height)
              : destNewImages;
            if (destSelected) {
              try { setCurrentHardcodedLayout(destPageId, destSelected); } catch {}
            }

            setPages((prev) =>
              prev.map((page) => {
                if (page.id === sourcePageId) {
                  return { ...page, images: sourceArrangedImages };
                } else if (page.id === destPageId) {
                  return { ...page, images: destArrangedImages };
                }
                return page;
              }),
            );
          } else {
            const [sourceArrangedImages, destArrangedImages] = await Promise.all([
              sourceNewImages.length > 0
                ? arrangeImagesWithCorrectLayout(
                    sourceNewImages,
                    true,
                    sourcePageId,
                  )
                : Promise.resolve([]),
              arrangeImagesWithCorrectLayout(destNewImages, true, destPageId),
            ]);

            setPages((prev) =>
              prev.map((page) => {
                if (page.id === sourcePageId) {
                  return { ...page, images: sourceArrangedImages };
                } else if (page.id === destPageId) {
                  return { ...page, images: destArrangedImages };
                }
                return page;
              }),
            );
          }
        } catch (error) {

        }
      }
    },
    [pages, settings, arrangeImagesWithCorrectLayout],
  );

  const moveImageToNextPage = useCallback(
    async (sourcePageId, imageIndex, destPageId) => {
      await moveImageToPreviousPage(sourcePageId, imageIndex, destPageId);
    },
    [moveImageToPreviousPage],
  );

  const swapImagesInPage = useCallback(
    async (pageId, index1, index2) => {
      const targetPage = pages.find((page) => page.id === pageId);
      if (
        !targetPage ||
        !targetPage.images[index1] ||
        !targetPage.images[index2]
      )
        return;

      const newImages = [...targetPage.images];
      // Swap the images
      [newImages[index1], newImages[index2]] = [
        newImages[index2],
        newImages[index1],
      ];

      try {
        let arrangedImages;
        
        // If page has a layout ID, preserve that layout structure
        if (targetPage.layoutId && settings.designStyle === "full_cover") {
          const { width: previewWidth, height: previewHeight } = getPreviewDimensions(settings);
          arrangedImages = recalculatePositionsPreservingLayout(
            newImages,
            previewWidth,
            previewHeight,
            settings,
            targetPage
          );
        } else {
          // Use correct layout method based on design style
          arrangedImages = await arrangeImagesWithCorrectLayout(
            newImages,
            true,
            pageId,
          );
        }

        setPages((prev) =>
          prev.map((page) =>
            page.id === pageId ? { ...page, images: arrangedImages } : page,
          ),
        );
      } catch (error) {

      }
    },
    [pages, arrangeImagesWithCorrectLayout, settings],
  );

  const handleGeneratePDF = useCallback(
    async (albumName = null) => {
      if (pages.length === 0) return;

      setIsProcessing(true);
      try {
        await generatePDF(
          pages,
          settings,
          (progressData) => {
            const progressElement = React.createElement(ProgressToast, {
              current: progressData.step || 0,
              total: progressData.total || 100,
              message: progressData.message || "Generating PDF...",
              currentFileName: "",
            });

            toast.custom(progressElement, {
              id: "pdf-generation-progress",
              duration: 0,
            });
          },
          albumName,
        );

        toast.dismiss("pdf-generation-progress");
        toast.success("PDF generated successfully!");
      } catch (err) {
        toast.dismiss("pdf-generation-progress");
        toast.error(`Failed to generate PDF: ${err.message}`);
      } finally {
        setIsProcessing(false);
      }
    },
    [pages, settings],
  );

  const clearCurrentWork = useCallback(async () => {
    setPages([]);
    setAvailableImages([]);
    // Clear stored state as well
    try {
      await clearAppState();
    } catch (error) {

    }
    toast.success("Work area cleared");
  }, []);

  const handleExportProject = useCallback(
    async () => {
      setIsProcessing(true);
      
      let progressToast = null;

      try {
        await exportProject(
          pages,
          availableImages,
          settings,
          (progress) => {
            const progressElement = React.createElement(ProgressToast, {
              current: progress.current,
              total: progress.total,
              message: progress.message,
              currentFileName: progress.currentFileName,
            });

            if (!progressToast) {
              progressToast = toast.custom(progressElement, {
                id: "export-processing",
                duration: 0,
              });
            } else {
              toast.custom(progressElement, {
                id: "export-processing",
                duration: 0,
              });
            }
          }
        );

        toast.dismiss("export-processing");
        toast.success("Project exported successfully!");
      } catch (err) {
        toast.dismiss("export-processing");
        toast.error(`Export failed: ${err.message}`);
      } finally {
        setIsProcessing(false);
      }
    },
    [pages, availableImages, settings],
  );

  const handleLoadProject = useCallback(
    async (file, onSettingsLoaded) => {
      if (!file) {
        toast.error("No file selected");
        return;
      }

      if (!file.name.toLowerCase().endsWith('.zip')) {
        toast.error("Please select a valid Tales project file (.zip)");
        return;
      }

      setIsProcessing(true);
      
      let progressToast = null;

      try {
        const projectData = await loadProject(
          file,
          (progress) => {
            const progressElement = React.createElement(ProgressToast, {
              current: progress.current,
              total: progress.total,
              message: progress.message,
              currentFileName: progress.currentFileName,
            });

            if (!progressToast) {
              progressToast = toast.custom(progressElement, {
                id: "load-processing",
                duration: 0,
              });
            } else {
              toast.custom(progressElement, {
                id: "load-processing",
                duration: 0,
              });
            }
          }
        );

        toast.dismiss("load-processing");

        // Clear current work and load new project
        resetPageLayoutState();
        setPages(projectData.pages);
        setAvailableImages(projectData.availableImages);
        
        // Update settings if provided
        if (projectData.settings && onSettingsLoaded) {
          onSettingsLoaded(projectData.settings);
        }

        toast.success("Project loaded successfully!");
      } catch (err) {
        toast.dismiss("load-processing");
        toast.error(`Load failed: ${err.message}`);
      } finally {
        setIsProcessing(false);
      }
    },
    [],
  );

  const handleMergeProject = useCallback(
    async (file) => {
      if (!file) {
        toast.error("No file selected");
        return;
      }

      if (!file.name.toLowerCase().endsWith('.zip')) {
        toast.error("Please select a valid Tales project file (.zip)");
        return;
      }

      setIsProcessing(true);
      
      let progressToast = null;

      try {
        const mergedData = await mergeProject(
          file,
          pages,
          availableImages,
          settings,
          (progress) => {
            const progressElement = React.createElement(ProgressToast, {
              current: progress.current,
              total: progress.total,
              message: progress.message,
              currentFileName: progress.currentFileName,
            });

            if (!progressToast) {
              progressToast = toast.custom(progressElement, {
                id: "merge-processing",
                duration: 0,
              });
            } else {
              toast.custom(progressElement, {
                id: "merge-processing",
                duration: 0,
              });
            }
          }
        );

        toast.dismiss("merge-processing");

        // Merge pages and available images (keep current settings)
        setPages(mergedData.pages);
        setAvailableImages(mergedData.availableImages);

        toast.success("Project merged successfully!");
      } catch (err) {
        toast.dismiss("merge-processing");
        toast.error(`Merge failed: ${err.message}`);
      } finally {
        setIsProcessing(false);
      }
    },
    [pages, availableImages, settings],
  );

  const totalImages =
    (pages || []).reduce((sum, page) => sum + (page?.images?.length || 0), 0) +
    (availableImages?.length || 0);

  return {
    pages,
    availableImages,
    isProcessing,
    isLoadingFromStorage,
    totalImages,
    handleFiles,
    handleDragEnd,
    addPage,
    addPageBetween,
    removePage,
    changePageColor,
    changeImageBorderColor,
    togglePageBorder,
    setAllPageColors,
    enableAllPageBorders,
    removeAvailableImage,
    addSelectedToPage,
    autoArrangeImagesToPages,
    moveImageBack,
    moveAllImagesBack,
    autoArrangePage,
    randomizePage,
    selectLayout,
    updateImagePosition,
    moveImageToPreviousPage,
    moveImageToNextPage,
    swapImagesInPage,
    handleGeneratePDF,
    clearCurrentWork,
    handleExportProject,
    handleLoadProject,
    handleMergeProject,

    // Per-page processing helper
    isPageProcessing: (pageId) => pageProcessing.has(pageId),
  };
};
