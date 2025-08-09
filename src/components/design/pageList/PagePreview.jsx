import React, { useRef, useEffect, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Button } from "flowbite-react";
import {
  HiTrash,
  HiColorSwatch,
  HiArrowLeft,
  HiRefresh,
  HiViewGrid,
  HiChevronLeft,
  HiChevronRight,
  HiChevronUp,
  HiChevronDown,
} from "react-icons/hi";
import { getPreviewDimensions } from "../../../constants";
import FullCoverImage from "./FullCoverImage.jsx";

const PagePreview = ({
  page,
  pageIndex,
  pages,
  onChangeColor,
  onRemovePage,
  onMoveImageBack,
  onMoveAllImagesBack,
  onAutoArrangePage,
  onRandomizePage,
  onRandomizeLayout,
  onNextLayout,
  onPreviousLayout,
  onUpdateImagePosition,
  onMoveImageToPreviousPage,
  onMoveImageToNextPage,
  onSwapImagesInPage,
  settings,
  isProcessing,
}) => {
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: page.id,
    data: {
      type: "page",
      pageId: page.id,
    },
  });

  const previewDimensions = getPreviewDimensions(settings);
  const imageCount = page.images.length;

  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

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

        <div className="flex justify-end gap-2">
          <Button
            size="xs"
            color="gray"
            onClick={() => onChangeColor(page.id)}
            className="flex items-center gap-1"
            data-testid={`change-color-${pageIndex}`}
          >
            <HiColorSwatch className="h-3 w-3" />
            Color
          </Button>
          {page.images.length > 0 && (
            <>
              <Button
                size="xs"
                color="blue"
                onClick={() => onRandomizePage(page.id)}
                disabled={isProcessing}
                className="flex items-center gap-1"
                title="Shuffle image positions within same layout"
                data-testid={`shuffle-images-${pageIndex}`}
              >
                <HiRefresh className="h-3 w-3" />
                {isProcessing ? "Shuffling..." : "Shuffle Images"}
              </Button>
              <Button
                size="xs"
                color="purple"
                onClick={() => onPreviousLayout(page.id)}
                disabled={isProcessing}
                className="flex items-center gap-1"
                title="Switch to previous layout structure"
                data-testid={`prev-layout-${pageIndex}`}
              >
                <HiChevronLeft className="h-3 w-3" />
                {isProcessing ? "Switching..." : "Previous Layout"}
              </Button>
              <Button
                size="xs"
                color="purple"
                onClick={() => onNextLayout(page.id)}
                disabled={isProcessing}
                className="flex items-center gap-1"
                title="Switch to next layout structure"
                data-testid={`next-layout-${pageIndex}`}
              >
                <HiChevronRight className="h-3 w-3" />
                {isProcessing ? "Switching..." : "Next Layout"}
              </Button>
            </>
          )}
        </div>
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
                    ? "border-2 border-solid"
                    : "rounded border-2 border-dashed"
                } ${
                  isOver
                    ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-300 dark:border-gray-600"
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
  // Use object-contain for classic layout to maintain aspect ratios
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
