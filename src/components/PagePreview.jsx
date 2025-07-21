import React from 'react'
import { Droppable, Draggable } from 'react-beautiful-dnd'
import { PREVIEW_WIDTH, PREVIEW_HEIGHT } from '../constants.js'

const PagePreview = ({
  page,
  pageIndex,
  onChangeColor,
  onRemovePage,
  onAddPageBetween,
  canRemove,
  isLastPage,
}) => {
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
            className="add-page-between-btn"
            onClick={() => onAddPageBetween(page.id)}
            title="Add page after this one"
          >
            +
          </button>
          {canRemove && (
            <button
              className="remove-page-btn"
              onClick={() => onRemovePage(page.id)}
              title="Remove page"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <Droppable droppableId={page.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`page-preview ${
              snapshot.isDraggingOver ? 'drag-over' : ''
            }`}
            style={{
              backgroundColor: page.color.color,
              width: PREVIEW_WIDTH,
              height: PREVIEW_HEIGHT,
            }}
          >
            {page.images.map((image, index) => (
              <Draggable
                key={`${page.id}-${image.id}`}
                draggableId={`${page.id}-${image.id}`}
                index={index}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`page-image ${
                      snapshot.isDragging ? 'dragging' : ''
                    }`}
                    style={{
                      left: image.x,
                      top: image.y,
                      width: image.previewWidth,
                      height: image.previewHeight,
                    }}
                  >
                    <img src={image.src} alt={image.file.name} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            {page.images.length === 0 && (
              <div className="empty-page">
                Drag images here to add them to this page
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  )
}

export default PagePreview
