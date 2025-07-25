import React from 'react'

const SettingsModal = ({ isOpen, onClose, settings, onSettingsChange }) => {
  const handleSettingChange = (key, value) => {
    onSettingsChange({ ...settings, [key]: value })
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Layout Settings</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
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
            </div>

            <div className="setting-group">
              <label htmlFor="maxImagesPerRow">Max Images Per Row:</label>
              <input
                type="number"
                id="maxImagesPerRow"
                value={settings.maxImagesPerRow}
                onChange={(e) =>
                  handleSettingChange(
                    'maxImagesPerRow',
                    parseInt(e.target.value),
                  )
                }
                min="1"
              />
            </div>

            <div className="setting-group">
              <label htmlFor="maxNumberOfRows">Max Number of Rows:</label>
              <input
                type="number"
                id="maxNumberOfRows"
                value={settings.maxNumberOfRows}
                onChange={(e) =>
                  handleSettingChange(
                    'maxNumberOfRows',
                    parseInt(e.target.value),
                  )
                }
                min="1"
              />
            </div>

            <div className="setting-group">
              <label htmlFor="minImagesPerRow">Min Images Per Row:</label>
              <input
                type="number"
                id="minImagesPerRow"
                value={settings.minImagesPerRow}
                onChange={(e) =>
                  handleSettingChange(
                    'minImagesPerRow',
                    parseInt(e.target.value),
                  )
                }
                min="1"
              />
            </div>

            <div className="setting-group">
              <label htmlFor="minNumberOfRows">Min Number of Rows:</label>
              <input
                type="number"
                id="minNumberOfRows"
                value={settings.minNumberOfRows}
                onChange={(e) =>
                  handleSettingChange(
                    'minNumberOfRows',
                    parseInt(e.target.value),
                  )
                }
                min="1"
              />
            </div>

            <div className="setting-group">
              <label htmlFor="imageQuality">Image Quality:</label>
              <input
                type="number"
                id="imageQuality"
                value={settings.imageQuality}
                onChange={(e) =>
                  handleSettingChange(
                    'imageQuality',
                    parseFloat(e.target.value),
                  )
                }
                min="0.1"
                max="1.0"
                step="0.1"
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
