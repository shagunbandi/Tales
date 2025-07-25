import React from "react";
import { useDroppable, useDraggable } from "@dnd-kit/core";

const AvailableImages = ({
  availableImages,
  removeAvailableImage,
  totalImages,
  onAddMoreImages,
}) => {
  const { setNodeRef: setDroppableRef } = useDroppable({
    id: "available-images",
    data: {
      type: "available-images",
    },
  });

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Available Images</h3>
        <button className="btn btn-small" onClick={onAddMoreImages}>
          + Add More
        </button>
      </div>
      <div ref={setDroppableRef} className="available-images">
        {availableImages.map((image, index) => (
          <DraggableImage
            key={image.id}
            image={image}
            index={index}
            onRemove={() => removeAvailableImage(index)}
          />
        ))}
        {availableImages.length === 0 && totalImages === 0 && (
          <div className="no-images">
            No images available. Upload some images first!
          </div>
        )}
        {availableImages.length === 0 && totalImages > 0 && (
          <div className="no-images">
            All images are arranged on pages.
            <br />
            <button className="btn btn-small" onClick={onAddMoreImages}>
              Add More Images
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const DraggableImage = ({ image, index, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: image.id,
      data: {
        sourceId: "available-images",
        sourceIndex: index,
        image,
      },
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`available-image ${isDragging ? "dragging" : ""}`}
      style={style}
    >
      <img src={image.src} alt={image.file.name} />
      <div className="image-name">{image.file.name}</div>
      <button className="remove-btn" onClick={onRemove}>
        ×
      </button>
    </div>
  );
};

export default AvailableImages;
