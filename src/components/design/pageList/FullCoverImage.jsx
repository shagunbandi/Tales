import React, { useState } from "react";
import { HiX, HiPencil } from "react-icons/hi";
import ImageEditModal from "../../modals/ImageEditModal.jsx";

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
  
  console.log('FullCoverImage render, modal state:', isModalOpen);

  const handleMoveBack = (e) => {
    e.stopPropagation();
    onMoveImageBack(pageId, index);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    console.log('Edit button clicked, opening modal with image:', image);
    console.log('Current modal state:', isModalOpen);
    setIsModalOpen(true);
    console.log('Modal state after set:', true);
  };

  const handleModalSave = (editData) => {
    onUpdateImagePosition(pageId, index, editData);
  };

  if (!image?.src) return null;

  const containerStyle = {
    left: image.x ?? 0,
    top: image.y ?? 0,
    width: image.previewWidth ?? 100,
    height: image.previewHeight ?? 100,
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: `translate(${image.cropOffsetX || 0}px, ${image.cropOffsetY || 0}px) scale(${image.scale || 1})`,
    transformOrigin: 'center',
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
          onClick={(e) => {
            console.log('Image clicked!');
            handleEditClick(e);
          }}
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