import React from "react";
import { Card } from "flowbite-react";

const SettingsTab = ({ settings, onSettingsChange, onNext }) => {
  const handleSettingChange = (key, value) => {
    let parsedValue = value;
    if (value !== "" && !isNaN(value)) {
      parsedValue = key === "imageQuality" ? parseFloat(value) : parseInt(value);
    }
    onSettingsChange({ ...settings, [key]: parsedValue });
  };

  const validateSettings = () => {
    const errors = {};
    const isValidNumber = (value, min, max) => {
      // Handle undefined, null, or empty values
      if (value === undefined || value === null || value === "") {
        return false;
      }
      // Ensure it's a valid number and within range
      return !isNaN(value) && value >= min && value <= max;
    };

    if (!isValidNumber(settings.pageMargin, 0, 50)) {
      errors.pageMargin = "Page margin must be between 0 and 50 pixels (0 is allowed)";
    }
    if (!isValidNumber(settings.imageGap, 0, 30)) {
      errors.imageGap = "Image gap must be between 0 and 30 pixels (0 is allowed)";
    }
    if (!isValidNumber(settings.maxImagesPerRow, 1, Infinity)) {
      errors.maxImagesPerRow = "Max images per row must be at least 1";
    }
    if (!isValidNumber(settings.maxNumberOfRows, 1, Infinity)) {
      errors.maxNumberOfRows = "Max number of rows must be at least 1";
    }
    if (!isValidNumber(settings.minImagesPerRow, 1, Infinity)) {
      errors.minImagesPerRow = "Min images per row must be at least 1";
    }
    if (!isValidNumber(settings.minNumberOfRows, 1, Infinity)) {
      errors.minNumberOfRows = "Min number of rows must be at least 1";
    }
    if (!isValidNumber(settings.maxNumberOfPages, 1, 100)) {
      errors.maxNumberOfPages = "Max number of pages must be between 1 and 100";
    }
    if (!isValidNumber(settings.imageQuality, 0.1, 1.0)) {
      errors.imageQuality = "Image quality must be between 0.1 and 1.0";
    }

    if (
      isValidNumber(settings.minImagesPerRow, 1, Infinity) &&
      isValidNumber(settings.maxImagesPerRow, 1, Infinity) &&
      settings.minImagesPerRow > settings.maxImagesPerRow
    ) {
      errors.minImagesPerRow =
        "Min images per row cannot be greater than max images per row";
    }

    if (
      isValidNumber(settings.minNumberOfRows, 1, Infinity) &&
      isValidNumber(settings.maxNumberOfRows, 1, Infinity) &&
      settings.minNumberOfRows > settings.maxNumberOfRows
    ) {
      errors.minNumberOfRows =
        "Min number of rows cannot be greater than max number of rows";
    }

    return errors;
  };

  const errors = validateSettings();
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="space-y-6 p-6">
      <Card>
        <div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Layout Settings
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Configure how your images will be arranged in the PDF pages.
          </p>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[
              {
                id: "pageMargin",
                label: "Page Margin (px):",
                min: 0,
                max: 50,
                help: "Space around the edges of each page",
              },
              {
                id: "imageGap",
                label: "Image Gap (px):",
                min: 0,
                max: 30,
                help: "Space between images on the same page",
              },
              {
                id: "maxImagesPerRow",
                label: "Max Images Per Row:",
                min: 1,
                help: "Maximum number of images in a row",
              },
              {
                id: "maxNumberOfRows",
                label: "Max Number of Rows:",
                min: 1,
                help: "Maximum number of rows per page",
              },
              {
                id: "minImagesPerRow",
                label: "Min Images Per Row:",
                min: 1,
                help: "Minimum number of images per row",
              },
              {
                id: "minNumberOfRows",
                label: "Min Number of Rows:",
                min: 1,
                help: "Minimum number of rows per page",
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
            ].map(({ id, label, min, max, step = 1, help }) => (
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
                  value={settings[id] !== undefined && settings[id] !== null ? settings[id] : ""}
                  onChange={(e) => handleSettingChange(id, e.target.value)}
                  min={min}
                  max={max}
                  step={step}
                  required
                  className={`w-full rounded border px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                    errors[id]
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-400 dark:focus:border-red-400 dark:focus:ring-red-400"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                  }`}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">{help}</p>
                {errors[id] && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors[id]}</p>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col items-start gap-2 pt-4">
            <button
              type="submit"
              onClick={onNext}
              disabled={hasErrors}
              className={`rounded px-4 py-2 text-sm text-white ${
                hasErrors
                  ? "cursor-not-allowed bg-gray-300 dark:bg-gray-600"
                  : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              }`}
            >
              Next: Design Layout
            </button>
            {hasErrors && (
              <p className="text-sm text-red-600 dark:text-red-400">
                Please fix the errors above before proceeding.
              </p>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
};

export default SettingsTab;