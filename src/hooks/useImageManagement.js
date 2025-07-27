import { useState, useCallback } from "react";
import { processFiles } from "../utils/imageUtils.js";
import {
  getRandomColor,
  findCorrectInsertPosition,
  arrangeAndCenterImages,
} from "../utils/layoutUtils.js";
import { autoArrangeImages } from "../utils/autoArrangeUtils.js";
import { generatePDF } from "../utils/pdfUtils.js";
import { COLOR_PALETTE, getPreviewDimensions } from "../constants.js";

export const useImageManagement = (settings = null) => {
  const [pages, setPages] = useState([]);
  const [availableImages, setAvailableImages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = useCallback(
    async (files) => {
      setError("");
      setIsProcessing(true);

      try {
        const processedImages = await processFiles(
          files,
          availableImages.length,
          settings,
        );
        setAvailableImages((prev) => [...prev, ...processedImages]);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsProcessing(false);
      }
    },
    [availableImages.length, settings],
  );

  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event;

      if (!over) return;

      // Extract source and destination information from the new API
      const sourceId = active.data.current?.sourceId;
      const sourceIndex = active.data.current?.sourceIndex;
      const destinationId = over.id;
      const destinationData = over.data.current;

      if (
        sourceId === "available-images" &&
        destinationId.startsWith("page-")
      ) {
        const imageIndex = sourceIndex;
        const pageId = destinationId;
        const imageToMove = availableImages[imageIndex];

        setAvailableImages((prev) =>
          prev.filter((_, index) => index !== imageIndex),
        );

        setPages((prev) =>
          prev.map((page) => {
            if (page.id === pageId) {
              const newImages = [...page.images];
              // Add to the end of the page images
              newImages.push(imageToMove);

              // Use arrangeAndCenterImages for multi-row layout
              const pageMargin = settings?.pageMargin;
              const imageGap = settings?.imageGap;
              const { width: previewWidth, height: previewHeight } =
                getPreviewDimensions(settings);

              const arrangedImages = arrangeAndCenterImages(
                newImages,
                previewWidth,
                previewHeight,
                pageMargin,
                imageGap,
                settings,
              );
              return { ...page, images: arrangedImages };
            }
            return page;
          }),
        );
      } else if (sourceId === destinationId && sourceId.startsWith("page-")) {
        const pageId = sourceId;
        setPages((prev) =>
          prev.map((page) => {
            if (page.id === pageId) {
              const newImages = [...page.images];
              const [moved] = newImages.splice(sourceIndex, 1);
              newImages.splice(sourceIndex, 0, moved); // Keep at same position for now

              // Use arrangeAndCenterImages for multi-row layout
              const pageMargin = settings?.pageMargin;
              const imageGap = settings?.imageGap;
              const { width: previewWidth, height: previewHeight } =
                getPreviewDimensions(settings);

              const arrangedImages = arrangeAndCenterImages(
                newImages,
                previewWidth,
                previewHeight,
                pageMargin,
                imageGap,
                settings,
              );
              return { ...page, images: arrangedImages };
            }
            return page;
          }),
        );
      } else if (
        sourceId.startsWith("page-") &&
        destinationId === "available-images"
      ) {
        const pageId = sourceId;
        const imageIndex = sourceIndex;
        const currentPages = pages;
        const currentPage = currentPages.find((p) => p.id === pageId);

        if (currentPage && currentPage.images[imageIndex]) {
          const imageToRemove = currentPage.images[imageIndex];

          setAvailableImages((current) => {
            const newAvailable = [...current];
            const insertIndex = findCorrectInsertPosition(
              newAvailable,
              imageToRemove.originalIndex,
            );
            newAvailable.splice(insertIndex, 0, imageToRemove);
            return newAvailable;
          });
        }

        setPages((prev) =>
          prev.map((page) => {
            if (page.id === pageId) {
              const newImages = [...page.images];
              newImages.splice(imageIndex, 1);
              return { ...page, images: newImages };
            }
            return page;
          }),
        );
      }
    },
    [availableImages, pages, settings],
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
      const { arrangedPages, remainingImages } = autoArrangeImages(
        availableImages,
        pages,
        settings,
      );

      setPages((prevPages) => [...prevPages, ...arrangedPages]);
      setAvailableImages(remainingImages);
    } catch (err) {
      setError(`Failed to auto-arrange images: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [availableImages, pages, settings]);

  const handleGeneratePDF = useCallback(async () => {
    if (pages.length === 0) return;

    setIsProcessing(true);
    try {
      await generatePDF(pages, settings);
    } catch (err) {
      setError(`Failed to generate PDF: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [pages, settings]);

  const totalImages =
    pages.reduce((sum, page) => sum + page.images.length, 0) +
    availableImages.length;

  return {
    pages,
    availableImages,
    isProcessing,
    error,
    totalImages,
    handleFiles,
    handleDragEnd,
    addPage,
    addPageBetween,
    removePage,
    changePageColor,
    removeAvailableImage,
    autoArrangeImagesToPages,
    handleGeneratePDF,
    setError,
  };
};
