import React from "react";
import { Button } from "flowbite-react";

const GeneratePDFButton = ({ onGeneratePDF, pages, isProcessing }) => {
  return (
    <div className="min-w-0">
      <div className="border-t border-gray-200 pt-6">
        <div className="flex justify-center">
          <Button
            size="lg"
            color="blue"
            onClick={onGeneratePDF}
            disabled={pages.every((p) => p.images.length === 0) || isProcessing}
            className="w-full sm:w-auto"
          >
            {isProcessing ? "Generating PDF..." : "Generate PDF"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GeneratePDFButton;
