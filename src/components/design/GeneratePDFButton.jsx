import React from 'react'

const GeneratePDFButton = ({ onGeneratePDF, pages, isProcessing }) => {
  return (
    <div className="actions">
      <button
        className="btn btn-primary"
        onClick={onGeneratePDF}
        disabled={pages.every((p) => p.images.length === 0) || isProcessing}
      >
        {isProcessing ? 'Generating PDF...' : 'Generate PDF'}
      </button>
    </div>
  )
}

export default GeneratePDFButton
