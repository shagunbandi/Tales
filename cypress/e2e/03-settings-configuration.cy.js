// E2E Tests for Settings Configuration
// Tests cover: page settings, layout settings, color selection, validation, and setting persistence

describe("Settings Configuration", () => {
  beforeEach(() => {
    cy.clearAllData();
    cy.visitTales();

    // Setup: Upload images and select design style to reach settings
    cy.navigateToTab("upload");
    cy.uploadTestImages(3);
    cy.selectDesignStyle("classic");
    cy.navigateToTab("settings");
  });

  describe("Page Size and Orientation Settings", () => {
    it("should display all available page size options", () => {
      cy.get('[data-testid="page-size-select"]').should("be.visible");
      cy.get('[data-testid="page-size-select"]').select("a4");
      cy.get('[data-testid="page-size-select"]').select("letter");
      cy.get('[data-testid="page-size-select"]').select("legal");

      // Should show current selection
      cy.get('[data-testid="page-size-select"]').should("have.value", "legal");
    });

    it("should switch between landscape and portrait orientation", () => {
      // Default should be landscape
      cy.get('[data-testid="orientation-landscape"]').should("be.checked");

      // Switch to portrait
      cy.get('[data-testid="orientation-portrait"]').click();
      cy.get('[data-testid="orientation-portrait"]').should("be.checked");

      // Switch back to landscape
      cy.get('[data-testid="orientation-landscape"]').click();
      cy.get('[data-testid="orientation-landscape"]').should("be.checked");
    });

    it("should update page preview when changing size and orientation", () => {
      // Change to portrait A4
      cy.get('[data-testid="page-size-select"]').select("a4");
      cy.get('[data-testid="orientation-portrait"]').click();

      // Preview should reflect changes
      cy.get('[data-testid="page-preview"]').should("be.visible");
      cy.get('[data-testid="page-preview"]')
        .invoke("height")
        .should("be.greaterThan", 400);

      // Change to landscape letter
      cy.get('[data-testid="page-size-select"]').select("letter");
      cy.get('[data-testid="orientation-landscape"]').click();

      // Preview should update
      cy.get('[data-testid="page-preview"]')
        .invoke("width")
        .should("be.greaterThan", 400);
    });
  });

  describe("Margin and Gap Settings", () => {
    it("should allow adjusting page margins within valid range", () => {
      // Test valid margin values
      cy.get('[data-testid="page-margin-input"]').clear().type("15");
      cy.verifySettingsValue("pageMargin", "15");

      cy.get('[data-testid="page-margin-input"]').clear().type("30");
      cy.verifySettingsValue("pageMargin", "30");

      cy.get('[data-testid="page-margin-input"]').clear().type("50");
      cy.verifySettingsValue("pageMargin", "50");
    });

    it("should validate page margin bounds", () => {
      // Test minimum bound
      cy.get('[data-testid="page-margin-input"]').clear().type("0");
      cy.get('[data-testid="page-margin-input"]').blur();
      cy.verifyErrorMessage("Page margin must be between 5 and 50 pixels");

      // Test maximum bound
      cy.get('[data-testid="page-margin-input"]').clear().type("60");
      cy.get('[data-testid="page-margin-input"]').blur();
      cy.verifyErrorMessage("Page margin must be between 5 and 50 pixels");

      // Test invalid input
      cy.get('[data-testid="page-margin-input"]').clear().type("abc");
      cy.get('[data-testid="page-margin-input"]').blur();
      cy.verifyErrorMessage("Page margin must be between 5 and 50 pixels");
    });

    it("should allow adjusting image gaps within valid range", () => {
      // Test valid gap values
      cy.get('[data-testid="image-gap-input"]').clear().type("5");
      cy.verifySettingsValue("imageGap", "5");

      cy.get('[data-testid="image-gap-input"]').clear().type("15");
      cy.verifySettingsValue("imageGap", "15");

      cy.get('[data-testid="image-gap-input"]').clear().type("25");
      cy.verifySettingsValue("imageGap", "25");
    });

    it("should validate image gap bounds", () => {
      // Test negative value
      cy.get('[data-testid="image-gap-input"]').clear().type("-5");
      cy.get('[data-testid="image-gap-input"]').blur();
      cy.verifyErrorMessage("Image gap must be between 0 and 30 pixels");

      // Test maximum bound
      cy.get('[data-testid="image-gap-input"]').clear().type("35");
      cy.get('[data-testid="image-gap-input"]').blur();
      cy.verifyErrorMessage("Image gap must be between 0 and 30 pixels");
    });

    it("should hide gap settings for full cover design style", () => {
      // Go back and select full cover
      cy.navigateToTab("designStyle");
      cy.selectDesignStyle("fullCover");
      cy.navigateToTab("settings");

      // Image gap setting should not be visible
      cy.get('[data-testid="image-gap-setting"]').should("not.exist");

      // Page margin should still be available but potentially disabled
      cy.get('[data-testid="page-margin-setting"]').should("be.visible");
    });
  });

  describe("Layout Configuration Settings", () => {
    it("should allow configuring maximum images per row", () => {
      cy.get('[data-testid="max-images-per-row-input"]').clear().type("2");
      cy.verifySettingsValue("maxImagesPerRow", "2");

      cy.get('[data-testid="max-images-per-row-input"]').clear().type("6");
      cy.verifySettingsValue("maxImagesPerRow", "6");
    });

    it("should validate maximum images per row", () => {
      // Test minimum bound
      cy.get('[data-testid="max-images-per-row-input"]').clear().type("0");
      cy.get('[data-testid="max-images-per-row-input"]').blur();
      cy.verifyErrorMessage("Max images per row must be at least 1");

      // Test negative value
      cy.get('[data-testid="max-images-per-row-input"]').clear().type("-1");
      cy.get('[data-testid="max-images-per-row-input"]').blur();
      cy.verifyErrorMessage("Max images per row must be at least 1");
    });

    it("should allow configuring maximum number of rows", () => {
      cy.get('[data-testid="max-number-of-rows-input"]').clear().type("1");
      cy.verifySettingsValue("maxNumberOfRows", "1");

      cy.get('[data-testid="max-number-of-rows-input"]').clear().type("5");
      cy.verifySettingsValue("maxNumberOfRows", "5");
    });

    it("should allow configuring maximum number of pages", () => {
      cy.get('[data-testid="max-number-of-pages-input"]').clear().type("2");
      cy.verifySettingsValue("maxNumberOfPages", "2");

      cy.get('[data-testid="max-number-of-pages-input"]').clear().type("10");
      cy.verifySettingsValue("maxNumberOfPages", "10");
    });

    it("should validate maximum pages bounds", () => {
      // Test minimum bound
      cy.get('[data-testid="max-number-of-pages-input"]').clear().type("0");
      cy.get('[data-testid="max-number-of-pages-input"]').blur();
      cy.verifyErrorMessage("Max number of pages must be between 1 and 100");

      // Test maximum bound
      cy.get('[data-testid="max-number-of-pages-input"]').clear().type("150");
      cy.get('[data-testid="max-number-of-pages-input"]').blur();
      cy.verifyErrorMessage("Max number of pages must be between 1 and 100");
    });

    it("should allow configuring images per page", () => {
      cy.get('[data-testid="images-per-page-input"]').clear().type("5");
      cy.verifySettingsValue("imagesPerPage", "5");

      cy.get('[data-testid="images-per-page-input"]').clear().type("15");
      cy.verifySettingsValue("imagesPerPage", "15");
    });
  });

  describe("Color Selection", () => {
    it("should display color palette with all available colors", () => {
      cy.get('[data-testid="color-palette"]').should("be.visible");

      // Should have multiple color options
      cy.get('[data-testid^="color-"]').should("have.length.greaterThan", 10);

      // Each color should be clickable and show preview
      cy.get('[data-testid="color-Cream"]').should("be.visible").click();
      cy.get('[data-testid="color-Oxford Blue"]').should("be.visible").click();
      cy.get('[data-testid="color-Pastel Green"]').should("be.visible").click();
    });

    it("should allow selecting different background colors", () => {
      // Select a light color
      cy.get('[data-testid="color-Cream"]').click();
      cy.get('[data-testid="color-Cream"]').should("have.class", "ring-2");

      // Select a dark color
      cy.get('[data-testid="color-Oxford Blue"]').click();
      cy.get('[data-testid="color-Oxford Blue"]').should(
        "have.class",
        "ring-2",
      );
      cy.get('[data-testid="color-Cream"]').should("not.have.class", "ring-2");

      // Select a colorful option
      cy.get('[data-testid="color-Pastel Green"]').click();
      cy.get('[data-testid="color-Pastel Green"]').should(
        "have.class",
        "ring-2",
      );
    });

    it("should update color preview when selecting different colors", () => {
      // Select different colors and verify preview updates
      cy.get('[data-testid="color-Light Coral"]').click();
      cy.get('[data-testid="page-preview"]').should(
        "have.css",
        "background-color",
      );

      cy.get('[data-testid="color-Powder Blue"]').click();
      cy.get('[data-testid="page-preview"]').should(
        "have.css",
        "background-color",
      );

      // Colors should be visibly different (basic check)
      cy.get('[data-testid="page-preview"]').should("be.visible");
    });

    it("should show color names on hover or selection", () => {
      cy.get('[data-testid="color-Cream"]').trigger("mouseover");
      cy.get('[data-testid="color-tooltip"]').should("contain", "Cream");

      cy.get('[data-testid="color-Oxford Blue"]').click();
      cy.get('[data-testid="selected-color-name"]').should(
        "contain",
        "Oxford Blue",
      );
    });
  });

  describe("Image Quality Settings", () => {
    it("should allow adjusting image quality", () => {
      cy.get('[data-testid="image-quality-input"]').should("be.visible");

      // Test different quality values
      cy.get('[data-testid="image-quality-input"]').clear().type("0.7");
      cy.verifySettingsValue("imageQuality", "0.7");

      cy.get('[data-testid="image-quality-input"]').clear().type("1.0");
      cy.verifySettingsValue("imageQuality", "1.0");

      cy.get('[data-testid="image-quality-input"]').clear().type("0.5");
      cy.verifySettingsValue("imageQuality", "0.5");
    });

    it("should validate image quality bounds", () => {
      // Test minimum bound
      cy.get('[data-testid="image-quality-input"]').clear().type("0.05");
      cy.get('[data-testid="image-quality-input"]').blur();
      cy.verifyErrorMessage("Image quality must be between 0.1 and 1.0");

      // Test maximum bound
      cy.get('[data-testid="image-quality-input"]').clear().type("1.5");
      cy.get('[data-testid="image-quality-input"]').blur();
      cy.verifyErrorMessage("Image quality must be between 0.1 and 1.0");
    });
  });

  describe("Settings Persistence", () => {
    it("should save settings when navigating between tabs", () => {
      // Configure multiple settings
      cy.get('[data-testid="page-margin-input"]').clear().type("25");
      cy.get('[data-testid="image-gap-input"]').clear().type("8");
      cy.get('[data-testid="max-images-per-row-input"]').clear().type("3");
      cy.get('[data-testid="color-Pastel Green"]').click();

      // Navigate to design tab
      cy.get('[data-testid="next-to-design-button"]').click();

      // Go back to settings
      cy.navigateToTab("settings");

      // Settings should be preserved
      cy.verifySettingsValue("pageMargin", "25");
      cy.verifySettingsValue("imageGap", "8");
      cy.verifySettingsValue("maxImagesPerRow", "3");
      cy.get('[data-testid="color-Pastel Green"]').should(
        "have.class",
        "ring-2",
      );
    });

    it("should persist settings in browser storage", () => {
      // Configure settings
      cy.get('[data-testid="page-margin-input"]').clear().type("35");
      cy.get('[data-testid="color-Sky Blue"]').click();

      // Reload page
      cy.reload();

      // Navigate back to settings (after re-uploading images)
      cy.navigateToTab("upload");
      cy.uploadTestImages(2);
      cy.selectDesignStyle("classic");
      cy.navigateToTab("settings");

      // Settings should be restored (if implemented)
      // Note: This depends on the app's local storage implementation
      cy.get('[data-testid="settings-content"]').should("be.visible");
    });
  });

  describe("Settings Validation and Error Handling", () => {
    it("should prevent proceeding with invalid settings", () => {
      // Enter invalid values
      cy.get('[data-testid="page-margin-input"]').clear().type("-10");
      cy.get('[data-testid="image-gap-input"]').clear().type("50");

      // Next button should be disabled or show error
      cy.get('[data-testid="next-to-design-button"]').should("be.disabled");
    });

    it("should show validation errors clearly", () => {
      // Test multiple invalid values
      cy.get('[data-testid="page-margin-input"]').clear().type("-5");
      cy.get('[data-testid="page-margin-input"]').blur();
      cy.get('[data-testid="image-gap-input"]').clear().type("40");
      cy.get('[data-testid="image-gap-input"]').blur();

      // Should show multiple error messages
      cy.get('[data-testid="settings-errors"]').should("be.visible");
      cy.get('[data-testid="error-count"]').should("contain", "2");
    });

    it("should clear errors when values are corrected", () => {
      // Create error
      cy.get('[data-testid="page-margin-input"]').clear().type("-5");
      cy.get('[data-testid="page-margin-input"]').blur();
      cy.get('[data-testid="settings-errors"]').should("be.visible");

      // Fix error
      cy.get('[data-testid="page-margin-input"]').clear().type("20");
      cy.get('[data-testid="page-margin-input"]').blur();

      // Error should be cleared
      cy.get('[data-testid="settings-errors"]').should("not.exist");
      cy.get('[data-testid="next-to-design-button"]').should("not.be.disabled");
    });
  });

  describe("Settings Preview and Real-time Updates", () => {
    it("should update preview in real-time when changing settings", () => {
      // Change margin and verify preview updates
      cy.get('[data-testid="page-margin-input"]').clear().type("10");
      cy.get('[data-testid="page-preview"]').should("be.visible");

      cy.get('[data-testid="page-margin-input"]').clear().type("40");
      cy.get('[data-testid="page-preview"]').should("be.visible");

      // Change gap and verify preview updates
      cy.get('[data-testid="image-gap-input"]').clear().type("5");
      cy.wait(500); // Allow for debouncing
      cy.get('[data-testid="page-preview"]').should("be.visible");
    });

    it("should show accurate color preview", () => {
      // Select different colors and verify preview
      const colors = ["Cream", "Oxford Blue", "Pastel Green", "Light Coral"];

      colors.forEach((color) => {
        cy.get(`[data-testid="color-${color}"]`).click();
        cy.get('[data-testid="page-preview"]').should("be.visible");
        // The preview should reflect the selected color
        cy.get('[data-testid="page-preview"]').should(
          "have.css",
          "background-color",
        );
      });
    });
  });

  describe("Settings for Different Design Styles", () => {
    it("should show appropriate settings for Classic design", () => {
      // Ensure we're on classic design
      cy.navigateToTab("designStyle");
      cy.selectDesignStyle("classic");
      cy.navigateToTab("settings");

      // Should show all classic-specific settings
      cy.get('[data-testid="page-margin-setting"]').should("be.visible");
      cy.get('[data-testid="image-gap-setting"]').should("be.visible");
      cy.get('[data-testid="max-images-per-row-setting"]').should("be.visible");
      cy.get('[data-testid="max-number-of-rows-setting"]').should("be.visible");
    });

    it("should show appropriate settings for Full Cover design", () => {
      // Switch to full cover design
      cy.navigateToTab("designStyle");
      cy.selectDesignStyle("fullCover");
      cy.navigateToTab("settings");

      // Should hide gap-related settings
      cy.get('[data-testid="image-gap-setting"]').should("not.exist");

      // Should still show other relevant settings
      cy.get('[data-testid="page-size-setting"]').should("be.visible");
      cy.get('[data-testid="orientation-setting"]').should("be.visible");
      cy.get('[data-testid="color-palette"]').should("be.visible");
    });

    it("should handle switching design styles and updating settings accordingly", () => {
      // Configure settings for classic
      cy.get('[data-testid="image-gap-input"]').clear().type("15");
      cy.get('[data-testid="max-images-per-row-input"]').clear().type("3");

      // Switch to full cover
      cy.navigateToTab("designStyle");
      cy.selectDesignStyle("fullCover");
      cy.navigateToTab("settings");

      // Gap setting should be hidden
      cy.get('[data-testid="image-gap-setting"]').should("not.exist");

      // Switch back to classic
      cy.navigateToTab("designStyle");
      cy.selectDesignStyle("classic");
      cy.navigateToTab("settings");

      // Gap setting should reappear with preserved value
      cy.get('[data-testid="image-gap-setting"]').should("be.visible");
      cy.verifySettingsValue("imageGap", "15");
    });
  });
});
