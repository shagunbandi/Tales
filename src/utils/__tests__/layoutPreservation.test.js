import { describe, it, expect } from "vitest";
import { recalculatePositionsPreservingLayout } from "../fullCoverLayoutUtils.js";
import { getPreviewDimensions } from "../../constants.js";

describe("Layout Preservation Tests", () => {
  const mockSettings = {
    pageSize: "a4",
    orientation: "landscape",
    designStyle: "full_cover",
    pageBorderWidth: 5,
    pictureBorderWidth: 2,
  };

  const mockSettingsNoBorder = {
    ...mockSettings,
    pageBorderWidth: 0,
    pictureBorderWidth: 0,
  };

  describe("recalculatePositionsPreservingLayout", () => {
    it("should preserve rowIndex and colIndex when border is toggled", () => {
      const images = [
        {
          id: 1,
          src: "image1.jpg",
          rowIndex: 0,
          colIndex: 0,
          x: 100,
          y: 100,
          previewWidth: 200,
          previewHeight: 200,
        },
        {
          id: 2,
          src: "image2.jpg",
          rowIndex: 0,
          colIndex: 1,
          x: 300,
          y: 100,
          previewWidth: 200,
          previewHeight: 200,
        },
        {
          id: 3,
          src: "image3.jpg",
          rowIndex: 1,
          colIndex: 0,
          x: 100,
          y: 300,
          previewWidth: 200,
          previewHeight: 200,
        },
      ];

      const { width, height } = getPreviewDimensions(mockSettings);
      const pageData = { enablePageBorder: true };

      const result = recalculatePositionsPreservingLayout(
        images,
        width,
        height,
        mockSettings,
        pageData
      );

      // Check that rowIndex and colIndex are preserved
      expect(result[0].rowIndex).toBe(0);
      expect(result[0].colIndex).toBe(0);
      expect(result[1].rowIndex).toBe(0);
      expect(result[1].colIndex).toBe(1);
      expect(result[2].rowIndex).toBe(1);
      expect(result[2].colIndex).toBe(0);

      // Check that positions and dimensions were recalculated
      expect(result[0].x).not.toBe(images[0].x);
      expect(result[0].y).not.toBe(images[0].y);
      expect(result[0].previewWidth).toBeDefined();
      expect(result[0].previewHeight).toBeDefined();
    });

    it("should adjust dimensions but preserve layout when border is disabled", () => {
      const images = [
        {
          id: 1,
          src: "image1.jpg",
          rowIndex: 0,
          colIndex: 0,
          x: 100,
          y: 100,
          previewWidth: 200,
          previewHeight: 200,
        },
        {
          id: 2,
          src: "image2.jpg",
          rowIndex: 0,
          colIndex: 1,
          x: 300,
          y: 100,
          previewWidth: 200,
          previewHeight: 200,
        },
      ];

      const { width, height } = getPreviewDimensions(mockSettingsNoBorder);
      const pageDataWithBorder = { enablePageBorder: true };
      const pageDataNoBorder = { enablePageBorder: false };

      const resultWithBorder = recalculatePositionsPreservingLayout(
        images,
        width,
        height,
        mockSettings,
        pageDataWithBorder
      );

      const resultNoBorder = recalculatePositionsPreservingLayout(
        images,
        width,
        height,
        mockSettingsNoBorder,
        pageDataNoBorder
      );

      // rowIndex and colIndex should be preserved in both cases
      expect(resultWithBorder[0].rowIndex).toBe(0);
      expect(resultWithBorder[0].colIndex).toBe(0);
      expect(resultNoBorder[0].rowIndex).toBe(0);
      expect(resultNoBorder[0].colIndex).toBe(0);

      // Dimensions should be different due to border changes
      expect(resultWithBorder[0].previewWidth).not.toBe(
        resultNoBorder[0].previewWidth
      );
    });

    it("should preserve gridSpan data for hardcoded layouts", () => {
      const images = [
        {
          id: 1,
          src: "image1.jpg",
          rowIndex: 0,
          colIndex: 0,
          x: 100,
          y: 100,
          previewWidth: 400,
          previewHeight: 200,
          gridSpan: {
            rowStart: 0,
            rowEnd: 1,
            colStart: 0,
            colEnd: 2,
          },
        },
        {
          id: 2,
          src: "image2.jpg",
          rowIndex: 1,
          colIndex: 0,
          x: 100,
          y: 300,
          previewWidth: 200,
          previewHeight: 200,
          gridSpan: {
            rowStart: 1,
            rowEnd: 2,
            colStart: 0,
            colEnd: 1,
          },
        },
      ];

      const { width, height } = getPreviewDimensions(mockSettings);
      const pageData = { enablePageBorder: true };

      const result = recalculatePositionsPreservingLayout(
        images,
        width,
        height,
        mockSettings,
        pageData
      );

      // Check that gridSpan is preserved
      expect(result[0].gridSpan).toEqual({
        rowStart: 0,
        rowEnd: 1,
        colStart: 0,
        colEnd: 2,
      });
      expect(result[1].gridSpan).toEqual({
        rowStart: 1,
        rowEnd: 2,
        colStart: 0,
        colEnd: 1,
      });

      // Check that rowIndex and colIndex are preserved
      expect(result[0].rowIndex).toBe(0);
      expect(result[0].colIndex).toBe(0);
      expect(result[1].rowIndex).toBe(1);
      expect(result[1].colIndex).toBe(0);
    });

    it("should handle empty images array", () => {
      const { width, height } = getPreviewDimensions(mockSettings);
      const pageData = { enablePageBorder: true };

      const result = recalculatePositionsPreservingLayout(
        [],
        width,
        height,
        mockSettings,
        pageData
      );

      expect(result).toEqual([]);
    });
  });
});

