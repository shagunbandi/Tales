import React, { useState } from "react";
import { Button, Spinner } from "flowbite-react";
import { HiEye } from "react-icons/hi";
import AlbumViewModal from "../modals/AlbumViewModal.jsx";

const GeneratePDFButton = ({
  onGeneratePDF,
  pages,
  isProcessing,
  settings,
}) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isAlbumViewOpen, setIsAlbumViewOpen] = useState(false);

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await onGeneratePDF();
    } catch (error) {
      // Error is already handled in the onGeneratePDF function
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleViewAlbum = () => {
    console.log("View Album clicked! Pages:", pages?.length || 0);
    setIsAlbumViewOpen(true);
  };

  const hasPages = pages.length > 0 && pages.some(p => p.images.length > 0);

  return (
    <>
      <div className="min-w-0">
        <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            {/* View Album Button */}
            <Button
              size="lg"
              color="gray"
              onClick={handleViewAlbum}
              disabled={isProcessing}
              className="w-full sm:w-auto"
              data-testid="view-album-button"
            >
              <HiEye className="mr-2 h-5 w-5" />
              View Album
            </Button>
            
            {/* Generate PDF Button */}
            <Button
              size="lg"
              color="blue"
              onClick={handleGeneratePDF}
              disabled={!hasPages || isProcessing || isGeneratingPDF}
              className="w-full sm:w-auto"
              data-testid="generate-pdf-button"
            >
              {isProcessing || isGeneratingPDF ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Generating PDF...
                </>
              ) : (
                "Generate PDF"
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Album View Modal */}
      <AlbumViewModal
        isOpen={isAlbumViewOpen}
        onClose={() => setIsAlbumViewOpen(false)}
        pages={pages}
        settings={settings}
      />
    </>
  );
};

export default GeneratePDFButton;
