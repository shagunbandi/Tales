import React, { useState } from "react";
import { Card, Button, Modal } from "flowbite-react";
import { HiCog, HiDownload, HiUpload, HiColorSwatch, HiTrash } from "react-icons/hi";
import AvailableImages from "./design/AvailableImages.jsx";
import PagesHeader from "./design/PagesHeader.jsx";
import PagesList from "./design/PagesList.jsx";
import GeneratePDFButton from "./design/GeneratePDFButton.jsx";
import {
  DESIGN_STYLES,
  PAGE_SIZE_LABELS,
  ORIENTATIONS,
  ORIENTATION_LABELS,
  COLOR_PALETTE,
} from "../constants.js";

// Settings Modal Component
const SettingsModal = ({ show, onClose, settings, onSettingsChange }) => {
  const handleSettingChange = (key, value) => {
    let parsedValue = value;
    if (value !== "" && !isNaN(value)) {
      parsedValue =
        key === "imageQuality" || key === "pageBorderWidth" || key === "pictureBorderWidth" ? parseFloat(value) : parseInt(value);
    }
    onSettingsChange({ ...settings, [key]: parsedValue });
  };

  const validateSettings = () => {
    const errors = {};
    const isValidNumber = (value, min, max) => {
      if (value === undefined || value === null || value === "") {
        return false;
      }
      return !isNaN(value) && value >= min && value <= max;
    };

    if (settings.pictureBorderWidth !== undefined && settings.pictureBorderWidth !== null && settings.pictureBorderWidth !== "" && (isNaN(settings.pictureBorderWidth) || settings.pictureBorderWidth < 0)) {
      errors.pictureBorderWidth = "Picture border width must be 0 or greater";
    }
    if (settings.pageBorderWidth !== undefined && settings.pageBorderWidth !== null && settings.pageBorderWidth !== "" && (isNaN(settings.pageBorderWidth) || settings.pageBorderWidth < 0)) {
      errors.pageBorderWidth = "Page border width must be 0 or greater";
    }

    if (!isValidNumber(settings.imagesPerPage, 1, Infinity)) {
      errors.imagesPerPage = "Images per page must be at least 1";
    }
    if (!isValidNumber(settings.maxNumberOfPages, 1, 100)) {
      errors.maxNumberOfPages = "Max number of pages must be between 1 and 100";
    }
    if (!isValidNumber(settings.imageQuality, 0.1, 1.0)) {
      errors.imageQuality = "Image quality must be between 0.1 and 1.0";
    }

    return errors;
  };

  const errors = validateSettings();

  const settingFields = [
    {
      id: "pictureBorderWidth",
      label: "Picture Border Width (mm):",
      min: 0,
      step: 0.5,
      help: "Width of border around each picture (0 = no border)",
    },
    {
      id: "pageBorderWidth",
      label: "Page Border Width (mm):",
      min: 0,
      step: 0.5,
      help: "Creates a frame around entire page content (0 = no border)",
    },
    {
      id: "imagesPerPage",
      label: "Images Per Page:",
      min: 1,
      help: "Preferred number of images per page (works with row/column limits)",
    },
    {
      id: "maxNumberOfPages",
      label: "Max Number of Pages:",
      min: 1,
      max: 100,
      help: "Maximum pages in the generated PDF",
    },
    {
      id: "imageQuality",
      label: "Image Quality:",
      min: 0.1,
      max: 1.0,
      step: 0.1,
      help: "Quality of images (0.1 = low, 1.0 = high)",
    },
  ];

  return (
    <Modal show={show} onClose={onClose} size="lg" data-testid="settings-modal">
      <div className="p-6">
        {/* Header */}
        <div className="mb-4 flex items-center">
          <HiCog className="mr-2 h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Layout Settings
          </h3>
        </div>

        {/* Body */}
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Configure how your images will be arranged in the PDF pages.
          </p>

          {/* Page Configuration */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Page Size */}
            <div className="space-y-1">
              <label
                htmlFor="pageSize"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Page Size:
              </label>
              <select
                id="pageSize"
                value={settings.pageSize || "a4"}
                onChange={(e) => handleSettingChange("pageSize", e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                data-testid="settings-select-pageSize"
              >
                {Object.keys(PAGE_SIZE_LABELS).map((size) => (
                  <option key={size} value={size}>
                    {PAGE_SIZE_LABELS[size]}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Choose the paper size for your PDF
              </p>
            </div>

            {/* Orientation */}
            <div className="space-y-1">
              <label
                htmlFor="orientation"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Orientation:
              </label>
              <select
                id="orientation"
                value={settings.orientation || ORIENTATIONS.LANDSCAPE}
                onChange={(e) => handleSettingChange("orientation", e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                data-testid="settings-select-orientation"
              >
                {Object.values(ORIENTATIONS).map((orientation) => (
                  <option key={orientation} value={orientation}>
                    {ORIENTATION_LABELS[orientation]}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Page orientation for your layout
              </p>
            </div>
          </div>

          {/* Layout Settings */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {settingFields.map(({ id, label, min, max, step = 1, help }) => (
                <div key={id} className="space-y-1">
                  <label
                    htmlFor={id}
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    {label}
                  </label>
                  <input
                    type="number"
                    id={id}
                    value={
                      settings[id] !== undefined && settings[id] !== null
                        ? settings[id]
                        : ""
                    }
                    onChange={(e) => handleSettingChange(id, e.target.value)}
                    min={min}
                    max={max}
                    step={step}
                    required
                    className={`w-full rounded border bg-white px-3 py-2 text-sm text-gray-900 dark:bg-gray-700 dark:text-gray-100 ${
                      errors[id]
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-400 dark:focus:border-red-400 dark:focus:ring-red-400"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                    }`}
                    data-testid={`settings-input-${id}`}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {help}
                  </p>
                  {errors[id] && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {errors[id]}
                    </p>
                  )}
                </div>
              ))}
          </div>

          {/* Info note for Full Cover borders */}
          {(settings.pageBorderWidth > 0 || settings.pictureBorderWidth > 0) && (
            <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Border Colors:</strong> Use the "Page Color" button on each page to set the color for the page background, page border, and picture borders - all controlled by one color.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const DesignTab = ({
  pages,
  availableImages,
  totalImages,
  isProcessing,
  onAddPage,
  onAddPageBetween,
  onRemovePage,
  onChangePageColor,
  onChangeImageBorderColor,
  onTogglePageBorder,
  onSetAllPageColors,
  onEnableAllPageBorders,
  onRemoveAvailableImage,
  onAddMoreImages,
  onGeneratePDF,
  onAutoArrange,
  onMoveImageBack,
  onMoveAllImagesBack,
  onAutoArrangePage,
  onRandomizePage,
  onSelectLayout,
  onUpdateImagePosition,
  onMoveImageToPreviousPage,
  onMoveImageToNextPage,
  onSwapImagesInPage,
  settings,
  onSettingsChange,
  isPageProcessing,
  onAddSelectedToPage,
  onExportProject,
  onLoadProject,
  onMergeProject,
  onClearAll,
}) => {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [isImagesExpanded, setIsImagesExpanded] = useState(false);
  const [showBulkColorPicker, setShowBulkColorPicker] = useState(false);
  const [tempBulkColor, setTempBulkColor] = useState("#FFFFFF");
  const projectFileInputRef = React.useRef(null);
  const mergeProjectFileInputRef = React.useRef(null);

  const handleLoadProjectClick = () => {
    if (projectFileInputRef.current) {
      projectFileInputRef.current.value = "";
      projectFileInputRef.current.click();
    }
  };

  const handleMergeProjectClick = () => {
    if (mergeProjectFileInputRef.current) {
      mergeProjectFileInputRef.current.value = "";
      mergeProjectFileInputRef.current.click();
    }
  };

  const handleProjectFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (file && file.name.toLowerCase().endsWith('.zip')) {
      await onLoadProject(file);
    } else if (file) {
      // Show error for invalid file type
      // The hook will show the error toast, so we don't need alert here
    }
  };

  const handleMergeProjectFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (file && file.name.toLowerCase().endsWith('.zip')) {
      await onMergeProject(file);
    } else if (file) {
      // Show error for invalid file type
      // The hook will show the error toast, so we don't need alert here
    }
  };

  const handleToggleImagesExpanded = () => {
    setIsImagesExpanded(prev => !prev);
  };

  const handleAddSelectedToPageWithCollapse = (selectedImages, pageId) => {
    onAddSelectedToPage(selectedImages, pageId);
    setIsImagesExpanded(false); // Auto-collapse after adding to page
  };

  const handleClearConfirm = async () => {
    setShowClearConfirmModal(false);
    if (onClearAll) {
      await onClearAll();
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Hidden file inputs for project loading and merging */}
      <input
        ref={projectFileInputRef}
        type="file"
        accept=".zip"
        onChange={handleProjectFileChange}
        className="hidden"
      />
      <input
        ref={mergeProjectFileInputRef}
        type="file"
        accept=".zip"
        onChange={handleMergeProjectFileChange}
        className="hidden"
      />
      
      {isImagesExpanded ? (
        /* Expanded Images View - Full Width */
        <div className="w-full" data-testid="expanded-images-panel">
          <Card className="h-[calc(100vh-8rem)]">
            <AvailableImages
              availableImages={availableImages}
              removeAvailableImage={onRemoveAvailableImage}
              totalImages={totalImages}
              onAddMoreImages={onAddMoreImages}
              pages={pages}
              onAddSelectedToPage={handleAddSelectedToPageWithCollapse}
              isExpanded={true}
              onToggleExpanded={handleToggleImagesExpanded}
            />
          </Card>
        </div>
      ) : (
        /* Normal Two-Column Layout */
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* Available Images - Sticky Sidebar */}
          <div
            className="w-full lg:sticky lg:top-6 lg:w-1/3 lg:min-w-0 lg:self-start"
            data-testid="available-images-panel"
          >
            <Card className="h-fit lg:h-[calc(100vh-8rem)]">
              <AvailableImages
                availableImages={availableImages}
                removeAvailableImage={onRemoveAvailableImage}
                totalImages={totalImages}
                onAddMoreImages={onAddMoreImages}
                pages={pages}
                onAddSelectedToPage={onAddSelectedToPage}
                isExpanded={false}
                onToggleExpanded={handleToggleImagesExpanded}
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
                settings={settings}
              />

              {/* Settings Button */}
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => setShowSettingsModal(true)}
                  size="sm"
                  color="gray"
                  data-testid="settings-button"
                >
                  <HiCog className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </div>
              <div className="space-y-3 pb-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={handleLoadProjectClick}
                    size="sm"
                    color="blue"
                    disabled={isProcessing}
                    data-testid="load-project-button"
                  >
                    <HiUpload className="mr-2 h-4 w-4" />
                    Load Project
                  </Button>
                  <Button
                    onClick={handleMergeProjectClick}
                    size="sm"
                    color="purple"
                    disabled={isProcessing}
                    data-testid="merge-project-button"
                  >
                    <HiUpload className="mr-2 h-4 w-4" />
                    Merge Project
                  </Button>
                  <Button
                    onClick={onExportProject}
                    size="sm"
                    color="green"
                    disabled={isProcessing || (pages.length === 0 && availableImages.length === 0)}
                    data-testid="export-project-button"
                  >
                    <HiDownload className="mr-2 h-4 w-4" />
                    Export Project
                  </Button>
                  <Button
                    onClick={() => setShowClearConfirmModal(true)}
                    size="sm"
                    color="red"
                    disabled={isProcessing || (pages.length === 0 && availableImages.length === 0)}
                    data-testid="start-fresh-button"
                  >
                    <HiTrash className="mr-2 h-4 w-4" />
                    Start Fresh
                  </Button>
                </div>
                
                {/* Bulk Border Operations */}
                {pages.length > 0 && (
                  <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Bulk Operations
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => setShowBulkColorPicker(!showBulkColorPicker)}
                        size="xs"
                        color="light"
                        disabled={isProcessing}
                      >
                        <HiColorSwatch className="mr-1 h-3 w-3" />
                        Set Color for All Pages
                      </Button>
                      <Button
                        onClick={() => onEnableAllPageBorders(true)}
                        size="xs"
                        color="light"
                        disabled={isProcessing}
                      >
                        Enable All Borders
                      </Button>
                      <Button
                        onClick={() => onEnableAllPageBorders(false)}
                        size="xs"
                        color="light"
                        disabled={isProcessing}
                      >
                        Disable All Borders
                      </Button>
                    </div>

                    {/* Bulk Color Picker */}
                    {showBulkColorPicker && (
                      <div className="mt-2 rounded-lg border border-gray-300 bg-white p-3 dark:border-gray-600 dark:bg-gray-900">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                Choose Color for All Pages
                              </label>
                              {settings?.designStyle === "full_cover" && (settings?.pageBorderWidth > 0 || settings?.pictureBorderWidth > 0) && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  Will update page background, page border & picture borders for all pages
                                </p>
                              )}
                            </div>
                            <Button
                              size="xs"
                              color="blue"
                              onClick={() => setShowBulkColorPicker(false)}
                            >
                              Done
                            </Button>
                          </div>
                          
                          {/* Color Palette Grid */}
                          <div className="grid grid-cols-6 gap-2">
                            {COLOR_PALETTE.map((color) => (
                              <button
                                key={color.color}
                                onClick={() => {
                                  setTempBulkColor(color.color);
                                  onSetAllPageColors(color);
                                }}
                                className={`h-10 w-full rounded border-2 transition-all hover:scale-110 ${
                                  tempBulkColor === color.color
                                    ? "border-blue-500 ring-2 ring-blue-300"
                                    : "border-gray-300 dark:border-gray-600"
                                }`}
                                style={{ backgroundColor: color.color }}
                                title={color.name}
                              />
                            ))}
                          </div>
                          
                          {/* Show selected color info */}
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Selected:</span>
                            <div
                              className="h-6 w-6 rounded border border-gray-300 dark:border-gray-600"
                              style={{ backgroundColor: tempBulkColor }}
                            />
                            <span className="text-gray-700 dark:text-gray-200">
                              {COLOR_PALETTE.find(c => c.color === tempBulkColor)?.name || tempBulkColor}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="border-t border-gray-200 pt-4 dark:border-gray-700"></div>

              <PagesList
                pages={pages}
                onAddPageBetween={onAddPageBetween}
                onRemovePage={onRemovePage}
                onChangePageColor={onChangePageColor}
                onChangeImageBorderColor={onChangeImageBorderColor}
                onTogglePageBorder={onTogglePageBorder}
                onAddPage={onAddPage}
                onMoveImageBack={onMoveImageBack}
                onMoveAllImagesBack={onMoveAllImagesBack}
                onAutoArrangePage={onAutoArrangePage}
                onRandomizePage={onRandomizePage}
                onSelectLayout={onSelectLayout}
                onUpdateImagePosition={onUpdateImagePosition}
                onMoveImageToPreviousPage={onMoveImageToPreviousPage}
                onMoveImageToNextPage={onMoveImageToNextPage}
                onSwapImagesInPage={onSwapImagesInPage}
                settings={settings}
                isProcessing={isProcessing}
                isPageProcessing={isPageProcessing}
              />

              <GeneratePDFButton
                onGeneratePDF={onGeneratePDF}
                pages={pages}
                isProcessing={isProcessing}
                settings={settings}
              />
            </Card>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        show={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        settings={settings}
        onSettingsChange={onSettingsChange}
      />

      {/* Clear Confirmation Modal */}
      <Modal 
        show={showClearConfirmModal} 
        onClose={() => setShowClearConfirmModal(false)}
        size="md"
        data-testid="clear-confirm-modal"
      >
        <div className="p-6">
          <div className="mb-4 flex items-center">
            <HiTrash className="mr-2 h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Start Fresh?
            </h3>
          </div>
          
          <div className="mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              This will remove all pages and imported media. This action cannot be undone.
            </p>
            {(pages.length > 0 || availableImages.length > 0) && (
              <div className="mt-3 rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Warning:</strong> You currently have{" "}
                  {pages.length > 0 && `${pages.length} page${pages.length !== 1 ? 's' : ''}`}
                  {pages.length > 0 && availableImages.length > 0 && " and "}
                  {availableImages.length > 0 && `${availableImages.length} available image${availableImages.length !== 1 ? 's' : ''}`}.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button 
              onClick={() => setShowClearConfirmModal(false)}
              color="gray"
              data-testid="clear-cancel-button"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleClearConfirm}
              color="red"
              data-testid="clear-confirm-button"
            >
              Yes, Start Fresh
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DesignTab;
