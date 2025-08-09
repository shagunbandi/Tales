import React, { useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { useImageManagement } from "./hooks/useImageManagement";
import { useAutoSave } from "./hooks/useAutoSave";
import { DEFAULT_SETTINGS } from "./constants";
import TabNavigation from "./components/TabNavigation";
import DesignStyleTab from "./components/DesignStyleTab";
import DesignTab from "./components/DesignTab";
import SettingsTab from "./components/SettingsTab";
import AlbumsTab from "./components/AlbumsTab";
import AppHeader from "./components/AppHeader";
import { DarkThemeToggle } from "flowbite-react";
import UploadTab from "./components/UploadTab";

function App() {
  const [activeTab, setActiveTab] = useState("albums");
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [currentAlbumId, setCurrentAlbumId] = useState(null);
  const [currentAlbumName, setCurrentAlbumName] = useState("");
  const [showNavigation, setShowNavigation] = useState(false);
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
    // Album storage methods
    saveCurrentAsAlbum,
    loadAlbumById,
    clearCurrentWork,
    getCurrentAlbumData,
    loadAlbumData,
    enableAutoSave,
  } = useImageManagement(settings);

  // Auto-save functionality
  const {
    lastSaveTime,
    isAutoSaving,
    enableAutoSave: enableAutoSaveHook,
    disableAutoSave,
    manualSave,
    hasUnsavedChanges,
  } = useAutoSave({
    pages,
    availableImages,
    saveCurrentAsAlbum,
    enabled:
      totalImages > 0 && (activeTab === "design" || activeTab === "settings"), // Only auto-save when working on design
    intervalMs: 60000, // 1 minute
    currentAlbumId,
    currentAlbumName,
  });

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

  // Enhanced album loading that sets current album info for auto-save
  const handleLoadAlbum = async (albumId) => {
    const album = await loadAlbumById(albumId);
    if (album) {
      setCurrentAlbumId(album.id);
      setCurrentAlbumName(album.name);

      // Restore the album's settings
      if (album.settings) {
        setSettings((prevSettings) => ({
          ...prevSettings,
          ...album.settings,
        }));
        toast.success(
          `🎨 Restored settings: ${album.settings.designStyle === "full_cover" ? "Full Cover" : "Classic"} design`,
          {
            duration: 3000,
            icon: "⚙️",
          },
        );
      }

      setActiveTab("design"); // Navigate to design tab after loading
    }
    return album;
  };

  // Enhanced save function that updates current album info
  const handleSaveAlbum = async (
    albumName,
    albumDescription = "",
    existingId = null,
  ) => {
    const savedId = await saveCurrentAsAlbum(
      albumName,
      albumDescription,
      existingId,
    );
    if (savedId) {
      setCurrentAlbumId(savedId);
      setCurrentAlbumName(albumName);
    }
    return savedId;
  };

  // Clear current album info when clearing work
  const handleClearWork = () => {
    clearCurrentWork();
    setCurrentAlbumId(null);
    setCurrentAlbumName("");
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
      <AppHeader
        isAutoSaving={isAutoSaving}
        lastSaveTime={lastSaveTime}
        hasUnsavedChanges={hasUnsavedChanges}
        currentAlbumName={currentAlbumName}
      />

      {showNavigation && (
        <TabNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          totalImages={totalImages}
          hasSettingsErrors={hasSettingsErrors}
          onGoToAlbums={
            activeTab !== "albums"
              ? () => {
                  setActiveTab("albums");
                  setShowNavigation(false);
                }
              : null
          }
        />
      )}

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        {activeTab === "albums" && (
          <div data-testid="albums-tab">
            <AlbumsTab
              saveCurrentAsAlbum={handleSaveAlbum}
              loadAlbumById={handleLoadAlbum}
              clearCurrentWork={handleClearWork}
              getCurrentAlbumData={getCurrentAlbumData}
              totalImages={totalImages}
              isProcessing={isProcessing}
              setActiveTab={setActiveTab}
              setShowNavigation={setShowNavigation}
              setCurrentAlbumName={setCurrentAlbumName}
              setCurrentAlbumId={setCurrentAlbumId}
            />
          </div>
        )}

        {activeTab === "upload" && (
          <div data-testid="upload-tab">
            <UploadTab
              handleFiles={handleFiles}
              isProcessing={isProcessing}
              totalImages={totalImages}
              setActiveTab={setActiveTab}
            />
          </div>
        )}

        {activeTab === "designStyle" && (
          <div data-testid="design-style-tab">
            <DesignStyleTab
              settings={settings}
              onSettingsChange={setSettings}
              onNext={handleNextToSettings}
            />
          </div>
        )}

        {activeTab === "settings" && (
          <div data-testid="settings-tab">
            <SettingsTab
              settings={settings}
              onSettingsChange={setSettings}
              onNext={handleNextToDesign}
            />
          </div>
        )}

        {activeTab === "design" && (
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
              onSaveAlbum={handleSaveAlbum}
              currentAlbumId={currentAlbumId}
              currentAlbumName={currentAlbumName}
              lastSaveTime={lastSaveTime}
              settings={settings}
            />
          </div>
        )}
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
