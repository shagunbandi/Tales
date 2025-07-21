import React from 'react'
import { Droppable, Draggable } from 'react-beautiful-dnd'

const AvailableImages = ({
  availableImages,
  removeAvailableImage,
  totalImages,
  onAddMoreImages,
}) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Available Images</h3>
        <button className="btn btn-small" onClick={onAddMoreImages}>
          + Add More
        </button>
      </div>
      <Droppable droppableId="available-images">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="available-images"
          >
            {availableImages.map((image, index) => (
              <Draggable key={image.id} draggableId={image.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`available-image ${
                      snapshot.isDragging ? 'dragging' : ''
                    }`}
                  >
                    <img src={image.src} alt={image.file.name} />
                    <div className="image-name">{image.file.name}</div>
                    <button
                      className="remove-btn"
                      onClick={() => removeAvailableImage(index)}
                    >
                      ×
                    </button>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
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
        )}
      </Droppable>
    </div>
  )
}

export default AvailableImages
