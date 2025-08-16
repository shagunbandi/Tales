import React, { useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Toaster } from "react-hot-toast";
import { useImageManagement } from "./hooks/useImageManagement";
import { DEFAULT_SETTINGS } from "./constants";
import DesignTab from "./components/DesignTab";
import AppHeader from "./components/AppHeader";
import { DarkThemeToggle } from "flowbite-react";

function App() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const fileInputRef = React.useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const {
    pages,
    availableImages,
    isProcessing,
    totalImages,
    handleFiles,
    handleDragEnd,
    addPage,
    addPageBetween,
    removePage,
    changePageColor,
    removeAvailableImage,
    addSelectedToPage,
    autoArrangeImagesToPages,
    moveImageBack,
    moveAllImagesBack,
    autoArrangePage,
    randomizePage,
    randomizeLayout,
    nextLayout,
    previousLayout,
    selectLayout,
    updateImagePosition,
    moveImageToPreviousPage,
    moveImageToNextPage,
    swapImagesInPage,
    handleGeneratePDF,
    clearCurrentWork,
    handleExportProject,
    handleLoadProject,
    isPageProcessing,
  } = useImageManagement(settings);

  const addMoreImages = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      await handleFiles(files);
    }
  };

  return (
    <div
      className="mx-auto min-h-screen max-w-4xl dark:bg-gray-900"
      data-testid="app-root"
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        data-testid="global-file-input"
      />
      <div className="absolute top-4 right-4 z-50">
        <DarkThemeToggle />
      </div>
      <AppHeader />

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div data-testid="design-tab">
          <DesignTab
            pages={pages}
            availableImages={availableImages}
            totalImages={totalImages}
            isProcessing={isProcessing}
            onAddPage={addPage}
            onAddPageBetween={addPageBetween}
            onRemovePage={removePage}
            onChangePageColor={changePageColor}
            onRemoveAvailableImage={removeAvailableImage}
            onAddMoreImages={addMoreImages}
            onGeneratePDF={handleGeneratePDF}
            onAutoArrange={autoArrangeImagesToPages}
            onMoveImageBack={moveImageBack}
            onMoveAllImagesBack={moveAllImagesBack}
            onAutoArrangePage={autoArrangePage}
            onRandomizePage={randomizePage}
            onRandomizeLayout={randomizeLayout}
            onNextLayout={nextLayout}
            onPreviousLayout={previousLayout}
            onSelectLayout={selectLayout}
            onUpdateImagePosition={updateImagePosition}
            onMoveImageToPreviousPage={moveImageToPreviousPage}
            onMoveImageToNextPage={moveImageToNextPage}
            onSwapImagesInPage={swapImagesInPage}
            settings={settings}
            onSettingsChange={setSettings}
            isPageProcessing={isPageProcessing}
            onAddSelectedToPage={addSelectedToPage}
            onExportProject={handleExportProject}
            onLoadProject={handleLoadProject}
          />
        </div>
      </DndContext>

      <div data-testid="toast-container">
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            dismissible: true,
            style: {
              background: "#363636",
              color: "#fff",
              padding: "12px",
              borderRadius: "8px",
              fontSize: "14px",
              maxWidth: "350px",
            },
            success: {
              style: {
                background: "#22c55e",
                color: "#fff",
              },
              iconTheme: {
                primary: "#fff",
                secondary: "#22c55e",
              },
            },
            error: {
              style: {
                background: "#ef4444",
                color: "#fff",
              },
              iconTheme: {
                primary: "#fff",
                secondary: "#ef4444",
              },
            },
          }}
        />
      </div>
    </div>
  );
}

export default App;
