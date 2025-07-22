import React from 'react'

const AddPageSection = ({ onAddPage, position, title }) => {
  return (
    <div className="add-page-section">
      <div className="add-page-line">
        <div className="add-page-indicator">New page will be added here</div>
        <button className="add-page-btn" onClick={onAddPage} title={title}>
          + Add Page
        </button>
      </div>
    </div>
  )
}

export default AddPageSection
