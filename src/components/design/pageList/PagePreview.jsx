import React, { useRef, useEffect, useState } from "react";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { Button } from "flowbite-react";
import { HiTrash, HiColorSwatch } from "react-icons/hi";
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

  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const newScale = containerWidth / previewDimensions.width;
        setScale(newScale);
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [previewDimensions.width]);

  return (
    <div className="mb-6 min-w-0">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Page {pageIndex + 1}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {imageCount} {imageCount === 1 ? "image" : "images"}
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            size="xs"
            color="gray"
            onClick={() => onChangeColor(page.id)}
            className="flex items-center gap-1"
          >
            <HiColorSwatch className="h-3 w-3" />
            Color
          </Button>
          <Button
            size="xs"
            color="red"
            onClick={() => onRemovePage(page.id)}
            className="flex items-center gap-1"
          >
            <HiTrash className="h-3 w-3" />
            Remove
          </Button>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex justify-center overflow-hidden">
          <div
            ref={containerRef}
            className="w-full max-w-full overflow-hidden"
            style={{
              height: previewDimensions.height * scale,
            }}
          >
            <div
              style={{
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                width: previewDimensions.width,
                height: previewDimensions.height,
              }}
            >
              <div
                ref={setDroppableRef}
                className={`relative rounded border-2 border-dashed ${
                  isOver ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-600"
                }`}
                style={{
                  backgroundColor: page.color.color,
                  width: previewDimensions.width,
                  height: previewDimensions.height,
                  maxWidth: "100%",
                  maxHeight: "400px",
                }}
              >
                {page.images.map((image, index) => (
                  <DraggablePageImage
                    key={`${page.id}-${image.id}`}
                    image={image}
                    pageId={page.id}
                    index={index}
                    settings={settings}
                  />
                ))}
                {page.images.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                    Drag images here
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DraggablePageImage = ({ image, pageId, index, settings }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `${pageId}-${image.id}`,
      data: {
        sourceId: pageId,
        sourceIndex: index,
        image,
      },
    });

  if (!image?.src) return null;

  const style = {
    left: image.x ?? 0,
    top: image.y ?? 0,
    width: image.previewWidth ?? 100,
    height: image.previewHeight ?? 100,
    ...(transform
      ? {
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        }
      : {}),
  };

  // Use object-cover for full cover layout since images are pre-cropped
  // Use object-contain for classic layout to maintain aspect ratios
  const objectFitClass = settings?.designStyle === 'full_cover' ? 'object-cover' : 'object-contain';

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
        alt={image.file?.name || "Image"}
        className={`h-full w-full rounded ${objectFitClass}`}
      />
    </div>
  );
};

export default PagePreview;
