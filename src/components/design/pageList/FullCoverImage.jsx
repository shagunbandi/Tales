import React, { useState } from "react";
import { HiPencil, HiArrowLeft, HiChevronLeft, HiChevronRight, HiChevronUp, HiChevronDown } from "react-icons/hi";
import ImageEditModal from "../../modals/ImageEditModal.jsx";
import { cropImageWithScaleAndPosition } from "../../../utils/imageCropUtils.js";

const FullCoverImage = ({
  image,
  pageId,
  pageIndex,
  index,
  pages,
  settings,
  onMoveImageBack,
  onUpdateImagePosition,
  onMoveImageToPreviousPage,
  onMoveImageToNextPage,
  onSwapImagesInPage,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // No drag functionality - only buttons for moving images

  const handleMoveBack = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onMoveImageBack(pageId, index);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleMoveToPreviousPage = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (pageIndex > 0) {
      onMoveImageToPreviousPage(pageId, index, pages[pageIndex - 1].id);
    }
  };

  const handleMoveToNextPage = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (pageIndex < pages.length - 1) {
      onMoveImageToNextPage(pageId, index, pages[pageIndex + 1].id);
    }
  };

  const handleMoveLeft = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (index > 0) {
      onSwapImagesInPage(pageId, index, index - 1);
    }
  };

  const handleMoveRight = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const currentPage = pages.find(p => p.id === pageId);
    if (currentPage && index < currentPage.images.length - 1) {
      onSwapImagesInPage(pageId, index, index + 1);
    }
  };

  const handleModalSave = async (editData) => {
    try {
      // Create a cropped version of the image based on the edit data
      const originalSrc = image.originalSrc || image.src;
      
      // Use EXACT same dimensions as preview and PDF
      const previewWidth = image.previewWidth ?? 100;
      const previewHeight = image.previewHeight ?? 100;
      
      const croppedImageSrc = await cropImageWithScaleAndPosition(
        originalSrc,
        previewWidth,
        previewHeight,
        {
          scale: editData.scale,
          cropOffsetX: editData.cropOffsetX,
          cropOffsetY: editData.cropOffsetY,
          format: 'image/png', // PNG for lossless quality
        }
      );
      
      // Update the image with the cropped version and the edit data
      onUpdateImagePosition(pageId, index, {
        ...editData,
        src: croppedImageSrc, // Use the cropped image as the new src
        originalSrc: originalSrc, // Preserve the original for future edits
      });
    } catch (error) {
      console.error('Failed to crop image:', error);
      // Fallback to just updating the position data
      onUpdateImagePosition(pageId, index, editData);
    }
  };

  if (!image?.src) return null;

  const containerStyle = {
    left: image.x ?? 0,
    top: image.y ?? 0,
    width: image.previewWidth ?? 100,
    height: image.previewHeight ?? 100,
  };

  const currentPage = pages.find(p => p.id === pageId);
  const canMoveLeft = index > 0;
  const canMoveRight = currentPage && index < currentPage.images.length - 1;
  const canMoveToPreviousPage = pageIndex > 0;
  const canMoveToNextPage = pageIndex < pages.length - 1;

  // If we have a cropped image, use it directly without transforms
  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover', // The cropped image should fill the container exactly
    cursor: 'pointer',
  };

  return (
    <>
      <div
        className={`absolute overflow-hidden ${
          isHovered ? 'border border-gray-300' : ''
        }`}
        style={containerStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img
          src={image.src}
          alt={image.file?.name || "Image"}
          className="select-none pointer-events-none"
          style={imageStyle}
          draggable={false}
        />
        
        {isHovered && (
          <>
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={handleEditClick}
              className="absolute top-1 left-1 z-10 rounded-full bg-blue-500 p-1 text-xs text-white shadow-lg hover:bg-blue-600"
              title="Edit image position and crop"
            >
              <HiPencil className="h-3 w-3" />
            </button>
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={handleMoveBack}
              className="absolute top-1 right-1 z-10 rounded-full bg-red-500 p-1 text-xs text-white shadow-lg hover:bg-red-600"
              title="Move back to available images"
            >
              <HiArrowLeft className="h-3 w-3" />
            </button>

            {/* Navigation buttons */}
            <div className="absolute bottom-1 left-1 z-10 flex gap-1">
              {/* Move to previous page */}
              {canMoveToPreviousPage && (
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={handleMoveToPreviousPage}
                  className="rounded-full bg-purple-500 p-1 text-xs text-white shadow-lg hover:bg-purple-600"
                  title="Move to previous page"
                >
                  <HiChevronUp className="h-3 w-3" />
                </button>
              )}

              {/* Move to next page */}
              {canMoveToNextPage && (
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={handleMoveToNextPage}
                  className="rounded-full bg-purple-500 p-1 text-xs text-white shadow-lg hover:bg-purple-600"
                  title="Move to next page"
                >
                  <HiChevronDown className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Position adjustment buttons */}
            <div className="absolute bottom-1 right-1 z-10 flex gap-1">
              {/* Move left within page */}
              {canMoveLeft && (
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={handleMoveLeft}
                  className="rounded-full bg-green-500 p-1 text-xs text-white shadow-lg hover:bg-green-600"
                  title="Move left"
                >
                  <HiChevronLeft className="h-3 w-3" />
                </button>
              )}

              {/* Move right within page */}
              {canMoveRight && (
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={handleMoveRight}
                  className="rounded-full bg-green-500 p-1 text-xs text-white shadow-lg hover:bg-green-600"
                  title="Move right"
                >
                  <HiChevronRight className="h-3 w-3" />
                </button>
              )}
            </div>
          </>
        )}
      </div>
      
      <ImageEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSave}
        image={image}
        containerWidth={image.previewWidth ?? 100}
        containerHeight={image.previewHeight ?? 100}
      />
    </>
  );
};

export default FullCoverImage;