import React, { useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useImageManagement } from "./hooks/useImageManagement";
import { DEFAULT_SETTINGS } from "./constants";
import TabNavigation from "./components/TabNavigation";
import UploadTab from "./components/UploadTab";
import DesignStyleTab from "./components/DesignStyleTab";
import DesignTab from "./components/DesignTab";
import SettingsTab from "./components/SettingsTab";
import AppHeader from "./components/AppHeader";
import { DarkThemeToggle } from "flowbite-react";

function App() {
  const [activeTab, setActiveTab] = useState("upload");
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

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
    error,
    progress,
    totalImages,
    handleFiles,
    handleDragEnd,
    addPage,
    addPageBetween,
    removePage,
    changePageColor,
    removeAvailableImage,
    autoArrangeImagesToPages,
    moveImageBack,
    moveAllImagesBack,
    autoArrangePage,
    randomizePage,
    randomizeLayout,
    updateImagePosition,
    moveImageToPreviousPage,
    moveImageToNextPage,
    swapImagesInPage,
    handleGeneratePDF,
    setError,
  } = useImageManagement(settings);

  // Validation function to check if settings are valid
  const validateSettings = () => {
    const errors = {};

    // Helper function to check if value is valid number
    const isValidNumber = (value, min, max) => {
      return !isNaN(value) && value !== "" && value >= min && value <= max;
    };

    // Page margin validation
    if (!isValidNumber(settings.pageMargin, 0, 50)) {
      errors.pageMargin = "Page margin must be between 5 and 50 pixels";
    }

    // Image gap validation
    if (!isValidNumber(settings.imageGap, 0, 30)) {
      errors.imageGap = "Image gap must be between 0 and 30 pixels";
    }

    // Max images per row validation
    if (!isValidNumber(settings.maxImagesPerRow, 1, Infinity)) {
      errors.maxImagesPerRow = "Max images per row must be at least 1";
    }

    // Max number of rows validation
    if (!isValidNumber(settings.maxNumberOfRows, 1, Infinity)) {
      errors.maxNumberOfRows = "Max number of rows must be at least 1";
    }

    // Images per page validation
    if (!isValidNumber(settings.imagesPerPage, 1, Infinity)) {
      errors.imagesPerPage = "Images per page must be at least 1";
    }

    // Max number of pages validation
    if (!isValidNumber(settings.maxNumberOfPages, 1, 100)) {
      errors.maxNumberOfPages = "Max number of pages must be between 1 and 100";
    }

    // Image quality validation
    if (!isValidNumber(settings.imageQuality, 0.1, 1.0)) {
      errors.imageQuality = "Image quality must be between 0.1 and 1.0";
    }

    return errors;
  };

  const settingsErrors = validateSettings();
  const hasSettingsErrors = Object.keys(settingsErrors).length > 0;

  const addMoreImages = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = "image/*";
    input.onchange = async (event) => {
      const files = Array.from(event.target.files);
      if (files.length > 0) {
        await handleFiles(files);
      }
    };
    input.click();
  };

  // Redirect to design style when images are uploaded
  React.useEffect(() => {
    if (totalImages > 0 && activeTab === "upload") {
      setActiveTab("designStyle");
    }
  }, [totalImages, activeTab]);

  const handleNextToSettings = () => {
    setActiveTab("settings");
  };

  const handleNextToDesign = () => {
    setActiveTab("design");
  };

  return (
    <div className="mx-auto min-h-screen max-w-4xl dark:bg-gray-900">
      <div className="absolute top-4 right-4 z-50">
        <DarkThemeToggle />
      </div>
      <AppHeader />

      <TabNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalImages={totalImages}
        hasSettingsErrors={hasSettingsErrors}
      />

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        {activeTab === "upload" && (
          <UploadTab
            handleFiles={handleFiles}
            isProcessing={isProcessing}
            totalImages={totalImages}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === "designStyle" && (
          <DesignStyleTab
            settings={settings}
            onSettingsChange={setSettings}
            onNext={handleNextToSettings}
          />
        )}

        {activeTab === "settings" && (
          <SettingsTab
            settings={settings}
            onSettingsChange={setSettings}
            onNext={handleNextToDesign}
          />
        )}

        {activeTab === "design" && (
          <DesignTab
            pages={pages}
            availableImages={availableImages}
            totalImages={totalImages}
            isProcessing={isProcessing}
            progress={progress}
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
            onUpdateImagePosition={updateImagePosition}
            onMoveImageToPreviousPage={moveImageToPreviousPage}
            onMoveImageToNextPage={moveImageToNextPage}
            onSwapImagesInPage={swapImagesInPage}
            settings={settings}
          />
        )}
      </DndContext>

      {error && (
        <div className="fixed top-4 right-4 z-50 rounded-lg bg-red-500 px-4 py-2 text-white shadow-lg dark:bg-red-600">
          {error}
        </div>
      )}
    </div>
  );
}

export default App;
