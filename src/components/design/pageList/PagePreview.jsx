import React, { useRef, useEffect, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Button } from "flowbite-react";
import {
  HiTrash,
  HiColorSwatch,
  HiArrowLeft,
  HiRefresh,
  HiViewGrid,
  HiChevronUp,
  HiChevronDown,
} from "react-icons/hi";
import { getPreviewDimensions, COLOR_PALETTE, getPreviewBorderWidth } from "../../../constants";
import { getCurrentLayoutInfo } from "../../../utils/layoutCycling.js";
import FullCoverImage from "./FullCoverImage.jsx";
import LayoutSelectionModal from "./LayoutSelectionModal.jsx";

const PagePreview = ({
  page,
  pageIndex,
  pages,
  onChangeColor,
  onChangeImageBorderColor,
  onTogglePageBorder,
  onRemovePage,
  onMoveImageBack,
  onMoveAllImagesBack,
  onAutoArrangePage,
  onRandomizePage,
  onSelectLayout,
  onUpdateImagePosition,
  onMoveImageToPreviousPage,
  onMoveImageToNextPage,
  onSwapImagesInPage,
  settings,
  isProcessing,
  isPageBusy,
}) => {
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: page.id,
    data: {
      type: "page",
      pageId: page.id,
    },
  });

  const previewDimensions = getPreviewDimensions(settings);
  // Only apply borders if enabled for this page
  const borderEnabled = page.enablePageBorder !== false;
  const previewBorderWidth = getPreviewBorderWidth(settings, borderEnabled);
  const imageCount = page.images.length;
  const layoutInfo = getCurrentLayoutInfo(page.id, page.images, settings);

  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);
  const [showPageColorPicker, setShowPageColorPicker] = useState(false);
  const [tempPageColor, setTempPageColor] = useState(page.color.color || "#FFFFFF");

  // Note: In Full Cover mode, we always show the Choose Layout button
  // The modal will handle cases where no layouts are available

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const newScale = containerWidth / previewDimensions.width;
        setScale(newScale);
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [previewDimensions.width]);

  const handleOpenLayoutModal = () => {
    setIsLayoutModalOpen(true);
  };

  const handleCloseLayoutModal = () => {
    setIsLayoutModalOpen(false);
  };

  const handleSelectLayout = (pageId, selectedLayout) => {
    if (onSelectLayout) {
      onSelectLayout(pageId, selectedLayout);
    }
  };

  const handlePageColorApply = () => {
    setShowPageColorPicker(false);
  };

  const handlePageColorChange = (colorHex) => {
    // Find color object from palette
    const colorObj = COLOR_PALETTE.find(c => c.color === colorHex);
    if (colorObj && onChangeColor) {
      onChangeColor(page.id, colorObj);
      setTempPageColor(colorHex);
    }
  };

  return (
    <div className="mb-6 min-w-0" data-testid={`page-preview-${pageIndex}`}>
      <div className="mb-4 space-y-2">
        {/* Page info line */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Page {pageIndex + 1}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {imageCount} {imageCount === 1 ? "image" : "images"}
            </span>
            {layoutInfo.totalLayouts > 0 && (
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                {layoutInfo.currentLayoutName || `Layout ${layoutInfo.currentIndex}`} ({layoutInfo.currentIndex}/{layoutInfo.totalLayouts})
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {page.images.length > 0 && (
              <>
                <Button
                  size="xs"
                  color="yellow"
                  onClick={() => onMoveAllImagesBack(page.id)}
                  className="flex items-center gap-1"
                  data-testid={`move-all-back-${pageIndex}`}
                >
                  <HiArrowLeft className="h-3 w-3" />
                  Move All Back
                </Button>
              </>
            )}
            <Button
              size="xs"
              color="red"
              onClick={() => onRemovePage(page.id)}
              className="flex items-center gap-1"
              data-testid={`remove-page-${pageIndex}`}
            >
              <HiTrash className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Action buttons line */}

        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            {/* Border Toggle - Only show in Full Cover mode when borders are configured */}
            {settings?.designStyle === "full_cover" && (settings?.pageBorderWidth > 0 || settings?.pictureBorderWidth > 0) && (
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-200">
                  Borders:
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={page.enablePageBorder !== false}
                    onChange={() => onTogglePageBorder && onTogglePageBorder(page.id)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              size="xs"
              color="gray"
              onClick={() => setShowPageColorPicker(!showPageColorPicker)}
              className="flex items-center gap-1"
              data-testid={`change-page-color-${pageIndex}`}
            >
              <HiColorSwatch className="h-3 w-3" />
              Page Color
            </Button>
            {page.images.length > 0 && (
              <>
              <Button
                size="xs"
                color="blue"
                onClick={() => onRandomizePage(page.id)}
                disabled={isPageBusy}
                className="flex items-center gap-1"
                title="Shuffle image positions within same layout"
                data-testid={`shuffle-images-${pageIndex}`}
              >
                <HiRefresh className="h-3 w-3" />
                {isPageBusy ? "Shuffling..." : "Shuffle Images"}
              </Button>
              <Button
                size="xs"
                color="purple"
                onClick={handleOpenLayoutModal}
                disabled={isPageBusy}
                className="flex items-center gap-1"
                title="Choose from available layout templates"
                data-testid={`choose-layout-${pageIndex}`}
              >
                <HiViewGrid className="h-3 w-3" />
                {isPageBusy ? "Processing..." : "Choose Layout"}
              </Button>
            </>
          )}
          </div>
        </div>

        {/* Page Color Picker - Controls page background, page border, and picture border */}
        {showPageColorPicker && (
          <div className="mt-2 rounded-lg border border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-800">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Page Color
                  </label>
                  {settings?.designStyle === "full_cover" && (settings?.pageBorderWidth > 0 || settings?.pictureBorderWidth > 0) && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Controls page background, page border & picture borders
                    </p>
                  )}
                </div>
                <Button
                  size="xs"
                  color="blue"
                  onClick={handlePageColorApply}
                >
                  Done
                </Button>
              </div>
              
              {/* Color Palette Grid */}
              <div className="grid grid-cols-6 gap-2">
                {COLOR_PALETTE.map((color) => (
                  <button
                    key={color.color}
                    onClick={() => handlePageColorChange(color.color)}
                    className={`h-10 w-full rounded border-2 transition-all hover:scale-110 ${
                      tempPageColor === color.color
                        ? "border-blue-500 ring-2 ring-blue-300"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    style={{ backgroundColor: color.color }}
                    title={color.name}
                  />
                ))}
              </div>
              
              {/* Show selected color info */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600 dark:text-gray-400">Selected:</span>
                <div
                  className="h-6 w-6 rounded border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: tempPageColor }}
                />
                <span className="text-gray-700 dark:text-gray-200">
                  {COLOR_PALETTE.find(c => c.color === tempPageColor)?.name || tempPageColor}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
        <div className="flex justify-center overflow-hidden">
          <div
            ref={containerRef}
            className="w-full max-w-full overflow-hidden"
            style={{
              height: previewDimensions.height * scale,
            }}
          >
            <div
              style={{
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                width: previewDimensions.width,
                height: previewDimensions.height,
              }}
            >
              <div
                ref={setDroppableRef}
                className={`relative ${
                  settings?.designStyle === "full_cover"
                    ? ""
                    : "rounded border-2 border-dashed"
                } ${
                  isOver
                    ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                    : settings?.designStyle !== "full_cover" ? "border-gray-300 dark:border-gray-600" : ""
                }`}
                style={{
                  backgroundColor: page.color.color,
                  width: previewDimensions.width,
                  height: previewDimensions.height,
                  maxWidth: "100%",
                  maxHeight: "400px",
                }}
                data-testid={`page-droppable-${pageIndex}`}
              >
                {page.images.map((image, index) => {
                  const isFullCover =
                    settings?.designStyle === "full_cover" ||
                    image.fullCoverMode;

                  if (isFullCover) {
                    return (
                      <FullCoverImage
                        key={`${page.id}-${image.id}`}
                        image={image}
                        page={page}
                        pageId={page.id}
                        pageIndex={pageIndex}
                        index={index}
                        pages={pages}
                        settings={settings}
                        onMoveImageBack={onMoveImageBack}
                        onUpdateImagePosition={onUpdateImagePosition}
                        onMoveImageToPreviousPage={onMoveImageToPreviousPage}
                        onMoveImageToNextPage={onMoveImageToNextPage}
                        onSwapImagesInPage={onSwapImagesInPage}
                      />
                    );
                  } else {
                    return (
                      <PageImage
                        key={`${page.id}-${image.id}`}
                        image={image}
                        pageId={page.id}
                        pageIndex={pageIndex}
                        index={index}
                        pages={pages}
                        settings={settings}
                        onMoveImageBack={onMoveImageBack}
                        onMoveImageToPreviousPage={onMoveImageToPreviousPage}
                        onMoveImageToNextPage={onMoveImageToNextPage}
                        onSwapImagesInPage={onSwapImagesInPage}
                      />
                    );
                  }
                })}
                {page.images.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                    Drag images here
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Layout Selection Modal */}
      {isLayoutModalOpen && (
        <LayoutSelectionModal
          isOpen={isLayoutModalOpen}
          onClose={handleCloseLayoutModal}
          onSelectLayout={handleSelectLayout}
          pageId={page.id}
          images={page.images}
          settings={settings}
          currentLayoutId={null} // Could be enhanced to detect current layout
        />
      )}
    </div>
  );
};

const PageImage = ({
  image,
  pageId,
  pageIndex,
  index,
  pages,
  settings,
  onMoveImageBack,
  onMoveImageToPreviousPage,
  onMoveImageToNextPage,
  onSwapImagesInPage,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMoveBack = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onMoveImageBack(pageId, index);
  };

  const handleMoveToPreviousPage = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (pageIndex > 0) {
      onMoveImageToPreviousPage(pageId, index, pages[pageIndex - 1].id);
    }
  };

  const handleMoveToNextPage = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (pageIndex < pages.length - 1) {
      onMoveImageToNextPage(pageId, index, pages[pageIndex + 1].id);
    }
  };

  const handleMoveLeft = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (index > 0) {
      onSwapImagesInPage(pageId, index, index - 1);
    }
  };

  const handleMoveRight = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const currentPage = pages.find((p) => p.id === pageId);
    if (currentPage && index < currentPage.images.length - 1) {
      onSwapImagesInPage(pageId, index, index + 1);
    }
  };

  if (!image?.src) return null;

  const isFullCover =
    settings?.designStyle === "full_cover" || image.fullCoverMode;

  const style = {
    left: image.x ?? 0,
    top: image.y ?? 0,
    width: image.previewWidth ?? 100,
    height: image.previewHeight ?? 100,
  };

  // Use object-cover for full cover layout to crop images for display
  const objectFitClass = isFullCover ? "object-cover" : "object-contain";

  const currentPage = pages.find((p) => p.id === pageId);
  const canMoveLeft = index > 0;
  const canMoveRight = currentPage && index < currentPage.images.length - 1;
  const canMoveToPreviousPage = pageIndex > 0;
  const canMoveToNextPage = pageIndex < pages.length - 1;

  return (
    <div
      className="absolute"
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`page-image-${pageIndex}-${index}`}
    >
      <img
        src={image.src}
        alt={image.file?.name || "Image"}
        className={`h-full w-full rounded ${objectFitClass}`}
      />
      {isHovered && (
        <>
          {/* Move back to available images */}
          <button
            onClick={handleMoveBack}
            className="absolute top-1 right-1 z-10 rounded-full bg-red-500 p-1 text-xs text-white shadow-lg hover:bg-red-600"
            title="Move back to available images"
            data-testid={`move-back-${pageIndex}-${index}`}
          >
            <HiArrowLeft className="h-3 w-3" />
          </button>

          {/* Navigation buttons */}
          <div className="absolute bottom-1 left-1 z-10 flex gap-1">
            {/* Move to previous page */}
            {canMoveToPreviousPage && (
              <button
                onClick={handleMoveToPreviousPage}
                className="rounded-full bg-blue-500 p-1 text-xs text-white shadow-lg hover:bg-blue-600"
                title="Move to previous page"
                data-testid={`move-prev-page-${pageIndex}-${index}`}
              >
                <HiChevronUp className="h-3 w-3" />
              </button>
            )}

            {/* Move to next page */}
            {canMoveToNextPage && (
              <button
                onClick={handleMoveToNextPage}
                className="rounded-full bg-blue-500 p-1 text-xs text-white shadow-lg hover:bg-blue-600"
                title="Move to next page"
                data-testid={`move-next-page-${pageIndex}-${index}`}
              >
                <HiChevronDown className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Position adjustment buttons */}
          <div className="absolute right-1 bottom-1 z-10 flex gap-1">
            {/* Move left within page */}
            {canMoveLeft && (
              <button
                onClick={handleMoveLeft}
                className="rounded-full bg-green-500 p-1 text-xs text-white shadow-lg hover:bg-green-600"
                title="Move left"
                data-testid={`move-left-${pageIndex}-${index}`}
              >
                <HiChevronLeft className="h-3 w-3" />
              </button>
            )}

            {/* Move right within page */}
            {canMoveRight && (
              <button
                onClick={handleMoveRight}
                className="rounded-full bg-green-500 p-1 text-xs text-white shadow-lg hover:bg-green-600"
                title="Move right"
                data-testid={`move-right-${pageIndex}-${index}`}
              >
                <HiChevronRight className="h-3 w-3" />
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PagePreview;
