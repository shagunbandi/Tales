import React from 'react'

const SettingsTab = ({ settings, onSettingsChange, onNext }) => {
  const handleSettingChange = (key, value) => {
    onSettingsChange({ ...settings, [key]: value })
  }

  return (
    <div className="settings-tab">
      <div className="settings-container">
        <h3>Layout Settings</h3>
        <p className="settings-description">
          Configure how your images will be arranged in the PDF pages.
        </p>

        <div className="settings-grid">
          <div className="setting-group">
            <label htmlFor="pageMargin">Page Margin (px):</label>
            <input
              type="number"
              id="pageMargin"
              value={settings.pageMargin}
              onChange={(e) =>
                handleSettingChange('pageMargin', parseInt(e.target.value))
              }
              min="5"
              max="50"
            />
            <small>Space around the edges of each page</small>
          </div>

          <div className="setting-group">
            <label htmlFor="imageGap">Image Gap (px):</label>
            <input
              type="number"
              id="imageGap"
              value={settings.imageGap}
              onChange={(e) =>
                handleSettingChange('imageGap', parseInt(e.target.value))
              }
              min="0"
              max="30"
            />
            <small>Space between images on the same page</small>
          </div>

          <div className="setting-group">
            <label htmlFor="maxImagesPerRow">Max Images Per Row:</label>
            <input
              type="number"
              id="maxImagesPerRow"
              value={settings.maxImagesPerRow}
              onChange={(e) =>
                handleSettingChange('maxImagesPerRow', parseInt(e.target.value))
              }
              min="1"
            />
            <small>
              Maximum number of images that can be placed in a single row
            </small>
          </div>

          <div className="setting-group">
            <label htmlFor="maxNumberOfRows">Max Number of Rows:</label>
            <input
              type="number"
              id="maxNumberOfRows"
              value={settings.maxNumberOfRows}
              onChange={(e) =>
                handleSettingChange('maxNumberOfRows', parseInt(e.target.value))
              }
              min="1"
            />
            <small>Maximum number of rows per page</small>
          </div>

          <div className="setting-group">
            <label htmlFor="minImagesPerRow">Min Images Per Row:</label>
            <input
              type="number"
              id="minImagesPerRow"
              value={settings.minImagesPerRow}
              onChange={(e) =>
                handleSettingChange('minImagesPerRow', parseInt(e.target.value))
              }
              min="1"
            />
            <small>
              Minimum number of images that should be placed in a row
            </small>
          </div>

          <div className="setting-group">
            <label htmlFor="minNumberOfRows">Min Number of Rows:</label>
            <input
              type="number"
              id="minNumberOfRows"
              value={settings.minNumberOfRows}
              onChange={(e) =>
                handleSettingChange('minNumberOfRows', parseInt(e.target.value))
              }
              min="1"
            />
            <small>Minimum number of rows per page</small>
          </div>

          <div className="setting-group">
            <label htmlFor="maxNumberOfPages">Max Number of Pages:</label>
            <input
              type="number"
              id="maxNumberOfPages"
              value={settings.maxNumberOfPages}
              onChange={(e) =>
                handleSettingChange(
                  'maxNumberOfPages',
                  parseInt(e.target.value),
                )
              }
              min="1"
              max="100"
            />
            <small>Maximum number of pages in the generated PDF</small>
          </div>

          <div className="setting-group">
            <label htmlFor="imageQuality">Image Quality:</label>
            <input
              type="number"
              id="imageQuality"
              value={settings.imageQuality}
              onChange={(e) =>
                handleSettingChange('imageQuality', parseFloat(e.target.value))
              }
              min="0.1"
              max="1.0"
              step="0.1"
            />
            <small>Quality of images in the PDF (0.1 = low, 1.0 = high)</small>
          </div>
        </div>

        <div className="settings-actions">
          <button className="btn btn-primary" onClick={onNext}>
            Next: Design Layout
          </button>
        </div>

        {/* Debug section to verify settings are updated */}
        <div className="settings-debug">
          <details>
            <summary>Current Settings Values (Debug)</summary>
            <pre>{JSON.stringify(settings, null, 2)}</pre>
          </details>
        </div>
      </div>
    </div>
  )
}

export default SettingsTab
