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
  onUpdateImagePosition,
  onMoveImageToPreviousPage,
  onMoveImageToNextPage,
  onSwapImagesInPage,
  settings,
  isProcessing,
}) => {
  return (
    <div className="min-w-0 space-y-6">
      <AddPageSection
        onAddPage={() => onAddPageBetween("start")}
        title="Add page at the beginning"
      />

      {pages.length === 0 ? (
        <div className="py-12 text-center">
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
              onUpdateImagePosition={onUpdateImagePosition}
              onMoveImageToPreviousPage={onMoveImageToPreviousPage}
              onMoveImageToNextPage={onMoveImageToNextPage}
              onSwapImagesInPage={onSwapImagesInPage}
              isLastPage={pageIndex === pages.length - 1}
              settings={settings}
              isProcessing={isProcessing}
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
  );
};

export default PagesList;
