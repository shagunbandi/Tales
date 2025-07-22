import React from 'react'

const PagesHeader = ({ isProcessing, availableImages, onAutoArrange }) => {
  return (
    <div className="pages-header">
      <h3>PDF Pages Preview</h3>
      <div className="page-controls">
        <button
          className="btn btn-secondary"
          onClick={onAutoArrange}
          disabled={isProcessing || availableImages.length === 0}
        >
          {isProcessing ? 'Auto-arranging...' : 'Auto-arrange Images'}
        </button>
      </div>
    </div>
  )
}

export default PagesHeader
