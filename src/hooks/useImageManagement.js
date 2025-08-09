import React, { useState, useCallback } from "react";
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
  nextPageLayout,
  previousPageLayout,
  resetPageLayoutState,
  reapplyCurrentLayout,
  setCurrentHardcodedLayout,
} from "../utils/layoutCycling.js";
import {
  applyHardcodedLayout,
  getLayoutOptions,
  hasHardcodedLayouts,
} from "../utils/hardcodedLayouts.js";
import { COLOR_PALETTE, getPreviewDimensions } from "../constants.js";
import { storageManager } from "../utils/storageUtils.js";

export const useImageManagement = (settings = null) => {
  const [pages, setPages] = useState([]);
  const [availableImages, setAvailableImages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

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
  const placeImagesInOrder = useCallback(
    (images, layoutStructure) => {
      if (
        !images ||
        images.length === 0 ||
        !layoutStructure ||
        layoutStructure.length === 0
      ) {
        return images;
      }

      const { width: previewWidth, height: previewHeight } =
        getPreviewDimensions(settings);
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
    },
    [settings],
  );

  /**
   * Arrange images using the appropriate layout method based on design style
   * For classical: uses proper margins, gaps, and centering
   * For full cover: maintains current layout structure
   */
  const arrangeImagesWithCorrectLayout = useCallback(
    async (images, preserveLayoutStructure = false, pageId = null) => {
      if (!images || images.length === 0) return [];

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
        // For both classical (always) and full cover (when not preserving structure)
        // This properly handles margins, gaps, and layout calculations
        return await arrangeImages(
          images,
          previewWidth,
          previewHeight,
          settings,
        );
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
      const { width: previewWidth, height: previewHeight } =
        getPreviewDimensions(settings);

      // Simple grid positioning that preserves order but doesn't use smart algorithms
      return images.map((image, index) => {
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
        const maxNumberOfRows = settings.maxNumberOfRows || 4;
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
          toast.error(
            `Cannot add image: Page already has the maximum of ${maxImagesPerPage} images. Please remove some images first or add a new page.`,
          );
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
          const arrangedImages =
            newImages.length > 0
              ? await arrangeImagesWithCorrectLayout(newImages, false, pageId)
              : [];

          setPages((prev) =>
            prev.map((page) =>
              page.id === pageId ? { ...page, images: arrangedImages } : page,
            ),
          );
        } catch (error) {
          console.error("Error in moveImageBack:", error);
          // Fallback to just removing the image
          setPages((prev) =>
            prev.map((page) =>
              page.id === pageId ? { ...page, images: newImages } : page,
            ),
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
      });

      toast.custom(progressElement, {
        id: "arrange-progress",
        duration: 0,
      });

      try {
        // Show intermediate progress
        const progressTimeout = setTimeout(() => {
          toast.custom(
            React.createElement(ProgressToast, {
              current: 50,
              total: 100,
              message: "Calculating optimal positions...",
              currentFileName: "",
            }),
            {
              id: "arrange-progress",
              duration: 0,
            },
          );
        }, 100);

        const { width: previewWidth, height: previewHeight } =
          getPreviewDimensions(settings);
        const arrangedImages = await arrangeImages(
          targetPage.images,
          previewWidth,
          previewHeight,
          settings,
        );

        // Clear the timeout in case it hasn't fired yet
        clearTimeout(progressTimeout);

        setPages((currentPages) =>
          currentPages.map((page) =>
            page.id === pageId ? { ...page, images: arrangedImages } : page,
          ),
        );

        toast.dismiss("arrange-progress");
        toast.success("Page layout updated!");
      } catch (error) {
        console.error("Error in autoArrangePage:", error);
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
      });

      toast.custom(progressElement, {
        id: "shuffle-progress",
        duration: 0,
      });

      try {
        // Show intermediate progress
        const progressTimeout = setTimeout(() => {
          toast.custom(
            React.createElement(ProgressToast, {
              current: 50,
              total: 100,
              message: "Reorganizing layout...",
              currentFileName: "",
            }),
            {
              id: "shuffle-progress",
              duration: 0,
            },
          );
        }, 100);

        const shuffledImages = await shuffleImagesInLayout(
          targetPage.images,
          settings,
        );

        // Clear the timeout in case it hasn't fired yet
        clearTimeout(progressTimeout);

        setPages((currentPages) =>
          currentPages.map((page) =>
            page.id === pageId ? { ...page, images: shuffledImages } : page,
          ),
        );

        toast.dismiss("shuffle-progress");
        toast.success("Images shuffled!");
      } catch (error) {
        console.error("Error in randomizePage:", error);
        toast.dismiss("shuffle-progress");
        toast.error("Failed to shuffle images");
      } finally {
        setIsProcessing(false);
      }
    },
    [pages, settings, isProcessing],
  );

  const nextLayout = useCallback(
    async (pageId) => {
      const targetPage = pages.find((page) => page.id === pageId);
      if (!targetPage || targetPage.images.length === 0) return;

      // Prevent multiple simultaneous operations
      if (isProcessing) return;

      setIsProcessing(true);

      const progressElement = React.createElement(ProgressToast, {
        current: 0,
        total: 100,
        message: "Switching to next layout...",
        currentFileName: "",
      });

      toast.custom(progressElement, {
        id: "next-layout-progress",
        duration: 0,
      });

      try {
        // Show intermediate progress
        const progressTimeout = setTimeout(() => {
          toast.custom(
            React.createElement(ProgressToast, {
              current: 50,
              total: 100,
              message: "Calculating new layout...",
              currentFileName: "",
            }),
            {
              id: "next-layout-progress",
              duration: 0,
            },
          );
        }, 100);

        const newLayoutImages = await nextPageLayout(
          targetPage.images,
          settings,
          pageId,
        );

        // Clear the timeout in case it hasn't fired yet
        clearTimeout(progressTimeout);

        setPages((currentPages) =>
          currentPages.map((page) =>
            page.id === pageId ? { ...page, images: newLayoutImages } : page,
          ),
        );

        toast.dismiss("next-layout-progress");
        toast.success("Switched to next layout!");
      } catch (error) {
        console.error("Error in nextLayout:", error);
        toast.dismiss("next-layout-progress");
        toast.error("Failed to switch layout");
      } finally {
        setIsProcessing(false);
      }
    },
    [pages, settings, isProcessing],
  );

  const previousLayout = useCallback(
    async (pageId) => {
      const targetPage = pages.find((page) => page.id === pageId);
      if (!targetPage || targetPage.images.length === 0) return;

      // Prevent multiple simultaneous operations
      if (isProcessing) return;

      setIsProcessing(true);

      const progressElement = React.createElement(ProgressToast, {
        current: 0,
        total: 100,
        message: "Switching to previous layout...",
        currentFileName: "",
      });

      toast.custom(progressElement, {
        id: "prev-layout-progress",
        duration: 0,
      });

      try {
        // Show intermediate progress
        const progressTimeout = setTimeout(() => {
          toast.custom(
            React.createElement(ProgressToast, {
              current: 50,
              total: 100,
              message: "Calculating new layout...",
              currentFileName: "",
            }),
            {
              id: "prev-layout-progress",
              duration: 0,
            },
          );
        }, 100);

        const newLayoutImages = await previousPageLayout(
          targetPage.images,
          settings,
          pageId,
        );

        // Clear the timeout in case it hasn't fired yet
        clearTimeout(progressTimeout);

        setPages((currentPages) =>
          currentPages.map((page) =>
            page.id === pageId ? { ...page, images: newLayoutImages } : page,
          ),
        );

        toast.dismiss("prev-layout-progress");
        toast.success("Switched to previous layout!");
      } catch (error) {
        console.error("Error in previousLayout:", error);
        toast.dismiss("prev-layout-progress");
        toast.error("Failed to switch layout");
      } finally {
        setIsProcessing(false);
      }
    },
    [pages, settings, isProcessing],
  );

  const selectLayout = useCallback(
    async (pageId, selectedLayout) => {
      const targetPage = pages.find((page) => page.id === pageId);
      if (!targetPage || targetPage.images.length === 0 || !selectedLayout) return;

      // Prevent multiple simultaneous operations
      if (isProcessing) return;

      setIsProcessing(true);

      const progressElement = React.createElement(ProgressToast, {
        current: 0,
        total: 100,
        message: "Applying selected layout...",
        currentFileName: "",
      });

      toast.custom(progressElement, {
        id: "select-layout-progress",
        duration: 0,
      });

      try {
        // Show intermediate progress
        const progressTimeout = setTimeout(() => {
          toast.custom(
            React.createElement(ProgressToast, {
              current: 50,
              total: 100,
              message: "Positioning images...",
              currentFileName: "",
            }),
            {
              id: "select-layout-progress",
              duration: 0,
            },
          );
        }, 100);

        // Get preview dimensions
        const previewDimensions = getPreviewDimensions(settings);

        // Apply the selected hardcoded layout
        const newLayoutImages = applyHardcodedLayout(
          selectedLayout,
          targetPage.images,
          previewDimensions.width,
          previewDimensions.height
        );

        // Persist the chosen hardcoded layout for future reapplication on moves
        try {
          setCurrentHardcodedLayout(pageId, selectedLayout);
        } catch (e) {
          console.warn("Could not persist hardcoded layout selection:", e);
        }

        // Clear the timeout in case it hasn't fired yet
        clearTimeout(progressTimeout);

        setPages((currentPages) =>
          currentPages.map((page) =>
            page.id === pageId ? { ...page, images: newLayoutImages } : page,
          ),
        );

        toast.dismiss("select-layout-progress");
        toast.success(`Applied "${selectedLayout.name}" layout!`);
      } catch (error) {
        console.error("Error in selectLayout:", error);
        toast.dismiss("select-layout-progress");
        toast.error("Failed to apply layout");
      } finally {
        setIsProcessing(false);
      }
    },
    [pages, settings, isProcessing],
  );

  // Legacy function - now calls nextLayout for backward compatibility
  const randomizeLayout = useCallback(
    async (pageId) => {
      return await nextLayout(pageId);
    },
    [nextLayout],
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
            const paperSize = settings?.pageSize?.toUpperCase() || "A4";
            const { width, height } = getPreviewDimensions(settings);

            let sourceArrangedImages = [];
            if (sourceNewImages.length > 0) {
              const sourceLayouts = getLayoutOptions(paperSize, sourceNewImages.length);
              const sourceSelected = sourceLayouts[0] || null;
              sourceArrangedImages = sourceSelected
                ? applyHardcodedLayout(sourceSelected, sourceNewImages, width, height)
                : sourceNewImages;
              if (sourceSelected) {
                try { setCurrentHardcodedLayout(sourcePageId, sourceSelected); } catch {}
              }
            }

            const destLayouts = getLayoutOptions(paperSize, destNewImages.length);
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
          console.error("Error in moveImageToPreviousPage:", error);
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
        // Use correct layout method based on design style
        const arrangedImages = await arrangeImagesWithCorrectLayout(
          newImages,
          true,
          pageId,
        );

        setPages((prev) =>
          prev.map((page) =>
            page.id === pageId ? { ...page, images: arrangedImages } : page,
          ),
        );
      } catch (error) {
        console.error("Error in swapImagesInPage:", error);
      }
    },
    [pages, arrangeImagesWithCorrectLayout],
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

  // Album storage functionality - with auto-overwrite support
  const saveCurrentAsAlbum = useCallback(
    async (albumName, albumDescription = "", existingId = null) => {
      if (!albumName?.trim()) {
        toast.error("Please provide a name for the album");
        return null;
      }

      if (pages.length === 0 && availableImages.length === 0) {
        toast.error("No images to save. Please add some images first.");
        return null;
      }

      setIsProcessing(true);

      // Show progress toast
      const progressElement = React.createElement(ProgressToast, {
        current: 0,
        total: 100,
        message: existingId ? "Updating album..." : "Saving album...",
        currentFileName: "",
      });

      toast.custom(progressElement, {
        id: "save-album-progress",
        duration: 0,
      });

      try {
        // Step 1: Generate thumbnail from first page (20%)
        toast.custom(
          React.createElement(ProgressToast, {
            current: 10,
            total: 100,
            message: "Generating thumbnail...",
            currentFileName: "",
          }),
          {
            id: "save-album-progress",
            duration: 0,
          },
        );

        const thumbnail = await storageManager.generateThumbnail(pages);

        // Step 2: Prepare album data (30%)
        toast.custom(
          React.createElement(ProgressToast, {
            current: 30,
            total: 100,
            message: "Preparing album data...",
            currentFileName: "",
          }),
          {
            id: "save-album-progress",
            duration: 0,
          },
        );

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
            console.warn(
              "Could not fetch existing album for created time:",
              error,
            );
          }
        } else {
          // Generate new ID for new albums
          albumId = storageManager.generateAlbumId();
        }

        // Step 3: Building album structure (40%)
        toast.custom(
          React.createElement(ProgressToast, {
            current: 40,
            total: 100,
            message: "Building album structure...",
            currentFileName: "",
          }),
          {
            id: "save-album-progress",
            duration: 0,
          },
        );

        const albumToSave = {
          id: albumId,
          name: albumName.trim(),
          description: albumDescription.trim(),
          created: originalCreatedTime,
          modified: Date.now(),
          settings: settings || {},
          pages: pages,
          availableImages: availableImages,
          totalImages:
            pages.reduce((sum, page) => sum + page.images.length, 0) +
            availableImages.length,
          thumbnail,
        };

        // Step 4: Saving to storage (50% -> 100%)
        toast.custom(
          React.createElement(ProgressToast, {
            current: 50,
            total: 100,
            message: "Saving to storage...",
            currentFileName: "",
          }),
          {
            id: "save-album-progress",
            duration: 0,
          },
        );

        // Show intermediate progress during save
        const saveProgressInterval = setInterval(() => {
          // This will show progress from 60% to 95% while saving
          const randomProgress = 60 + Math.floor(Math.random() * 35);
          toast.custom(
            React.createElement(ProgressToast, {
              current: randomProgress,
              total: 100,
              message: "Saving data to storage...",
              currentFileName: "",
            }),
            {
              id: "save-album-progress",
              duration: 0,
            },
          );
        }, 1000);

        const savedId = await storageManager.saveAlbum(albumToSave);

        // Clear the interval
        clearInterval(saveProgressInterval);

        // Dismiss progress toast
        toast.dismiss("save-album-progress");

        if (existingId) {
          toast.success(`💾 Album "${albumName}" updated successfully!`, {
            icon: "✅",
          });
        } else {
          toast.success(`💾 Album "${albumName}" saved successfully!`, {
            icon: "🎉",
          });
        }

        return savedId;
      } catch (error) {
        console.error("Error saving album:", error);
        toast.dismiss("save-album-progress");
        toast.error("Failed to save album. Please try again.");
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    [pages, availableImages, settings],
  );

  const loadAlbumById = useCallback(async (albumId) => {
    setIsProcessing(true);

    // Show progress toast for loading
    toast.custom(
      React.createElement(ProgressToast, {
        current: 0,
        total: 100,
        message: "Loading album...",
        currentFileName: "",
      }),
      {
        id: "load-album-progress",
        duration: 0,
      },
    );

    try {
      // Step 1: Fetching album data (30%)
      toast.custom(
        React.createElement(ProgressToast, {
          current: 30,
          total: 100,
          message: "Fetching album data...",
          currentFileName: "",
        }),
        {
          id: "load-album-progress",
          duration: 0,
        },
      );

      const album = await storageManager.getAlbum(albumId);

      if (!album) {
        toast.dismiss("load-album-progress");
        toast.error("Album not found");
        return false;
      }

      // Step 2: Processing album data (60%)
      toast.custom(
        React.createElement(ProgressToast, {
          current: 60,
          total: 100,
          message: "Processing album data...",
          currentFileName: "",
        }),
        {
          id: "load-album-progress",
          duration: 0,
        },
      );

      // Step 3: Restoring images and pages (90%)
      toast.custom(
        React.createElement(ProgressToast, {
          current: 90,
          total: 100,
          message: "Restoring images and pages...",
          currentFileName: "",
        }),
        {
          id: "load-album-progress",
          duration: 0,
        },
      );

      // Replace current state with loaded album data
      setPages(album.pages || []);
      setAvailableImages(album.availableImages || []);

      // Complete (100%)
      toast.custom(
        React.createElement(ProgressToast, {
          current: 100,
          total: 100,
          message: "Album loaded successfully!",
          currentFileName: "",
        }),
        {
          id: "load-album-progress",
          duration: 0,
        },
      );

      // Dismiss progress toast and show success
      setTimeout(() => {
        toast.dismiss("load-album-progress");
        toast.success(`Album "${album.name}" loaded successfully!`);
      }, 500);

      return album;
    } catch (error) {
      console.error("Error loading album:", error);
      toast.dismiss("load-album-progress");
      toast.error("Failed to load album");
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const clearCurrentWork = useCallback(() => {
    setPages([]);
    setAvailableImages([]);
    toast.success("Work area cleared");
  }, []);

  const getCurrentAlbumData = useCallback(() => {
    return {
      pages,
      availableImages,
      totalImages:
        pages.reduce((sum, page) => sum + page.images.length, 0) +
        availableImages.length,
      settings: settings || {},
    };
  }, [pages, availableImages, settings]);

  const loadAlbumData = useCallback((albumData) => {
    if (!albumData) {
      toast.error("Invalid album data");
      return false;
    }

    try {
      setPages(albumData.pages || []);
      setAvailableImages(albumData.availableImages || []);
      return true;
    } catch (error) {
      console.error("Error loading album data:", error);
      toast.error("Failed to load album data");
      return false;
    }
  }, []);

  // Auto-save functionality (optional)
  const enableAutoSave = useCallback(
    (albumId, intervalMs = 300000) => {
      let autoSaveInterval;

      const performAutoSave = async () => {
        if (pages.length > 0 || availableImages.length > 0) {
          try {
            const album = await storageManager.getAlbum(albumId);
            if (album) {
              await saveCurrentAsAlbum(album.name, album.description, albumId);
            }
          } catch (error) {
            console.error("Auto-save failed:", error);
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
    },
    [pages, availableImages, saveCurrentAsAlbum],
  );

  const totalImages =
    pages.reduce((sum, page) => sum + page.images.length, 0) +
    availableImages.length;

  return {
    pages,
    availableImages,
    isProcessing,
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
    selectLayout,
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
