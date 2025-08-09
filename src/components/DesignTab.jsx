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
  onSaveAlbum,
  currentAlbumId,
  currentAlbumName,
  lastSaveTime,
  settings,
}) => {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Available Images - Sticky Sidebar */}
        <div
          className="w-full lg:sticky lg:top-6 lg:w-1/3 lg:min-w-0 lg:self-start"
          data-testid="available-images-panel"
        >
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
        <div className="w-full lg:w-2/3 lg:min-w-0" data-testid="pages-panel">
          <Card>
            <PagesHeader
              isProcessing={isProcessing}
              availableImages={availableImages}
              totalImages={totalImages}
              onAutoArrange={onAutoArrange}
              onSaveAlbum={onSaveAlbum}
              currentAlbumId={currentAlbumId}
              currentAlbumName={currentAlbumName}
              lastSaveTime={lastSaveTime}
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
              isProcessing={isProcessing}
            />

            <GeneratePDFButton
              onGeneratePDF={onGeneratePDF}
              pages={pages}
              isProcessing={isProcessing}
              currentAlbumName={currentAlbumName}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DesignTab;
