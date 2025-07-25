import React from "react";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { Button, Badge } from "flowbite-react";
import { HiPlus, HiX } from "react-icons/hi";

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
    <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-white shadow-sm">
      <Badge color="gray" size="sm">
        {availableImages.length}{" "}
        {availableImages.length === 1 ? "image" : "images"}
      </Badge>
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Available Images
        </h3>
        <Button size="sm" color="blue" onClick={onAddMoreImages}>
          <HiPlus className="mr-1 h-4 w-4" />
          Add More
        </Button>
      </div>

      <div ref={setDroppableRef} className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
          {availableImages.map((image, index) => (
            <DraggableImage
              key={image.id}
              image={image}
              index={index}
              onRemove={() => removeAvailableImage(index)}
            />
          ))}

          {availableImages.length === 0 && totalImages === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-8 text-gray-500">
              <div className="text-center text-sm">
                <p className="mb-2">No images available</p>
                <p className="text-xs">Upload some images to get started!</p>
              </div>
            </div>
          )}

          {availableImages.length === 0 && totalImages > 0 && (
            <div className="col-span-full flex items-center justify-center py-8 text-center text-sm text-gray-500">
              All images are arranged on pages
            </div>
          )}
        </div>
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
      className={`relative cursor-move overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md ${
        isDragging ? "z-50 opacity-50 ring-2 ring-blue-400" : ""
      }`}
    >
      <div className="relative aspect-square">
        <img
          src={image.src}
          alt={image.file.name}
          className="h-full w-full object-cover"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-600"
          title="Remove image"
        >
          <HiX className="h-3 w-3" />
        </button>
      </div>
      <div className="p-2">
        <p className="truncate text-xs font-medium text-gray-600">
          {image.file.name}
        </p>
      </div>
    </div>
  );
};

export default AvailableImages;
