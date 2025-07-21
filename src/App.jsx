import React, { useState } from 'react'
import { DragDropContext } from 'react-beautiful-dnd'
import { useImageManagement } from './hooks/useImageManagement.js'
import { DEFAULT_SETTINGS } from './constants.js'
import TabNavigation from './components/TabNavigation.jsx'
import UploadTab from './components/UploadTab.jsx'
import SettingsTab from './components/SettingsTab.jsx'
import DesignTab from './components/DesignTab.jsx'

function App() {
  const [activeTab, setActiveTab] = useState('upload')
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)

  const {
    // State
    pages,
    availableImages,
    isProcessing,
    error,
    totalImages,

    // Actions
    handleFiles,
    handleDragEnd,
    addPage,
    addPageBetween,
    removePage,
    changePageColor,
    removeAvailableImage,
    autoArrangeImagesToPages,
    handleGeneratePDF,
    setError,
  } = useImageManagement(settings)

  // Add more images option
  const addMoreImages = () => {
    // Create a temporary file input
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = 'image/*'
    input.onchange = async (event) => {
      const files = Array.from(event.target.files)
      if (files.length > 0) {
        await handleFiles(files)
      }
    }
    input.click()
  }

  return (
    <div className="app">
      <h1 className="app-title">Tales</h1>
      <h2 className="app-subtitle">Your story told in pictures</h2>

      {/* Tab Navigation */}
      <TabNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalImages={totalImages}
      />

      <DragDropContext onDragEnd={handleDragEnd}>
        {activeTab === 'upload' && (
          <UploadTab
            handleFiles={handleFiles}
            isProcessing={isProcessing}
            totalImages={totalImages}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            settings={settings}
            onSettingsChange={setSettings}
            totalImages={totalImages}
            isProcessing={isProcessing}
            onAutoGenerate={async () => {
              await autoArrangeImagesToPages()
              setActiveTab('design')
            }}
            onNextStep={() => setActiveTab('design')}
          />
        )}

        {activeTab === 'design' && (
          <DesignTab
            pages={pages}
            availableImages={availableImages}
            totalImages={totalImages}
            isProcessing={isProcessing}
            onAddPage={addPage}
            onAddPageBetween={addPageBetween}
            onRemovePage={removePage}
            onChangePageColor={changePageColor}
            onRemoveAvailableImage={removeAvailableImage}
            onAddMoreImages={addMoreImages}
            onGeneratePDF={handleGeneratePDF}
            settings={settings}
          />
        )}
      </DragDropContext>

      {error && <div className="error">{error}</div>}
    </div>
  )
}

export default App
