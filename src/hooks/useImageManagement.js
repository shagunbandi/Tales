import { useState, useCallback } from "react";
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
} from "../utils/randomizeUtils.js";
import { COLOR_PALETTE, getPreviewDimensions } from "../constants.js";

export const useImageManagement = (settings = null) => {
  const [pages, setPages] = useState([]);
  const [availableImages, setAvailableImages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(null);

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
    async (event) => {
      console.log('[DRAG END DEBUG] handleDragEnd called:', event);
      const { active, over } = event;
      console.log('[DRAG END DEBUG] active:', active, 'over:', over);

      if (!over) {
        console.log('[DRAG END DEBUG] No drop target, returning');
        return;
      }

      // Extract source and destination information from the new API
      const sourceId = active.data.current?.sourceId;
      const sourceIndex = active.data.current?.sourceIndex;
      const destinationId = over.id;
      const destinationData = over.data.current;
      console.log('[DRAG END DEBUG] sourceId:', sourceId, 'sourceIndex:', sourceIndex, 'destinationId:', destinationId, 'destinationData:', destinationData);

      if (
        sourceId === "available-images" &&
        destinationId.startsWith("page-")
      ) {
        console.log('[DRAG DEBUG] Available images to page drag detected');
        const imageIndex = sourceIndex;
        const pageId = destinationId;
        const imageToMove = availableImages[imageIndex];

        setAvailableImages((prev) =>
          prev.filter((_, index) => index !== imageIndex),
        );

        setPages((prev) => {
          const targetPage = prev.find((p) => p.id === pageId);

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
            // Create a new page for the image
            const newPage = {
              id: `page-${Date.now()}`,
              images: [],
              color: getRandomColor(),
            };

            // Add the image to the new page
            const { width: previewWidth, height: previewHeight } =
              getPreviewDimensions(settings);
            arrangeImages(
              [imageToMove],
              previewWidth,
              previewHeight,
              settings,
            ).then((arrangedImages) => {
              setPages((currentPages) => {
                const pageIndex = currentPages.findIndex(
                  (p) => p.id === newPage.id,
                );
                if (pageIndex !== -1) {
                  const updatedPages = [...currentPages];
                  updatedPages[pageIndex] = {
                    ...newPage,
                    images: arrangedImages,
                  };
                  return updatedPages;
                }
                return currentPages;
              });
            });

            // Add the new page to the list
            return [...prev, newPage];
          } else {
            // Normal behavior - add to existing page
            return prev.map((page) => {
              if (page.id === pageId) {
                const newImages = [...page.images];
                // Add to the end of the page images
                newImages.push(imageToMove);

                // Use shared layout function (now async)
                const { width: previewWidth, height: previewHeight } =
                  getPreviewDimensions(settings);
                arrangeImages(
                  newImages,
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
            });
          }
        });
      } else if (sourceId === destinationId && sourceId.startsWith("page-")) {
        console.log('[DRAG DEBUG] Same page reorder drag detected');
        const pageId = sourceId;
        setPages((prev) =>
          prev.map((page) => {
            if (page.id === pageId) {
              const newImages = [...page.images];
              const [moved] = newImages.splice(sourceIndex, 1);
              newImages.splice(sourceIndex, 0, moved); // Keep at same position for now

              // Use shared layout function (now async)
              const { width: previewWidth, height: previewHeight } =
                getPreviewDimensions(settings);
              arrangeImages(
                newImages,
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
      } else if (
        sourceId.startsWith("page-") &&
        destinationId === "available-images"
      ) {
        console.log('[DRAG DEBUG] Page to available images drag detected');
        const pageId = sourceId;
        const imageIndex = sourceIndex;
        const currentPages = pages;
        const currentPage = currentPages.find((p) => p.id === pageId);

        if (currentPage && currentPage.images[imageIndex]) {
          const imageToRemove = currentPage.images[imageIndex];

          // Restore original image if it was cropped
          const originalImage = imageToRemove.originalSrc
            ? {
                ...imageToRemove,
                src: imageToRemove.originalSrc,
                originalSrc: undefined, // Remove the originalSrc property
                // Remove cropping-related properties
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
        }

        setPages((prev) =>
          prev.map((page) => {
            if (page.id === pageId) {
              const newImages = [...page.images];
              newImages.splice(imageIndex, 1);

              // Auto-arrange the remaining images on the page
              if (newImages.length > 0) {
                const { width: previewWidth, height: previewHeight } =
                  getPreviewDimensions(settings);
                arrangeImages(
                  newImages,
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
              }

              return { ...page, images: newImages };
            }
            return page;
          }),
        );
      } else if (
        sourceId.startsWith("page-") &&
        destinationId.includes("-drop") &&
        destinationData?.type === "image-swap"
      ) {
        // Image swapping within the same page or between pages
        const sourcePageId = sourceId;
        const sourceImageIndex = sourceIndex;
        const destPageId = destinationData.pageId;
        const destImageIndex = destinationData.imageIndex;

        console.log('[DRAG SWAP DEBUG] sourcePageId:', sourcePageId, 'destPageId:', destPageId, 'sourceImageIndex:', sourceImageIndex, 'destImageIndex:', destImageIndex);
        if (sourcePageId === destPageId && sourceImageIndex !== destImageIndex) {
          console.log('[DRAG SWAP DEBUG] Performing image swap within same page');
          // Swap images within the same page
          setPages((prev) =>
            prev.map((page) => {
              if (page.id === sourcePageId) {
                const newImages = [...page.images];
                if (newImages[sourceImageIndex] && newImages[destImageIndex]) {
                  // Swap the images
                  [newImages[sourceImageIndex], newImages[destImageIndex]] = [newImages[destImageIndex], newImages[sourceImageIndex]];
                  
                  // Auto-arrange images on the page
                  const { width: previewWidth, height: previewHeight } =
                    getPreviewDimensions(settings);
                  arrangeImages(
                    newImages,
                    previewWidth,
                    previewHeight,
                    settings,
                  ).then((arrangedImages) => {
                    setPages((currentPages) =>
                      currentPages.map((currentPage) =>
                        currentPage.id === sourcePageId
                          ? { ...currentPage, images: arrangedImages }
                          : currentPage,
                      ),
                    );
                  });
                  
                  return { ...page, images: newImages };
                }
              }
              return page;
            })
          );
        } else if (sourcePageId !== destPageId) {
          console.log('[DRAG SWAP DEBUG] Performing image move between different pages');
          // Move image from one page to another (treat as page-to-page move)
          const currentPages = pages;
          const sourcePage = currentPages.find((p) => p.id === sourcePageId);
          const destPage = currentPages.find((p) => p.id === destPageId);

          if (sourcePage && destPage && sourcePage.images[sourceImageIndex]) {
            const imageToMove = sourcePage.images[sourceImageIndex];

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
              console.log('[DRAG SWAP DEBUG] Destination page is full, cannot move image');
              return;
            }

            setPages((prev) => 
              prev.map((page) => {
                if (page.id === sourcePageId) {
                  // Remove image from source page
                  const newImages = [...page.images];
                  newImages.splice(sourceImageIndex, 1);
                  
                  // Auto-arrange remaining images on source page
                  if (newImages.length > 0) {
                    const { width: previewWidth, height: previewHeight } =
                      getPreviewDimensions(settings);
                    arrangeImages(
                      newImages,
                      previewWidth,
                      previewHeight,
                      settings,
                    ).then((arrangedImages) => {
                      setPages((currentPages) =>
                        currentPages.map((currentPage) =>
                          currentPage.id === sourcePageId
                            ? { ...currentPage, images: arrangedImages }
                            : currentPage,
                        ),
                      );
                    });
                  }
                  return { ...page, images: newImages };
                } else if (page.id === destPageId) {
                  // Add image to destination page
                  const newImages = [...page.images, imageToMove];
                  
                  // Auto-arrange images on destination page
                  const { width: previewWidth, height: previewHeight } =
                    getPreviewDimensions(settings);
                  arrangeImages(
                    newImages,
                    previewWidth,
                    previewHeight,
                    settings,
                  ).then((arrangedImages) => {
                    setPages((currentPages) =>
                      currentPages.map((currentPage) =>
                        currentPage.id === destPageId
                          ? { ...currentPage, images: arrangedImages }
                          : currentPage,
                      ),
                    );
                  });
                  
                  return { ...page, images: newImages };
                }
                return page;
              })
            );
          }
        }
      } else if (
        sourceId.startsWith("page-") &&
        destinationId.startsWith("page-") &&
        sourceId !== destinationId &&
        !destinationId.includes("-drop")
      ) {
        console.log('[DRAG DEBUG] Page to different page drag detected');
        console.log('[DRAG DEBUG] sourcePageId:', sourceId, 'destPageId:', destinationId, 'imageIndex:', sourceIndex);
        // Moving image from one page to another page
        const sourcePageId = sourceId;
        const destPageId = destinationId;
        const imageIndex = sourceIndex;

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
            // Don't allow move if destination is full in full cover mode
            return;
          }

          setPages((prev) => 
            prev.map((page) => {
              if (page.id === sourcePageId) {
                // Remove image from source page
                const newImages = [...page.images];
                newImages.splice(imageIndex, 1);
                
                // Auto-arrange remaining images on source page
                if (newImages.length > 0) {
                  const { width: previewWidth, height: previewHeight } =
                    getPreviewDimensions(settings);
                  arrangeImages(
                    newImages,
                    previewWidth,
                    previewHeight,
                    settings,
                  ).then((arrangedImages) => {
                    setPages((currentPages) =>
                      currentPages.map((currentPage) =>
                        currentPage.id === sourcePageId
                          ? { ...currentPage, images: arrangedImages }
                          : currentPage,
                      ),
                    );
                  });
                }
                return { ...page, images: newImages };
              } else if (page.id === destPageId) {
                // Add image to destination page
                const newImages = [...page.images, imageToMove];
                
                // Auto-arrange images on destination page
                const { width: previewWidth, height: previewHeight } =
                  getPreviewDimensions(settings);
                arrangeImages(
                  newImages,
                  previewWidth,
                  previewHeight,
                  settings,
                ).then((arrangedImages) => {
                  setPages((currentPages) =>
                    currentPages.map((currentPage) =>
                      currentPage.id === destPageId
                        ? { ...currentPage, images: arrangedImages }
                        : currentPage,
                    ),
                  );
                });
                
                return { ...page, images: newImages };
              }
              return page;
            })
          );
        }
      } else {
        console.log('[DRAG DEBUG] Unhandled drag scenario - sourceId:', sourceId, 'destinationId:', destinationId, 'destinationData:', destinationData);
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
    } catch (err) {
      setError(`Failed to auto-arrange images: ${err.message}`);
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  }, [availableImages, pages, settings]);

  const moveImageBack = useCallback(
    (pageId, imageIndex) => {
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

        setPages((prev) =>
          prev.map((page) => {
            if (page.id === pageId) {
              const newImages = [...page.images];
              newImages.splice(imageIndex, 1);

              // Auto-arrange the remaining images on the page
              if (newImages.length > 0) {
                const { width: previewWidth, height: previewHeight } =
                  getPreviewDimensions(settings);
                arrangeImages(
                  newImages,
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
              }

              return { ...page, images: newImages };
            }
            return page;
          }),
        );
      }
    },
    [pages, settings],
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

  const randomizeLayout = useCallback(
    async (pageId) => {
      setPages((prev) =>
        prev.map((page) => {
          if (page.id === pageId && page.images.length > 0) {
            randomizeLayoutStructure(page.images, settings).then(
              (randomizedLayoutImages) => {
                setPages((currentPages) =>
                  currentPages.map((currentPage) =>
                    currentPage.id === pageId
                      ? { ...currentPage, images: randomizedLayoutImages }
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

  const moveImageToPreviousPage = useCallback((sourcePageId, imageIndex, destPageId) => {
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
        return;
      }

      setPages((prev) => 
        prev.map((page) => {
          if (page.id === sourcePageId) {
            // Remove image from source page
            const newImages = [...page.images];
            newImages.splice(imageIndex, 1);
            
            // Auto-arrange remaining images on source page
            if (newImages.length > 0) {
              const { width: previewWidth, height: previewHeight } =
                getPreviewDimensions(settings);
              arrangeImages(
                newImages,
                previewWidth,
                previewHeight,
                settings,
              ).then((arrangedImages) => {
                setPages((currentPages) =>
                  currentPages.map((currentPage) =>
                    currentPage.id === sourcePageId
                      ? { ...currentPage, images: arrangedImages }
                      : currentPage,
                  ),
                );
              });
            }
            return { ...page, images: newImages };
          } else if (page.id === destPageId) {
            // Add image to destination page
            const newImages = [...page.images, imageToMove];
            
            // Auto-arrange images on destination page
            const { width: previewWidth, height: previewHeight } =
              getPreviewDimensions(settings);
            arrangeImages(
              newImages,
              previewWidth,
              previewHeight,
              settings,
            ).then((arrangedImages) => {
              setPages((currentPages) =>
                currentPages.map((currentPage) =>
                  currentPage.id === destPageId
                    ? { ...currentPage, images: arrangedImages }
                    : currentPage,
                ),
              );
            });
            
            return { ...page, images: newImages };
          }
          return page;
        })
      );
    }
  }, [pages, settings]);

  const moveImageToNextPage = useCallback((sourcePageId, imageIndex, destPageId) => {
    // Same logic as moveImageToPreviousPage
    moveImageToPreviousPage(sourcePageId, imageIndex, destPageId);
  }, [moveImageToPreviousPage]);

  const swapImagesInPage = useCallback((pageId, index1, index2) => {
    setPages((prev) =>
      prev.map((page) => {
        if (page.id === pageId) {
          const newImages = [...page.images];
          if (newImages[index1] && newImages[index2]) {
            // Swap the images
            [newImages[index1], newImages[index2]] = [newImages[index2], newImages[index1]];
            
            // Auto-arrange images on the page
            const { width: previewWidth, height: previewHeight } =
              getPreviewDimensions(settings);
            arrangeImages(
              newImages,
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
            
            return { ...page, images: newImages };
          }
        }
        return page;
      })
    );
  }, [settings]);

  const handleGeneratePDF = useCallback(async () => {
    if (pages.length === 0) return;

    setIsProcessing(true);
    setProgress(null);
    try {
      await generatePDF(pages, settings, (progressData) => {
        setProgress(progressData);
      });
    } catch (err) {
      setError(`Failed to generate PDF: ${err.message}`);
    } finally {
      setIsProcessing(false);
      setProgress(null);
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
    updateImagePosition,
    moveImageToPreviousPage,
    moveImageToNextPage,
    swapImagesInPage,
    handleGeneratePDF,
    setError,
  };
};
