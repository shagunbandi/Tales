import React from "react";
import AvailableImages from "./design/AvailableImages.jsx";
import PagesHeader from "./design/PagesHeader.jsx";
import PagesList from "./design/PagesList.jsx";
import GeneratePDFButton from "./design/GeneratePDFButton.jsx";

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
  onSettingsChange,
}) => {
  return (
    <div className="space-y-6 px-6 py-8">
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar: Available Images */}
        <div className="lg:sticky lg:top-8 lg:h-[75vh] lg:w-1/3">
          <AvailableImages
            availableImages={availableImages}
            removeAvailableImage={onRemoveAvailableImage}
            totalImages={totalImages}
            onAddMoreImages={onAddMoreImages}
          />
        </div>

        {/* Sticky Divider */}
        <div className="sticky top-8 hidden h-[70vh] w-px bg-gray-200 lg:block"></div>

        {/* Main: Pages Design & PDF Button */}
        <div className="space-y-6 lg:w-2/3">
          <PagesHeader
            isProcessing={isProcessing}
            availableImages={availableImages}
            onAutoArrange={onAutoArrange}
          />

          <PagesList
            pages={pages}
            onAddPageBetween={onAddPageBetween}
            onRemovePage={onRemovePage}
            onChangePageColor={onChangePageColor}
            onAddPage={onAddPage}
            settings={settings}
          />

          <GeneratePDFButton
            onGeneratePDF={onGeneratePDF}
            pages={pages}
            isProcessing={isProcessing}
          />
        </div>
      </div>
    </div>
  );
};

export default DesignTab;
