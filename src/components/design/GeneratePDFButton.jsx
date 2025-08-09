import React, { useState } from "react";
import { Button, Spinner } from "flowbite-react";

const GeneratePDFButton = ({
  onGeneratePDF,
  pages,
  isProcessing,
  currentAlbumName,
}) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await onGeneratePDF(currentAlbumName);
    } catch (error) {
      // Error is already handled in the onGeneratePDF function
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  return (
    <div className="min-w-0">
      <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
        <div className="flex justify-center">
          <Button
            size="lg"
            color="blue"
            onClick={handleGeneratePDF}
            disabled={
              pages.every((p) => p.images.length === 0) ||
              isProcessing ||
              isGeneratingPDF
            }
            className="w-full sm:w-auto"
            data-testid="generate-pdf-button"
          >
            {isProcessing || isGeneratingPDF ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Generating PDF...
              </>
            ) : (
              `Generate PDF${currentAlbumName ? ` - ${currentAlbumName}` : ""}`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GeneratePDFButton;
