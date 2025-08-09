import React from "react";
import AutoSaveIndicator from "./AutoSaveIndicator";

const AppHeader = ({
  isAutoSaving,
  lastSaveTime,
  hasUnsavedChanges,
  currentAlbumName,
}) => {
  return (
    <div className="relative my-8 p-5 text-center" data-testid="app-header">
      <div className="relative inline-block">
        <p className="animate-pulse bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 bg-clip-text text-5xl font-bold text-transparent">
          Tales
        </p>
        <div className="absolute -top-2 -right-2 h-3 w-3 animate-bounce rounded-full bg-yellow-400"></div>
        <div className="absolute -bottom-1 -left-1 h-2 w-2 animate-ping rounded-full bg-blue-400"></div>
      </div>
      <p className="mt-3 text-lg font-medium text-gray-600 dark:text-gray-300">
        For Journeys Worth Remembering
      </p>
      <div className="mt-4 flex items-center justify-center space-x-2">
        <div className="h-2 w-2 animate-pulse rounded-full bg-purple-400"></div>
        <div
          className="h-2 w-2 animate-pulse rounded-full bg-pink-400"
          style={{ animationDelay: "0.2s" }}
        ></div>
        <div
          className="h-2 w-2 animate-pulse rounded-full bg-indigo-400"
          style={{ animationDelay: "0.4s" }}
        ></div>
      </div>

      {/* Auto-save indicator */}
      <div className="mt-3">
        <AutoSaveIndicator
          isAutoSaving={isAutoSaving}
          lastSaveTime={lastSaveTime}
          hasUnsavedChanges={hasUnsavedChanges}
          currentAlbumName={currentAlbumName}
        />
      </div>
    </div>
  );
};

export default AppHeader;
