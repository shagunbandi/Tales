import React from "react";
import PagePreview from "./pageList/PagePreview.jsx";
import AddPageSection from "./pageList/AddPageSection.jsx";

const PagesList = ({
  pages,
  onAddPageBetween,
  onRemovePage,
  onChangePageColor,
  onAddPage,
  settings,
}) => {
  return (
    <div className="min-w-0 space-y-6">
      <AddPageSection
        onAddPage={() => onAddPageBetween("start")}
        title="Add page at the beginning"
      />

      {pages.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-gray-500">
            No pages yet. Add a page to get started!
          </p>
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
  );
};

export default PagesList;
