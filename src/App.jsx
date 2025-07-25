import React, { useState } from 'react'
import { DragDropContext } from 'react-beautiful-dnd'
import { useImageManagement } from './hooks/useImageManagement.js'
import { DEFAULT_SETTINGS } from './constants.js'
import TabNavigation from './components/TabNavigation.jsx'
import UploadTab from './components/UploadTab.jsx'
import DesignTab from './components/DesignTab.jsx'
import SettingsTab from './components/SettingsTab.jsx'

function App() {
  const [activeTab, setActiveTab] = useState('upload')
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)

  const {
    pages,
    availableImages,
    isProcessing,
    error,
    totalImages,
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

  const addMoreImages = () => {
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

  // Redirect to settings when images are uploaded
  React.useEffect(() => {
    if (totalImages > 0 && activeTab === 'upload') {
      setActiveTab('settings')
    }
  }, [totalImages, activeTab])

  const handleNextToDesign = () => {
    setActiveTab('design')
  }

  return (
    <div className="app">
      <h1 className="app-title">Tales</h1>
      <h2 className="app-subtitle">Your story told in pictures</h2>

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
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            settings={settings}
            onSettingsChange={setSettings}
            onNext={handleNextToDesign}
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
            onAutoArrange={autoArrangeImagesToPages}
            settings={settings}
            onSettingsChange={setSettings}
          />
        )}
      </DragDropContext>

      {error && <div className="error">{error}</div>}
    </div>
  )
}

export default App
