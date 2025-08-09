// I will create Cypress tests for core flows using data-testids.

const createAlbumAndGoToDesign = (name = "E2E Album") => {
  cy.getByTestId("create-new-album-button").click();
  cy.getByTestId("create-album-modal").should("be.visible");
  cy.getByTestId("album-name-input").type(name);
  cy.getByTestId("create-album-confirm").click();
  cy.getByTestId("design-style-tab").should("exist");
  cy.getByTestId("design-style-next-button").click();
  cy.getByTestId("settings-tab").should("exist");
  cy.getByTestId("settings-next-button").click();
  cy.getByTestId("design-tab").should("exist");
};

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
    // Ensure we're on albums tab
    cy.getByTestId("albums-tab").should("exist");
  });

  it("creates a new album and navigates through design style and settings", () => {
    createAlbumAndGoToDesign("My First Album");
  });

  it("uploads images via the hidden global input and arranges on pages", () => {
    createAlbumAndGoToDesign("Upload Test Album");

    // Upload one image
    attachDummyImageViaGlobalInput();

    // Wait for processing success toast globally
    cy.contains("Successfully processed", { timeout: 20000 });

    // Check available images counter increments to 1 of 1
    cy.getByTestId("available-images-count", { timeout: 20000 }).should("contain", "1 of 1");

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

  it("saves album and shows Generate PDF button", () => {
    createAlbumAndGoToDesign("PDF Album");
    attachDummyImageViaGlobalInput();

    cy.contains("Successfully processed", { timeout: 20000 });

    cy.getByTestId("available-images-count", { timeout: 20000 }).should("contain", "1 of 1");

    cy.getByTestId("auto-arrange-button").click();

    // Save album
    cy.getByTestId("save-album-button").click();
    cy.getByTestId("save-album-modal").should("be.visible");
    cy.getByTestId("save-album-name-input").clear().type("Saved Album");
    cy.getByTestId("save-album-confirm").click();

    cy.getByTestId("generate-pdf-button").should("exist");
  });
}); 