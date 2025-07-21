import React from 'react'

const TabNavigation = ({ activeTab, setActiveTab, totalImages }) => {
  return (
    <div className="tab-navigation">
      <button
        className={`tab-button ${activeTab === 'design' ? 'active' : ''}`}
        onClick={() => setActiveTab('design')}
      >
        Design Layout ({totalImages} images)
      </button>
      <button
        className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
        onClick={() => setActiveTab('upload')}
      >
        Upload Images
      </button>
    </div>
  )
}

export default TabNavigation
