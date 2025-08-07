// E2E Tests for Save/Load Album Functionality
// Tests cover: album creation, saving, loading, management, auto-save, and data persistence

describe("Save/Load Album Functionality", () => {
  beforeEach(() => {
    cy.clearAllData();
    cy.visitTales();
  });

  describe("Album Creation and Saving", () => {
    beforeEach(() => {
      // Setup: Create a basic layout
      cy.navigateToTab("upload");
      cy.uploadTestImages(4);
      cy.selectDesignStyle("classic");
      cy.navigateToTab("settings");
      cy.get('[data-testid="page-margin-input"]').clear().type("25");
      cy.get('[data-testid="color-Pastel Green"]').click();
      cy.get('[data-testid="next-to-design-button"]').click();

      // Arrange images
      cy.dragImageToPage(0, 0);
      cy.dragImageToPage(0, 0);
      cy.addNewPage();
      cy.dragImageToPage(0, 1);
    });

    it("should save album with basic information", () => {
      cy.saveAsAlbum("My First Album");

      // Should show success message
      cy.verifyToastMessage("Album saved successfully!");

      // Should update header to show saved album name
      cy.get('[data-testid="current-album-name"]').should(
        "contain",
        "My First Album",
      );
    });

    it("should save album with name and description", () => {
      cy.get('[data-testid="save-album-button"]').click();
      cy.get('[data-testid="album-name-input"]').type("Photo Collection 2024");
      cy.get('[data-testid="album-description-input"]').type(
        "My vacation photos from summer 2024",
      );
      cy.get('[data-testid="confirm-save-button"]').click();

      cy.verifyToastMessage("Album saved successfully!");
      cy.get('[data-testid="current-album-name"]').should(
        "contain",
        "Photo Collection 2024",
      );
    });

    it("should validate album name requirements", () => {
      cy.get('[data-testid="save-album-button"]').click();

      // Try to save without name
      cy.get('[data-testid="confirm-save-button"]').click();
      cy.verifyErrorMessage("Album name is required");

      // Try with very long name
      cy.get('[data-testid="album-name-input"]').type("A".repeat(101));
      cy.get('[data-testid="confirm-save-button"]').click();
      cy.verifyErrorMessage("Album name must be 100 characters or less");

      // Valid name should work
      cy.get('[data-testid="album-name-input"]')
        .clear()
        .type("Valid Album Name");
      cy.get('[data-testid="confirm-save-button"]').click();
      cy.verifyToastMessage("Album saved successfully!");
    });

    it("should handle special characters in album names", () => {
      const specialName = "Album #1: Photos & Memories (2024)!";
      cy.saveAsAlbum(specialName);

      cy.verifyToastMessage("Album saved successfully!");
      cy.get('[data-testid="current-album-name"]').should(
        "contain",
        specialName,
      );
    });

    it("should save complete album state including settings", () => {
      cy.saveAsAlbum("Complete State Album");

      // Navigate away and back
      cy.navigateToTab("albums");
      cy.loadAlbum("Complete State Album");

      // Should restore all state including settings
      cy.navigateToTab("settings");
      cy.verifySettingsValue("pageMargin", "25");
      cy.get('[data-testid="color-Pastel Green"]').should(
        "have.class",
        "ring-2",
      );

      // Should restore image arrangement
      cy.navigateToTab("design");
      cy.verifyPageLayout(0, 2);
      cy.verifyPageLayout(1, 1);
    });
  });

  describe("Album Loading", () => {
    beforeEach(() => {
      // Create and save a test album
      cy.navigateToTab("upload");
      cy.uploadTestImages(3);
      cy.selectDesignStyle("classic");
      cy.navigateToTab("settings");
      cy.get('[data-testid="color-Sky Blue"]').click();
      cy.get('[data-testid="next-to-design-button"]').click();
      cy.dragImageToPage(0, 0);
      cy.dragImageToPage(0, 0);
      cy.saveAsAlbum("Test Load Album", "Test album for loading tests");
    });

    it("should display saved albums in albums list", () => {
      cy.navigateToTab("albums");

      cy.get('[data-testid="album-list"]').within(() => {
        cy.contains("Test Load Album").should("be.visible");
        cy.contains("Test album for loading tests").should("be.visible");
      });
    });

    it("should load album and restore complete state", () => {
      cy.navigateToTab("albums");
      cy.loadAlbum("Test Load Album");

      // Should navigate to design tab
      cy.get('[data-testid="tab-navigation"]')
        .contains("4. Design Layout")
        .should("have.class", "font-semibold");

      // Should restore images
      cy.verifyImageCount(3);
      cy.verifyPageLayout(0, 2);

      // Should restore settings
      cy.navigateToTab("settings");
      cy.get('[data-testid="color-Sky Blue"]').should("have.class", "ring-2");
    });

    it("should show album metadata when loading", () => {
      cy.navigateToTab("albums");

      cy.get('[data-testid="album-list"]').within(() => {
        cy.contains("Test Load Album")
          .parent()
          .within(() => {
            cy.get('[data-testid="album-image-count"]').should(
              "contain",
              "3 images",
            );
            cy.get('[data-testid="album-created-date"]').should("be.visible");
            cy.get('[data-testid="album-description"]').should(
              "contain",
              "Test album for loading tests",
            );
          });
      });
    });

    it("should handle loading album with missing images gracefully", () => {
      // Simulate corrupted album data
      cy.window().then((win) => {
        const albums = JSON.parse(
          win.localStorage.getItem("tales-albums") || "[]",
        );
        if (albums.length > 0) {
          // Corrupt the image data
          albums[0].images = [];
          win.localStorage.setItem("tales-albums", JSON.stringify(albums));
        }
      });

      cy.navigateToTab("albums");
      cy.loadAlbum("Test Load Album");

      // Should handle gracefully with warning
      cy.verifyToastMessage(
        "Album loaded but some images may be missing",
        "warning",
      );
    });
  });

  describe("Album Management", () => {
    beforeEach(() => {
      // Create multiple test albums
      const albums = [
        { name: "Album One", description: "First test album" },
        { name: "Album Two", description: "Second test album" },
        { name: "Album Three", description: "Third test album" },
      ];

      albums.forEach((album, index) => {
        cy.navigateToTab("upload");
        cy.uploadTestImages(2 + index);
        cy.selectDesignStyle("classic");
        cy.navigateToTab("settings");
        cy.get('[data-testid="next-to-design-button"]').click();
        cy.dragImageToPage(0, 0);
        cy.saveAsAlbum(album.name, album.description);
        cy.clearAllData();
        cy.visitTales();
      });
    });

    it("should display all saved albums", () => {
      cy.navigateToTab("albums");

      cy.get('[data-testid="album-list"]').within(() => {
        cy.contains("Album One").should("be.visible");
        cy.contains("Album Two").should("be.visible");
        cy.contains("Album Three").should("be.visible");
      });
    });

    it("should sort albums by creation date", () => {
      cy.navigateToTab("albums");

      // Should be sorted with newest first (Album Three)
      cy.get('[data-testid="album-list"]').within(() => {
        cy.get('[data-testid^="album-item-"]')
          .first()
          .should("contain", "Album Three");
      });
    });

    it("should allow searching/filtering albums", () => {
      cy.navigateToTab("albums");

      cy.get('[data-testid="album-search-input"]').type("Two");

      cy.get('[data-testid="album-list"]').within(() => {
        cy.contains("Album Two").should("be.visible");
        cy.contains("Album One").should("not.exist");
        cy.contains("Album Three").should("not.exist");
      });

      // Clear search
      cy.get('[data-testid="album-search-input"]').clear();
      cy.get('[data-testid="album-list"]').within(() => {
        cy.contains("Album One").should("be.visible");
      });
    });

    it("should allow deleting albums", () => {
      cy.navigateToTab("albums");

      cy.deleteAlbum("Album Two");

      // Should show confirmation
      cy.verifyToastMessage("Album deleted successfully!");

      // Album should be removed from list
      cy.get('[data-testid="album-list"]').within(() => {
        cy.contains("Album One").should("be.visible");
        cy.contains("Album Two").should("not.exist");
        cy.contains("Album Three").should("be.visible");
      });
    });

    it("should confirm deletion before removing album", () => {
      cy.navigateToTab("albums");

      cy.get('[data-testid="album-list"]')
        .contains("Album One")
        .parent()
        .find('[data-testid="delete-album-button"]')
        .click();

      // Should show confirmation dialog
      cy.get('[data-testid="delete-confirmation-modal"]').should("be.visible");
      cy.get('[data-testid="delete-confirmation-text"]').should(
        "contain",
        "Album One",
      );

      // Cancel deletion
      cy.get('[data-testid="cancel-delete-button"]').click();
      cy.get('[data-testid="delete-confirmation-modal"]').should("not.exist");

      // Album should still exist
      cy.get('[data-testid="album-list"]').within(() => {
        cy.contains("Album One").should("be.visible");
      });
    });
  });

  describe("Album Overwriting and Updates", () => {
    beforeEach(() => {
      // Create initial album
      cy.navigateToTab("upload");
      cy.uploadTestImages(2);
      cy.selectDesignStyle("classic");
      cy.navigateToTab("settings");
      cy.get('[data-testid="next-to-design-button"]').click();
      cy.dragImageToPage(0, 0);
      cy.saveAsAlbum("Updatable Album");
    });

    it("should allow updating existing album", () => {
      // Modify the album
      cy.dragImageToPage(0, 0); // Add another image

      // Save with same name - should offer to update
      cy.get('[data-testid="save-album-button"]').click();
      cy.get('[data-testid="album-name-input"]')
        .clear()
        .type("Updatable Album");
      cy.get('[data-testid="confirm-save-button"]').click();

      // Should ask for confirmation to overwrite
      cy.get('[data-testid="overwrite-confirmation-modal"]').should(
        "be.visible",
      );
      cy.get('[data-testid="confirm-overwrite-button"]').click();

      cy.verifyToastMessage("Album updated successfully!");
    });

    it("should preserve original when declining to overwrite", () => {
      // Modify and try to overwrite
      cy.addNewPage();
      cy.dragImageToPage(0, 1);

      cy.get('[data-testid="save-album-button"]').click();
      cy.get('[data-testid="album-name-input"]')
        .clear()
        .type("Updatable Album");
      cy.get('[data-testid="confirm-save-button"]').click();

      // Decline overwrite
      cy.get('[data-testid="cancel-overwrite-button"]').click();

      // Load original album - should have original state
      cy.navigateToTab("albums");
      cy.loadAlbum("Updatable Album");
      cy.verifyPageLayout(0, 1);
      cy.get('[data-testid^="page-1"]').should("not.exist");
    });

    it("should suggest alternative names when declining overwrite", () => {
      cy.get('[data-testid="save-album-button"]').click();
      cy.get('[data-testid="album-name-input"]')
        .clear()
        .type("Updatable Album");
      cy.get('[data-testid="confirm-save-button"]').click();

      cy.get('[data-testid="cancel-overwrite-button"]').click();

      // Should suggest alternative name
      cy.get('[data-testid="album-name-input"]').should(
        "have.value",
        "Updatable Album (2)",
      );
    });
  });

  describe("Auto-Save Functionality", () => {
    beforeEach(() => {
      // Setup album for auto-save testing
      cy.navigateToTab("upload");
      cy.uploadTestImages(3);
      cy.selectDesignStyle("classic");
      cy.navigateToTab("settings");
      cy.get('[data-testid="next-to-design-button"]').click();
      cy.saveAsAlbum("Auto-Save Test Album");
    });

    it("should show auto-save indicator", () => {
      cy.get('[data-testid="auto-save-indicator"]').should("be.visible");
      cy.get('[data-testid="auto-save-status"]').should(
        "contain",
        "Auto-save enabled",
      );
    });

    it("should auto-save changes periodically", () => {
      // Make a change
      cy.dragImageToPage(0, 0);

      // Should show unsaved changes indicator
      cy.get('[data-testid="unsaved-changes-indicator"]').should("be.visible");

      // Wait for auto-save (mocked to be faster in tests)
      cy.wait(5000); // Auto-save interval in test

      // Should show auto-saved status
      cy.get('[data-testid="auto-save-status"]').should(
        "contain",
        "Auto-saved",
      );
      cy.get('[data-testid="last-save-time"]').should("be.visible");
    });

    it("should not auto-save when no changes made", () => {
      // Wait for potential auto-save period
      cy.wait(5000);

      // Should not show saving indicator
      cy.get('[data-testid="auto-saving-indicator"]').should("not.exist");
    });

    it("should allow manual save to override auto-save", () => {
      // Make changes
      cy.addNewPage();
      cy.dragImageToPage(0, 1);

      // Manual save before auto-save
      cy.get('[data-testid="manual-save-button"]').click();

      cy.verifyToastMessage("Album saved manually!");
      cy.get('[data-testid="last-save-time"]').should("contain", "just now");
    });

    it("should handle auto-save errors gracefully", () => {
      // Simulate storage full or other error
      cy.window().then((win) => {
        cy.stub(win.Storage.prototype, "setItem").throws(
          new Error("Storage full"),
        );
      });

      // Make change to trigger auto-save
      cy.dragImageToPage(0, 0);

      cy.wait(5000);

      // Should show error but not break functionality
      cy.get('[data-testid="auto-save-error"]').should(
        "contain",
        "Auto-save failed",
      );
      cy.get('[data-testid="manual-save-button"]').should("be.visible");
    });
  });

  describe("Data Persistence and Browser Storage", () => {
    it("should persist albums across browser sessions", () => {
      // Create and save album
      cy.navigateToTab("upload");
      cy.uploadTestImages(2);
      cy.selectDesignStyle("classic");
      cy.navigateToTab("settings");
      cy.get('[data-testid="next-to-design-button"]').click();
      cy.saveAsAlbum("Persistent Album");

      // Reload page
      cy.reload();

      // Album should still exist
      cy.navigateToTab("albums");
      cy.get('[data-testid="album-list"]').within(() => {
        cy.contains("Persistent Album").should("be.visible");
      });
    });

    it("should handle localStorage quota exceeded", () => {
      // Fill localStorage near capacity
      cy.window().then((win) => {
        try {
          for (let i = 0; i < 1000; i++) {
            win.localStorage.setItem(`test-${i}`, "x".repeat(1000));
          }
        } catch (e) {
          // Expected when quota is reached
        }
      });

      // Try to save album
      cy.navigateToTab("upload");
      cy.uploadTestImages(2);
      cy.selectDesignStyle("classic");
      cy.navigateToTab("settings");
      cy.get('[data-testid="next-to-design-button"]').click();
      cy.saveAsAlbum("Quota Test Album");

      // Should handle gracefully
      cy.get('[data-testid="storage-warning"]').should(
        "contain",
        "Storage space low",
      );
    });

    it("should validate album data integrity on load", () => {
      // Create album
      cy.navigateToTab("upload");
      cy.uploadTestImages(2);
      cy.selectDesignStyle("classic");
      cy.navigateToTab("settings");
      cy.get('[data-testid="next-to-design-button"]').click();
      cy.saveAsAlbum("Integrity Test Album");

      // Corrupt data
      cy.window().then((win) => {
        const albums = JSON.parse(
          win.localStorage.getItem("tales-albums") || "[]",
        );
        if (albums.length > 0) {
          albums[0].corrupted = true;
          delete albums[0].pages;
          win.localStorage.setItem("tales-albums", JSON.stringify(albums));
        }
      });

      // Try to load
      cy.navigateToTab("albums");
      cy.loadAlbum("Integrity Test Album");

      // Should handle corruption gracefully
      cy.verifyToastMessage("Album data appears corrupted", "warning");
    });
  });

  describe("Album Import/Export", () => {
    it("should allow exporting album data", () => {
      // Create album
      cy.navigateToTab("upload");
      cy.uploadTestImages(2);
      cy.selectDesignStyle("classic");
      cy.navigateToTab("settings");
      cy.get('[data-testid="next-to-design-button"]').click();
      cy.saveAsAlbum("Export Test Album");

      // Export album
      cy.navigateToTab("albums");
      cy.get('[data-testid="album-list"]')
        .contains("Export Test Album")
        .parent()
        .find('[data-testid="export-album-button"]')
        .click();

      // Should download JSON file
      cy.verifyDownload("Export Test Album.json");
    });

    it("should allow importing album data", () => {
      // Create export data
      const albumData = {
        name: "Imported Album",
        description: "Imported from file",
        settings: { designStyle: "classic", pageMargin: 20 },
        pages: [],
        images: [],
      };

      // Import album
      cy.navigateToTab("albums");
      cy.get('[data-testid="import-album-button"]').click();

      // Upload JSON file (simulated)
      cy.get('[data-testid="album-file-input"]').selectFile({
        contents: JSON.stringify(albumData),
        fileName: "imported-album.json",
        mimeType: "application/json",
      });

      // Should import successfully
      cy.verifyToastMessage("Album imported successfully!");
      cy.get('[data-testid="album-list"]').within(() => {
        cy.contains("Imported Album").should("be.visible");
      });
    });
  });

  describe("Album Collaboration Features", () => {
    it("should generate shareable album links", () => {
      // Create album
      cy.navigateToTab("upload");
      cy.uploadTestImages(2);
      cy.selectDesignStyle("classic");
      cy.navigateToTab("settings");
      cy.get('[data-testid="next-to-design-button"]').click();
      cy.saveAsAlbum("Shareable Album");

      // Generate share link
      cy.navigateToTab("albums");
      cy.get('[data-testid="album-list"]')
        .contains("Shareable Album")
        .parent()
        .find('[data-testid="share-album-button"]')
        .click();

      // Should show shareable link
      cy.get('[data-testid="share-link-modal"]').should("be.visible");
      cy.get('[data-testid="share-link-input"]')
        .should("have.value")
        .and("contain", "http");

      // Should allow copying link
      cy.get('[data-testid="copy-link-button"]').click();
      cy.verifyToastMessage("Link copied to clipboard!");
    });
  });
});
