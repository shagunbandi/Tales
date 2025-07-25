import React, { useState } from 'react'
import SettingsModal from './SettingsModal.jsx'

const PagesHeader = ({
  isProcessing,
  availableImages,
  onAutoArrange,
  settings,
  onSettingsChange,
}) => {
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div className="pages-header">
      <h3>PDF Pages Preview</h3>
      <div className="page-controls">
        <button className="btn btn-small" onClick={() => setShowSettings(true)}>
          Settings
        </button>
        <button
          className="btn btn-secondary"
          onClick={onAutoArrange}
          disabled={isProcessing || availableImages.length === 0}
        >
          {isProcessing ? 'Auto-arranging...' : 'Auto-arrange Images'}
        </button>
      </div>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSettingsChange={onSettingsChange}
      />
    </div>
  )
}

export default PagesHeader
