import React, { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  HiChevronLeft,
  HiChevronRight,
  HiX,
  HiEye,
  HiArrowsExpand,
} from "react-icons/hi";
import { getPreviewDimensions, PAGE_SIZES, getPreviewBorderWidth } from "../../constants.js";

const AlbumViewModal = ({
  isOpen,
  onClose,
  pages,
  settings,
}) => {
  const [currentSpread, setCurrentSpread] = useState(0); // 0 means pages 1-2, 1 means pages 3-4, etc.
  const [orientation, setOrientation] = useState("horizontal"); // "horizontal" or "vertical"

  const previewDimensions = getPreviewDimensions(settings);
  
  // Helper function to calculate picture border width in pixels for album view
  const calculatePictureBorderWidth = (page) => {
    const borderEnabled = page?.enablePageBorder !== false;
    const borderWidthMm = borderEnabled ? (settings?.pictureBorderWidth ?? 0) : 0;
    
    if (borderWidthMm <= 0 || !settings) return 0;
    
    const pageSize = PAGE_SIZES[settings.pageSize || "a4"];
    const isLandscape = settings.orientation !== "portrait";
    const pageSizeWidth = isLandscape ? pageSize.width : pageSize.height;
    const mmToPreviewPx = previewDimensions.width / pageSizeWidth;
    return borderWidthMm * mmToPreviewPx * albumScale;
  };
  
  // Helper function to calculate page border (inset) in pixels for album view
  const calculatePageBorderInset = (page) => {
    const borderEnabled = page?.enablePageBorder !== false;
    const previewBorderWidth = getPreviewBorderWidth(settings, borderEnabled);
    return previewBorderWidth * albumScale;
  };
  
  // Calculate album page dimensions to maximize screen space
  const maxViewportWidth = typeof window !== 'undefined' ? window.innerWidth * 0.8 : 1200;
  const maxViewportHeight = typeof window !== 'undefined' ? window.innerHeight * 0.65 : 600;
  
  // Calculate optimal size based on orientation
  const aspectRatio = previewDimensions.width / previewDimensions.height;
  let albumPageWidth, albumPageHeight;
  
  if (orientation === "horizontal") {
    // Calculate optimal size for two pages side by side
    const maxAlbumWidth = maxViewportWidth / 2 - 20; // Account for gap and margins
    const maxAlbumHeight = maxViewportHeight;
    
    if (maxAlbumWidth / aspectRatio <= maxAlbumHeight) {
      // Width is limiting factor
      albumPageWidth = maxAlbumWidth;
      albumPageHeight = maxAlbumWidth / aspectRatio;
    } else {
      // Height is limiting factor
      albumPageHeight = maxAlbumHeight;
      albumPageWidth = maxAlbumHeight * aspectRatio;
    }
  } else {
    // Vertical orientation - pages stacked top to bottom
    const maxAlbumWidth = maxViewportWidth;
    const maxAlbumHeight = maxViewportHeight / 2 - 20; // Account for gap and margins
    
    if (maxAlbumWidth / aspectRatio <= maxAlbumHeight) {
      // Width is limiting factor
      albumPageWidth = maxAlbumWidth;
      albumPageHeight = maxAlbumWidth / aspectRatio;
    } else {
      // Height is limiting factor
      albumPageHeight = maxAlbumHeight;
      albumPageWidth = maxAlbumHeight * aspectRatio;
    }
  }
  
  const albumScale = albumPageWidth / previewDimensions.width;

  // Calculate total spreads (2 pages per spread, with page 1 starting on the left)
  const totalSpreads = Math.max(1, Math.ceil(pages.length / 2));

  const handlePrevious = useCallback(() => {
    setCurrentSpread(prev => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentSpread(prev => Math.min(totalSpreads - 1, prev + 1));
  }, [totalSpreads]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "ArrowLeft") {
      handlePrevious();
    } else if (e.key === "ArrowRight") {
      handleNext();
    } else if (e.key === "Escape") {
      onClose();
    }
  }, [handlePrevious, handleNext, onClose]);

  // Get current pages for the spread
  // Page 1 starts on the left side (standard book layout)
  const leftPageIndex = currentSpread * 2;
  const rightPageIndex = currentSpread * 2 + 1;
  const leftPage = leftPageIndex < pages.length ? pages[leftPageIndex] : null;
  const rightPage = rightPageIndex < pages.length ? pages[rightPageIndex] : null;

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 bg-gray-900 bg-opacity-95"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div
        className="relative w-full h-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Minimal header */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          {/* Orientation toggle */}
          <div className="flex items-center bg-black bg-opacity-50 rounded-lg overflow-hidden">
            <button
              onClick={() => setOrientation("horizontal")}
              className={`px-3 py-2 flex items-center gap-1 transition-all ${
                orientation === "horizontal"
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:text-white hover:bg-opacity-75"
              }`}
              title="Horizontal view (side by side)"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <rect x="2" y="5" width="7" height="10" rx="1" />
                <rect x="11" y="5" width="7" height="10" rx="1" />
              </svg>
              <span className="text-xs">Side</span>
            </button>
            <button
              onClick={() => setOrientation("vertical")}
              className={`px-3 py-2 flex items-center gap-1 transition-all ${
                orientation === "vertical"
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:text-white hover:bg-opacity-75"
              }`}
              title="Vertical view (top to bottom)"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <rect x="5" y="2" width="10" height="7" rx="1" />
                <rect x="5" y="11" width="10" height="7" rx="1" />
              </svg>
              <span className="text-xs">Stack</span>
            </button>
          </div>
          
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 transition-all"
            title="Close"
          >
            <HiX className="h-6 w-6" />
          </button>
        </div>

        {/* Album container - takes most of the screen */}
        <div className="flex-1 flex items-center justify-center p-8">
          {/* Album book with realistic binding */}
          <div 
            className="relative"
            style={{
              perspective: '1000px',
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Book shadow */}
            <div 
              className="absolute inset-0 bg-black opacity-20 blur-lg transform translate-y-4 translate-x-2"
              style={
                orientation === "horizontal" 
                  ? {
                      width: albumPageWidth * 2 + 8,
                      height: albumPageHeight + 20,
                      top: -10,
                      left: -4
                    }
                  : {
                      width: albumPageWidth + 20,
                      height: albumPageHeight * 2 + 8,
                      top: -4,
                      left: -10
                    }
              }
            ></div>
            
            {/* Book spine/binding */}
            {orientation === "horizontal" ? (
              <div 
                className="absolute bg-gray-800 shadow-inner"
                style={{
                  width: '8px',
                  height: albumPageHeight + 20,
                  left: albumPageWidth - 4,
                  top: -10,
                  zIndex: 10,
                  background: 'linear-gradient(to right, #4a4a4a, #2a2a2a, #1a1a1a)',
                  borderRadius: '0 2px 2px 0'
                }}
              ></div>
            ) : (
              <div 
                className="absolute bg-gray-800 shadow-inner"
                style={{
                  width: albumPageWidth + 20,
                  height: '8px',
                  left: -10,
                  top: albumPageHeight - 4,
                  zIndex: 10,
                  background: 'linear-gradient(to bottom, #4a4a4a, #2a2a2a, #1a1a1a)',
                  borderRadius: '0 0 2px 2px'
                }}
              ></div>
            )}

            {/* Pages container */}
            <div className={orientation === "horizontal" ? "flex" : "flex flex-col"} style={{ gap: '0px' }}>
              {/* Left page */}
              <div className="flex flex-col">
                {leftPage ? (
                  <div
                    className="relative shadow-2xl bg-white transform"
                    style={
                      orientation === "horizontal"
                        ? {
                            width: albumPageWidth,
                            height: albumPageHeight,
                            backgroundColor: leftPage.color?.color || '#ffffff',
                            borderRadius: '8px 0 0 8px',
                            border: '1px solid #e5e5e5',
                            borderRight: 'none',
                            transform: 'rotateY(-1deg)',
                            transformOrigin: 'right center',
                            zIndex: 5
                          }
                        : {
                            width: albumPageWidth,
                            height: albumPageHeight,
                            backgroundColor: leftPage.color?.color || '#ffffff',
                            borderRadius: '8px 8px 0 0',
                            border: '1px solid #e5e5e5',
                            borderBottom: 'none',
                            transform: 'rotateX(1deg)',
                            transformOrigin: 'bottom center',
                            zIndex: 5
                          }
                    }
                  >
                      {/* Page border inset (if enabled) */}
                      {(() => {
                        const pageBorderInset = calculatePageBorderInset(leftPage);
                        const borderColor = leftPage.color?.color ?? "#FFFFFF";
                        
                        if (pageBorderInset > 0) {
                          return (
                            <div
                              style={{
                                position: 'absolute',
                                inset: `${pageBorderInset}px`,
                                border: `${pageBorderInset}px solid ${borderColor}`,
                                pointerEvents: 'none',
                                boxSizing: 'border-box',
                              }}
                            />
                          );
                        }
                        return null;
                      })()}
                      
                      {/* Render page images */}
                      {leftPage.images?.map((image, index) => {
                        if (!image?.src) return null;
                        
                        const pictureBorderWidth = calculatePictureBorderWidth(leftPage);
                        const borderColor = leftPage.color?.color ?? "#FFFFFF";
                        
                        const scaledStyle = {
                          position: 'absolute',
                          left: (image.x ?? 0) * albumScale,
                          top: (image.y ?? 0) * albumScale,
                          width: (image.previewWidth ?? 100) * albumScale,
                          height: (image.previewHeight ?? 100) * albumScale,
                          border: pictureBorderWidth > 0 ? `${pictureBorderWidth}px solid ${borderColor}` : 'none',
                          boxSizing: 'border-box',
                        };

                        return (
                          <img
                            key={`${leftPage.id}-${image.id || index}`}
                            src={image.src}
                            alt={image.file?.name || `Image ${index + 1}`}
                            className="absolute object-cover"
                            style={scaledStyle}
                            draggable={false}
                          />
                        );
                      })}
                  </div>
                ) : (
                  <div
                    className="shadow-2xl bg-gray-100 flex items-center justify-center text-gray-400 transform"
                    style={
                      orientation === "horizontal"
                        ? {
                            width: albumPageWidth,
                            height: albumPageHeight,
                            borderRadius: '8px 0 0 8px',
                            border: '1px solid #e5e5e5',
                            borderRight: 'none',
                            transform: 'rotateY(-1deg)',
                            transformOrigin: 'right center',
                            zIndex: 5
                          }
                        : {
                            width: albumPageWidth,
                            height: albumPageHeight,
                            borderRadius: '8px 8px 0 0',
                            border: '1px solid #e5e5e5',
                            borderBottom: 'none',
                            transform: 'rotateX(1deg)',
                            transformOrigin: 'bottom center',
                            zIndex: 5
                          }
                    }
                  >
                    Empty page
                  </div>
                )}
              </div>

              {/* Right page */}
              <div className="flex flex-col">
                {rightPage ? (
                  <div
                    className="relative shadow-2xl bg-white transform"
                    style={
                      orientation === "horizontal"
                        ? {
                            width: albumPageWidth,
                            height: albumPageHeight,
                            backgroundColor: rightPage.color?.color || '#ffffff',
                            borderRadius: '0 8px 8px 0',
                            border: '1px solid #e5e5e5',
                            borderLeft: 'none',
                            transform: 'rotateY(1deg)',
                            transformOrigin: 'left center',
                            zIndex: 5
                          }
                        : {
                            width: albumPageWidth,
                            height: albumPageHeight,
                            backgroundColor: rightPage.color?.color || '#ffffff',
                            borderRadius: '0 0 8px 8px',
                            border: '1px solid #e5e5e5',
                            borderTop: 'none',
                            transform: 'rotateX(-1deg)',
                            transformOrigin: 'top center',
                            zIndex: 5
                          }
                    }
                  >
                      {/* Page border inset (if enabled) */}
                      {(() => {
                        const pageBorderInset = calculatePageBorderInset(rightPage);
                        const borderColor = rightPage.color?.color ?? "#FFFFFF";
                        
                        if (pageBorderInset > 0) {
                          return (
                            <div
                              style={{
                                position: 'absolute',
                                inset: `${pageBorderInset}px`,
                                border: `${pageBorderInset}px solid ${borderColor}`,
                                pointerEvents: 'none',
                                boxSizing: 'border-box',
                              }}
                            />
                          );
                        }
                        return null;
                      })()}
                      
                      {/* Render page images */}
                      {rightPage.images?.map((image, index) => {
                        if (!image?.src) return null;
                        
                        const pictureBorderWidth = calculatePictureBorderWidth(rightPage);
                        const borderColor = rightPage.color?.color ?? "#FFFFFF";
                        
                        const scaledStyle = {
                          position: 'absolute',
                          left: (image.x ?? 0) * albumScale,
                          top: (image.y ?? 0) * albumScale,
                          width: (image.previewWidth ?? 100) * albumScale,
                          height: (image.previewHeight ?? 100) * albumScale,
                          border: pictureBorderWidth > 0 ? `${pictureBorderWidth}px solid ${borderColor}` : 'none',
                          boxSizing: 'border-box',
                        };

                        return (
                          <img
                            key={`${rightPage.id}-${image.id || index}`}
                            src={image.src}
                            alt={image.file?.name || `Image ${index + 1}`}
                            className="absolute object-cover"
                            style={scaledStyle}
                            draggable={false}
                          />
                        );
                      })}
                  </div>
                ) : (
                  <div
                    className="shadow-2xl bg-gray-100 flex items-center justify-center text-gray-400 transform"
                    style={
                      orientation === "horizontal"
                        ? {
                            width: albumPageWidth,
                            height: albumPageHeight,
                            borderRadius: '0 8px 8px 0',
                            border: '1px solid #e5e5e5',
                            borderLeft: 'none',
                            transform: 'rotateY(1deg)',
                            transformOrigin: 'left center',
                            zIndex: 5
                          }
                        : {
                            width: albumPageWidth,
                            height: albumPageHeight,
                            borderRadius: '0 0 8px 8px',
                            border: '1px solid #e5e5e5',
                            borderTop: 'none',
                            transform: 'rotateX(-1deg)',
                            transformOrigin: 'top center',
                            zIndex: 5
                          }
                    }
                  >
                    Empty page
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Controls section below the album */}
        <div className="bg-black bg-opacity-30 backdrop-blur-sm border-t border-gray-600 px-8 py-4">
          <div className="flex items-center justify-center gap-6">
            {/* Previous button */}
            <button
              onClick={handlePrevious}
              disabled={currentSpread === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                currentSpread === 0
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
              }`}
              title="Previous spread"
            >
              <HiChevronLeft className="h-5 w-5" />
              Previous
            </button>

            {/* Page info and indicators */}
            <div className="flex items-center gap-4">
              {/* Current spread info */}
              <div className="text-center">
                <div className="text-white font-medium">
                  {pages.length === 0 ? "No pages" : 
                   `Spread ${currentSpread + 1} of ${totalSpreads}`}
                </div>
                {(leftPage || rightPage) && (
                  <div className="text-gray-300 text-sm mt-1">
                    {leftPage && rightPage ? (
                      `Pages ${leftPageIndex + 1} - ${rightPageIndex + 1}`
                    ) : leftPage ? (
                      `Page ${leftPageIndex + 1}`
                    ) : (
                      `Page ${rightPageIndex + 1}`
                    )}
                  </div>
                )}
              </div>

              {/* Page dots indicator */}
              {totalSpreads > 1 && (
                <div className="flex gap-2">
                  {Array.from({ length: totalSpreads }, (_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSpread(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentSpread
                          ? "bg-blue-400 shadow-lg"
                          : "bg-gray-500 hover:bg-gray-400"
                      }`}
                      title={`Go to spread ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Next button */}
            <button
              onClick={handleNext}
              disabled={currentSpread >= totalSpreads - 1}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                currentSpread >= totalSpreads - 1
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
              }`}
              title="Next spread"
            >
              Next
              <HiChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default AlbumViewModal;