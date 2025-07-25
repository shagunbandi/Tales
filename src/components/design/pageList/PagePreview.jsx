import React from "react";
import { useDroppable, useDraggable } from "@dnd-kit/core";
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

  return (
    <div className="page-container">
      <div className="page-header">
        <span>Page {pageIndex + 1}</span>
        <div className="page-controls">
          <button
            className="color-btn"
            style={{ backgroundColor: page.color.color }}
            onClick={() => onChangeColor(page.id)}
            title="Change background color"
          >
            🎨
          </button>

          <button
            className="remove-page-btn"
            onClick={() => onRemovePage(page.id)}
            title="Remove page"
          >
            ×
          </button>
        </div>
      </div>

      <div
        ref={setDroppableRef}
        className={`page-preview ${isOver ? "drag-over" : ""}`}
        style={{
          backgroundColor: page.color.color,
          width: getPreviewDimensions(settings).width,
          height: getPreviewDimensions(settings).height,
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
          <div className="empty-page">
            Drag images here to add them to this page
          </div>
        )}
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
      className={`page-image ${isDragging ? "dragging" : ""}`}
      style={style}
    >
      <img src={image.src} alt={image.file.name} />
    </div>
  );
};

export default PagePreview;
