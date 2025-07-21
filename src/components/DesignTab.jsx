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
  onAutoArrange,
  settings,
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
            <div className="page-controls">
              <button
                className="btn btn-secondary"
                onClick={onAutoArrange}
                disabled={isProcessing || availableImages.length === 0}
              >
                {isProcessing ? 'Auto-arranging...' : 'Auto-arrange Images'}
              </button>
              <button className="btn btn-secondary" onClick={onAddPage}>
                Add Page
              </button>
            </div>
          </div>

          <div className="pages-list">
            {/* Add page button above the first page */}
            <div className="add-page-section">
              <div className="add-page-line">
                <div className="add-page-indicator">
                  New page will be added here
                </div>
                <button
                  className="add-page-btn"
                  onClick={() => onAddPageBetween('start')}
                  title="Add page at the beginning"
                >
                  + Add Page
                </button>
              </div>
            </div>

            {pages.length === 0 ? (
              /* Show message when no pages exist */
              <div className="no-pages-message">
                <p>No pages yet. Add a page to get started!</p>
              </div>
            ) : (
              pages.map((page, pageIndex) => (
                <React.Fragment key={page.id}>
                  <PagePreview
                    page={page}
                    pageIndex={pageIndex}
                    onChangeColor={onChangePageColor}
                    onRemovePage={onRemovePage}
                    onAddPageBetween={onAddPageBetween}
                    canRemove={true}
                    isLastPage={pageIndex === pages.length - 1}
                    settings={settings}
                  />

                  {/* Add page button below each page (except the last one) */}
                  {pageIndex < pages.length - 1 && (
                    <div className="add-page-section">
                      <div className="add-page-line">
                        <div className="add-page-indicator">
                          New page will be added here
                        </div>
                        <button
                          className="add-page-btn"
                          onClick={() => onAddPageBetween(page.id)}
                          title="Add page after this one"
                        >
                          + Add Page
                        </button>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))
            )}

            {/* Add page button below the last page (only if pages exist) */}
            {pages.length > 0 && (
              <div className="add-page-section">
                <div className="add-page-line">
                  <div className="add-page-indicator">
                    New page will be added here
                  </div>
                  <button
                    className="add-page-btn"
                    onClick={() => onAddPage()}
                    title="Add page at the end"
                  >
                    + Add Page
                  </button>
                </div>
              </div>
            )}
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
