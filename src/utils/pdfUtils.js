import jsPDF from "jspdf";
import { PAGE_SIZES } from "../constants.js";
import { previewToMm } from "./layoutUtils.js";

export const generatePDF = async (pages, settings = null) => {
  if (pages.length === 0) {
    throw new Error("No pages to generate PDF from");
  }

  const pageSize = PAGE_SIZES[settings?.pageSize || "a4"];
  const orientation = settings?.orientation || "landscape";

  const pdf = new jsPDF({
    orientation: orientation,
    unit: "mm",
    format: settings?.pageSize || "a4",
  });

  for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
    const page = pages[pageIndex];

    if (pageIndex > 0) {
      pdf.addPage();
    }

    pdf.setFillColor(page.color.color);
    const pageWidth =
      orientation === "landscape" ? pageSize.width : pageSize.height;
    const pageHeight =
      orientation === "landscape" ? pageSize.height : pageSize.width;
    pdf.rect(0, 0, pageWidth, pageHeight, "F");

    for (const image of page.images) {
      try {
        const imgWidth = previewToMm(image.previewWidth, settings);
        const imgHeight = previewToMm(image.previewHeight, settings);
        const imgX = previewToMm(image.x, settings);
        const imgY = previewToMm(image.y, settings);

        pdf.addImage(image.src, "JPEG", imgX, imgY, imgWidth, imgHeight);
      } catch (err) {
        console.warn(`Failed to add image to PDF:`, err);
      }
    }
  }

  const filename = `images-${new Date().toISOString().slice(0, 10)}.pdf`;
  pdf.save(filename);
};
