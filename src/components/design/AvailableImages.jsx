import React from "react";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { Button } from "flowbite-react";
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
    <div className="min-w-0">
      <div className="mb-4 flex flex-col gap-2">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Available Images
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {availableImages.length} of {totalImages} images
          </p>
        </div>
        <Button size="sm" color="blue" onClick={onAddMoreImages}>
          <HiPlus className="mr-1 h-4 w-4" />
          Add More
        </Button>
      </div>

      <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
        <div ref={setDroppableRef} className="max-h-96 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            {availableImages.map((image, index) => (
              <DraggableImage
                key={image.id}
                image={image}
                index={index}
                onRemove={() => removeAvailableImage(index)}
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
      className={`relative cursor-move overflow-hidden rounded-lg bg-gray-50 transition-all hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 ${
        isDragging ? "z-50 opacity-50 ring-2 ring-blue-400" : ""
      }`}
    >
      <div className="aspect-square">
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
          className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-600"
          title="Remove image"
        >
          <HiX className="h-3 w-3" />
        </button>
      </div>
      <div className="p-2">
        <p className="truncate text-xs text-gray-600 dark:text-gray-300">
          {image.file.name}
        </p>
      </div>
    </div>
  );
};

export default AvailableImages;
