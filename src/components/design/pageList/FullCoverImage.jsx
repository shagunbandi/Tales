import React, { useState } from "react";
import { HiX, HiPencil } from "react-icons/hi";
import ImageEditModal from "../../modals/ImageEditModal.jsx";
import { cropImageWithScaleAndPosition } from "../../../utils/imageCropUtils.js";

const FullCoverImage = ({
  image,
  pageId,
  index,
  settings,
  onMoveImageBack,
  onUpdateImagePosition,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMoveBack = (e) => {
    e.stopPropagation();
    onMoveImageBack(pageId, index);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    setIsModalOpen(true);
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
          className="select-none"
          style={imageStyle}
          onClick={handleEditClick}
          draggable={false}
        />
        
        {isHovered && (
          <>
            <button
              onClick={handleMoveBack}
              className="absolute top-1 right-1 z-10 rounded-full bg-red-500 p-1 text-xs text-white shadow-lg hover:bg-red-600"
              title="Remove from page"
            >
              <HiX className="h-3 w-3" />
            </button>
            
            <button
              onClick={handleEditClick}
              className="absolute top-1 left-1 z-10 rounded-full bg-blue-500 p-1 text-xs text-white shadow-lg hover:bg-blue-600"
              title="Edit image position"
            >
              <HiPencil className="h-3 w-3" />
            </button>
            
            <div className="absolute bottom-1 left-1 z-10 rounded bg-black bg-opacity-50 px-1 py-0.5 text-xs text-white">
              Click to edit
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