import React from "react";

// Accept both legacy props (current/total/message/currentFileName)
// and simplified props (progress/total/message)
const ProgressToast = ({
  current,
  progress,
  total = 0,
  message,
  currentFileName,
}) => {
  const effectiveProgress = typeof progress === "number" ? progress : current || 0;
  const percent = total > 0 ? Math.round((effectiveProgress / total) * 100) : 0;
  return (
    <div className="w-64" data-testid="progress-toast">
      <p className="mb-2 text-xs text-white/90">{message}</p>
      {currentFileName ? (
        <p className="mb-1 truncate text-[10px] text-white/70">{currentFileName}</p>
      ) : null}
      <div className="h-2 w-full rounded bg-white/20">
        <div
          className="h-2 rounded bg-white"
          style={{ width: `${percent}%` }}
          data-testid="progress-bar"
        />
      </div>
      <p className="mt-1 text-right text-[10px] text-white/70">{percent}%</p>
    </div>
  );
};

export default ProgressToast;
