import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Button } from "flowbite-react";
import { HiX, HiCheck, HiRefresh } from "react-icons/hi";

/**
 * Modal for editing image positioning and scaling within Full Cover layout
 * Uses React Portal to render outside the component tree
 */
const ImageEditModal = ({
  isOpen,
  onClose,
  onSave,
  image,
  containerWidth,
  containerHeight,
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  
  // Work with original image source
  const originalImageSrc = image?.originalSrc || image?.src;
  
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  // Initialize values when modal opens
  useEffect(() => {
    if (isOpen && image) {
      console.log('Modal opening with image:', image);
      setScale(image.scale || 1);
      setPosition({
        x: image.cropOffsetX || 0,
        y: image.cropOffsetY || 0,
      });
    }
  }, [isOpen, image]);

  // Calculate image display properties for drag functionality
  const calculateImageDimensions = useCallback(() => {
    if (!imageRef.current) return { width: 0, height: 0, baseWidth: 0, baseHeight: 0 };
    
    const imageWidth = imageRef.current.naturalWidth || 100;
    const imageHeight = imageRef.current.naturalHeight || 100;
    const imageAspectRatio = imageWidth / imageHeight;
    const previewContainerAspectRatio = containerWidth / containerHeight;
    
    // Calculate base dimensions for the preview (scaled down for modal)
    const maxPreviewWidth = 400;
    const maxPreviewHeight = 300;
    
    let previewWidth, previewHeight;
    if (containerWidth > maxPreviewWidth || containerHeight > maxPreviewHeight) {
      const scale = Math.min(maxPreviewWidth / containerWidth, maxPreviewHeight / containerHeight);
      previewWidth = containerWidth * scale;
      previewHeight = containerHeight * scale;
    } else {
      previewWidth = containerWidth;
      previewHeight = containerHeight;
    }
    
    // Calculate how the image would be displayed with object-cover behavior
    let baseWidth, baseHeight;
    if (imageAspectRatio > previewContainerAspectRatio) {
      // Image is wider - scale to container height
      baseHeight = previewHeight;
      baseWidth = baseHeight * imageAspectRatio;
    } else {
      // Image is taller - scale to container width
      baseWidth = previewWidth;
      baseHeight = baseWidth / imageAspectRatio;
    }
    
    return {
      width: baseWidth * scale,
      height: baseHeight * scale,
      baseWidth,
      baseHeight,
      previewWidth,
      previewHeight,
    };
  }, [containerWidth, containerHeight, scale]);

  // Handle mouse events for dragging
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      startX: position.x,
      startY: position.y,
    });
    setIsDragging(true);
  }, [position]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !dragStart || !containerRef.current) return;
    
    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    const deltaX = currentX - dragStart.x;
    const deltaY = currentY - dragStart.y;
    
    const newX = dragStart.startX + deltaX;
    const newY = dragStart.startY + deltaY;
    
    // Calculate constraints based on scaled dimensions
    const imageDimensions = calculateImageDimensions(); 
    const scaledWidth = imageDimensions.baseWidth * scale;
    const scaledHeight = imageDimensions.baseHeight * scale;
    const maxOffsetX = Math.max(0, (scaledWidth - imageDimensions.previewWidth) / 2);
    const maxOffsetY = Math.max(0, (scaledHeight - imageDimensions.previewHeight) / 2);
    
    setPosition({
      x: Math.max(-maxOffsetX, Math.min(maxOffsetX, newX)),
      y: Math.max(-maxOffsetY, Math.min(maxOffsetY, newY)),
    });
  }, [isDragging, dragStart, calculateImageDimensions, scale]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
  }, []);

  // Add global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Handle save
  const handleSave = () => {
    console.log('Saving image edit data:', { scale, cropOffsetX: position.x, cropOffsetY: position.y });
    onSave({
      scale,
      cropOffsetX: position.x,
      cropOffsetY: position.y,
    });
    onClose();
  };

  // Handle reset
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscapeKey);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || !image) {
    return null;
  }

  const imageDimensions = calculateImageDimensions();

  const modalContent = (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 dark:bg-opacity-80"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Edit Image Position & Scale
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <HiX className="h-6 w-6" />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Preview Container */}
          <div className="flex justify-center">
            <div
              ref={containerRef}
              className="relative border-2 border-gray-300 dark:border-gray-600 overflow-hidden cursor-move bg-gray-100 dark:bg-gray-700 rounded"
              style={{
                width: imageDimensions.previewWidth,
                height: imageDimensions.previewHeight,
              }}
            >
              <img
                ref={imageRef}
                src={originalImageSrc}
                alt={image.file?.name || "Image"}
                className="absolute select-none"
                style={{
                  width: imageDimensions.baseWidth,
                  height: imageDimensions.baseHeight,
                  left: '50%',
                  top: '50%',
                  transform: `translate(${-imageDimensions.baseWidth / 2 + position.x}px, ${-imageDimensions.baseHeight / 2 + position.y}px) scale(${scale})`,
                  transformOrigin: 'center',
                  cursor: isDragging ? 'grabbing' : 'grab',
                }}
                onMouseDown={handleMouseDown}
                draggable={false}
              />
              
              {/* Guidelines - Rule of thirds */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute w-full h-px bg-white bg-opacity-50 shadow-sm" style={{ top: '33.33%' }} />
                <div className="absolute w-full h-px bg-white bg-opacity-50 shadow-sm" style={{ top: '66.66%' }} />
                <div className="absolute h-full w-px bg-white bg-opacity-50 shadow-sm" style={{ left: '33.33%' }} />
                <div className="absolute h-full w-px bg-white bg-opacity-50 shadow-sm" style={{ left: '66.66%' }} />
              </div>
            </div>
          </div>
          
          {/* Controls */}
          <div className="space-y-6">
            {/* Scale Control */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                Scale: {scale.toFixed(2)}x
              </label>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider"
              />
            </div>
            
            {/* Position Display */}
            <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded">
              <div className="flex justify-between">
                <span>Position: X: {Math.round(position.x)}, Y: {Math.round(position.y)}</span>
                <span>Scale: {scale.toFixed(2)}x</span>
              </div>
            </div>
            
            {/* Instructions */}
            <div className="text-sm text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900 p-4 rounded border-l-4 border-blue-400">
              <div className="font-medium text-blue-800 dark:text-blue-200 mb-2">How to use:</div>
              <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                <li>• Drag the image to reposition it within the frame</li>
                <li>• Use the scale slider to resize the image</li>
                <li>• Grid lines help with rule-of-thirds composition</li>
                <li>• Changes preview exactly how they'll appear in your PDF</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <Button
            color="gray"
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <HiRefresh className="h-4 w-4" />
            Reset to Default
          </Button>
          
          <div className="flex gap-3">
            <Button
              color="gray"
              onClick={onClose}
              className="flex items-center gap-2"
            >
              <HiX className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              color="blue"
              onClick={handleSave}
              className="flex items-center gap-2"
            >
              <HiCheck className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Use React Portal to render modal outside the component tree
  return createPortal(modalContent, document.body);
};

export default ImageEditModal;