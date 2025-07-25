import React from 'react'
import { DEFAULT_SETTINGS } from '../../constants.js'

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
              <label htmlFor="maxImageHeight">Max Image Height (px):</label>
              <input
                type="number"
                id="maxImageHeight"
                value={settings.maxImageHeight}
                onChange={(e) =>
                  handleSettingChange(
                    'maxImageHeight',
                    parseInt(e.target.value),
                  )
                }
                min="20"
                max="200"
              />
            </div>

            <div className="setting-group">
              <label htmlFor="maxImageWidth">Max Image Width (px):</label>
              <input
                type="number"
                id="maxImageWidth"
                value={settings.maxImageWidth}
                onChange={(e) =>
                  handleSettingChange('maxImageWidth', parseInt(e.target.value))
                }
                min="20"
                max="200"
              />
            </div>

            <div className="setting-group">
              <label htmlFor="maxImageHeightRatio">
                Max Image Height Ratio:
              </label>
              <input
                type="number"
                id="maxImageHeightRatio"
                value={settings.maxImageHeightRatio}
                onChange={(e) =>
                  handleSettingChange(
                    'maxImageHeightRatio',
                    parseFloat(e.target.value),
                  )
                }
                min="0.1"
                max="1.0"
                step="0.1"
              />
            </div>

            <div className="setting-group">
              <label htmlFor="maxImageWidthRatio">Max Image Width Ratio:</label>
              <input
                type="number"
                id="maxImageWidthRatio"
                value={settings.maxImageWidthRatio}
                onChange={(e) =>
                  handleSettingChange(
                    'maxImageWidthRatio',
                    parseFloat(e.target.value),
                  )
                }
                min="0.1"
                max="1.0"
                step="0.1"
              />
            </div>

            <div className="setting-group">
              <label htmlFor="imageGapRatio">Image Gap Ratio:</label>
              <input
                type="number"
                id="imageGapRatio"
                value={settings.imageGapRatio}
                onChange={(e) =>
                  handleSettingChange(
                    'imageGapRatio',
                    parseFloat(e.target.value),
                  )
                }
                min="0.1"
                max="1.0"
                step="0.1"
              />
            </div>

            <div className="setting-group">
              <label htmlFor="maxColumns">Max Columns:</label>
              <input
                type="number"
                id="maxColumns"
                value={settings.maxColumns}
                onChange={(e) =>
                  handleSettingChange('maxColumns', parseInt(e.target.value))
                }
                min="1"
                max="6"
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
