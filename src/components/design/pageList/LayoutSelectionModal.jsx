import React, { useState, useEffect } from "react";
import { Modal, Button } from "flowbite-react";
import { HiViewGrid } from "react-icons/hi";
import { getLayoutOptions, convertToFullCoverFormat } from "../../../utils/hardcodedLayouts.js";
import { getPreviewDimensions, getHardcodedLayoutsKey, getPreviewBorderWidth } from "../../../constants.js";

const LayoutSelectionModal = ({ 
  isOpen, 
  onClose, 
  onSelectLayout,
  pageId,
  images, 
  settings,
  currentLayoutId = null
}) => {
  const [availableLayouts, setAvailableLayouts] = useState([]);
  const [selectedLayoutId, setSelectedLayoutId] = useState(currentLayoutId);

  useEffect(() => {
    if (isOpen && images && images.length > 0) {
      const paperSize = getHardcodedLayoutsKey(settings?.pageSize || "a4");
      const layouts = getLayoutOptions(paperSize, images.length);
      setAvailableLayouts(layouts);
      
      // Set initial selection to current layout or first available
      if (currentLayoutId && layouts.find(l => l.id === currentLayoutId)) {
        setSelectedLayoutId(currentLayoutId);
      } else if (layouts.length > 0) {
        setSelectedLayoutId(layouts[0].id);
      }
    }
  }, [isOpen, images, settings, currentLayoutId]);

  const handleSelectLayout = () => {
    if (selectedLayoutId) {
      const selectedLayout = availableLayouts.find(l => l.id === selectedLayoutId);
      if (selectedLayout) {
        onSelectLayout(pageId, selectedLayout);
      }
    }
    onClose();
  };

  const handleLayoutClick = (layoutId) => {
    setSelectedLayoutId(layoutId);
  };

  if (!images || images.length === 0) {
    return null;
  }

  const previewDimensions = getPreviewDimensions(settings);
  const imageCount = images.length;

  return (
    <Modal show={isOpen} onClose={onClose} size="4xl">
      <div className="p-6">
        {/* Header */}
        <div className="mb-4 flex items-center">
          <HiViewGrid className="mr-2 h-5 w-5" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Choose Layout for {imageCount} Image{imageCount !== 1 ? 's' : ''}
          </h3>
        </div>
        
        {/* Body */}
        {availableLayouts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              No predefined layouts available for {imageCount} images.
              The system will use automatic layout generation.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Select a layout template for your {imageCount} images:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {availableLayouts.map((layout) => (
                <LayoutPreviewCard
                  key={layout.id}
                  layout={layout}
                  images={images}
                  settings={settings}
                  previewDimensions={previewDimensions}
                  isSelected={selectedLayoutId === layout.id}
                  onClick={() => handleLayoutClick(layout.id)}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Footer */}
        <div className="mt-6 flex justify-between w-full">
          <Button color="gray" onClick={onClose}>
            Cancel
          </Button>
          {availableLayouts.length > 0 && (
            <Button 
              onClick={handleSelectLayout}
              disabled={!selectedLayoutId}
            >
              Apply Layout
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

const LayoutPreviewCard = ({ 
  layout, 
  images, 
  settings, 
  previewDimensions, 
  isSelected, 
  onClick 
}) => {
  const [previewImages, setPreviewImages] = useState([]);

  useEffect(() => {
    // Convert layout to preview format with border
    const mockPreviewWidth = 180; // Fixed preview width
    const mockPreviewHeight = (previewDimensions.height / previewDimensions.width) * mockPreviewWidth;
    
    // Calculate border for the mock preview
    const borderWidth = getPreviewBorderWidth(settings);
    const scaleFactor = mockPreviewWidth / previewDimensions.width;
    const mockBorderWidth = borderWidth * scaleFactor;
    
    const usableMockWidth = mockPreviewWidth - (2 * mockBorderWidth);
    const usableMockHeight = mockPreviewHeight - (2 * mockBorderWidth);
    
    const convertedImages = convertToFullCoverFormat(
      layout, 
      images, 
      usableMockWidth, 
      usableMockHeight,
      mockBorderWidth
    );
    setPreviewImages(convertedImages);
  }, [layout, images, previewDimensions, settings]);

  return (
    <div 
      className={`border-2 rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
      }`}
      onClick={onClick}
    >
      {/* Layout name and info */}
      <div className="mb-3">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
          {layout.name}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {layout.grid.rows}×{layout.grid.cols} grid
        </p>
      </div>

      {/* Layout preview */}
      <div className="flex justify-center">
        <div 
          className="relative border border-gray-300 dark:border-gray-600"
          style={{
            width: '180px',
            height: `${(previewDimensions.height / previewDimensions.width) * 180}px`,
            backgroundColor: settings?.backgroundColor || '#ffffff'
          }}
        >
          {previewImages.map((image, index) => (
            <div
              key={index}
              className="absolute border border-gray-400 dark:border-gray-500 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900 flex items-center justify-center"
              style={{
                left: image.x,
                top: image.y,
                width: image.previewWidth,
                height: image.previewHeight
              }}
            >
              <span className="text-xs font-medium text-blue-700 dark:text-blue-200">
                {index + 1}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="mt-2 flex justify-center">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Selected
          </span>
        </div>
      )}
    </div>
  );
};

export default LayoutSelectionModal;