import React, { useCallback } from 'react'

const UploadTab = ({ handleFiles, isProcessing, totalImages }) => {
  // Handle file input change
  const handleFileChange = useCallback(
    async (event) => {
      const files = Array.from(event.target.files)
      await handleFiles(files)
    },
    [handleFiles],
  )

  // Handle drag and drop for file upload
  const handleDrop = useCallback(
    async (event) => {
      event.preventDefault()
      const files = Array.from(event.dataTransfer.files)
      await handleFiles(files)
    },
    [handleFiles],
  )

  const handleDragOver = useCallback((event) => {
    event.preventDefault()
    event.currentTarget.classList.add('dragover')
  }, [])

  const handleDragLeave = useCallback((event) => {
    event.currentTarget.classList.remove('dragover')
  }, [])

  return (
    <div className="upload-tab">
      <div className="upload-section">
        <div
          className="folder-picker"
          onClick={() => document.getElementById('folder-input').click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="folder-picker-text">
            Click here or drag & drop image files
          </div>
          <div className="folder-picker-subtext">
            Supports JPG, PNG, GIF, WebP formats
          </div>
          <input
            id="folder-input"
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="folder-input"
          />
        </div>

        {totalImages > 0 && (
          <div className="image-count">
            ✓ {totalImages} images uploaded successfully!
            <br />
            <small>
              Proceed to the next step to configure your layout settings.
            </small>
          </div>
        )}
      </div>

      {isProcessing && (
        <div className="progress-section">
          <div className="progress-text">Processing images...</div>
        </div>
      )}
    </div>
  )
}

export default UploadTab
