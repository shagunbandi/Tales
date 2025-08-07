// E2E Tests for PDF Generation and Download
// Tests cover: PDF creation, download functionality, different layouts, settings impact, and error handling

describe("PDF Generation and Download", () => {
  beforeEach(() => {
    cy.clearAllData();
    cy.visitTales();

    // Setup: Upload images and arrange them
    cy.navigateToTab("upload");
    cy.uploadTestImages(4);
    cy.selectDesignStyle("classic");
    cy.navigateToTab("settings");
    cy.get('[data-testid="next-to-design-button"]').click();

    // Arrange some images on pages
    cy.dragImageToPage(0, 0);
    cy.dragImageToPage(0, 0);
    cy.dragImageToPage(0, 0);
  });

  describe("Basic PDF Generation", () => {
    it("should generate PDF with current layout", () => {
      // Click generate PDF button
      cy.generatePDF();

      // Should show generation progress
      cy.get('[data-testid="pdf-generating"]').should("be.visible");
      cy.get('[data-testid="pdf-progress-bar"]').should("be.visible");

      // Wait for generation to complete
      cy.waitForPDFGeneration();

      // Should show success message
      cy.verifyToastMessage("PDF generated successfully!");
    });

    it("should disable generate button during PDF creation", () => {
      cy.generatePDF();

      // Button should be disabled during generation
      cy.get('[data-testid="generate-pdf-button"]').should("be.disabled");

      cy.waitForPDFGeneration();

      // Button should be re-enabled after completion
      cy.get('[data-testid="generate-pdf-button"]').should("not.be.disabled");
    });

    it("should show progress during PDF generation", () => {
      cy.generatePDF();

      // Progress bar should show incremental progress
      cy.get('[data-testid="pdf-progress-bar"]').should("be.visible");
      cy.get('[data-testid="pdf-progress-text"]').should("contain", "%");

      cy.waitForPDFGeneration();

      // Progress should reach 100%
      cy.get('[data-testid="pdf-progress-text"]').should("contain", "100%");
    });
  });

  describe("PDF Download Functionality", () => {
    it("should download PDF file with correct name", () => {
      cy.generatePDF();
      cy.waitForPDFGeneration();

      // Should trigger download
      cy.verifyPDFDownload("tales-layout.pdf");
    });

    it("should download PDF with custom album name if saved", () => {
      // Save as album first
      cy.saveAsAlbum("My Test Album");

      // Generate PDF
      cy.generatePDF();
      cy.waitForPDFGeneration();

      // Should download with album name
      cy.verifyPDFDownload("My Test Album.pdf");
    });

    it("should include timestamp in filename for unsaved albums", () => {
      cy.generatePDF();
      cy.waitForPDFGeneration();

      // Check downloads folder for file with timestamp pattern
      const downloadsFolder = Cypress.config("downloadsFolder");
      cy.task("findFile", {
        folder: downloadsFolder,
        pattern: "tales-*-*.pdf",
      }).should("exist");
    });
  });

  describe("PDF Generation with Different Layouts", () => {
    it("should generate PDF with Classic layout", () => {
      // Verify we're using classic layout
      cy.get('[data-testid="current-design-style"]').should(
        "contain",
        "Classic",
      );

      cy.generatePDF();
      cy.waitForPDFGeneration();

      // Should generate successfully
      cy.verifyToastMessage("PDF generated with Classic layout");
    });

    it("should generate PDF with Full Cover layout", () => {
      // Switch to full cover layout
      cy.navigateToTab("designStyle");
      cy.selectDesignStyle("fullCover");
      cy.navigateToTab("design");

      // Re-arrange images for full cover
      cy.dragImageToPage(0, 0);

      cy.generatePDF();
      cy.waitForPDFGeneration();

      cy.verifyToastMessage("PDF generated with Full Cover layout");
    });

    it("should generate PDF with multiple pages", () => {
      // Add more pages and distribute images
      cy.addNewPage();
      cy.addNewPage();

      cy.dragImageToPage(0, 1);
      cy.dragImageToPage(0, 2);

      cy.generatePDF();
      cy.waitForPDFGeneration();

      // Should handle multi-page PDF generation
      cy.verifyToastMessage("PDF generated with 3 pages");
    });
  });

  describe("PDF Generation with Different Settings", () => {
    beforeEach(() => {
      // Go back to settings to configure
      cy.navigateToTab("settings");
    });

    it("should generate PDF with A4 landscape", () => {
      cy.get('[data-testid="page-size-select"]').select("a4");
      cy.get('[data-testid="orientation-landscape"]').click();
      cy.get('[data-testid="next-to-design-button"]').click();

      cy.generatePDF();
      cy.waitForPDFGeneration();

      cy.verifyToastMessage("PDF generated successfully");
    });

    it("should generate PDF with Letter portrait", () => {
      cy.get('[data-testid="page-size-select"]').select("letter");
      cy.get('[data-testid="orientation-portrait"]').click();
      cy.get('[data-testid="next-to-design-button"]').click();

      cy.generatePDF();
      cy.waitForPDFGeneration();

      cy.verifyToastMessage("PDF generated successfully");
    });

    it("should generate PDF with custom margins", () => {
      cy.get('[data-testid="page-margin-input"]').clear().type("30");
      cy.get('[data-testid="next-to-design-button"]').click();

      cy.generatePDF();
      cy.waitForPDFGeneration();

      cy.verifyToastMessage("PDF generated successfully");
    });

    it("should generate PDF with different background colors", () => {
      cy.get('[data-testid="color-Pastel Green"]').click();
      cy.get('[data-testid="next-to-design-button"]').click();

      cy.generatePDF();
      cy.waitForPDFGeneration();

      cy.verifyToastMessage("PDF generated successfully");
    });

    it("should generate PDF with different image quality settings", () => {
      cy.get('[data-testid="image-quality-input"]').clear().type("0.7");
      cy.get('[data-testid="next-to-design-button"]').click();

      cy.generatePDF();
      cy.waitForPDFGeneration();

      cy.verifyToastMessage("PDF generated successfully");
    });
  });

  describe("PDF Generation Performance", () => {
    it("should generate PDF efficiently with many images", () => {
      // Add more images
      cy.get('[data-testid="add-more-images-button"]').click();
      cy.uploadTestImages(8);

      // Distribute across multiple pages
      cy.addNewPage();
      cy.addNewPage();

      // Auto-arrange to fill pages
      cy.autoArrangeImages();

      // Generate PDF - should complete within reasonable time
      cy.generatePDF();

      // Should complete within 30 seconds even with many images
      cy.waitForPDFGeneration();
      cy.verifyToastMessage("PDF generated successfully");
    });

    it("should handle large images in PDF generation", () => {
      // Upload large test images
      cy.get('[data-testid="add-more-images-button"]').click();
      cy.uploadSpecificTestImage(2000, 1500, "#3498db", "Large Image");

      // Arrange large image
      cy.dragImageToPage(0, 0);

      cy.generatePDF();
      cy.waitForPDFGeneration();

      cy.verifyToastMessage("PDF generated successfully");
    });

    it("should optimize images during PDF generation", () => {
      cy.navigateToTab("settings");
      cy.get('[data-testid="image-quality-input"]').clear().type("0.5");
      cy.get('[data-testid="next-to-design-button"]').click();

      cy.generatePDF();

      // Should show optimization progress
      cy.get('[data-testid="optimization-status"]').should(
        "contain",
        "Optimizing images",
      );

      cy.waitForPDFGeneration();
      cy.verifyToastMessage("PDF generated successfully");
    });
  });

  describe("PDF Generation Error Handling", () => {
    it("should handle empty pages gracefully", () => {
      // Remove all images from pages
      cy.get('[data-testid="move-all-images-back-button"]').click();

      // Try to generate PDF
      cy.get('[data-testid="generate-pdf-button"]').click();

      // Should show appropriate error or warning
      cy.verifyToastMessage(
        "Please add images to pages before generating PDF",
        "error",
      );
    });

    it("should handle generation errors gracefully", () => {
      // Simulate error condition (e.g., very large number of pages)
      for (let i = 0; i < 50; i++) {
        cy.addNewPage();
      }

      cy.generatePDF();

      // Should handle error gracefully
      cy.get('[data-testid="pdf-error-message"]', { timeout: 30000 }).should(
        "contain",
        "Error generating PDF",
      );
    });

    it("should recover from generation failures", () => {
      // Force an error scenario
      cy.window().then((win) => {
        // Mock PDF generation to fail once
        cy.stub(win, "generatePDF")
          .onFirstCall()
          .throws(new Error("Test error"))
          .onSecondCall()
          .resolves();
      });

      cy.generatePDF();

      // Should show error
      cy.verifyToastMessage("PDF generation failed", "error");

      // Try again - should succeed
      cy.generatePDF();
      cy.waitForPDFGeneration();
      cy.verifyToastMessage("PDF generated successfully");
    });
  });

  describe("PDF Preview Before Generation", () => {
    it("should show PDF preview before generation", () => {
      cy.get('[data-testid="preview-pdf-button"]').click();

      // Should show modal with PDF preview
      cy.get('[data-testid="pdf-preview-modal"]').should("be.visible");
      cy.get('[data-testid="pdf-preview-pages"]').should("be.visible");

      // Should show each page preview
      cy.get('[data-testid^="preview-page-"]').should(
        "have.length.greaterThan",
        0,
      );

      // Can close preview
      cy.get('[data-testid="close-preview-button"]').click();
      cy.get('[data-testid="pdf-preview-modal"]').should("not.exist");
    });

    it("should allow generating PDF from preview", () => {
      cy.get('[data-testid="preview-pdf-button"]').click();

      // Generate from preview modal
      cy.get('[data-testid="generate-from-preview-button"]').click();

      cy.waitForPDFGeneration();
      cy.verifyToastMessage("PDF generated successfully");
    });

    it("should update preview when layout changes", () => {
      cy.get('[data-testid="preview-pdf-button"]').click();

      // Note initial preview
      cy.get('[data-testid="pdf-preview-pages"]').should("be.visible");

      // Close and change layout
      cy.get('[data-testid="close-preview-button"]').click();
      cy.addNewPage();
      cy.dragImageToPage(0, 1);

      // Open preview again - should reflect changes
      cy.get('[data-testid="preview-pdf-button"]').click();
      cy.get('[data-testid^="preview-page-"]').should("have.length", 2);
    });
  });

  describe("PDF Metadata and Properties", () => {
    it("should include proper metadata in generated PDF", () => {
      cy.saveAsAlbum("Test Album with Metadata");

      cy.generatePDF();
      cy.waitForPDFGeneration();

      // Verify PDF contains metadata (would need PDF parsing library in actual test)
      cy.verifyPDFDownload("Test Album with Metadata.pdf");

      // This is a placeholder for actual PDF metadata verification
      cy.task("verifyPDFMetadata", {
        filename: "Test Album with Metadata.pdf",
        expectedTitle: "Test Album with Metadata",
        expectedCreator: "Tales",
      }).should("be.true");
    });

    it("should set proper PDF page dimensions based on settings", () => {
      cy.navigateToTab("settings");
      cy.get('[data-testid="page-size-select"]').select("letter");
      cy.get('[data-testid="orientation-portrait"]').click();
      cy.get('[data-testid="next-to-design-button"]').click();

      cy.generatePDF();
      cy.waitForPDFGeneration();

      // Verify PDF has correct dimensions
      cy.task("verifyPDFDimensions", {
        filename: "tales-layout.pdf",
        expectedWidth: 216, // Letter width in mm
        expectedHeight: 279, // Letter height in mm
      }).should("be.true");
    });
  });

  describe("Batch PDF Generation", () => {
    it("should handle generating multiple PDFs in sequence", () => {
      // Generate first PDF
      cy.generatePDF();
      cy.waitForPDFGeneration();

      // Modify layout
      cy.addNewPage();
      cy.dragImageToPage(0, 1);

      // Generate second PDF
      cy.generatePDF();
      cy.waitForPDFGeneration();

      // Both should be successful
      cy.verifyToastMessage("PDF generated successfully");
    });

    it("should prevent concurrent PDF generation", () => {
      // Start first generation
      cy.generatePDF();

      // Try to start second generation while first is running
      cy.get('[data-testid="generate-pdf-button"]').should("be.disabled");

      cy.waitForPDFGeneration();

      // Should be able to generate again after first completes
      cy.get('[data-testid="generate-pdf-button"]').should("not.be.disabled");
    });
  });

  describe("PDF Accessibility and Compliance", () => {
    it("should generate accessible PDFs with proper structure", () => {
      cy.generatePDF();
      cy.waitForPDFGeneration();

      // Verify PDF has proper structure for accessibility
      cy.task("verifyPDFAccessibility", {
        filename: "tales-layout.pdf",
      }).should("be.true");
    });

    it("should include alt text for images in PDF", () => {
      cy.generatePDF();
      cy.waitForPDFGeneration();

      // Verify images have proper alt text or descriptions
      cy.task("verifyPDFImageAltText", {
        filename: "tales-layout.pdf",
      }).should("be.true");
    });
  });
});
