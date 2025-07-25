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
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar: Available Images */}
        <div className="lg:w-1/3">
          <AvailableImages
            availableImages={availableImages}
            removeAvailableImage={onRemoveAvailableImage}
            totalImages={totalImages}
            onAddMoreImages={onAddMoreImages}
          />
        </div>

        {/* Main: Pages Design & PDF Button */}
        <div className="lg:w-2/3 space-y-6">
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
