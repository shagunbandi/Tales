import React from "react";
import { Badge, Spinner } from "flowbite-react";
import { HiCheck, HiClock, HiExclamation } from "react-icons/hi";

const AutoSaveIndicator = ({
  isAutoSaving,
  lastSaveTime,
  hasUnsavedChanges,
  currentAlbumName,
}) => {
  const formatLastSaveTime = (timestamp) => {
    if (!timestamp) return null;

    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    if (minutes > 0) {
      return `${minutes}m ago`;
    } else if (seconds > 0) {
      return `${seconds}s ago`;
    } else {
      return "just now";
    }
  };

  if (isAutoSaving) {
    return (
      <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
        <Spinner size="xs" />
        <span>Auto-saving...</span>
      </div>
    );
  }

  if (hasUnsavedChanges && lastSaveTime) {
    return (
      <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
        <HiClock className="h-3 w-3" />
        <span>Changes since {formatLastSaveTime(lastSaveTime)}</span>
      </div>
    );
  }

  if (lastSaveTime) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
        <HiCheck className="h-3 w-3" />
        <span>Saved {formatLastSaveTime(lastSaveTime)}</span>
        {currentAlbumName && (
          <Badge color="green" size="sm">
            {currentAlbumName}
          </Badge>
        )}
      </div>
    );
  }

  return null;
};

export default AutoSaveIndicator;
