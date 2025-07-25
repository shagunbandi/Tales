import React from "react";
import { Button } from "flowbite-react";

const PagesHeader = ({ isProcessing, availableImages, onAutoArrange }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-semibold text-gray-800">PDF Pages Preview</h3>
      <div className="flex items-center gap-2">
        <Button
          color="gray"
          onClick={onAutoArrange}
          disabled={isProcessing || availableImages.length === 0}
          size="sm"
        >
          {isProcessing ? "Auto-arranging..." : "Auto-arrange Images"}
        </Button>
      </div>
    </div>
  );
};

export default PagesHeader;
