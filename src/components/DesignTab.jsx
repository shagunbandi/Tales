import React from "react";
import { Card } from "flowbite-react";
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
    <div className="space-y-6 p-6">
      <Card>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Available Images */}
          <div className="lg:col-span-1">
            <AvailableImages
              availableImages={availableImages}
              removeAvailableImage={onRemoveAvailableImage}
              totalImages={totalImages}
              onAddMoreImages={onAddMoreImages}
            />
          </div>

          {/* Pages Design */}
          <div className="lg:col-span-2">
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
      </Card>
    </div>
  );
};

export default DesignTab;
