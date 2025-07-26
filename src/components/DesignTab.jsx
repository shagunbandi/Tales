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
    <div className="space-y-6 p-4 sm:p-6">
      <Card>
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Available Images */}
          <div className="w-full lg:w-1/3 lg:min-w-0">
            <AvailableImages
              availableImages={availableImages}
              removeAvailableImage={onRemoveAvailableImage}
              totalImages={totalImages}
              onAddMoreImages={onAddMoreImages}
            />
          </div>

          {/* Pages Design */}
          <div className="w-full lg:w-2/3 lg:min-w-0">
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
