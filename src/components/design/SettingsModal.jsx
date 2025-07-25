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
              <label htmlFor="maxImagesPerPage">Max Images Per Page:</label>
              <input
                type="number"
                id="maxImagesPerPage"
                value={settings.maxImagesPerPage}
                onChange={(e) =>
                  handleSettingChange(
                    'maxImagesPerPage',
                    parseInt(e.target.value),
                  )
                }
                min="1"
                max="12"
              />
            </div>

            <div className="setting-group">
              <label htmlFor="imagesPerRow">Images Per Row:</label>
              <input
                type="number"
                id="imagesPerRow"
                value={settings.imagesPerRow}
                onChange={(e) =>
                  handleSettingChange('imagesPerRow', parseInt(e.target.value))
                }
                min="1"
                max="6"
              />
            </div>

            <div className="setting-group">
              <label htmlFor="numberOfRows">Number of Rows:</label>
              <input
                type="number"
                id="numberOfRows"
                value={settings.numberOfRows}
                onChange={(e) =>
                  handleSettingChange('numberOfRows', parseInt(e.target.value))
                }
                min="1"
                max="4"
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
