import React, { useCallback, useEffect, useState } from "react";
import { Card, Button, Alert } from "flowbite-react";
import {
  HiOutlineCloudArrowUp,
  HiCheckCircle,
  HiInformationCircle,
} from "react-icons/hi2";

const UploadTab = ({
  handleFiles,
  isProcessing,
  totalImages,
  setActiveTab,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = useCallback(
    async (event) => {
      const files = Array.from(event.target.files);
      await handleFiles(files);
    },
    [handleFiles],
  );

  const handleDrop = useCallback(
    async (event) => {
      event.preventDefault();
      setIsDragOver(false);
      const files = Array.from(event.dataTransfer.files);
      await handleFiles(files);
    },
    [handleFiles],
  );

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  useEffect(() => {
    if (totalImages > 0 && !isProcessing) {
      setActiveTab("design");
    }
  }, [totalImages, isProcessing, setActiveTab]);

  return (
    <div className="space-y-6 p-6">
      <Card
        className={`cursor-pointer transition-colors duration-200 ${
          isDragOver ? "bg-blue-50" : "hover:bg-gray-50"
        }`}
        onClick={() => document.getElementById("folder-input").click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <HiOutlineCloudArrowUp className="mb-4 h-12 w-12 text-gray-400" />
          <p className="text-lg font-semibold text-gray-700">
            Click here or drag & drop image files
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Supports JPG, PNG, GIF, WebP formats
          </p>
          <Button color="gray" size="sm" className="mt-4">
            Choose Files
          </Button>
        </div>
        <input
          id="folder-input"
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </Card>

      {totalImages > 0 && (
        <Alert color="success" icon={HiCheckCircle}>
          <span className="font-medium">
            ✓ {totalImages} images uploaded successfully!
          </span>
          <br />
          <span className="text-sm">
            Automatically proceeding to design layout...
          </span>
        </Alert>
      )}

      {isProcessing && (
        <Alert color="info" icon={HiInformationCircle}>
          <span className="font-medium">Processing images...</span>
        </Alert>
      )}
    </div>
  );
};

export default UploadTab;
