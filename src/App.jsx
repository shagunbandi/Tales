import React, { useState, useEffect } from "react";
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
import LoadingOverlay from "./components/LoadingOverlay";
import { DarkThemeToggle } from "flowbite-react";
import { loadAppState } from "./utils/storageUtils";

function App() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const fileInputRef = React.useRef(null);

  // Load settings from storage on app initialization
  useEffect(() => {
    const loadStoredSettings = async () => {
      try {
        const storedState = await loadAppState();
        if (storedState && storedState.settings) {
          setSettings({ ...DEFAULT_SETTINGS, ...storedState.settings });
        }
        // Small delay to ensure loading indicator is visible
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error('Failed to load stored settings:', error);
      } finally {
        setIsLoadingSettings(false);
      }
    };

    loadStoredSettings();
  }, []);

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
    isLoadingFromStorage,
    totalImages,
    handleFiles,
    handleDragEnd,
    addPage,
    addPageBetween,
    removePage,
    changePageColor,
    changeImageBorderColor,
    togglePageBorder,
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

  const handleSettingsChange = async (newSettings) => {
    setSettings(newSettings);
    // Note: Auto re-arrangement of pages is handled by useEffect in useImageManagement hook
  };

  const handleFileInputChange = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      await handleFiles(files);
    }
  };

  const handleLoadProjectWithSettings = async (file) => {
    await handleLoadProject(file, (loadedSettings) => {
      setSettings(loadedSettings);
    });
  };

  // Show loading overlay while app is initializing
  const isAppLoading = isLoadingSettings || isLoadingFromStorage;

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
            onChangeImageBorderColor={changeImageBorderColor}
            onTogglePageBorder={togglePageBorder}
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
            onSettingsChange={handleSettingsChange}
            isPageProcessing={isPageProcessing}
            onAddSelectedToPage={addSelectedToPage}
            onExportProject={handleExportProject}
            onLoadProject={handleLoadProjectWithSettings}
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

      {/* Loading overlay */}
      {isAppLoading && (
        <LoadingOverlay message="Restoring your work..." />
      )}
    </div>
  );
}

export default App;
