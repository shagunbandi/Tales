import jsPDF from 'jspdf'
import { A4_WIDTH_MM, A4_HEIGHT_MM } from '../constants.js'
import { previewToMm } from './layoutUtils.js'

// Generate PDF from pages
export const generatePDF = async (pages) => {
  if (pages.length === 0) {
    throw new Error('No pages to generate PDF from')
  }

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  })

  for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
    const page = pages[pageIndex]

    if (pageIndex > 0) {
      pdf.addPage()
    }

    // Set background color
    pdf.setFillColor(page.color.color)
    pdf.rect(0, 0, A4_WIDTH_MM, A4_HEIGHT_MM, 'F')

    // Add images to the page
    for (const image of page.images) {
      try {
        const imgWidth = previewToMm(image.previewWidth)
        const imgHeight = previewToMm(image.previewHeight)
        const imgX = previewToMm(image.x)
        const imgY = previewToMm(image.y)

        pdf.addImage(image.src, 'JPEG', imgX, imgY, imgWidth, imgHeight)
      } catch (err) {
        console.warn(`Failed to add image to PDF:`, err)
      }
    }
  }

  const filename = `images-${new Date().toISOString().slice(0, 10)}.pdf`
  pdf.save(filename)
}
