import React from "react";
import { Card } from "flowbite-react";
import AvailableImages from "./design/AvailableImages.jsx";
import PagesHeader from "./design/PagesHeader.jsx";
import PagesList from "./design/PagesList.jsx";
import GeneratePDFButton from "./design/GeneratePDFButton.jsx";
import ProgressBar from "./ProgressBar.jsx";

const DesignTab = ({
  pages,
  availableImages,
  totalImages,
  isProcessing,
  progress,
  onAddPage,
  onAddPageBetween,
  onRemovePage,
  onChangePageColor,
  onRemoveAvailableImage,
  onAddMoreImages,
  onGeneratePDF,
  onAutoArrange,
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
}) => {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Progress Bar */}
      {progress && (
        <Card>
          <ProgressBar progress={progress} />
        </Card>
      )}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Available Images - Sticky Sidebar */}
        <div className="w-full lg:sticky lg:top-6 lg:w-1/3 lg:min-w-0 lg:self-start">
          <Card className="h-fit lg:max-h-[calc(100vh-8rem)] lg:overflow-hidden">
            <AvailableImages
              availableImages={availableImages}
              removeAvailableImage={onRemoveAvailableImage}
              totalImages={totalImages}
              onAddMoreImages={onAddMoreImages}
            />
          </Card>
        </div>

        {/* Pages Design */}
        <div className="w-full lg:w-2/3 lg:min-w-0">
          <Card>
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
              settings={settings}
            />

            <GeneratePDFButton
              onGeneratePDF={onGeneratePDF}
              pages={pages}
              isProcessing={isProcessing}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DesignTab;
