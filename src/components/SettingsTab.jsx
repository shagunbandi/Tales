import React, { useState } from 'react'

const SettingsTab = ({
  settings,
  onSettingsChange,
  totalImages,
  isProcessing,
  onAutoGenerate,
  onNextStep,
}) => {
  const [localSettings, setLocalSettings] = useState(settings)

  const handleSettingChange = (key, value) => {
    const newSettings = { ...localSettings, [key]: value }
    setLocalSettings(newSettings)
    onSettingsChange(newSettings)
  }

  return (
    <div className="settings-tab">
      <div className="settings-section">
        <h3>Page Settings</h3>
        <div className="setting-group">
          <label>
            Page Size:
            <select
              value={localSettings.pageSize}
              onChange={(e) => handleSettingChange('pageSize', e.target.value)}
            >
              <option value="a4">A4</option>
              <option value="letter">Letter</option>
              <option value="legal">Legal</option>
            </select>
          </label>
        </div>

        <div className="setting-group">
          <label>
            Orientation:
            <select
              value={localSettings.orientation}
              onChange={(e) =>
                handleSettingChange('orientation', e.target.value)
              }
            >
              <option value="landscape">Landscape</option>
              <option value="portrait">Portrait</option>
            </select>
          </label>
        </div>
      </div>

      <div className="settings-section">
        <h3>Layout Settings</h3>
        <div className="setting-group">
          <label>
            Page Margin (px):
            <input
              type="number"
              value={localSettings.pageMargin}
              onChange={(e) =>
                handleSettingChange('pageMargin', parseInt(e.target.value))
              }
              min="10"
              max="50"
            />
          </label>
        </div>

        <div className="setting-group">
          <label>
            Image Gap (px):
            <input
              type="number"
              value={localSettings.imageGap}
              onChange={(e) =>
                handleSettingChange('imageGap', parseInt(e.target.value))
              }
              min="5"
              max="50"
            />
          </label>
        </div>

        <div className="setting-group">
          <label>
            Max Images Per Page:
            <input
              type="number"
              value={localSettings.maxImagesPerPage}
              onChange={(e) =>
                handleSettingChange(
                  'maxImagesPerPage',
                  parseInt(e.target.value),
                )
              }
              min="1"
              max="10"
            />
          </label>
        </div>
      </div>

      <div className="settings-section">
        <h3>Image Settings</h3>
        <div className="setting-group">
          <label>
            Image Quality (0-1):
            <input
              type="number"
              step="0.1"
              value={localSettings.imageQuality}
              onChange={(e) =>
                handleSettingChange('imageQuality', parseFloat(e.target.value))
              }
              min="0.1"
              max="1"
            />
          </label>
        </div>

        <div className="setting-group">
          <label>
            Max Image Height (%):
            <input
              type="number"
              value={localSettings.maxImageHeight}
              onChange={(e) =>
                handleSettingChange('maxImageHeight', parseInt(e.target.value))
              }
              min="50"
              max="100"
            />
          </label>
        </div>

        <div className="setting-group">
          <label>
            Max Image Width (%):
            <input
              type="number"
              value={localSettings.maxImageWidth}
              onChange={(e) =>
                handleSettingChange('maxImageWidth', parseInt(e.target.value))
              }
              min="50"
              max="100"
            />
          </label>
        </div>
      </div>

      <div className="settings-info">
        <p>Total Images: {totalImages}</p>
        {isProcessing && <p>Processing...</p>}
      </div>

      <div className="settings-actions">
        <button
          className="btn btn-primary"
          onClick={onAutoGenerate}
          disabled={isProcessing || totalImages === 0}
        >
          {isProcessing ? 'Auto-arranging Images...' : 'Auto-arrange Images'}
        </button>
        <button
          className="btn btn-secondary"
          onClick={onNextStep}
          disabled={isProcessing}
        >
          Continue to Design
        </button>
      </div>
    </div>
  )
}

export default SettingsTab
