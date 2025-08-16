// Cypress tests for the single-page Tales app

const attachDummyImageViaGlobalInput = () => {
  cy.fixture("images/dummy1.png", "base64").then((base64) => {
    const file = {
      contents: Cypress.Blob.base64StringToBlob(base64, "image/png"),
      fileName: "dummy1.png",
      mimeType: "image/png",
      lastModified: Date.now(),
    };
    cy.getByTestId("global-file-input").selectFile(file, { force: true });
  });
};

describe("Tales App E2E", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.getByTestId("app-root").should("exist");
    // App should directly show the design tab
    cy.getByTestId("design-tab").should("exist");
  });

  it("displays the single design page", () => {
    // Should see the design page with its main components
    cy.getByTestId("available-images-panel").should("exist");
    cy.getByTestId("pages-panel").should("exist");
    cy.getByTestId("design-style-button").should("exist");
    cy.getByTestId("settings-button").should("exist");
  });

  it("allows uploading images and arranging them", () => {
    // Upload an image
    cy.getByTestId("add-more-images-button").click();
    attachDummyImageViaGlobalInput();

    // Wait for processing success toast
    cy.contains("Successfully processed", { timeout: 20000 });

    // Check available images counter shows 1 of 1
    cy.getByTestId("available-images-count", { timeout: 20000 }).should(
      "contain",
      "1 of 1",
    );

    // Auto-arrange onto pages
    cy.getByTestId("auto-arrange-button").click();

    // There should be at least one page now
    cy.getByTestId("pages-list").within(() => {
      cy.get("[data-testid^=page-preview-]", { timeout: 10000 }).should(
        "have.length.at.least",
        1,
      );
    });
  });

  it("opens and configures design style modal", () => {
    // Open design style modal
    cy.getByTestId("design-style-button").click();
    cy.getByTestId("design-style-modal").should("be.visible");

    // Select full cover design style
    cy.getByTestId("design-style-full_cover").click();

    // Close modal
    cy.contains("Done").click();
    cy.getByTestId("design-style-modal").should("not.exist");
  });

  it("opens and configures settings modal", () => {
    // Open settings modal
    cy.getByTestId("settings-button").click();
    cy.getByTestId("settings-modal").should("be.visible");

    // Modify a setting
    cy.getByTestId("settings-input-imagesPerPage").clear().type("6");

    // Close modal
    cy.contains("Done").click();
    cy.getByTestId("settings-modal").should("not.exist");
  });

  it("can generate PDF after uploading and arranging images", () => {
    // Upload image and arrange
    cy.getByTestId("add-more-images-button").click();
    attachDummyImageViaGlobalInput();

    cy.contains("Successfully processed", { timeout: 20000 });
    cy.getByTestId("auto-arrange-button").click();

    // Generate PDF button should be available
    cy.getByTestId("generate-pdf-button").should("exist").and("not.be.disabled");
  });

  it("supports multiple image uploads", () => {
    // Upload first image
    cy.getByTestId("add-more-images-button").click();
    attachDummyImageViaGlobalInput();
    cy.contains("Successfully processed", { timeout: 20000 });

    // Upload second image
    cy.getByTestId("add-more-images-button").click();
    attachDummyImageViaGlobalInput();
    cy.contains("Successfully processed", { timeout: 20000 });

    // Should show 2 of 2 images
    cy.getByTestId("available-images-count", { timeout: 20000 }).should(
      "contain",
      "2 of 2",
    );
  });
});
