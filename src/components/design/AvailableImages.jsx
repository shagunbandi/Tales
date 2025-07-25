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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Available Images</h3>
        <button
          onClick={onAddMoreImages}
          className="px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded"
        >
          + Add More
        </button>
      </div>

      <div
        ref={setDroppableRef}
        className="grid grid-cols-2 sm:grid-cols-3 gap-4 border rounded p-4 min-h-[100px] bg-gray-50"
      >
        {availableImages.map((image, index) => (
          <DraggableImage
            key={image.id}
            image={image}
            index={index}
            onRemove={() => removeAvailableImage(index)}
          />
        ))}

        {availableImages.length === 0 && totalImages === 0 && (
          <div className="col-span-full text-sm text-gray-500 text-center">
            No images available. Upload some images first!
          </div>
        )}

        {availableImages.length === 0 && totalImages > 0 && (
          <div className="col-span-full text-center space-y-2">
            <p className="text-sm text-gray-500">All images are arranged on pages.</p>
            <button
              onClick={onAddMoreImages}
              className="px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded"
            >
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
      style={style}
      className={`relative border rounded overflow-hidden bg-white shadow-sm ${
        isDragging ? "opacity-50 ring-2 ring-blue-400" : ""
      }`}
    >
      <img
        src={image.src}
        alt={image.file.name}
        className="w-full h-24 object-cover"
      />
      <div className="text-xs text-gray-600 truncate px-2 py-1">
        {image.file.name}
      </div>
      <button
        onClick={onRemove}
        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
        title="Remove"
      >
        ×
      </button>
    </div>
  );
};

export default AvailableImages;
