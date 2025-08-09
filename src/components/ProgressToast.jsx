import React from "react";

const ProgressToast = ({
  current,
  progress,
  total = 0,
  message,
  currentFileName,
  showBlocking = false,
}) => {
  const effectiveProgress = typeof progress === "number" ? progress : current || 0;
  const percent = total > 0 ? Math.round((effectiveProgress / total) * 100) : 0;

  const remainingSteps = total - effectiveProgress;
  const timeEstimate =
    remainingSteps > 0 && effectiveProgress > 0
      ? Math.max(1, Math.ceil(remainingSteps * 0.3))
      : null;

  return (
    <div
      className={`${showBlocking ? 'w-80' : 'w-64'} p-4 bg-gray-800 text-white border border-white/10 rounded-xl shadow-xl`}
      data-testid="progress-toast"
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium truncate">{message}</p>
        <p className="text-xs font-mono font-bold text-blue-400">{percent}%</p>
      </div>

      {currentFileName && (
        <p className="mb-2 truncate text-xs text-gray-300">
          Processing: {currentFileName}
        </p>
      )}

      <div className="relative mb-2">
        <div className="h-3 w-full rounded-full bg-gray-700 border border-gray-600">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500 ease-out shadow-inner"
            style={{ width: `${percent}%` }}
            data-testid="progress-bar"
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>
          {effectiveProgress}/{total} steps
        </span>
        {timeEstimate && timeEstimate > 0 && timeEstimate < 30 && (
          <span className="text-blue-300 font-medium">~{timeEstimate}s left</span>
        )}
      </div>
    </div>
  );
};

export default ProgressToast;
