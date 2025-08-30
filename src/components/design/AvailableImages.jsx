import React, { useState, useCallback } from "react";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { Button, Modal } from "flowbite-react";
import { HiPlus, HiX, HiCollection, HiCheckCircle, HiOutlineArrowsExpand, HiOutlineMinus, HiChevronLeft, HiChevronRight, HiEye } from "react-icons/hi";

const AvailableImages = ({
  availableImages,
  removeAvailableImage,
  totalImages,
  onAddMoreImages,
  pages,
  onAddSelectedToPage,
  isExpanded = false,
  onToggleExpanded,
}) => {
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [showCarousel, setShowCarousel] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const toggleImageSelection = useCallback((index) => {
    setSelectedImages(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(index)) {
        newSelection.delete(index);
      } else {
        newSelection.add(index);
      }
      return newSelection;
    });
  }, []);

  const selectAllImages = useCallback(() => {
    setSelectedImages(new Set(availableImages.map((_, index) => index)));
  }, [availableImages]);

  const clearSelection = useCallback(() => {
    setSelectedImages(new Set());
    setSelectionMode(false);
  }, []);

  const toggleSelectionMode = useCallback(() => {
    setSelectionMode(prev => !prev);
    if (selectionMode) {
      clearSelection();
    }
  }, [selectionMode, clearSelection]);

  const handleAddSelectedToPage = useCallback((pageId) => {
    const selectedIndexes = Array.from(selectedImages).sort((a, b) => b - a); // Reverse order for removal
    const selectedImageData = selectedIndexes.map(index => availableImages[index]);
    
    if (onAddSelectedToPage && selectedImageData.length > 0) {
      onAddSelectedToPage(selectedImageData, pageId);
      clearSelection();
    }
  }, [selectedImages, availableImages, onAddSelectedToPage, clearSelection]);

  const openCarousel = useCallback((index) => {
    setCarouselIndex(index);
    setShowCarousel(true);
    // Enable selection mode when opening carousel
    if (!selectionMode) {
      setSelectionMode(true);
    }
  }, [selectionMode]);

  const closeCarousel = useCallback(() => {
    setShowCarousel(false);
  }, []);

  const nextImage = useCallback(() => {
    setCarouselIndex(prev => (prev + 1) % availableImages.length);
  }, [availableImages.length]);

  const prevImage = useCallback(() => {
    setCarouselIndex(prev => (prev - 1 + availableImages.length) % availableImages.length);
  }, [availableImages.length]);

  const handleCarouselImageSelect = useCallback((index) => {
    if (selectionMode) {
      toggleImageSelection(index);
    }
  }, [selectionMode, toggleImageSelection]);

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: "available-images",
    data: {
      type: "available-images",
    },
  });

  return (
    <div className="flex h-full min-w-0 flex-col">
      <div className="mb-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Available Images
            </h3>
            <p
              className="text-sm text-gray-500 dark:text-gray-400"
              data-testid="available-images-count"
            >
              {availableImages.length} of {totalImages} images
              {selectionMode && selectedImages.size > 0 && (
                <span className="ml-2 text-blue-600 dark:text-blue-400">
                  ({selectedImages.size} selected)
                </span>
              )}
            </p>
          </div>
          
          {onToggleExpanded && (
            <Button
              size="sm"
              color="gray"
              onClick={onToggleExpanded}
              data-testid="toggle-expand-button"
              title={isExpanded ? "Minimize images view" : "Expand images view"}
            >
              {isExpanded ? (
                <HiOutlineMinus className="h-4 w-4" />
              ) : (
                <HiOutlineArrowsExpand className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            color="blue"
            onClick={onAddMoreImages}
            data-testid="add-more-images-button"
          >
            <HiPlus className="mr-1 h-4 w-4" />
            Add More
          </Button>
          
          {availableImages.length > 0 && (
            <Button
              size="sm"
              color={selectionMode ? "gray" : "light"}
              onClick={toggleSelectionMode}
              data-testid="toggle-selection-mode"
            >
              <HiCheckCircle className="mr-1 h-4 w-4" />
              {selectionMode ? "Cancel" : "Select"}
            </Button>
          )}
          
          {availableImages.length > 0 && isExpanded && (
            <Button
              size="sm"
              color="green"
              onClick={() => openCarousel(0)}
              data-testid="carousel-button"
            >
              <HiEye className="mr-1 h-4 w-4" />
              Carousel View
            </Button>
          )}
        </div>

        {selectionMode && (
          <div className="flex flex-col gap-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
            <div className="flex gap-2">
              <Button
                size="xs"
                color="blue"
                onClick={selectAllImages}
                disabled={selectedImages.size === availableImages.length}
              >
                Select All
              </Button>
              <Button
                size="xs"
                color="gray"
                onClick={clearSelection}
                disabled={selectedImages.size === 0}
              >
                Clear
              </Button>
            </div>
            
            {selectedImages.size > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Add selected to page:
                </p>
                <div className="flex flex-wrap gap-1">
                  {pages.map((page, index) => (
                    <Button
                      key={page.id}
                      size="xs"
                      color="blue"
                      onClick={() => handleAddSelectedToPage(page.id)}
                      className="flex-shrink-0"
                    >
                      Page {index + 1}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div
        className="min-h-0 flex-1 border-2 border-dashed border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800/50"
        data-testid="available-images"
      >
        <div ref={setDroppableRef} className="h-full overflow-y-auto">
          <div className={`grid gap-3 ${isExpanded ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8' : 'grid-cols-2'}`}>
            {availableImages.map((image, index) => (
              <DraggableImage
                key={image.id}
                image={image}
                index={index}
                onRemove={() => removeAvailableImage(index)}
                selectionMode={selectionMode}
                isSelected={selectedImages.has(index)}
                onToggleSelection={() => toggleImageSelection(index)}
                selectedImages={selectedImages}
                availableImages={availableImages}
                isExpanded={isExpanded}
                onOpenCarousel={() => openCarousel(index)}
              />
            ))}

            {availableImages.length === 0 && totalImages === 0 && (
              <div className="col-span-full py-8 text-center text-gray-500 dark:text-gray-400">
                <p className="text-sm">No images available</p>
                <p className="text-xs">Upload some images to get started!</p>
              </div>
            )}

            {availableImages.length === 0 && totalImages > 0 && (
              <div className="col-span-full py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                All images are arranged on pages
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Carousel Modal */}
      <Modal show={showCarousel} onClose={closeCarousel} size="7xl" data-testid="image-carousel-modal">
        <div className="relative">
          {/* Close button */}
          <button
            onClick={closeCarousel}
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
            data-testid="carousel-close-button"
          >
            <HiX className="h-5 w-5" />
          </button>

          {/* Navigation arrows */}
          {availableImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                data-testid="carousel-prev-button"
              >
                <HiChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-12 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                data-testid="carousel-next-button"
              >
                <HiChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Main image display */}
          {availableImages[carouselIndex] && (
            <div className="flex flex-col">
              <div className="relative flex h-[70vh] items-center justify-center bg-black">
                <img
                  src={availableImages[carouselIndex].src}
                  alt={availableImages[carouselIndex].file?.name || availableImages[carouselIndex].name || "Image"}
                  className="h-full max-w-full object-contain"
                  onClick={() => handleCarouselImageSelect(carouselIndex)}
                  data-testid="carousel-main-image"
                />
                
                {/* Selection indicator on main image */}
                {selectionMode && (
                  <div className={`absolute top-4 left-4 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${
                    selectedImages.has(carouselIndex)
                      ? "bg-blue-500 border-blue-500 text-white" 
                      : "bg-white border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                  }`}>
                    {selectedImages.has(carouselIndex) && <HiCheckCircle className="h-6 w-6" />}
                  </div>
                )}
              </div>

              {/* Image info and controls */}
              <div className="bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      {availableImages[carouselIndex].file?.name || availableImages[carouselIndex].name || "Untitled"}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Image {carouselIndex + 1} of {availableImages.length}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      color={selectedImages.has(carouselIndex) ? "red" : "blue"}
                      onClick={() => toggleImageSelection(carouselIndex)}
                      data-testid="carousel-toggle-selection"
                    >
                      <HiCheckCircle className="mr-1 h-4 w-4" />
                      {selectedImages.has(carouselIndex) ? "Deselect" : "Select"}
                    </Button>
                    
                    <Button
                      size="sm"
                      color="red"
                      onClick={() => removeAvailableImage(carouselIndex)}
                      data-testid="carousel-remove-image"
                    >
                      <HiX className="mr-1 h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                </div>

                {/* Selected images preview and page selection */}
                {pages.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    {/* Selected images preview */}
                    {selectedImages.size > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Selected images ({selectedImages.size}):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {Array.from(selectedImages).map((imageIndex) => (
                            <div
                              key={imageIndex}
                              className="relative w-12 h-12 rounded border-2 border-blue-500 overflow-hidden"
                              onClick={() => setCarouselIndex(imageIndex)}
                              title={availableImages[imageIndex]?.file?.name || availableImages[imageIndex]?.name || "Image"}
                            >
                              <img
                                src={availableImages[imageIndex]?.src}
                                alt="Selected"
                                className="w-full h-full object-cover cursor-pointer hover:opacity-80"
                              />
                              {imageIndex === carouselIndex && (
                                <div className="absolute inset-0 bg-blue-500/20 border-2 border-blue-400"></div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Add {selectedImages.size > 0 ? `${selectedImages.size} selected images` : 'current image'} to page:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {pages.map((page, index) => (
                        <Button
                          key={page.id}
                          size="sm"
                          color="green"
                          onClick={() => {
                            if (selectedImages.size > 0) {
                              // Send all selected images
                              const selectedImageData = Array.from(selectedImages).map(idx => availableImages[idx]);
                              onAddSelectedToPage(selectedImageData, page.id);
                            } else {
                              // Send current image only
                              const imageToAdd = availableImages[carouselIndex];
                              onAddSelectedToPage([imageToAdd], page.id);
                            }
                            closeCarousel();
                          }}
                          data-testid={`carousel-add-to-page-${index}`}
                        >
                          Page {index + 1}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

const DraggableImage = ({ 
  image, 
  index, 
  onRemove, 
  selectionMode, 
  isSelected, 
  onToggleSelection,
  selectedImages,
  availableImages,
  isExpanded = false,
  onOpenCarousel
}) => {
  const isDragDisabled = selectionMode;
  
  // Determine what to drag - single image or batch
  const dragData = isSelected && selectedImages.size > 1 ? {
    sourceId: "available-images",
    sourceIndex: index,
    image,
    isBatch: true,
    selectedImages: Array.from(selectedImages),
    batchImages: Array.from(selectedImages).map(idx => availableImages[idx])
  } : {
    sourceId: "available-images",
    sourceIndex: index,
    image,
    isBatch: false
  };

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: image.id,
      data: dragData,
      disabled: isDragDisabled,
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const handleClick = (e) => {
    if (selectionMode) {
      e.preventDefault();
      e.stopPropagation();
      onToggleSelection();
    } else if (onOpenCarousel) {
      // Always open carousel when clicking on images (both expanded and normal modes)
      e.preventDefault();
      e.stopPropagation();
      onOpenCarousel();
    }
  };

  return (
    <div
      ref={setNodeRef}
      {...(selectionMode ? {} : attributes)}
      {...(selectionMode ? {} : listeners)}
      style={style}
      onClick={handleClick}
      className={`relative overflow-hidden rounded-lg bg-gray-50 transition-all dark:bg-gray-800 ${
        selectionMode 
          ? `cursor-pointer ${isSelected ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/30" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`
          : onOpenCarousel
          ? `cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 hover:ring-2 hover:ring-blue-300 ${isDragging ? "z-50 opacity-50 ring-2 ring-blue-400" : ""}`
          : `cursor-move hover:bg-gray-100 dark:hover:bg-gray-700 ${isDragging ? "z-50 opacity-50 ring-2 ring-blue-400" : ""}`
      }`}
      data-testid={`available-image-${index}`}
    >
      <div className="aspect-square">
        <img
          src={image.src}
          alt={image.file?.name || image.name || "Image"}
          className="h-full w-full object-cover"
        />
        
        {/* Carousel view indicator */}
        {onOpenCarousel && !selectionMode && (
          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
            <div className="bg-white/90 dark:bg-gray-800/90 rounded-full p-2">
              <HiEye className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </div>
          </div>
        )}
        
        {/* Selection indicator */}
        {selectionMode && (
          <div className={`absolute top-2 left-2 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
            isSelected 
              ? "bg-blue-500 border-blue-500 text-white" 
              : "bg-white border-gray-300 dark:bg-gray-700 dark:border-gray-600"
          }`}>
            {isSelected && <HiCheckCircle className="h-4 w-4" />}
          </div>
        )}

        {/* Batch count badge */}
        {isSelected && selectedImages.size > 1 && !selectionMode && (
          <div className="absolute top-1 left-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-semibold text-white">
            {selectedImages.size}
          </div>
        )}

        {/* Remove button */}
        {!selectionMode && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-600"
            title="Remove image"
            data-testid={`remove-available-image-${index}`}
          >
            <HiX className="h-3 w-3" />
          </button>
        )}
      </div>
      <div className="p-2">
        <p className="truncate text-xs text-gray-600 dark:text-gray-300">
          {image.file?.name || image.name || "Untitled"}
        </p>
      </div>
    </div>
  );
};

export default AvailableImages;
