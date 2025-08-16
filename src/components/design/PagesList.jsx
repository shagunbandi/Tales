import React, { useState, useMemo } from "react";
import { Button } from "flowbite-react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import PagePreview from "./pageList/PagePreview.jsx";
import AddPageSection from "./pageList/AddPageSection.jsx";

const PagesList = React.memo(({
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
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Reset to first page if current index is out of bounds
  const validCurrentPageIndex = useMemo(() => {
    if (pages.length === 0) return 0;
    return Math.min(currentPageIndex, pages.length - 1);
  }, [currentPageIndex, pages.length]);

  // Update current page index if it's out of bounds
  React.useEffect(() => {
    if (validCurrentPageIndex !== currentPageIndex) {
      setCurrentPageIndex(validCurrentPageIndex);
    }
  }, [validCurrentPageIndex, currentPageIndex]);

  const currentPage = pages[validCurrentPageIndex];
  const hasPreviousPage = validCurrentPageIndex > 0;
  const hasNextPage = validCurrentPageIndex < pages.length - 1;

  const goToPreviousPage = () => {
    if (hasPreviousPage) {
      setCurrentPageIndex(validCurrentPageIndex - 1);
    }
  };

  const goToNextPage = () => {
    if (hasNextPage) {
      setCurrentPageIndex(validCurrentPageIndex + 1);
    }
  };
  return (
    <div className="min-w-0 space-y-6" data-testid="pages-list">
      {pages.length === 0 ? (
        <>
          <div data-testid="add-page-start">
            <AddPageSection
              onAddPage={() => onAddPageBetween("start")}
              title="Add page at the beginning"
            />
          </div>
          <div className="py-12 text-center" data-testid="no-pages-message">
            <p className="text-gray-500 dark:text-gray-400">
              No pages yet. Add a page to get started!
            </p>
          </div>
        </>
      ) : (
        <>
          {/* Page navigation controls */}
          {pages.length > 1 && (
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
              <Button
                size="sm"
                color="gray"
                onClick={goToPreviousPage}
                disabled={!hasPreviousPage}
                className="flex items-center gap-2"
                data-testid="previous-page-button"
              >
                <HiChevronLeft className="h-4 w-4" />
                Previous Page
              </Button>
              
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Page {validCurrentPageIndex + 1} of {pages.length}
                </span>
              </div>
              
              <Button
                size="sm"
                color="gray"
                onClick={goToNextPage}
                disabled={!hasNextPage}
                className="flex items-center gap-2"
                data-testid="next-page-button"
              >
                Next Page
                <HiChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Add page at beginning option */}
          <div data-testid="add-page-start">
            <AddPageSection
              onAddPage={() => onAddPageBetween("start")}
              title="Add page at the beginning"
            />
          </div>

          {/* Current page preview */}
          {currentPage && (
            <>
              <PagePreview
                page={currentPage}
                pageIndex={validCurrentPageIndex}
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
                isLastPage={validCurrentPageIndex === pages.length - 1}
                settings={settings}
                isProcessing={isProcessing}
                isPageBusy={isPageProcessing ? isPageProcessing(currentPage.id) : false}
              />
              
              {/* Add page after current page */}
              <div data-testid={`add-page-after-${validCurrentPageIndex}`}>
                <AddPageSection
                  onAddPage={() => onAddPageBetween(currentPage.id)}
                  title="Add page after this one"
                />
              </div>
            </>
          )}

          {/* Add page at end option */}
          <div data-testid="add-page-end">
            <AddPageSection onAddPage={onAddPage} title="Add page at the end" />
          </div>
        </>
      )}
    </div>
  );
});

export default PagesList;
