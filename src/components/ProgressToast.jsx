import React from "react";

const ProgressToast = ({ current, total, message, currentFileName }) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="max-w-[400px] min-w-[300px] rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {message}
          </span>
          <span className="rounded bg-gray-100 px-2 py-1 font-mono text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            {current}/{total}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-600">
          <div
            className="flex h-3 items-center justify-center rounded-full bg-blue-600 transition-all duration-300 ease-out"
            style={{ width: `${percentage}%` }}
          >
            {percentage > 15 && (
              <span className="text-xs font-semibold text-white">
                {percentage}%
              </span>
            )}
          </div>
        </div>

        {/* Current File Name */}
        {currentFileName && (
          <div className="truncate rounded bg-gray-50 px-2 py-1 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400">
            📷 {currentFileName}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressToast;
