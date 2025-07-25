import React from "react";
import { Button } from "flowbite-react";

const PagesHeader = ({ isProcessing, availableImages, onAutoArrange }) => {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">PDF Pages</h3>
          <p className="text-sm text-gray-500">Arrange your images on pages</p>
        </div>
        <Button
          color="gray"
          onClick={onAutoArrange}
          disabled={isProcessing || availableImages.length === 0}
          size="sm"
        >
          {isProcessing ? "Auto-arranging..." : "Auto-arrange"}
        </Button>
      </div>
      <div className="border-t border-gray-200 pt-4">
      </div>
    </div>
  );
};

export default PagesHeader;
