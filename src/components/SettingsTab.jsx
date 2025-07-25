import React from "react";

const SettingsTab = ({ settings, onSettingsChange, onNext }) => {
  const handleSettingChange = (key, value) => {
    // Handle empty string or invalid numbers
    let parsedValue = value;
    if (value === "" || isNaN(value)) {
      parsedValue = key === "imageQuality" ? 0.8 : 1; // Default values
    } else {
      parsedValue =
        key === "imageQuality" ? parseFloat(value) : parseInt(value);
    }
    onSettingsChange({ ...settings, [key]: parsedValue });
  };

  // Validation function to check if all settings are valid
  const validateSettings = () => {
    const errors = {};

    // Helper function to check if value is valid number
    const isValidNumber = (value, min, max) => {
      return !isNaN(value) && value !== "" && value >= min && value <= max;
    };

    // Page margin validation
    if (!isValidNumber(settings.pageMargin, 5, 50)) {
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

    // Min images per row validation
    if (!isValidNumber(settings.minImagesPerRow, 1, Infinity)) {
      errors.minImagesPerRow = "Min images per row must be at least 1";
    }

    // Min number of rows validation
    if (!isValidNumber(settings.minNumberOfRows, 1, Infinity)) {
      errors.minNumberOfRows = "Min number of rows must be at least 1";
    }

    // Max number of pages validation
    if (!isValidNumber(settings.maxNumberOfPages, 1, 100)) {
      errors.maxNumberOfPages = "Max number of pages must be between 1 and 100";
    }

    // Image quality validation
    if (!isValidNumber(settings.imageQuality, 0.1, 1.0)) {
      errors.imageQuality = "Image quality must be between 0.1 and 1.0";
    }

    // Cross-field validation (only if both values are valid)
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
    <div className="settings-tab">
      <div className="settings-container">
        <h3>Layout Settings</h3>
        <p className="settings-description">
          Configure how your images will be arranged in the PDF pages.
        </p>

        <form className="settings-form" onSubmit={(e) => e.preventDefault()}>
          <div className="settings-grid">
            <div className="setting-group">
              <label htmlFor="pageMargin">Page Margin (px):</label>
              <input
                type="number"
                id="pageMargin"
                value={settings.pageMargin || ""}
                onChange={(e) =>
                  handleSettingChange("pageMargin", e.target.value)
                }
                min="5"
                max="50"
                className={errors.pageMargin ? "error" : ""}
                required
              />
              <small>Space around the edges of each page</small>
              {errors.pageMargin && (
                <div className="error-message">{errors.pageMargin}</div>
              )}
            </div>

            <div className="setting-group">
              <label htmlFor="imageGap">Image Gap (px):</label>
              <input
                type="number"
                id="imageGap"
                value={settings.imageGap || ""}
                onChange={(e) =>
                  handleSettingChange("imageGap", e.target.value)
                }
                min="0"
                max="30"
                className={errors.imageGap ? "error" : ""}
                required
              />
              <small>Space between images on the same page</small>
              {errors.imageGap && (
                <div className="error-message">{errors.imageGap}</div>
              )}
            </div>

            <div className="setting-group">
              <label htmlFor="maxImagesPerRow">Max Images Per Row:</label>
              <input
                type="number"
                id="maxImagesPerRow"
                value={settings.maxImagesPerRow || ""}
                onChange={(e) =>
                  handleSettingChange("maxImagesPerRow", e.target.value)
                }
                min="1"
                className={errors.maxImagesPerRow ? "error" : ""}
                required
              />
              <small>
                Maximum number of images that can be placed in a single row
              </small>
              {errors.maxImagesPerRow && (
                <div className="error-message">{errors.maxImagesPerRow}</div>
              )}
            </div>

            <div className="setting-group">
              <label htmlFor="maxNumberOfRows">Max Number of Rows:</label>
              <input
                type="number"
                id="maxNumberOfRows"
                value={settings.maxNumberOfRows || ""}
                onChange={(e) =>
                  handleSettingChange("maxNumberOfRows", e.target.value)
                }
                min="1"
                className={errors.maxNumberOfRows ? "error" : ""}
                required
              />
              <small>Maximum number of rows per page</small>
              {errors.maxNumberOfRows && (
                <div className="error-message">{errors.maxNumberOfRows}</div>
              )}
            </div>

            <div className="setting-group">
              <label htmlFor="minImagesPerRow">Min Images Per Row:</label>
              <input
                type="number"
                id="minImagesPerRow"
                value={settings.minImagesPerRow || ""}
                onChange={(e) =>
                  handleSettingChange("minImagesPerRow", e.target.value)
                }
                min="1"
                className={errors.minImagesPerRow ? "error" : ""}
                required
              />
              <small>
                Minimum number of images that should be placed in a row
              </small>
              {errors.minImagesPerRow && (
                <div className="error-message">{errors.minImagesPerRow}</div>
              )}
            </div>

            <div className="setting-group">
              <label htmlFor="minNumberOfRows">Min Number of Rows:</label>
              <input
                type="number"
                id="minNumberOfRows"
                value={settings.minNumberOfRows || ""}
                onChange={(e) =>
                  handleSettingChange("minNumberOfRows", e.target.value)
                }
                min="1"
                className={errors.minNumberOfRows ? "error" : ""}
                required
              />
              <small>Minimum number of rows per page</small>
              {errors.minNumberOfRows && (
                <div className="error-message">{errors.minNumberOfRows}</div>
              )}
            </div>

            <div className="setting-group">
              <label htmlFor="maxNumberOfPages">Max Number of Pages:</label>
              <input
                type="number"
                id="maxNumberOfPages"
                value={settings.maxNumberOfPages || ""}
                onChange={(e) =>
                  handleSettingChange("maxNumberOfPages", e.target.value)
                }
                min="1"
                max="100"
                className={errors.maxNumberOfPages ? "error" : ""}
                required
              />
              <small>Maximum number of pages in the generated PDF</small>
              {errors.maxNumberOfPages && (
                <div className="error-message">{errors.maxNumberOfPages}</div>
              )}
            </div>

            <div className="setting-group">
              <label htmlFor="imageQuality">Image Quality:</label>
              <input
                type="number"
                id="imageQuality"
                value={settings.imageQuality || ""}
                onChange={(e) =>
                  handleSettingChange("imageQuality", e.target.value)
                }
                min="0.1"
                max="1.0"
                step="0.1"
                className={errors.imageQuality ? "error" : ""}
                required
              />
              <small>
                Quality of images in the PDF (0.1 = low, 1.0 = high)
              </small>
              {errors.imageQuality && (
                <div className="error-message">{errors.imageQuality}</div>
              )}
            </div>
          </div>

          <div className="settings-actions">
            <button
              type="submit"
              className="btn btn-primary"
              onClick={onNext}
              disabled={hasErrors}
            >
              Next: Design Layout
            </button>
            {hasErrors && (
              <div className="validation-summary">
                Please fix the errors above before proceeding.
              </div>
            )}
          </div>
        </form>

        {/* Debug section to verify settings are updated */}
        <div className="settings-debug">
          <details>
            <summary>Current Settings Values (Debug)</summary>
            <pre>{JSON.stringify(settings, null, 2)}</pre>
          </details>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
