import React from "react";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { Button, Badge } from "flowbite-react";
import { HiTrash } from "react-icons/hi";
import { getPreviewDimensions } from "../../../constants";

const PagePreview = ({
  page,
  pageIndex,
  onChangeColor,
  onRemovePage,
  settings,
}) => {
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: page.id,
    data: {
      type: "page",
      pageId: page.id,
    },
  });

  const previewDimensions = getPreviewDimensions(settings);
  const imageCount = page.images.length;

  return (
    <div className="rounded-lg bg-white p-3 shadow-md transition-shadow hover:shadow-lg">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge pill color="light" size="sm">
            Page {pageIndex + 1}
          </Badge>
          <Badge pill color="success" size="sm">
            {imageCount} {imageCount === 1 ? "image" : "images"}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Badge
            pill
            color="purple"
            size="sm"
            onClick={() => onChangeColor(page.id)}
            className="cursor-pointer"
          >
            Change color
          </Badge>
          <Badge
            pill
            color="red"
            size="sm"
            onClick={() => onRemovePage(page.id)}
            className="cursor-pointer"
          >
            Remove Page
          </Badge>
        </div>
      </div>

      <div className="flex justify-center">
        <div
          ref={setDroppableRef}
          className={`relative rounded border-2 border-dashed ${
            isOver ? "border-blue-400 bg-blue-50" : "border-gray-300"
          }`}
          style={{
            backgroundColor: page.color.color,
            width: previewDimensions.width,
            height: previewDimensions.height,
          }}
        >
          {page.images.map((image, index) => (
            <DraggablePageImage
              key={`${page.id}-${image.id}`}
              image={image}
              pageId={page.id}
              index={index}
            />
          ))}
          {page.images.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">
              Drag images here
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DraggablePageImage = ({ image, pageId, index }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `${pageId}-${image.id}`,
      data: {
        sourceId: pageId,
        sourceIndex: index,
        image,
      },
    });

  const style = {
    left: image.x,
    top: image.y,
    width: image.previewWidth,
    height: image.previewHeight,
    ...(transform
      ? {
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        }
      : {}),
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`absolute cursor-move ${isDragging ? "z-50 opacity-50" : ""}`}
      style={style}
    >
      <img
        src={image.src}
        alt={image.file.name}
        className="h-full w-full rounded object-cover"
      />
    </div>
  );
};

export default PagePreview;
