// E2E Tests for Auto-Arrangement Features
// Tests cover: auto-arrange algorithms, layout cycling, randomization, optimization, and smart positioning

describe("Auto-Arrangement Features", () => {
  beforeEach(() => {
    cy.clearAllData();
    cy.visitTales();

    // Setup: Upload images and navigate to design tab
    cy.navigateToTab("upload");
    cy.uploadTestImages(8);
    cy.selectDesignStyle("classic");
    cy.navigateToTab("settings");

    // Configure settings for testing
    cy.get('[data-testid="max-images-per-row-input"]').clear().type("3");
    cy.get('[data-testid="max-number-of-rows-input"]').clear().type("2");
    cy.get('[data-testid="next-to-design-button"]').click();
  });

  describe("Global Auto-Arrangement", () => {
    it("should auto-arrange all images across pages", () => {
      // Initially all images should be in available
      cy.get('[data-testid="available-images"]').within(() => {
        cy.get('[data-testid^="available-image-"]').should("have.length", 8);
      });

      // Auto-arrange all images
      cy.autoArrangeImages();

      // Should distribute images across pages
      cy.get('[data-testid="available-images"]').within(() => {
        cy.get('[data-testid^="available-image-"]').should("have.length", 0);
      });

      // Should create multiple pages as needed
      cy.get('[data-testid^="page-"]').should("have.length.greaterThan", 1);

      // First page should be full (3x2 = 6 images max)
      cy.verifyPageLayout(0, 6);

      // Remaining images should go to next page
      cy.verifyPageLayout(1, 2);
    });

    it("should respect page capacity settings during auto-arrangement", () => {
      // Set smaller page capacity
      cy.navigateToTab("settings");
      cy.get('[data-testid="max-images-per-row-input"]').clear().type("2");
      cy.get('[data-testid="max-number-of-rows-input"]').clear().type("2");
      cy.get('[data-testid="next-to-design-button"]').click();

      cy.autoArrangeImages();

      // Each page should have max 4 images (2x2)
      cy.verifyPageLayout(0, 4);
      cy.verifyPageLayout(1, 4);
    });

    it("should optimize layout for image aspect ratios", () => {
      // Upload images with different aspect ratios
      cy.get('[data-testid="add-more-images-button"]').click();
      cy.uploadSpecificTestImage(800, 400, "#e74c3c", "Landscape");
      cy.uploadSpecificTestImage(400, 800, "#2ecc71", "Portrait");
      cy.uploadSpecificTestImage(500, 500, "#3498db", "Square");

      cy.autoArrangeImages();

      // Should arrange considering aspect ratios
      cy.get('[data-testid="layout-optimization-info"]').should("be.visible");
      cy.get('[data-testid="arrangement-quality-score"]').should(
        "contain",
        "%",
      );
    });

    it("should show progress during auto-arrangement", () => {
      cy.get('[data-testid="auto-arrange-button"]').click();

      // Should show progress indicator
      cy.get('[data-testid="auto-arrange-progress"]').should("be.visible");
      cy.get('[data-testid="arrangement-status"]').should(
        "contain",
        "Arranging images",
      );

      // Progress should complete
      cy.get('[data-testid="auto-arrange-progress"]', {
        timeout: 10000,
      }).should("not.exist");
      cy.verifyToastMessage("Images arranged automatically!");
    });

    it("should allow canceling auto-arrangement", () => {
      cy.get('[data-testid="auto-arrange-button"]').click();

      // Cancel during process
      cy.get('[data-testid="cancel-auto-arrange-button"]').click();

      // Should stop and revert
      cy.get('[data-testid="auto-arrange-progress"]').should("not.exist");
      cy.verifyToastMessage("Auto-arrangement canceled");

      // Images should remain in available
      cy.get('[data-testid="available-images"]').within(() => {
        cy.get('[data-testid^="available-image-"]').should("have.length", 8);
      });
    });
  });

  describe("Page-Level Auto-Arrangement", () => {
    beforeEach(() => {
      // Manually place some images on a page first
      cy.dragImageToPage(0, 0);
      cy.dragImageToPage(0, 0);
      cy.dragImageToPage(0, 0);
      cy.dragImageToPage(0, 0);
    });

    it("should auto-arrange images within a specific page", () => {
      // Images should be placed randomly initially
      cy.get('[data-testid="page-0"]').within(() => {
        cy.get('[data-testid^="page-image-"]').should("have.length", 4);
      });

      // Auto-arrange this page
      cy.autoArrangePage(0);

      // Should maintain same number but optimize layout
      cy.verifyPageLayout(0, 4);
      cy.verifyToastMessage("Page layout optimized!");
    });

    it("should cycle through different layout patterns for a page", () => {
      // Get initial layout
      cy.get('[data-testid="page-0"]').within(() => {
        cy.get('[data-testid^="page-image-"]').should("have.length", 4);
      });

      // Cycle to next layout
      cy.nextLayout(0);
      cy.wait(500);

      // Should show different arrangement
      cy.get('[data-testid="layout-pattern-indicator"]').should(
        "contain",
        "Layout 2",
      );

      // Cycle again
      cy.nextLayout(0);
      cy.wait(500);

      cy.get('[data-testid="layout-pattern-indicator"]').should(
        "contain",
        "Layout 3",
      );
    });

    it("should cycle backwards through layout patterns", () => {
      // Go forward a few layouts
      cy.nextLayout(0);
      cy.nextLayout(0);

      cy.get('[data-testid="layout-pattern-indicator"]').should(
        "contain",
        "Layout 3",
      );

      // Go backwards
      cy.previousLayout(0);

      cy.get('[data-testid="layout-pattern-indicator"]').should(
        "contain",
        "Layout 2",
      );
    });

    it("should show layout preview before applying", () => {
      cy.get('[data-testid="page-0"]').within(() => {
        cy.get('[data-testid="preview-next-layout-button"]').click();
      });

      // Should show preview overlay
      cy.get('[data-testid="layout-preview-overlay"]').should("be.visible");
      cy.get('[data-testid="preview-layout-grid"]').should("be.visible");

      // Can apply or cancel
      cy.get('[data-testid="apply-preview-layout-button"]').click();
      cy.get('[data-testid="layout-preview-overlay"]').should("not.exist");
    });
  });

  describe("Randomization Features", () => {
    beforeEach(() => {
      // Place images on multiple pages
      cy.dragImageToPage(0, 0);
      cy.dragImageToPage(0, 0);
      cy.dragImageToPage(0, 0);

      cy.addNewPage();
      cy.dragImageToPage(0, 1);
      cy.dragImageToPage(0, 1);
    });

    it("should randomize layout for specific page", () => {
      // Get initial positions
      cy.get('[data-testid="page-0"]').within(() => {
        cy.get('[data-testid^="page-image-"]').then(($images) => {
          const initialPositions = Array.from($images).map((img) => ({
            x: img.getBoundingClientRect().left,
            y: img.getBoundingClientRect().top,
          }));

          // Randomize page
          cy.get('[data-testid="randomize-page-button"]').click();

          // Positions should have changed
          cy.get('[data-testid^="page-image-"]').then(($newImages) => {
            const newPositions = Array.from($newImages).map((img) => ({
              x: img.getBoundingClientRect().left,
              y: img.getBoundingClientRect().top,
            }));

            // At least some positions should be different
            let differentPositions = 0;
            for (let i = 0; i < initialPositions.length; i++) {
              if (
                initialPositions[i].x !== newPositions[i].x ||
                initialPositions[i].y !== newPositions[i].y
              ) {
                differentPositions++;
              }
            }
            expect(differentPositions).to.be.greaterThan(0);
          });
        });
      });
    });

    it("should randomize entire layout across all pages", () => {
      cy.randomizeLayout();

      // Should show randomization progress
      cy.get('[data-testid="randomizing-layout"]').should("be.visible");
      cy.get('[data-testid="randomizing-layout"]', { timeout: 5000 }).should(
        "not.exist",
      );

      cy.verifyToastMessage("Layout randomized!");

      // All pages should still have images but in different arrangements
      cy.verifyPageLayout(0, 3);
      cy.verifyPageLayout(1, 2);
    });

    it("should provide different randomization styles", () => {
      cy.get('[data-testid="randomization-options"]').should("be.visible");

      // Test different randomization modes
      cy.get('[data-testid="random-style-scattered"]').click();
      cy.randomizeLayout();
      cy.wait(1000);

      cy.get('[data-testid="random-style-grid-based"]').click();
      cy.randomizeLayout();
      cy.wait(1000);

      cy.get('[data-testid="random-style-artistic"]').click();
      cy.randomizeLayout();
      cy.wait(1000);

      // Each style should produce different results
      cy.verifyToastMessage("Layout randomized!");
    });

    it("should maintain page capacity constraints during randomization", () => {
      // Set strict page limits
      cy.navigateToTab("settings");
      cy.get('[data-testid="max-images-per-row-input"]').clear().type("2");
      cy.get('[data-testid="max-number-of-rows-input"]').clear().type("1");
      cy.get('[data-testid="next-to-design-button"]').click();

      // Randomize with constraints
      cy.randomizeLayout();

      // Should respect constraints
      cy.get('[data-testid^="page-"]').each(($page, index) => {
        cy.wrap($page).within(() => {
          cy.get('[data-testid^="page-image-"]').should(
            "have.length.lessThan",
            3,
          );
        });
      });
    });
  });

  describe("Smart Arrangement Algorithms", () => {
    it("should use area optimization for mixed aspect ratios", () => {
      // Upload images with very different aspect ratios
      cy.get('[data-testid="add-more-images-button"]').click();
      cy.uploadSpecificTestImage(1200, 300, "#e74c3c", "Wide Banner");
      cy.uploadSpecificTestImage(300, 900, "#2ecc71", "Tall Portrait");
      cy.uploadSpecificTestImage(600, 600, "#3498db", "Square");

      // Use smart arrangement
      cy.get('[data-testid="smart-arrange-button"]').click();

      // Should show algorithm selection
      cy.get('[data-testid="algorithm-area-optimization"]').click();
      cy.get('[data-testid="apply-smart-arrangement-button"]').click();

      // Should optimize for minimum wasted space
      cy.get('[data-testid="arrangement-efficiency"]').should("contain", "%");
      cy.verifyToastMessage("Smart arrangement applied!");
    });

    it("should use color harmony arrangement", () => {
      cy.get('[data-testid="smart-arrange-button"]').click();
      cy.get('[data-testid="algorithm-color-harmony"]').click();
      cy.get('[data-testid="apply-smart-arrangement-button"]').click();

      // Should arrange based on color similarity
      cy.get('[data-testid="color-analysis-info"]').should("be.visible");
      cy.verifyToastMessage("Color-based arrangement applied!");
    });

    it("should use size-based arrangement", () => {
      cy.get('[data-testid="smart-arrange-button"]').click();
      cy.get('[data-testid="algorithm-size-based"]').click();
      cy.get('[data-testid="apply-smart-arrangement-button"]').click();

      // Should group by similar sizes
      cy.get('[data-testid="size-grouping-info"]').should("be.visible");
      cy.verifyToastMessage("Size-based arrangement applied!");
    });

    it("should allow custom arrangement rules", () => {
      cy.get('[data-testid="smart-arrange-button"]').click();
      cy.get('[data-testid="custom-rules-tab"]').click();

      // Configure custom rules
      cy.get('[data-testid="rule-largest-first"]').check();
      cy.get('[data-testid="rule-center-focus"]').check();
      cy.get('[data-testid="rule-color-balance"]').check();

      cy.get('[data-testid="apply-custom-arrangement-button"]').click();

      cy.verifyToastMessage("Custom arrangement rules applied!");
    });
  });

  describe("Layout Templates", () => {
    it("should provide predefined layout templates", () => {
      cy.get('[data-testid="layout-templates-button"]').click();

      // Should show template gallery
      cy.get('[data-testid="template-gallery"]').should("be.visible");
      cy.get('[data-testid^="template-"]').should("have.length.greaterThan", 3);

      // Test different templates
      cy.get('[data-testid="template-grid"]').click();
      cy.get('[data-testid="apply-template-button"]').click();
      cy.verifyToastMessage("Grid template applied!");

      cy.get('[data-testid="layout-templates-button"]').click();
      cy.get('[data-testid="template-mosaic"]').click();
      cy.get('[data-testid="apply-template-button"]').click();
      cy.verifyToastMessage("Mosaic template applied!");
    });

    it("should preview templates before applying", () => {
      cy.get('[data-testid="layout-templates-button"]').click();

      // Hover over template to preview
      cy.get('[data-testid="template-collage"]').trigger("mouseover");

      // Should show preview
      cy.get('[data-testid="template-preview-modal"]').should("be.visible");
      cy.get('[data-testid="template-preview-image"]').should("be.visible");
      cy.get('[data-testid="template-description"]').should("be.visible");

      // Can apply from preview
      cy.get('[data-testid="apply-from-preview-button"]').click();
      cy.verifyToastMessage("Collage template applied!");
    });

    it("should adapt templates to available images", () => {
      // Have fewer images than template expects
      cy.get('[data-testid="move-all-images-back-button"]').click();
      cy.dragImageToPage(0, 0);
      cy.dragImageToPage(0, 0);
      cy.dragImageToPage(0, 0); // Only 3 images

      cy.get('[data-testid="layout-templates-button"]').click();
      cy.get('[data-testid="template-six-pack"]').click(); // Template for 6 images

      // Should show adaptation message
      cy.get('[data-testid="template-adaptation-warning"]').should(
        "contain",
        "Template will be adapted for 3 images",
      );

      cy.get('[data-testid="apply-template-button"]').click();
      cy.verifyToastMessage("Template adapted and applied!");
    });

    it("should allow saving custom templates", () => {
      // Create a custom arrangement
      cy.dragImageToPage(0, 0);
      cy.dragImageToPage(0, 0);
      cy.nextLayout(0);
      cy.nextLayout(0);

      // Save as template
      cy.get('[data-testid="save-as-template-button"]').click();
      cy.get('[data-testid="template-name-input"]').type("My Custom Layout");
      cy.get('[data-testid="template-description-input"]').type(
        "Custom arrangement I created",
      );
      cy.get('[data-testid="save-template-button"]').click();

      cy.verifyToastMessage("Template saved!");

      // Should appear in template gallery
      cy.get('[data-testid="layout-templates-button"]').click();
      cy.get('[data-testid="custom-templates-tab"]').click();
      cy.get('[data-testid="template-My Custom Layout"]').should("be.visible");
    });
  });

  describe("Arrangement Undo/Redo", () => {
    beforeEach(() => {
      // Place initial images
      cy.dragImageToPage(0, 0);
      cy.dragImageToPage(0, 0);
      cy.dragImageToPage(0, 0);
    });

    it("should undo auto-arrangement operations", () => {
      // Record initial state
      cy.get('[data-testid="page-0"]').within(() => {
        cy.get('[data-testid^="page-image-"]').should("have.length", 3);
      });

      // Auto-arrange
      cy.autoArrangeImages();

      // Should have different arrangement
      cy.get('[data-testid="available-images"]').within(() => {
        cy.get('[data-testid^="available-image-"]').should("have.length", 5);
      });

      // Undo
      cy.get('[data-testid="undo-arrangement-button"]').click();

      // Should restore original state
      cy.get('[data-testid="page-0"]').within(() => {
        cy.get('[data-testid^="page-image-"]').should("have.length", 3);
      });
      cy.get('[data-testid="available-images"]').within(() => {
        cy.get('[data-testid^="available-image-"]').should("have.length", 5);
      });
    });

    it("should redo undone arrangements", () => {
      // Auto-arrange and undo
      cy.autoArrangeImages();
      cy.get('[data-testid="undo-arrangement-button"]').click();

      // Redo
      cy.get('[data-testid="redo-arrangement-button"]').click();

      // Should reapply auto-arrangement
      cy.get('[data-testid="available-images"]').within(() => {
        cy.get('[data-testid^="available-image-"]').should("have.length", 0);
      });
    });

    it("should support multiple levels of undo", () => {
      // Perform multiple operations
      cy.autoArrangePage(0); // Operation 1
      cy.randomizePage(0); // Operation 2
      cy.nextLayout(0); // Operation 3

      // Undo three times
      cy.get('[data-testid="undo-arrangement-button"]').click(); // Undo layout change
      cy.get('[data-testid="undo-arrangement-button"]').click(); // Undo randomize
      cy.get('[data-testid="undo-arrangement-button"]').click(); // Undo auto-arrange

      // Should be back to original state
      cy.get('[data-testid="page-0"]').within(() => {
        cy.get('[data-testid^="page-image-"]').should("have.length", 3);
      });
    });
  });

  describe("Performance and Edge Cases", () => {
    it("should handle large numbers of images efficiently", () => {
      // Add many more images
      cy.get('[data-testid="add-more-images-button"]').click();
      cy.uploadTestImages(20);

      // Auto-arrange should still work efficiently
      const startTime = Date.now();
      cy.autoArrangeImages();

      cy.get('[data-testid="auto-arrange-progress"]', {
        timeout: 15000,
      }).should("not.exist");

      // Should complete in reasonable time (under 15 seconds)
      cy.verifyToastMessage("Images arranged automatically!");
    });

    it("should handle empty pages gracefully", () => {
      // Remove all images from current page
      cy.get('[data-testid="move-all-images-back-button"]').click();

      // Try to auto-arrange empty page
      cy.autoArrangePage(0);

      // Should show appropriate message
      cy.verifyToastMessage("No images to arrange on this page", "info");
    });

    it("should handle single image arrangements", () => {
      // Move all but one image back
      cy.get('[data-testid="move-all-images-back-button"]').click();
      cy.dragImageToPage(0, 0);

      // Auto-arrange single image
      cy.autoArrangePage(0);

      // Should center the image
      cy.get('[data-testid="page-0"]').within(() => {
        cy.get('[data-testid^="page-image-"]').should("have.class", "centered");
      });
    });

    it("should adapt to different page orientations", () => {
      // Switch to portrait orientation
      cy.navigateToTab("settings");
      cy.get('[data-testid="orientation-portrait"]').click();
      cy.get('[data-testid="next-to-design-button"]').click();

      // Auto-arrange should adapt to portrait layout
      cy.autoArrangeImages();

      // Should optimize for portrait aspect ratio
      cy.get('[data-testid="orientation-adapted-layout"]').should("be.visible");
      cy.verifyToastMessage("Images arranged for portrait orientation!");
    });
  });

  describe("Full Cover Mode Auto-Arrangement", () => {
    beforeEach(() => {
      // Switch to full cover mode
      cy.navigateToTab("designStyle");
      cy.selectDesignStyle("fullCover");
      cy.navigateToTab("design");
    });

    it("should auto-arrange for full cover layout", () => {
      cy.autoArrangeImages();

      // Each page should have one image filling entire page
      cy.get('[data-testid^="page-"]').each(($page, index) => {
        cy.wrap($page).within(() => {
          cy.get('[data-testid^="page-image-"]').should("have.length", 1);
          cy.get('[data-testid^="page-image-"]').should(
            "have.class",
            "full-cover",
          );
        });
      });
    });

    it("should cycle through cropping positions for full cover", () => {
      // Place image on page
      cy.dragImageToPage(0, 0);

      // Cycle through crop positions
      cy.get('[data-testid="page-0"]').within(() => {
        cy.get('[data-testid="cycle-crop-position-button"]').click();
      });

      // Should show different crop positions
      cy.get('[data-testid="crop-position-indicator"]').should(
        "contain",
        "Center",
      );

      cy.get('[data-testid="page-0"]').within(() => {
        cy.get('[data-testid="cycle-crop-position-button"]').click();
      });

      cy.get('[data-testid="crop-position-indicator"]').should(
        "contain",
        "Top",
      );
    });
  });
});
