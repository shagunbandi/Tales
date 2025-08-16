import React, { useState } from "react";
import { Card, Button, Modal } from "flowbite-react";
import { HiCog, HiTemplate } from "react-icons/hi";
import AvailableImages from "./design/AvailableImages.jsx";
import PagesHeader from "./design/PagesHeader.jsx";
import PagesList from "./design/PagesList.jsx";
import GeneratePDFButton from "./design/GeneratePDFButton.jsx";
import {
  DESIGN_STYLES,
  DESIGN_STYLE_LABELS,
  DESIGN_STYLE_DESCRIPTIONS,
} from "../constants.js";

// Settings Modal Component
const SettingsModal = ({ show, onClose, settings, onSettingsChange }) => {
  const handleSettingChange = (key, value) => {
    let parsedValue = value;
    if (value !== "" && !isNaN(value)) {
      parsedValue =
        key === "imageQuality" ? parseFloat(value) : parseInt(value);
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

    if (settings.designStyle !== DESIGN_STYLES.FULL_COVER) {
      if (!isValidNumber(settings.pageMargin, 0, 50)) {
        errors.pageMargin =
          "Page margin must be between 0 and 50 pixels (0 is allowed)";
      }
      if (!isValidNumber(settings.imageGap, 0, 30)) {
        errors.imageGap =
          "Image gap must be between 0 and 30 pixels (0 is allowed)";
      }
    }

    if (settings.designStyle !== DESIGN_STYLES.FULL_COVER) {
      if (!isValidNumber(settings.maxImagesPerRow, 1, Infinity)) {
        errors.maxImagesPerRow = "Max images per row must be at least 1";
      }
      if (!isValidNumber(settings.maxNumberOfRows, 1, Infinity)) {
        errors.maxNumberOfRows = "Max number of rows must be at least 1";
      }
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
  const isFullCover = settings.designStyle === DESIGN_STYLES.FULL_COVER;

  const settingFields = [
    {
      id: "pageMargin",
      label: "Page Margin (px):",
      min: 0,
      max: 50,
      help: "Space around the edges of each page",
      hidden: isFullCover,
    },
    {
      id: "imageGap",
      label: "Image Gap (px):",
      min: 0,
      max: 30,
      help: "Space between images on the same page",
      hidden: isFullCover,
    },
    {
      id: "maxImagesPerRow",
      label: "Max Images Per Row:",
      min: 1,
      help: "Maximum number of images in a row",
      hidden: isFullCover,
    },
    {
      id: "maxNumberOfRows",
      label: "Max Number of Rows:",
      min: 1,
      help: "Maximum number of rows per page",
      hidden: isFullCover,
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
            {isFullCover && (
              <span className="mt-1 block text-blue-600 dark:text-blue-400">
                Full Cover Mode: Gap and margin settings are disabled as images
                will cover the entire page.
              </span>
            )}
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {settingFields
              .filter((field) => !field.hidden)
              .map(({ id, label, min, max, step = 1, help }) => (
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

// Design Style Modal Component
const DesignStyleModal = ({ show, onClose, settings, onSettingsChange }) => {
  const handleDesignStyleChange = (designStyle) => {
    onSettingsChange({
      ...settings,
      designStyle,
    });
  };

  const isFullCover = settings.designStyle === DESIGN_STYLES.FULL_COVER;

  return (
    <Modal show={show} onClose={onClose} size="lg" data-testid="design-style-modal">
      <div className="p-6">
        {/* Header */}
        <div className="mb-4 flex items-center">
          <HiTemplate className="mr-2 h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Choose Design Style
          </h3>
        </div>

        {/* Body */}
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Select how you want your images to be arranged in the PDF.
          </p>

          <div className="space-y-3">
            {Object.entries(DESIGN_STYLES).map(([key, value]) => (
              <div
                key={value}
                className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                  settings.designStyle === value
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"
                }`}
                onClick={() => handleDesignStyleChange(value)}
                data-testid={`design-style-${value}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-800 dark:text-gray-100">
                      {DESIGN_STYLE_LABELS[value]}
                    </h4>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      {DESIGN_STYLE_DESCRIPTIONS[value]}
                    </p>
                  </div>
                  <div className="ml-4">
                    {settings.designStyle === value && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
                        <svg
                          className="h-4 w-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {isFullCover && (
            <div className="mt-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Full Cover Mode:</strong> Images will cover the entire
                page without gaps or margins. Gap and margin settings will be
                automatically set to zero.
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
  onSelectLayout,
  onUpdateImagePosition,
  onMoveImageToPreviousPage,
  onMoveImageToNextPage,
  onSwapImagesInPage,
  settings,
  onSettingsChange,
  isPageProcessing,
  onAddSelectedToPage,
}) => {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showDesignStyleModal, setShowDesignStyleModal] = useState(false);

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
              pages={pages}
              onAddSelectedToPage={onAddSelectedToPage}
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
            />

            {/* Settings and Design Style Buttons */}
            <div className="flex gap-2 pb-4">
              <Button
                onClick={() => setShowDesignStyleModal(true)}
                size="sm"
                color="gray"
                data-testid="design-style-button"
              >
                <HiTemplate className="mr-2 h-4 w-4" />
                Design Style
              </Button>
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
            />
          </Card>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        show={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        settings={settings}
        onSettingsChange={onSettingsChange}
      />

      {/* Design Style Modal */}
      <DesignStyleModal
        show={showDesignStyleModal}
        onClose={() => setShowDesignStyleModal(false)}
        settings={settings}
        onSettingsChange={onSettingsChange}
      />
    </div>
  );
};

export default DesignTab;
