import React, { useState, useCallback } from "react";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { Button } from "flowbite-react";
import { HiPlus, HiX, HiCollection, HiCheckCircle } from "react-icons/hi";

const AvailableImages = ({
  availableImages,
  removeAvailableImage,
  totalImages,
  onAddMoreImages,
  pages,
  onAddSelectedToPage,
}) => {
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [selectionMode, setSelectionMode] = useState(false);

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

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: "available-images",
    data: {
      type: "available-images",
    },
  });

  return (
    <div className="flex h-full min-w-0 flex-col">
      <div className="mb-4 flex flex-col gap-2">
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
        
        <div className="flex gap-2">
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
          <div className="grid grid-cols-2 gap-3">
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
  availableImages
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
