import React from 'react'
import PagePreview from '../PagePreview.jsx'
import AddPageSection from './AddPageSection.jsx'

const PagesList = ({
  pages,
  onAddPageBetween,
  onRemovePage,
  onChangePageColor,
  onAddPage,
  settings,
}) => {
  return (
    <div className="pages-list">
      <AddPageSection
        onAddPage={() => onAddPageBetween('start')}
        title="Add page at the beginning"
      />

      {pages.length === 0 ? (
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

            {pageIndex < pages.length - 1 && (
              <AddPageSection
                onAddPage={() => onAddPageBetween(page.id)}
                title="Add page after this one"
              />
            )}
          </React.Fragment>
        ))
      )}

      {pages.length > 0 && (
        <AddPageSection onAddPage={onAddPage} title="Add page at the end" />
      )}
    </div>
  )
}

export default PagesList
