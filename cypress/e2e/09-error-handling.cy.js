// E2E Tests for Error Handling and Edge Cases
// Tests cover: network errors, file corruption, browser limitations, storage issues, and recovery mechanisms

describe("Error Handling and Edge Cases", () => {
  beforeEach(() => {
    cy.clearAllData();
    cy.visitTales();
  });

  describe("File Upload Error Handling", () => {
    it("should handle unsupported file types gracefully", () => {
      cy.navigateToTab("upload");

      // Try to upload unsupported file
      cy.get('input[type="file"]').then((input) => {
        const unsupportedFile = new File(["test content"], "test.txt", {
          type: "text/plain",
        });
        const dt = new DataTransfer();
        dt.items.add(unsupportedFile);
        input[0].files = dt.files;
        input[0].dispatchEvent(new Event("change", { bubbles: true }));
      });

      // Should show error message
      cy.verifyErrorMessage(
        "Unsupported file type. Please upload images only.",
      );
      cy.verifyImageCount(0);
    });

    it("should handle corrupted image files", () => {
      cy.navigateToTab("upload");

      // Upload corrupted image file
      cy.get('input[type="file"]').then((input) => {
        const corruptedFile = new File(["corrupted data"], "corrupt.jpg", {
          type: "image/jpeg",
        });
        const dt = new DataTransfer();
        dt.items.add(corruptedFile);
        input[0].files = dt.files;
        input[0].dispatchEvent(new Event("change", { bubbles: true }));
      });

      cy.verifyErrorMessage("Failed to load image. File may be corrupted.");
    });

    it("should handle extremely large files", () => {
      cy.navigateToTab("upload");

      // Create very large file (simulated)
      cy.window().then((win) => {
        cy.stub(win.File.prototype, "size").value(50 * 1024 * 1024); // 50MB
      });

      cy.uploadSpecificTestImage(400, 300, "#e74c3c", "Large File");

      // Should show warning about large file
      cy.get('[data-testid="large-file-warning"]').should(
        "contain",
        "Large file detected",
      );
      cy.verifyToastMessage("Large images may affect performance", "warning");
    });

    it("should handle upload interruptions", () => {
      cy.navigateToTab("upload");

      // Start upload and simulate network failure
      cy.uploadTestImages(5);

      // Simulate network interruption during processing
      cy.window().then((win) => {
        cy.stub(win, "FileReader").throws(new Error("Network error"));
      });

      // Should show error and allow retry
      cy.get('[data-testid="upload-error"]').should("be.visible");
      cy.get('[data-testid="retry-upload-button"]').click();

      // Should attempt retry
      cy.verifyToastMessage("Retrying upload...");
    });

    it("should handle simultaneous upload limit", () => {
      cy.navigateToTab("upload");

      // Try to upload many files simultaneously
      cy.get('input[type="file"]').then((input) => {
        const files = [];
        for (let i = 0; i < 50; i++) {
          const canvas = document.createElement("canvas");
          canvas.width = 100;
          canvas.height = 100;
          canvas.toBlob((blob) => {
            files.push(
              new File([blob], `image-${i}.jpg`, { type: "image/jpeg" }),
            );
          });
        }

        const dt = new DataTransfer();
        files.forEach((file) => dt.items.add(file));
        input[0].files = dt.files;
        input[0].dispatchEvent(new Event("change", { bubbles: true }));
      });

      // Should queue uploads and show progress
      cy.get('[data-testid="upload-queue"]').should("be.visible");
      cy.get('[data-testid="queue-status"]').should(
        "contain",
        "Processing in batches",
      );
    });
  });

  describe("Memory and Performance Error Handling", () => {
    it("should handle memory limitations during image processing", () => {
      // Simulate low memory condition
      cy.window().then((win) => {
        const originalCreateCanvas = win.document.createElement;
        cy.stub(win.document, "createElement").callsFake((tagName) => {
          if (tagName === "canvas") {
            throw new Error("Insufficient memory for canvas creation");
          }
          return originalCreateCanvas.call(win.document, tagName);
        });
      });

      cy.navigateToTab("upload");
      cy.uploadSpecificTestImage(400, 300, "#e74c3c", "Memory Test");

      // Should handle gracefully
      cy.verifyErrorMessage("Insufficient memory to process image");
      cy.get('[data-testid="memory-cleanup-suggestion"]').should(
        "contain",
        "Try refreshing the page",
      );
    });

    it("should handle browser storage quota exceeded", () => {
      // Fill up localStorage
      cy.window().then((win) => {
        cy.stub(win.Storage.prototype, "setItem").throws(
          new DOMException("QuotaExceededError"),
        );
      });

      // Try to save album
      cy.navigateToTab("upload");
      cy.uploadTestImages(2);
      cy.selectDesignStyle("classic");
      cy.navigateToTab("settings");
      cy.get('[data-testid="next-to-design-button"]').click();
      cy.saveAsAlbum("Storage Test");

      // Should show storage error
      cy.verifyErrorMessage("Storage quota exceeded");
      cy.get('[data-testid="storage-cleanup-options"]').should("be.visible");
    });

    it("should handle canvas rendering failures", () => {
      cy.navigateToTab("upload");
      cy.uploadTestImages(3);
      cy.selectDesignStyle("classic");
      cy.navigateToTab("settings");
      cy.get('[data-testid="next-to-design-button"]').click();

      // Simulate canvas failure during PDF generation
      cy.window().then((win) => {
        cy.stub(win.HTMLCanvasElement.prototype, "getContext").returns(null);
      });

      cy.generatePDF();

      // Should handle gracefully
      cy.verifyErrorMessage("PDF generation failed due to rendering error");
      cy.get('[data-testid="fallback-options"]').should("be.visible");
    });
  });

  describe("Network and Connectivity Errors", () => {
    it("should handle offline conditions", () => {
      // Simulate offline mode
      cy.window().then((win) => {
        Object.defineProperty(win.navigator, "onLine", {
          writable: true,
          value: false,
        });
        win.dispatchEvent(new Event("offline"));
      });

      // Should show offline indicator
      cy.get('[data-testid="offline-indicator"]').should("be.visible");
      cy.get('[data-testid="offline-message"]').should(
        "contain",
        "You are currently offline",
      );

      // Try to perform online-dependent action
      cy.navigateToTab("upload");
      cy.uploadTestImages(2);

      // Should still work for local operations
      cy.verifyImageCount(2);

      // But warn about sync issues
      cy.get('[data-testid="sync-warning"]').should(
        "contain",
        "Changes will sync when online",
      );
    });

    it("should recover when connection is restored", () => {
      // Start offline
      cy.window().then((win) => {
        Object.defineProperty(win.navigator, "onLine", {
          writable: true,
          value: false,
        });
      });

      cy.visitTales();

      // Go online
      cy.window().then((win) => {
        Object.defineProperty(win.navigator, "onLine", {
          writable: true,
          value: true,
        });
        win.dispatchEvent(new Event("online"));
      });

      // Should show connection restored
      cy.verifyToastMessage("Connection restored!");
      cy.get('[data-testid="offline-indicator"]').should("not.exist");
    });
  });

  describe("Data Corruption and Recovery", () => {
    it("should handle corrupted localStorage data", () => {
      // Corrupt localStorage data
      cy.window().then((win) => {
        win.localStorage.setItem("tales-albums", "corrupted json data {");
        win.localStorage.setItem("tales-settings", "invalid");
      });

      cy.visitTales();

      // Should handle corruption gracefully
      cy.get('[data-testid="data-corruption-warning"]').should("be.visible");
      cy.get('[data-testid="reset-data-button"]').click();

      // Should reset to clean state
      cy.verifyToastMessage("Data reset successfully");
      cy.get('[data-testid="tab-navigation"]').should("be.visible");
    });

    it("should provide data backup and restore options", () => {
      // Create some data
      cy.navigateToTab("upload");
      cy.uploadTestImages(2);
      cy.selectDesignStyle("classic");
      cy.navigateToTab("settings");
      cy.get('[data-testid="next-to-design-button"]').click();
      cy.saveAsAlbum("Backup Test");

      // Access backup options
      cy.navigateToTab("albums");
      cy.get('[data-testid="backup-options"]').click();

      // Create backup
      cy.get('[data-testid="create-backup-button"]').click();
      cy.verifyToastMessage("Backup created successfully");

      // Corrupt data
      cy.clearAllData();

      // Restore from backup
      cy.get('[data-testid="restore-backup-button"]').click();
      cy.get('[data-testid="select-backup-file"]').selectFile(
        "tales-backup.json",
      );
      cy.get('[data-testid="confirm-restore-button"]').click();

      cy.verifyToastMessage("Data restored from backup");
    });

    it("should validate album data integrity on load", () => {
      // Create album with specific structure
      cy.navigateToTab("upload");
      cy.uploadTestImages(2);
      cy.selectDesignStyle("classic");
      cy.navigateToTab("settings");
      cy.get('[data-testid="next-to-design-button"]').click();
      cy.saveAsAlbum("Integrity Test");

      // Tamper with saved data
      cy.window().then((win) => {
        const albums = JSON.parse(win.localStorage.getItem("tales-albums"));
        if (albums && albums.length > 0) {
          delete albums[0].pages;
          albums[0].settings = null;
          win.localStorage.setItem("tales-albums", JSON.stringify(albums));
        }
      });

      // Try to load corrupted album
      cy.navigateToTab("albums");
      cy.loadAlbum("Integrity Test");

      // Should detect corruption and offer repair
      cy.get('[data-testid="corruption-detected"]').should("be.visible");
      cy.get('[data-testid="repair-album-button"]').click();

      cy.verifyToastMessage("Album repaired with default settings");
    });
  });

  describe("Browser Compatibility Issues", () => {
    it("should handle unsupported browser features gracefully", () => {
      // Simulate missing FileReader API
      cy.window().then((win) => {
        delete win.FileReader;
      });

      cy.navigateToTab("upload");

      // Should show compatibility warning
      cy.get('[data-testid="compatibility-warning"]').should("be.visible");
      cy.get('[data-testid="browser-support-info"]').should(
        "contain",
        "upgrade your browser",
      );
    });

    it("should handle missing canvas support", () => {
      // Simulate no canvas support
      cy.window().then((win) => {
        cy.stub(win.document, "createElement").callsFake((tagName) => {
          if (tagName === "canvas") {
            return null;
          }
          return win.document.createElement.wrappedMethod.call(
            win.document,
            tagName,
          );
        });
      });

      cy.visitTales();

      // Should show fallback UI
      cy.get('[data-testid="canvas-fallback"]').should("be.visible");
      cy.get('[data-testid="feature-limitation-notice"]').should(
        "contain",
        "Limited functionality",
      );
    });

    it("should handle drag and drop API unavailability", () => {
      // Simulate no drag and drop support
      cy.window().then((win) => {
        delete win.DragEvent;
        delete win.DataTransfer;
      });

      cy.navigateToTab("upload");
      cy.uploadTestImages(2);
      cy.selectDesignStyle("classic");
      cy.navigateToTab("settings");
      cy.get('[data-testid="next-to-design-button"]').click();

      // Should show alternative UI for moving images
      cy.get('[data-testid="drag-fallback-buttons"]').should("be.visible");
      cy.get('[data-testid="move-image-controls"]').should("be.visible");
    });
  });

  describe("User Input Validation and Sanitization", () => {
    it("should sanitize album names to prevent XSS", () => {
      cy.navigateToTab("upload");
      cy.uploadTestImages(2);
      cy.selectDesignStyle("classic");
      cy.navigateToTab("settings");
      cy.get('[data-testid="next-to-design-button"]').click();

      // Try malicious album name
      const maliciousName = '<script>alert("xss")</script>Test Album';
      cy.saveAsAlbum(maliciousName);

      // Should sanitize the name
      cy.get('[data-testid="current-album-name"]').should(
        "not.contain",
        "<script>",
      );
      cy.get('[data-testid="current-album-name"]').should(
        "contain",
        "Test Album",
      );
    });

    it("should validate settings input ranges strictly", () => {
      cy.navigateToTab("upload");
      cy.uploadTestImages(2);
      cy.selectDesignStyle("classic");
      cy.navigateToTab("settings");

      // Try extreme values
      cy.get('[data-testid="page-margin-input"]').clear().type("999999");
      cy.get('[data-testid="page-margin-input"]').blur();

      // Should enforce maximum
      cy.get('[data-testid="page-margin-input"]').should("have.value", "50");
      cy.verifyErrorMessage("Value exceeds maximum allowed");

      // Try negative values
      cy.get('[data-testid="image-gap-input"]').clear().type("-100");
      cy.get('[data-testid="image-gap-input"]').blur();

      // Should enforce minimum
      cy.get('[data-testid="image-gap-input"]').should("have.value", "0");
    });

    it("should handle special characters in file names", () => {
      cy.navigateToTab("upload");

      // Upload file with special characters
      cy.get('input[type="file"]').then((input) => {
        const canvas = document.createElement("canvas");
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#3498db";
        ctx.fillRect(0, 0, 200, 200);

        canvas.toBlob((blob) => {
          const file = new File([blob], "test-file-with-émojis-🎨.jpg", {
            type: "image/jpeg",
          });
          const dt = new DataTransfer();
          dt.items.add(file);
          input[0].files = dt.files;
          input[0].dispatchEvent(new Event("change", { bubbles: true }));
        });
      });

      // Should handle special characters gracefully
      cy.verifyImageCount(1);
      cy.get('[data-testid="file-name-display"]').should(
        "contain",
        "test-file",
      );
    });
  });

  describe("Concurrent Operation Conflicts", () => {
    it("should handle simultaneous save operations", () => {
      cy.navigateToTab("upload");
      cy.uploadTestImages(2);
      cy.selectDesignStyle("classic");
      cy.navigateToTab("settings");
      cy.get('[data-testid="next-to-design-button"]').click();

      // Start two save operations simultaneously
      cy.get('[data-testid="save-album-button"]').click();
      cy.get('[data-testid="album-name-input"]').type("Concurrent Test 1");
      cy.get('[data-testid="confirm-save-button"]').click();

      // Immediately try another save
      cy.get('[data-testid="save-album-button"]').click();
      cy.get('[data-testid="album-name-input"]')
        .clear()
        .type("Concurrent Test 2");
      cy.get('[data-testid="confirm-save-button"]').click();

      // Should handle conflict gracefully
      cy.get('[data-testid="concurrent-operation-warning"]').should(
        "be.visible",
      );
      cy.verifyToastMessage("Previous save in progress. Please wait.");
    });

    it("should handle PDF generation during auto-save", () => {
      cy.navigateToTab("upload");
      cy.uploadTestImages(3);
      cy.selectDesignStyle("classic");
      cy.navigateToTab("settings");
      cy.get('[data-testid="next-to-design-button"]').click();

      // Save album to enable auto-save
      cy.saveAsAlbum("PDF Test Album");

      // Make change to trigger auto-save
      cy.dragImageToPage(0, 0);

      // Immediately try to generate PDF
      cy.generatePDF();

      // Should coordinate operations
      cy.get('[data-testid="operation-coordination"]').should(
        "contain",
        "Waiting for save to complete",
      );
    });

    it("should prevent data races in layout operations", () => {
      cy.navigateToTab("upload");
      cy.uploadTestImages(4);
      cy.selectDesignStyle("classic");
      cy.navigateToTab("settings");
      cy.get('[data-testid="next-to-design-button"]').click();

      // Start auto-arrange
      cy.get('[data-testid="auto-arrange-button"]').click();

      // Immediately try manual drag operation
      cy.dragImageToPage(0, 0);

      // Should prevent conflicting operations
      cy.get('[data-testid="operation-blocked"]').should(
        "contain",
        "Auto-arrangement in progress",
      );
    });
  });

  describe("Recovery and Graceful Degradation", () => {
    it("should provide fallback when advanced features fail", () => {
      // Disable advanced canvas features
      cy.window().then((win) => {
        cy.stub(win.HTMLCanvasElement.prototype, "toDataURL").throws(
          new Error("Canvas export failed"),
        );
      });

      cy.navigateToTab("upload");
      cy.uploadTestImages(2);
      cy.selectDesignStyle("classic");
      cy.navigateToTab("settings");
      cy.get('[data-testid="next-to-design-button"]').click();

      // Try to generate PDF
      cy.generatePDF();

      // Should offer alternative
      cy.get('[data-testid="fallback-pdf-option"]').should("be.visible");
      cy.get('[data-testid="download-individual-images-button"]').click();

      cy.verifyToastMessage("Downloaded individual images as fallback");
    });

    it("should maintain core functionality during partial failures", () => {
      // Simulate failure in non-critical feature
      cy.window().then((win) => {
        cy.stub(win.console, "error").throws(
          new Error("Logging service unavailable"),
        );
      });

      // Core functionality should still work
      cy.navigateToTab("upload");
      cy.uploadTestImages(2);
      cy.selectDesignStyle("classic");
      cy.navigateToTab("settings");
      cy.get('[data-testid="next-to-design-button"]').click();

      // Main features should be unaffected
      cy.dragImageToPage(0, 0);
      cy.verifyPageLayout(0, 1);
      cy.saveAsAlbum("Partial Failure Test");
      cy.verifyToastMessage("Album saved successfully!");
    });

    it("should guide users through error recovery", () => {
      // Simulate critical error
      cy.window().then((win) => {
        cy.stub(win, "localStorage").value(null);
      });

      cy.visitTales();

      // Should show recovery wizard
      cy.get('[data-testid="error-recovery-wizard"]').should("be.visible");
      cy.get('[data-testid="recovery-step-1"]').should(
        "contain",
        "Storage issue detected",
      );

      // Follow recovery steps
      cy.get('[data-testid="try-refresh-button"]').click();

      // Should guide through recovery process
      cy.get('[data-testid="recovery-progress"]').should("be.visible");
    });
  });

  describe("Performance Monitoring and Alerts", () => {
    it("should warn about performance impacts", () => {
      // Upload many large images
      cy.navigateToTab("upload");

      for (let i = 0; i < 10; i++) {
        cy.uploadSpecificTestImage(2000, 1500, "#e74c3c", `Large Image ${i}`);
      }

      // Should show performance warning
      cy.get('[data-testid="performance-warning"]').should("be.visible");
      cy.get('[data-testid="memory-usage-indicator"]').should(
        "contain",
        "High memory usage",
      );

      // Offer optimization suggestions
      cy.get('[data-testid="optimization-suggestions"]').should(
        "contain",
        "Consider reducing image sizes",
      );
    });

    it("should monitor and report slow operations", () => {
      // Simulate slow operation
      cy.navigateToTab("upload");
      cy.uploadTestImages(5);
      cy.selectDesignStyle("classic");
      cy.navigateToTab("settings");
      cy.get('[data-testid="next-to-design-button"]').click();

      // Slow down PDF generation artificially
      cy.window().then((win) => {
        const originalSetTimeout = win.setTimeout;
        cy.stub(win, "setTimeout").callsFake((callback, delay) => {
          return originalSetTimeout(callback, delay * 10); // 10x slower
        });
      });

      cy.generatePDF();

      // Should detect slow operation
      cy.get('[data-testid="slow-operation-detected"]', {
        timeout: 5000,
      }).should("be.visible");
      cy.get('[data-testid="performance-tip"]').should(
        "contain",
        "This is taking longer than usual",
      );
    });
  });
});
