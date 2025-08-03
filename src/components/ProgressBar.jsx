import React from "react";
import { Progress } from "flowbite-react";

const ProgressBar = ({ progress, className = "" }) => {
  if (!progress) return null;

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-2 flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {progress.message}
        </span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {progress.percentage}%
        </span>
      </div>
      <Progress
        progress={progress.percentage}
        size="md"
        color="blue"
        className="w-full"
      />
      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Step {progress.step} of {progress.total}
      </div>
    </div>
  );
};

export default ProgressBar;