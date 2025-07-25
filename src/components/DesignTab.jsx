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
    <div className="design-tab">
      <div className="layout-container">
        <AvailableImages
          availableImages={availableImages}
          removeAvailableImage={onRemoveAvailableImage}
          totalImages={totalImages}
          onAddMoreImages={onAddMoreImages}
        />

        <div className="pages-container">
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
