import React from "react";
import { Button } from "flowbite-react";

const GeneratePDFButton = ({ onGeneratePDF, pages, isProcessing }) => {
  return (
    <div className="mt-8 flex justify-center">
      <Button
        size="lg"
        color="blue"
        onClick={onGeneratePDF}
        disabled={pages.every((p) => p.images.length === 0) || isProcessing}
      >
        {isProcessing ? "Generating PDF..." : "Generate PDF"}
      </Button>
    </div>
  );
};

export default GeneratePDFButton;
