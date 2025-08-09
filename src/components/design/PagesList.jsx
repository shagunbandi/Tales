import React from "react";
import PagePreview from "./pageList/PagePreview.jsx";
import AddPageSection from "./pageList/AddPageSection.jsx";

const PagesList = ({
  pages,
  onAddPageBetween,
  onRemovePage,
  onChangePageColor,
  onAddPage,
  onMoveImageBack,
  onMoveAllImagesBack,
  onAutoArrangePage,
  onRandomizePage,
  onRandomizeLayout,
  onNextLayout,
  onPreviousLayout,
  onSelectLayout,
  onUpdateImagePosition,
  onMoveImageToPreviousPage,
  onMoveImageToNextPage,
  onSwapImagesInPage,
  settings,
  isProcessing,
  isPageProcessing,
}) => {
  return (
    <div className="min-w-0 space-y-6" data-testid="pages-list">
      <div data-testid="add-page-start">
        <AddPageSection
          onAddPage={() => onAddPageBetween("start")}
          title="Add page at the beginning"
        />
      </div>

      {pages.length === 0 ? (
        <div className="py-12 text-center" data-testid="no-pages-message">
          <p className="text-gray-500 dark:text-gray-400">
            No pages yet. Add a page to get started!
          </p>
        </div>
      ) : (
        pages.map((page, pageIndex) => (
          <React.Fragment key={page.id}>
            <PagePreview
              page={page}
              pageIndex={pageIndex}
              pages={pages}
              onChangeColor={onChangePageColor}
              onRemovePage={onRemovePage}
              onMoveImageBack={onMoveImageBack}
              onMoveAllImagesBack={onMoveAllImagesBack}
              onAutoArrangePage={onAutoArrangePage}
              onRandomizePage={onRandomizePage}
              onRandomizeLayout={onRandomizeLayout}
              onNextLayout={onNextLayout}
              onPreviousLayout={onPreviousLayout}
              onSelectLayout={onSelectLayout}
              onUpdateImagePosition={onUpdateImagePosition}
              onMoveImageToPreviousPage={onMoveImageToPreviousPage}
              onMoveImageToNextPage={onMoveImageToNextPage}
              onSwapImagesInPage={onSwapImagesInPage}
              isLastPage={pageIndex === pages.length - 1}
              settings={settings}
              isProcessing={isProcessing}
              isPageBusy={isPageProcessing ? isPageProcessing(page.id) : false}
            />
            {pageIndex < pages.length - 1 && (
              <div data-testid={`add-page-after-${pageIndex}`}>
                <AddPageSection
                  onAddPage={() => onAddPageBetween(page.id)}
                  title="Add page after this one"
                />
              </div>
            )}
          </React.Fragment>
        ))
      )}

      {pages.length > 0 && (
        <div data-testid="add-page-end">
          <AddPageSection onAddPage={onAddPage} title="Add page at the end" />
        </div>
      )}
    </div>
  );
};

export default PagesList;
