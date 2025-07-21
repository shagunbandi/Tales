import React, { useState } from 'react'
import { DragDropContext } from 'react-beautiful-dnd'
import { useImageManagement } from './hooks/useImageManagement.js'
import TabNavigation from './components/TabNavigation.jsx'
import UploadTab from './components/UploadTab.jsx'
import DesignTab from './components/DesignTab.jsx'

function App() {
  const [activeTab, setActiveTab] = useState('design')

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
    removePage,
    changePageColor,
    removeAvailableImage,
    handleGeneratePDF,
    setError,
  } = useImageManagement()

  // Add more images option
  const addMoreImages = () => {
    document.getElementById('folder-input').click()
  }

  return (
    <div className="app">
      <h1 className="app-title">Interactive PDF Designer</h1>

      {/* Tab Navigation */}
      <TabNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalImages={totalImages}
      />

      <DragDropContext onDragEnd={handleDragEnd}>
        {activeTab === 'design' && (
          <DesignTab
            pages={pages}
            availableImages={availableImages}
            totalImages={totalImages}
            isProcessing={isProcessing}
            onAddPage={addPage}
            onRemovePage={removePage}
            onChangePageColor={changePageColor}
            onRemoveAvailableImage={removeAvailableImage}
            onAddMoreImages={addMoreImages}
            onGeneratePDF={handleGeneratePDF}
          />
        )}

        {activeTab === 'upload' && (
          <UploadTab
            handleFiles={handleFiles}
            isProcessing={isProcessing}
            totalImages={totalImages}
          />
        )}
      </DragDropContext>

      {error && <div className="error">{error}</div>}
    </div>
  )
}

export default App
