import React from 'react'

const TabNavigation = ({ activeTab, setActiveTab, totalImages }) => {
  const tabs = [
    { id: 'upload', label: '1. Upload Images', disabled: totalImages > 0 },
    { id: 'settings', label: '2. Settings', disabled: totalImages === 0 },
    { id: 'design', label: '3. Design Layout', disabled: totalImages === 0 },
  ]

  return (
    <div className="tab-navigation">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab-button ${activeTab === tab.id ? 'active' : ''} ${
            tab.disabled ? 'disabled' : ''
          }`}
          onClick={() => !tab.disabled && setActiveTab(tab.id)}
          disabled={tab.disabled}
        >
          {tab.label}
          {tab.id === 'design' && totalImages > 0 && ` (${totalImages} images)`}
        </button>
      ))}
    </div>
  )
}

export default TabNavigation
