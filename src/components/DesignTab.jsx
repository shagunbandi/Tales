import React from 'react'
import AvailableImages from './AvailableImages.jsx'
import PagePreview from './PagePreview.jsx'

const DesignTab = ({
  pages,
  availableImages,
  totalImages,
  isProcessing,
  onAddPage,
  onAddPageBetween,
  onRemovePage,
  onChangePageColor,
  onRemoveAvailableImage,
  onAddMoreImages,
  onGeneratePDF,
}) => {
  return (
    <div className="design-tab">
      <div className="layout-container">
        {/* Available Images Panel */}
        <AvailableImages
          availableImages={availableImages}
          removeAvailableImage={onRemoveAvailableImage}
          totalImages={totalImages}
          onAddMoreImages={onAddMoreImages}
        />

        {/* Pages Preview */}
        <div className="pages-container">
          <div className="pages-header">
            <h3>PDF Pages Preview</h3>
            <button className="btn btn-secondary" onClick={onAddPage}>
              Add Page
            </button>
          </div>

          <div className="pages-list">
            {pages.map((page, pageIndex) => (
              <PagePreview
                key={page.id}
                page={page}
                pageIndex={pageIndex}
                onChangeColor={onChangePageColor}
                onRemovePage={onRemovePage}
                onAddPageBetween={onAddPageBetween}
                canRemove={pages.length > 1}
                isLastPage={pageIndex === pages.length - 1}
              />
            ))}
          </div>

          <div className="actions">
            <button
              className="btn btn-primary"
              onClick={onGeneratePDF}
              disabled={
                pages.every((p) => p.images.length === 0) || isProcessing
              }
            >
              {isProcessing ? 'Generating PDF...' : 'Generate PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DesignTab
