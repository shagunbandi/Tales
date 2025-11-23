import React from "react";
import { Button } from "flowbite-react";

const PagesHeader = ({
  isProcessing,
  availableImages,
  totalImages,
  onAutoArrange,
  settings,
}) => {
  return (
    <div className="min-w-0">
      <div className="mb-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                PDF Pages
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Arrange your images on pages
                {settings?.orientation && (
                  <span className="ml-2 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {settings.orientation === "portrait" ? "📱 Portrait" : "🖥️ Landscape"}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            color="gray"
            onClick={onAutoArrange}
            disabled={isProcessing || availableImages.length === 0}
            size="sm"
            data-testid="auto-arrange-button"
          >
            {isProcessing ? "Auto-arranging..." : "Auto-arrange"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PagesHeader;
