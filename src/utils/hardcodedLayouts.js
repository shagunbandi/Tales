/**
 * Hardcoded layout configurations for full page layouts
 * Supports grid-based layouts for different numbers of images across different paper sizes
 * NOTE: Layouts with overlapping positions or excessive empty spaces have been filtered out
 */

const HARDCODED_LAYOUTS_RAW = {
  // A4 layouts (297mm x 210mm)
  A4: {
    // 1 image - single large image covering full page
    1: [
      {
        id: "1-fullpage",
        name: "Full Page",
        grid: { rows: 1, cols: 1 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 }
        ]
      }
    ],

    // 2 images - various splits
    2: [
      {
        id: "2-horizontal",
        name: "Side by Side",
        grid: { rows: 1, cols: 2 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 0, col: 1, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "2-vertical",
        name: "Top and Bottom",
        grid: { rows: 2, cols: 1 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 1, col: 0, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "2-70-30",
        name: "70/30 Split",
        grid: { rows: 1, cols: 10 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 7 },
          { imageIndex: 1, row: 0, col: 7, rowSpan: 1, colSpan: 3 }
        ]
      },
      {
        id: "2-30-70",
        name: "30/70 Split",
        grid: { rows: 1, cols: 10 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 3 },
          { imageIndex: 1, row: 0, col: 3, rowSpan: 1, colSpan: 7 }
        ]
      },
      {
        id: "2-60-40",
        name: "60/40 Split",
        grid: { rows: 1, cols: 5 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 3 },
          { imageIndex: 1, row: 0, col: 3, rowSpan: 1, colSpan: 2 }
        ]
      },
      {
        id: "2-40-60",
        name: "40/60 Split",
        grid: { rows: 1, cols: 5 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 2 },
          { imageIndex: 1, row: 0, col: 2, rowSpan: 1, colSpan: 3 }
        ]
      },
      {
        id: "2-tall-60-40",
        name: "Tall 60/40",
        grid: { rows: 5, cols: 1 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 3, colSpan: 1 },
          { imageIndex: 1, row: 3, col: 0, rowSpan: 2, colSpan: 1 }
        ]
      },
      {
        id: "2-tall-40-60",
        name: "Tall 40/60",
        grid: { rows: 5, cols: 1 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 2, colSpan: 1 },
          { imageIndex: 1, row: 2, col: 0, rowSpan: 3, colSpan: 1 }
        ]
      },
      {
        id: "2-vertical-2-1",
        name: "2/1 Vertical",
        grid: { rows: 3, cols: 3 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 3, colSpan: 2 },
          { imageIndex: 1, row: 0, col: 2, rowSpan: 3, colSpan: 1 }
        ]
      },
      {
        id: "2-vertical-1-2",
        name: "1/2 Vertical",
        grid: { rows: 3, cols: 3 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 3, colSpan: 1 },
          { imageIndex: 1, row: 0, col: 1, rowSpan: 3, colSpan: 2 }
        ]
      },
      {
        id: "2-horizontal-2-1",
        name: "2/1 Horizontal",
        grid: { rows: 3, cols: 3 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 2, colSpan: 3 },
          { imageIndex: 1, row: 2, col: 0, rowSpan: 1, colSpan: 3 }
        ]
      },
      {
        id: "2-horizontal-1-2",
        name: "1/2 Horizontal",
        grid: { rows: 3, cols: 3 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 3 },
          { imageIndex: 1, row: 1, col: 0, rowSpan: 2, colSpan: 3 }
        ]
      }
    ],

    // 3 images - L-shapes and strips
    3: [
      {
        id: "3-large-left",
        name: "Large Left + 2 Right",
        grid: { rows: 2, cols: 2 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 2, colSpan: 1 },
          { imageIndex: 1, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 1, col: 1, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "3-large-right",
        name: "2 Left + Large Right",
        grid: { rows: 2, cols: 2 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 0, col: 1, rowSpan: 2, colSpan: 1 }
        ]
      },
      {
        id: "3-large-top",
        name: "Large Top + 2 Bottom",
        grid: { rows: 2, cols: 2 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 2 },
          { imageIndex: 1, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 1, col: 1, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "3-large-bottom",
        name: "2 Top + Large Bottom",
        grid: { rows: 2, cols: 2 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 1, col: 0, rowSpan: 1, colSpan: 2 }
        ]
      },
      {
        id: "3-strip",
        name: "3 in a Row",
        grid: { rows: 1, cols: 3 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 0, col: 2, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "3-column",
        name: "3 in a Column",
        grid: { rows: 3, cols: 1 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 2, col: 0, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "3-columns-2x3",
        name: "3 Tall Columns",
        grid: { rows: 2, cols: 3 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 2, colSpan: 1 },
          { imageIndex: 1, row: 0, col: 1, rowSpan: 2, colSpan: 1 },
          { imageIndex: 2, row: 0, col: 2, rowSpan: 2, colSpan: 1 }
        ]
      },
      {
        id: "3-rows-3x2",
        name: "3 Wide Strips",
        grid: { rows: 3, cols: 2 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 2 },
          { imageIndex: 1, row: 1, col: 0, rowSpan: 1, colSpan: 2 },
          { imageIndex: 2, row: 2, col: 0, rowSpan: 1, colSpan: 2 }
        ]
      },
      {
        id: "3-large-top-left-2-bottom",
        name: "Large Top-Left + 2 Bottom",
        grid: { rows: 3, cols: 2 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 2, colSpan: 2 }, // Image 1 - Large top (2 rows, 2 cols)
          { imageIndex: 1, row: 2, col: 0, rowSpan: 1, colSpan: 1 }, // Image 2 - Bottom-left
          { imageIndex: 2, row: 2, col: 1, rowSpan: 1, colSpan: 1 }  // Image 3 - Bottom-right
        ]
      },
      {
        id: "3-large-tall-top-2-bottom",
        name: "Large Tall Top + 2 Bottom",
        grid: { rows: 5, cols: 2 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 3, colSpan: 2 }, // Image 1 - Large tall top (3 rows, 2 cols)
          { imageIndex: 1, row: 3, col: 0, rowSpan: 2, colSpan: 1 }, // Image 2 - Bottom-left (2 rows)
          { imageIndex: 2, row: 3, col: 1, rowSpan: 2, colSpan: 1 }  // Image 3 - Bottom-right (2 rows)
        ]
      }
    ],

    // 4 images - squares and rectangles
    4: [
      {
        id: "4-quad",
        name: "2x2 Grid",
        grid: { rows: 2, cols: 2 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 1, col: 1, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "4-strip",
        name: "4 in a Row",
        grid: { rows: 1, cols: 4 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 0, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 0, col: 3, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "4-column",
        name: "4 in a Column",
        grid: { rows: 4, cols: 1 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 2, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 3, col: 0, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "4-large-left",
        name: "Large Left + 3 Right",
        grid: { rows: 3, cols: 2 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 3, colSpan: 1 },
          { imageIndex: 1, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 1, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 2, col: 1, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "4-large-left-75-25",
        name: "Large Left 75% + 3 Right",
        grid: { rows: 3, cols: 4 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 3, colSpan: 3 },
          { imageIndex: 1, row: 0, col: 3, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 1, col: 3, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 2, col: 3, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "4-large-right",
        name: "3 Left + Large Right",
        grid: { rows: 3, cols: 2 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 2, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 0, col: 1, rowSpan: 3, colSpan: 1 }
        ]
      },
      {
        id: "4-large-right-75-25",
        name: "3 Left + Large Right 75%",
        grid: { rows: 3, cols: 4 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 2, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 0, col: 1, rowSpan: 3, colSpan: 3 }
        ]
      },
      {
        id: "4-large-top",
        name: "Large Top + 3 Bottom",
        grid: { rows: 2, cols: 3 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 3 },
          { imageIndex: 1, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 1, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 1, col: 2, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "4-large-bottom",
        name: "3 Top + Large Bottom",
        grid: { rows: 2, cols: 3 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 0, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 1, col: 0, rowSpan: 1, colSpan: 3 }
        ]
      },
      {
        id: "4-large-left-3-small",
        name: "Large Left 2x3 + 3 Small",
        grid: { rows: 2, cols: 6 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 2, colSpan: 3 },
          { imageIndex: 1, row: 0, col: 3, rowSpan: 2, colSpan: 1 },
          { imageIndex: 2, row: 0, col: 4, rowSpan: 2, colSpan: 1 },
          { imageIndex: 3, row: 0, col: 5, rowSpan: 2, colSpan: 1 }
        ]
      },
      {
        id: "4-large-right-3-small",
        name: "3 Small + Large Right 2x3",
        grid: { rows: 2, cols: 6 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 2, colSpan: 1 },
          { imageIndex: 1, row: 0, col: 1, rowSpan: 2, colSpan: 1 },
          { imageIndex: 2, row: 0, col: 2, rowSpan: 2, colSpan: 1 },
          { imageIndex: 3, row: 0, col: 3, rowSpan: 2, colSpan: 3 }
        ]
      },
      {
        id: "4-large-top-3-small",
        name: "Large Top 3x2 + 3 Small",
        grid: { rows: 6, cols: 2 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 3, colSpan: 2 },
          { imageIndex: 1, row: 3, col: 0, rowSpan: 1, colSpan: 2 },
          { imageIndex: 2, row: 4, col: 0, rowSpan: 1, colSpan: 2 },
          { imageIndex: 3, row: 5, col: 0, rowSpan: 1, colSpan: 2 }
        ]
      },
      {
        id: "4-large-bottom-3-small",
        name: "3 Small + Large Bottom 3x2",
        grid: { rows: 6, cols: 2 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 2 },
          { imageIndex: 1, row: 1, col: 0, rowSpan: 1, colSpan: 2 },
          { imageIndex: 2, row: 2, col: 0, rowSpan: 1, colSpan: 2 },
          { imageIndex: 3, row: 3, col: 0, rowSpan: 3, colSpan: 2 }
        ]
      },
      {
        id: "4-large-left-tall",
        name: "Large Left + 3 Stacked",
        grid: { rows: 3, cols: 3 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 3, colSpan: 2 },
          { imageIndex: 1, row: 0, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 1, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 2, col: 2, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "2-narrow-2-wide",
        name: "2 Narrow + 2 Wide",
        grid: { rows: 2, cols: 3 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 0, col: 1, rowSpan: 1, colSpan: 2 },
          { imageIndex: 2, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 1, col: 1, rowSpan: 1, colSpan: 2 }
        ]
      },
      {
        id: "2-wide-2-narrow",
        name: "2 Wide + 2 Narrow",
        grid: { rows: 2, cols: 3 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 2 },
          { imageIndex: 1, row: 0, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 1, col: 0, rowSpan: 1, colSpan: 2 },
          { imageIndex: 3, row: 1, col: 2, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "4-large-left-large-right-bottom",
        name: "Large TL + Large BR",
        grid: { rows: 3, cols: 4 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 2, colSpan: 2 }, // Image 1 - Large top-left (rows 0-1, cols 0-1)
          { imageIndex: 1, row: 0, col: 2, rowSpan: 2, colSpan: 2 }, // Image 2 - Large top-right (rows 0-1, cols 2-3)
          { imageIndex: 2, row: 2, col: 0, rowSpan: 1, colSpan: 2 }, // Image 3 - Wide bottom-left (row 2, cols 0-1)
          { imageIndex: 3, row: 2, col: 2, rowSpan: 1, colSpan: 2 }  // Image 4 - Wide bottom-right (row 2, cols 2-3)
        ]
      },
      {
        id: "4-two-large-two-wide",
        name: "2 Large Top + 2 Wide Bottom",
        grid: { rows: 3, cols: 4 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 2, colSpan: 2 }, // Image 1 - Large top-left (rows 0-1, cols 0-1)
          { imageIndex: 1, row: 0, col: 2, rowSpan: 2, colSpan: 2 }, // Image 2 - Large top-right (rows 0-1, cols 2-3)
          { imageIndex: 2, row: 2, col: 0, rowSpan: 1, colSpan: 2 }, // Image 3 - Wide bottom-left (row 2, cols 0-1)
          { imageIndex: 3, row: 2, col: 2, rowSpan: 1, colSpan: 2 }  // Image 4 - Wide bottom-right (row 2, cols 2-3)
        ]
      }
    ],

    // 5 images - Multiple creative layouts
    5: [
      {
        id: "5-featured-top-left",
        name: "Featured Top-Left",
        grid: { rows: 3, cols: 3 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 2, colSpan: 2 }, // Large featured top-left
          { imageIndex: 1, row: 0, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 1, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 2, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 2, col: 1, rowSpan: 1, colSpan: 2 }
        ]
      },
      {
        id: "5-featured-top-right",
        name: "Featured Top-Right",
        grid: { rows: 3, cols: 3 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 0, col: 1, rowSpan: 2, colSpan: 2 }, // Large featured top-right
          { imageIndex: 3, row: 2, col: 0, rowSpan: 1, colSpan: 2 },
          { imageIndex: 4, row: 2, col: 2, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "5-featured-bottom-left",
        name: "Featured Bottom-Left", 
        grid: { rows: 3, cols: 3 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 2 },
          { imageIndex: 1, row: 0, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 1, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 1, col: 0, rowSpan: 2, colSpan: 2 }, // Large featured bottom-left
          { imageIndex: 4, row: 2, col: 2, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "5-featured-bottom-right",
        name: "Featured Bottom-Right",
        grid: { rows: 3, cols: 3 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 0, col: 1, rowSpan: 1, colSpan: 2 },
          { imageIndex: 2, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 2, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 1, col: 1, rowSpan: 2, colSpan: 2 } // Large featured bottom-right
        ]
      },
      {
        id: "5-strip-plus",
        name: "2 Top + 1 Middle + 2 Bottom",
        grid: { rows: 3, cols: 4 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 2 },
          { imageIndex: 1, row: 0, col: 2, rowSpan: 1, colSpan: 2 },
          { imageIndex: 2, row: 1, col: 0, rowSpan: 1, colSpan: 4 }, // Full-width middle
          { imageIndex: 3, row: 2, col: 0, rowSpan: 1, colSpan: 2 },
          { imageIndex: 4, row: 2, col: 2, rowSpan: 1, colSpan: 2 }
        ]
      },
      {
        id: "5-asymmetric-blocks",
        name: "Asymmetric Blocks",
        grid: { rows: 3, cols: 2 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 2, colSpan: 1 }, // Tall left (spans 2 rows)
          { imageIndex: 1, row: 0, col: 1, rowSpan: 1, colSpan: 1 }, // Top-right
          { imageIndex: 2, row: 1, col: 1, rowSpan: 1, colSpan: 1 }, // Middle-right
          { imageIndex: 3, row: 2, col: 0, rowSpan: 1, colSpan: 1 }, // Bottom-left
          { imageIndex: 4, row: 2, col: 1, rowSpan: 1, colSpan: 1 }  // Bottom-right
        ]
      },
      {
        id: "5-stacked-strips",
        name: "Stacked Strips", 
        grid: { rows: 3, cols: 2 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 2 }, // Full-width top
          { imageIndex: 1, row: 1, col: 0, rowSpan: 1, colSpan: 1 }, // Bottom-left
          { imageIndex: 2, row: 1, col: 1, rowSpan: 1, colSpan: 1 }, // Bottom-center-left  
          { imageIndex: 3, row: 2, col: 0, rowSpan: 1, colSpan: 1 }, // Bottom-left
          { imageIndex: 4, row: 2, col: 1, rowSpan: 1, colSpan: 1 }  // Bottom-right
        ]
      },
      {
        id: "5-corner-center",
        name: "Corner + Center",
        grid: { rows: 2, cols: 3 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 }, // Top-left
          { imageIndex: 1, row: 0, col: 1, rowSpan: 1, colSpan: 1 }, // Top-center
          { imageIndex: 2, row: 0, col: 2, rowSpan: 1, colSpan: 1 }, // Top-right
          { imageIndex: 3, row: 1, col: 0, rowSpan: 1, colSpan: 1 }, // Bottom-left
          { imageIndex: 4, row: 1, col: 1, rowSpan: 1, colSpan: 2 }  // Bottom-wide (center+right)
        ]
      },
      {
        id: "5-in-row",
        name: "5 in a Row",
        grid: { rows: 1, cols: 5 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 0, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 0, col: 3, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 0, col: 4, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "5-in-column",
        name: "5 in a Column",
        grid: { rows: 5, cols: 1 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 2, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 3, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 4, col: 0, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "5-four-top-one-bottom",
        name: "4 Top + 1 Bottom Wide",
        grid: { rows: 2, cols: 4 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 0, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 0, col: 3, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 1, col: 0, rowSpan: 1, colSpan: 4 } // Full-width bottom
        ]
      }
    ],

    // 6 images - variations of 2x3 and 3x2
    6: [
      {
        id: "6-grid-2x3",
        name: "2x3 Grid",
        grid: { rows: 2, cols: 3 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 0, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 1, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 5, row: 1, col: 2, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "6-grid-3x2",
        name: "3x2 Grid",
        grid: { rows: 3, cols: 2 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 1, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 2, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 5, row: 2, col: 1, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "6-large-corner",
        name: "Large Corner + 5 Small",
        grid: { rows: 3, cols: 4 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 2, colSpan: 2 },
          { imageIndex: 1, row: 0, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 0, col: 3, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 1, col: 2, rowSpan: 1, colSpan: 2 },
          { imageIndex: 4, row: 2, col: 0, rowSpan: 1, colSpan: 2 },
          { imageIndex: 5, row: 2, col: 2, rowSpan: 1, colSpan: 2 }
        ]
      },
      {
        id: "6-in-row",
        name: "6 in a Row",
        grid: { rows: 1, cols: 6 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 0, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 0, col: 3, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 0, col: 4, rowSpan: 1, colSpan: 1 },
          { imageIndex: 5, row: 0, col: 5, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "6-in-column",
        name: "6 in a Column",
        grid: { rows: 6, cols: 1 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 2, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 3, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 4, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 5, row: 5, col: 0, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "6-featured-top-left-3x3",
        name: "Featured TL (3x3)",
        grid: { rows: 3, cols: 3 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 2, colSpan: 2 },
          { imageIndex: 1, row: 0, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 1, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 2, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 2, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 5, row: 2, col: 2, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "6-featured-top-right-3x3",
        name: "Featured TR (3x3)",
        grid: { rows: 3, cols: 3 },
        positions: [
          { imageIndex: 0, row: 0, col: 1, rowSpan: 2, colSpan: 2 },
          { imageIndex: 1, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 2, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 2, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 5, row: 2, col: 2, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "6-featured-bottom-left-3x3",
        name: "Featured BL (3x3)",
        grid: { rows: 3, cols: 3 },
        positions: [
          { imageIndex: 0, row: 1, col: 0, rowSpan: 2, colSpan: 2 },
          { imageIndex: 1, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 0, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 1, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 5, row: 2, col: 2, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "6-featured-bottom-right-3x3",
        name: "Featured BR (3x3)",
        grid: { rows: 3, cols: 3 },
        positions: [
          { imageIndex: 0, row: 1, col: 1, rowSpan: 2, colSpan: 2 },
          { imageIndex: 1, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 0, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 5, row: 2, col: 0, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "6-large-left-large-right",
        name: "Large Left + Large Right",
        grid: { rows: 3, cols: 4 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 2, colSpan: 2 }, // Image 1 - Large top-left (rows 0-1, cols 0-1)
          { imageIndex: 1, row: 0, col: 2, rowSpan: 1, colSpan: 1 }, // Image 2 - Top-middle-right
          { imageIndex: 2, row: 0, col: 3, rowSpan: 1, colSpan: 1 }, // Image 3 - Top-right
          { imageIndex: 3, row: 1, col: 2, rowSpan: 2, colSpan: 2 }, // Image 4 - Large middle-right (rows 1-2, cols 2-3)
          { imageIndex: 4, row: 2, col: 0, rowSpan: 1, colSpan: 1 }, // Image 5 - Bottom-left
          { imageIndex: 5, row: 2, col: 1, rowSpan: 1, colSpan: 1 }  // Image 6 - Bottom-middle-left
        ]
      },
      {
        id: "6-two-large-four-small",
        name: "2 Large Top + 4 Small Bottom",
        grid: { rows: 3, cols: 4 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 2, colSpan: 2 }, // Image 1 - Large top-left (rows 0-1, cols 0-1)
          { imageIndex: 1, row: 0, col: 2, rowSpan: 2, colSpan: 2 }, // Image 2 - Large top-right (rows 0-1, cols 2-3)
          { imageIndex: 2, row: 2, col: 0, rowSpan: 1, colSpan: 1 }, // Image 3 - Bottom-left
          { imageIndex: 3, row: 2, col: 1, rowSpan: 1, colSpan: 1 }, // Image 4 - Bottom-middle-left
          { imageIndex: 4, row: 2, col: 2, rowSpan: 1, colSpan: 1 }, // Image 5 - Bottom-middle-right
          { imageIndex: 5, row: 2, col: 3, rowSpan: 1, colSpan: 1 }  // Image 6 - Bottom-right
        ]
      },
      {
        id: "6-large-left-four-right",
        name: "Large Left + 4 Right + Wide Bottom",
        grid: { rows: 3, cols: 4 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 3, colSpan: 2 }, // Image 1 - Large left (all 3 rows, cols 0-1)
          { imageIndex: 1, row: 0, col: 2, rowSpan: 1, colSpan: 1 }, // Image 2 - Top-right
          { imageIndex: 2, row: 0, col: 3, rowSpan: 1, colSpan: 1 }, // Image 3 - Top-far-right
          { imageIndex: 3, row: 1, col: 2, rowSpan: 1, colSpan: 1 }, // Image 4 - Middle-right
          { imageIndex: 4, row: 1, col: 3, rowSpan: 1, colSpan: 1 }, // Image 5 - Middle-far-right
          { imageIndex: 5, row: 2, col: 2, rowSpan: 1, colSpan: 2 }  // Image 6 - Wide bottom-right (cols 2-3)
        ]
      }
    ],

    // 7 images - Multiple creative layouts
    7: [
      {
        id: "7-featured-center",
        name: "Featured Center",
        grid: { rows: 3, cols: 4 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 2 },
          { imageIndex: 1, row: 0, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 0, col: 3, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 1, col: 1, rowSpan: 1, colSpan: 2 }, // Featured center
          { imageIndex: 5, row: 1, col: 3, rowSpan: 1, colSpan: 1 },
          { imageIndex: 6, row: 2, col: 0, rowSpan: 1, colSpan: 4 }
        ]
      },
      {
        id: "7-large-left",
        name: "Large Left + 6 Right",
        grid: { rows: 3, cols: 3 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 3, colSpan: 1 }, // Large left
          { imageIndex: 1, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 0, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 1, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 1, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 5, row: 2, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 6, row: 2, col: 2, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "7-t-shape",
        name: "T-Shape Layout",
        grid: { rows: 4, cols: 4 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 4 }, // Top strip
          { imageIndex: 1, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 1, col: 1, rowSpan: 2, colSpan: 2 }, // Center featured
          { imageIndex: 3, row: 1, col: 3, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 2, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 5, row: 2, col: 3, rowSpan: 1, colSpan: 1 },
          { imageIndex: 6, row: 3, col: 1, rowSpan: 1, colSpan: 2 }
        ]
      },
      {
        id: "7-corner-focus",
        name: "Corner Focus",
        grid: { rows: 3, cols: 3 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 2, colSpan: 2 }, // Large top-left
          { imageIndex: 1, row: 0, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 1, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 2, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 2, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 5, row: 2, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 6, row: 0, col: 1, rowSpan: 1, colSpan: 1 } // Fill gap
        ]
      },
      {
        id: "7-in-row",
        name: "7 in a Row",
        grid: { rows: 1, cols: 7 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 0, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 0, col: 3, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 0, col: 4, rowSpan: 1, colSpan: 1 },
          { imageIndex: 5, row: 0, col: 5, rowSpan: 1, colSpan: 1 },
          { imageIndex: 6, row: 0, col: 6, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "7-in-column",
        name: "7 in a Column",
        grid: { rows: 7, cols: 1 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 2, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 3, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 4, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 5, row: 5, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 6, row: 6, col: 0, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "7-featured-center-2",
        name: "Featured Center Alt",
        grid: { rows: 3, cols: 3 },
        positions: [
          { imageIndex: 0, row: 1, col: 1, rowSpan: 2, colSpan: 2 },
          { imageIndex: 1, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 0, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 5, row: 2, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 6, row: 2, col: 1, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "7-featured-left",
        name: "Large Left Column",
        grid: { rows: 3, cols: 4 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 3, colSpan: 2 },
          { imageIndex: 1, row: 0, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 0, col: 3, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 1, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 1, col: 3, rowSpan: 1, colSpan: 1 },
          { imageIndex: 5, row: 2, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 6, row: 2, col: 3, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "7-featured-right",
        name: "Large Right Column",
        grid: { rows: 3, cols: 4 },
        positions: [
          { imageIndex: 0, row: 0, col: 2, rowSpan: 3, colSpan: 2 },
          { imageIndex: 1, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 1, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 5, row: 2, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 6, row: 2, col: 1, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "7-two-large-top",
        name: "2 Large Top + 5 Bottom",
        grid: { rows: 4, cols: 4 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 2, colSpan: 2 }, // Image 1 - Large top-left (rows 0-1, cols 0-1)
          { imageIndex: 1, row: 0, col: 2, rowSpan: 2, colSpan: 2 }, // Image 2 - Large top-right (rows 0-1, cols 2-3)
          { imageIndex: 2, row: 2, col: 0, rowSpan: 1, colSpan: 1 }, // Image 3 - Bottom row left
          { imageIndex: 3, row: 2, col: 1, rowSpan: 1, colSpan: 1 }, // Image 4 - Bottom row
          { imageIndex: 4, row: 2, col: 2, rowSpan: 1, colSpan: 1 }, // Image 5 - Bottom row
          { imageIndex: 5, row: 2, col: 3, rowSpan: 1, colSpan: 1 }, // Image 6 - Bottom row right
          { imageIndex: 6, row: 3, col: 0, rowSpan: 1, colSpan: 4 }  // Image 7 - Wide bottom strip
        ]
      },
      {
        id: "7-two-large-balanced",
        name: "2 Large + 5 Balanced",
        grid: { rows: 3, cols: 5 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 2, colSpan: 2 }, // Image 1 - Large top-left (2x2)
          { imageIndex: 1, row: 0, col: 2, rowSpan: 2, colSpan: 2 }, // Image 2 - Large top-right (2x2)
          { imageIndex: 2, row: 0, col: 4, rowSpan: 1, colSpan: 1 }, // Image 3 - Small top-right
          { imageIndex: 3, row: 1, col: 4, rowSpan: 1, colSpan: 1 }, // Image 4 - Small middle-right
          { imageIndex: 4, row: 2, col: 0, rowSpan: 1, colSpan: 1 }, // Image 5 - Small bottom-left
          { imageIndex: 5, row: 2, col: 1, rowSpan: 1, colSpan: 2 }, // Image 6 - Wide bottom-middle (1x2)
          { imageIndex: 6, row: 2, col: 3, rowSpan: 1, colSpan: 2 }  // Image 7 - Wide bottom-right (1x2)
        ]
      },
      {
        id: "7-two-large-right-stack",
        name: "2 Large + 3 Right Stack",
        grid: { rows: 3, cols: 5 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 2, colSpan: 2 }, // Image 1 - Large top-left (2x2)
          { imageIndex: 1, row: 0, col: 2, rowSpan: 2, colSpan: 2 }, // Image 2 - Large top-center-right (2x2)
          { imageIndex: 2, row: 0, col: 4, rowSpan: 1, colSpan: 1 }, // Image 3 - Small top-right
          { imageIndex: 3, row: 1, col: 4, rowSpan: 1, colSpan: 1 }, // Image 4 - Small middle-right
          { imageIndex: 4, row: 2, col: 4, rowSpan: 1, colSpan: 1 }, // Image 5 - Small bottom-right
          { imageIndex: 5, row: 2, col: 0, rowSpan: 1, colSpan: 2 }, // Image 6 - Wide bottom-left (1x2)
          { imageIndex: 6, row: 2, col: 2, rowSpan: 1, colSpan: 2 }  // Image 7 - Wide bottom-center (1x2)
        ]
      },
      {
        id: "7-four-large-left",
        name: "4 Large Left + 3 Right",
        grid: { rows: 6, cols: 6 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 3, colSpan: 2 }, // Image 1 - Large tall top-left (3x2)
          { imageIndex: 1, row: 0, col: 2, rowSpan: 3, colSpan: 2 }, // Image 2 - Large tall top-center-left (3x2)
          { imageIndex: 2, row: 3, col: 0, rowSpan: 3, colSpan: 2 }, // Image 3 - Large tall bottom-left (3x2)
          { imageIndex: 3, row: 3, col: 2, rowSpan: 3, colSpan: 2 }, // Image 4 - Large tall bottom-center-left (3x2)
          { imageIndex: 4, row: 0, col: 4, rowSpan: 2, colSpan: 2 }, // Image 5 - Top-right (2x2) - same size as 6, 7
          { imageIndex: 5, row: 2, col: 4, rowSpan: 2, colSpan: 2 }, // Image 6 - Middle-right (2x2) - same size as 5, 7
          { imageIndex: 6, row: 4, col: 4, rowSpan: 2, colSpan: 2 }  // Image 7 - Bottom-right (2x2) - same size as 5, 6
        ]
      }
    ],

    // 8 images - Multiple creative layouts
    8: [
      {
        id: "8-grid-2x4",
        name: "2x4 Grid",
        grid: { rows: 2, cols: 4 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 0, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 0, col: 3, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 5, row: 1, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 6, row: 1, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 7, row: 1, col: 3, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "8-grid-4x2",
        name: "4x2 Grid",
        grid: { rows: 4, cols: 2 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 1, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 2, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 5, row: 2, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 6, row: 3, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 7, row: 3, col: 1, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "8-center-focus",
        name: "Center Focus",
        grid: { rows: 3, cols: 4 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 0, col: 1, rowSpan: 1, colSpan: 2 }, // Top center wide
          { imageIndex: 2, row: 0, col: 3, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 1, col: 1, rowSpan: 1, colSpan: 2 }, // Center featured
          { imageIndex: 5, row: 1, col: 3, rowSpan: 1, colSpan: 1 },
          { imageIndex: 6, row: 2, col: 0, rowSpan: 1, colSpan: 2 }, // Bottom left wide
          { imageIndex: 7, row: 2, col: 2, rowSpan: 1, colSpan: 2 }  // Bottom right wide
        ]
      },
      {
        id: "8-compact-blocks", 
        name: "Compact Blocks",
        grid: { rows: 4, cols: 2 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 1, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 2, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 5, row: 2, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 6, row: 3, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 7, row: 3, col: 1, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "8-in-row",
        name: "8 in a Row",
        grid: { rows: 1, cols: 8 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 0, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 0, col: 3, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 0, col: 4, rowSpan: 1, colSpan: 1 },
          { imageIndex: 5, row: 0, col: 5, rowSpan: 1, colSpan: 1 },
          { imageIndex: 6, row: 0, col: 6, rowSpan: 1, colSpan: 1 },
          { imageIndex: 7, row: 0, col: 7, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "8-in-column",
        name: "8 in a Column",
        grid: { rows: 8, cols: 1 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 2, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 3, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 4, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 5, row: 5, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 6, row: 6, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 7, row: 7, col: 0, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "8-featured-center-2",
        name: "Center Focus Alt",
        grid: { rows: 4, cols: 4 },
        positions: [
          { imageIndex: 0, row: 1, col: 1, rowSpan: 2, colSpan: 2 },
          { imageIndex: 1, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 0, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 0, col: 3, rowSpan: 1, colSpan: 1 },
          { imageIndex: 5, row: 3, col: 0, rowSpan: 1, colSpan: 4 },
          { imageIndex: 6, row: 2, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 7, row: 2, col: 3, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "8-featured-left",
        name: "Large Left + 6",
        grid: { rows: 3, cols: 4 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 3, colSpan: 2 },
          { imageIndex: 1, row: 0, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 0, col: 3, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 1, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 1, col: 3, rowSpan: 1, colSpan: 1 },
          { imageIndex: 5, row: 2, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 6, row: 2, col: 3, rowSpan: 1, colSpan: 1 },
          { imageIndex: 7, row: 2, col: 1, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "8-featured-right",
        name: "6 + Large Right",
        grid: { rows: 3, cols: 4 },
        positions: [
          { imageIndex: 0, row: 0, col: 2, rowSpan: 3, colSpan: 2 },
          { imageIndex: 1, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 1, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 5, row: 2, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 6, row: 2, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 7, row: 2, col: 2, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "8-center-column",
        name: "Center Column + Sides",
        grid: { rows: 3, cols: 7 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 2 },
          { imageIndex: 1, row: 0, col: 2, rowSpan: 2, colSpan: 3 },
          { imageIndex: 2, row: 0, col: 5, rowSpan: 1, colSpan: 2 },
          { imageIndex: 3, row: 1, col: 0, rowSpan: 1, colSpan: 2 },
          { imageIndex: 4, row: 1, col: 5, rowSpan: 1, colSpan: 2 },
          { imageIndex: 5, row: 2, col: 0, rowSpan: 1, colSpan: 2 },
          { imageIndex: 6, row: 2, col: 2, rowSpan: 1, colSpan: 3 },
          { imageIndex: 7, row: 2, col: 5, rowSpan: 1, colSpan: 2 }
        ]
      }
    ],

    // 9 images - Multiple creative layouts
    9: [
      {
        id: "9-grid-3x3",
        name: "3x3 Grid",
        grid: { rows: 3, cols: 3 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 0, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 1, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 5, row: 1, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 6, row: 2, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 7, row: 2, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 8, row: 2, col: 2, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "9-center-focus",
        name: "Center Focus",
        grid: { rows: 3, cols: 4 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 0, col: 1, rowSpan: 1, colSpan: 2 }, // Top wide
          { imageIndex: 2, row: 0, col: 3, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 1, col: 1, rowSpan: 1, colSpan: 2 }, // Center featured
          { imageIndex: 5, row: 1, col: 3, rowSpan: 1, colSpan: 1 },
          { imageIndex: 6, row: 2, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 7, row: 2, col: 1, rowSpan: 1, colSpan: 2 }, // Bottom wide
          { imageIndex: 8, row: 2, col: 3, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "9-compact-3x3",
        name: "Compact 3x3",
        grid: { rows: 3, cols: 3 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 0, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 1, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 5, row: 1, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 6, row: 2, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 7, row: 2, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 8, row: 2, col: 2, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "9-efficient-layout",
        name: "Efficient Layout", 
        grid: { rows: 3, cols: 3 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 0, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 1, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 5, row: 1, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 6, row: 2, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 7, row: 2, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 8, row: 2, col: 2, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "9-in-row",
        name: "9 in a Row",
        grid: { rows: 1, cols: 9 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 0, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 0, col: 3, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 0, col: 4, rowSpan: 1, colSpan: 1 },
          { imageIndex: 5, row: 0, col: 5, rowSpan: 1, colSpan: 1 },
          { imageIndex: 6, row: 0, col: 6, rowSpan: 1, colSpan: 1 },
          { imageIndex: 7, row: 0, col: 7, rowSpan: 1, colSpan: 1 },
          { imageIndex: 8, row: 0, col: 8, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "9-in-column",
        name: "9 in a Column",
        grid: { rows: 9, cols: 1 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 2, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 3, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 4, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 5, row: 5, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 6, row: 6, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 7, row: 7, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 8, row: 8, col: 0, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "9-featured-center-3x3",
        name: "Center 2x2 + Ring",
        grid: { rows: 3, cols: 3 },
        positions: [
          { imageIndex: 0, row: 0, col: 1, rowSpan: 2, colSpan: 2 },
          { imageIndex: 1, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 2, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 2, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 5, row: 2, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 6, row: 1, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 7, row: 0, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 8, row: 0, col: 1, rowSpan: 1, colSpan: 1 }
        ]
      }
    ],

    // 10 images - Multiple creative layouts
    10: [
      {
        id: "10-grid-2x5",
        name: "2x5 Grid",
        grid: { rows: 2, cols: 5 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 0, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 0, col: 3, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 0, col: 4, rowSpan: 1, colSpan: 1 },
          { imageIndex: 5, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 6, row: 1, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 7, row: 1, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 8, row: 1, col: 3, rowSpan: 1, colSpan: 1 },
          { imageIndex: 9, row: 1, col: 4, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "10-grid-5x2",
        name: "5x2 Grid",
        grid: { rows: 5, cols: 2 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 1, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 2, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 5, row: 2, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 6, row: 3, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 7, row: 3, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 8, row: 4, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 9, row: 4, col: 1, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "10-featured-corners",
        name: "Featured Corners",
        grid: { rows: 4, cols: 5 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 2, colSpan: 2 }, // Large top-left
          { imageIndex: 1, row: 0, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 0, col: 3, rowSpan: 2, colSpan: 2 }, // Large top-right
          { imageIndex: 3, row: 1, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 2, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 5, row: 2, col: 1, rowSpan: 1, colSpan: 3 }, // Center strip
          { imageIndex: 6, row: 2, col: 4, rowSpan: 1, colSpan: 1 },
          { imageIndex: 7, row: 3, col: 0, rowSpan: 1, colSpan: 2 }, // Bottom-left wide
          { imageIndex: 8, row: 3, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 9, row: 3, col: 3, rowSpan: 1, colSpan: 2 }  // Bottom-right wide
        ]
      },
      {
        id: "10-pyramid",
        name: "Pyramid Layout",
        grid: { rows: 4, cols: 4 },
        positions: [
          { imageIndex: 0, row: 0, col: 1, rowSpan: 1, colSpan: 2 }, // Top (1 wide)
          { imageIndex: 1, row: 1, col: 0, rowSpan: 1, colSpan: 1 }, // Second row left
          { imageIndex: 2, row: 1, col: 1, rowSpan: 1, colSpan: 1 }, // Second row center-left
          { imageIndex: 3, row: 1, col: 2, rowSpan: 1, colSpan: 1 }, // Second row center-right
          { imageIndex: 4, row: 1, col: 3, rowSpan: 1, colSpan: 1 }, // Second row right
          { imageIndex: 5, row: 2, col: 0, rowSpan: 1, colSpan: 1 }, // Third row left
          { imageIndex: 6, row: 2, col: 1, rowSpan: 1, colSpan: 1 }, // Third row center-left
          { imageIndex: 7, row: 2, col: 2, rowSpan: 1, colSpan: 1 }, // Third row center-right
          { imageIndex: 8, row: 2, col: 3, rowSpan: 1, colSpan: 1 }, // Third row right
          { imageIndex: 9, row: 3, col: 1, rowSpan: 1, colSpan: 2 }  // Bottom (1 wide)
        ]
      },
      {
        id: "10-magazine-style",
        name: "Magazine Style",
        grid: { rows: 5, cols: 4 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 2, colSpan: 2 }, // Large featured
          { imageIndex: 1, row: 0, col: 2, rowSpan: 1, colSpan: 2 }, // Top-right wide
          { imageIndex: 2, row: 1, col: 2, rowSpan: 1, colSpan: 1 }, // Right-upper
          { imageIndex: 3, row: 1, col: 3, rowSpan: 1, colSpan: 1 }, // Right-upper-2
          { imageIndex: 4, row: 2, col: 0, rowSpan: 1, colSpan: 4 }, // Full-width strip
          { imageIndex: 5, row: 3, col: 0, rowSpan: 1, colSpan: 1 }, // Bottom row start
          { imageIndex: 6, row: 3, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 7, row: 3, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 8, row: 3, col: 3, rowSpan: 1, colSpan: 1 },
          { imageIndex: 9, row: 4, col: 1, rowSpan: 1, colSpan: 2 }  // Bottom center wide
        ]
      },
      {
        id: "10-in-row",
        name: "10 in a Row",
        grid: { rows: 1, cols: 10 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 0, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 0, col: 3, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 0, col: 4, rowSpan: 1, colSpan: 1 },
          { imageIndex: 5, row: 0, col: 5, rowSpan: 1, colSpan: 1 },
          { imageIndex: 6, row: 0, col: 6, rowSpan: 1, colSpan: 1 },
          { imageIndex: 7, row: 0, col: 7, rowSpan: 1, colSpan: 1 },
          { imageIndex: 8, row: 0, col: 8, rowSpan: 1, colSpan: 1 },
          { imageIndex: 9, row: 0, col: 9, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "10-in-column",
        name: "10 in a Column", 
        grid: { rows: 10, cols: 1 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 2, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 3, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 4, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 5, row: 5, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 6, row: 6, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 7, row: 7, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 8, row: 8, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 9, row: 9, col: 0, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "10-featured-center-2",
        name: "Center Pyramid Alt",
        grid: { rows: 5, cols: 5 },
        positions: [
          { imageIndex: 0, row: 0, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 1, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 1, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 1, col: 3, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 2, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 5, row: 2, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 6, row: 2, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 7, row: 2, col: 3, rowSpan: 1, colSpan: 1 },
          { imageIndex: 8, row: 2, col: 4, rowSpan: 1, colSpan: 1 },
          { imageIndex: 9, row: 3, col: 2, rowSpan: 1, colSpan: 1 }
        ]
      }
    ],

    // 11 images - Multiple creative layouts  
    11: [
      {
        id: "11-asymmetric-feature",
        name: "Asymmetric Feature",
        grid: { rows: 4, cols: 5 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 2, colSpan: 3 }, // Large featured top-left
          { imageIndex: 1, row: 0, col: 3, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 0, col: 4, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 1, col: 3, rowSpan: 1, colSpan: 2 }, // Wide middle-right
          { imageIndex: 4, row: 2, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 5, row: 2, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 6, row: 2, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 7, row: 2, col: 3, rowSpan: 1, colSpan: 1 },
          { imageIndex: 8, row: 2, col: 4, rowSpan: 1, colSpan: 1 },
          { imageIndex: 9, row: 3, col: 0, rowSpan: 1, colSpan: 2 }, // Bottom-left wide
          { imageIndex: 10, row: 3, col: 2, rowSpan: 1, colSpan: 3 }  // Bottom-right wide
        ]
      },
      {
        id: "11-magazine-spread",
        name: "Magazine Spread",
        grid: { rows: 5, cols: 4 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 2, colSpan: 2 }, // Large featured top-left
          { imageIndex: 1, row: 0, col: 2, rowSpan: 1, colSpan: 2 }, // Top-right wide
          { imageIndex: 2, row: 1, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 1, col: 3, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 2, col: 0, rowSpan: 1, colSpan: 4 }, // Full-width strip
          { imageIndex: 5, row: 3, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 6, row: 3, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 7, row: 3, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 8, row: 3, col: 3, rowSpan: 1, colSpan: 1 },
          { imageIndex: 9, row: 4, col: 0, rowSpan: 1, colSpan: 2 }, // Bottom-left wide
          { imageIndex: 10, row: 4, col: 2, rowSpan: 1, colSpan: 2 }  // Bottom-right wide
        ]
      },
      {
        id: "11-diagonal-flow",
        name: "Diagonal Flow",
        grid: { rows: 4, cols: 4 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 2 },
          { imageIndex: 1, row: 0, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 0, col: 3, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 1, col: 1, rowSpan: 1, colSpan: 2 },
          { imageIndex: 5, row: 1, col: 3, rowSpan: 1, colSpan: 1 },
          { imageIndex: 6, row: 2, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 7, row: 2, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 8, row: 2, col: 2, rowSpan: 1, colSpan: 2 },
          { imageIndex: 9, row: 3, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 10, row: 3, col: 2, rowSpan: 1, colSpan: 2 }
        ]
      },
      {
        id: "11-featured-center-3x4",
        name: "Center 2x2 + Surround",
        grid: { rows: 4, cols: 4 },
        positions: [
          { imageIndex: 0, row: 1, col: 1, rowSpan: 2, colSpan: 2 },
          { imageIndex: 1, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 0, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 0, col: 3, rowSpan: 1, colSpan: 1 },
          { imageIndex: 5, row: 3, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 6, row: 3, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 7, row: 3, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 8, row: 3, col: 3, rowSpan: 1, colSpan: 1 },
          { imageIndex: 9, row: 2, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 10, row: 1, col: 0, rowSpan: 1, colSpan: 1 }
        ]
      }
    ],

    // 12 images
    12: [
      {
        id: "12-grid-3x4",
        name: "3x4 Grid",
        grid: { rows: 3, cols: 4 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 0, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 0, col: 3, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 5, row: 1, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 6, row: 1, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 7, row: 1, col: 3, rowSpan: 1, colSpan: 1 },
          { imageIndex: 8, row: 2, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 9, row: 2, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 10, row: 2, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 11, row: 2, col: 3, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "12-grid-4x3",
        name: "4x3 Grid",
        grid: { rows: 4, cols: 3 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 0, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 1, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 5, row: 1, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 6, row: 2, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 7, row: 2, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 8, row: 2, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 9, row: 3, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 10, row: 3, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 11, row: 3, col: 2, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "12-featured-center-4x4",
        name: "Center 2x2 + Border",
        grid: { rows: 4, cols: 4 },
        positions: [
          { imageIndex: 0, row: 1, col: 1, rowSpan: 2, colSpan: 2 },
          { imageIndex: 1, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 0, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 0, col: 3, rowSpan: 1, colSpan: 1 },
          { imageIndex: 5, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 6, row: 2, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 7, row: 3, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 8, row: 3, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 9, row: 3, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 10, row: 3, col: 3, rowSpan: 1, colSpan: 1 },
          { imageIndex: 11, row: 2, col: 3, rowSpan: 1, colSpan: 1 }
        ]
      }
    ],

    // 16 images
    16: [
      {
        id: "16-grid-4x4",
        name: "4x4 Grid",
        grid: { rows: 4, cols: 4 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 0, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 0, col: 3, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 5, row: 1, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 6, row: 1, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 7, row: 1, col: 3, rowSpan: 1, colSpan: 1 },
          { imageIndex: 8, row: 2, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 9, row: 2, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 10, row: 2, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 11, row: 2, col: 3, rowSpan: 1, colSpan: 1 },
          { imageIndex: 12, row: 3, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 13, row: 3, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 14, row: 3, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 15, row: 3, col: 3, rowSpan: 1, colSpan: 1 }
        ]
      }
    ]
  },

  // Letter layouts (279mm x 216mm) - same layouts as A4 but optimized for Letter proportions
  Letter: {
    // Copy all A4 layouts for Letter size
    1: [
      {
        id: "1-fullpage",
        name: "Full Page",
        grid: { rows: 1, cols: 1 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 }
        ]
      }
    ],

    2: [
      {
        id: "2-horizontal",
        name: "Side by Side",
        grid: { rows: 1, cols: 2 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 0, col: 1, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "2-vertical",
        name: "Top and Bottom",
        grid: { rows: 2, cols: 1 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 1, col: 0, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "2-70-30",
        name: "70/30 Split",
        grid: { rows: 1, cols: 10 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 7 },
          { imageIndex: 1, row: 0, col: 7, rowSpan: 1, colSpan: 3 }
        ]
      }
    ],

    3: [
      {
        id: "3-strip",
        name: "3 in a Row",
        grid: { rows: 1, cols: 3 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 0, col: 2, rowSpan: 1, colSpan: 1 }
        ]
      }
    ],

    4: [
      {
        id: "4-quad",
        name: "2x2 Grid",
        grid: { rows: 2, cols: 2 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 1, col: 1, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "4-strip",
        name: "4 in a Row",
        grid: { rows: 1, cols: 4 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 0, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 0, col: 3, rowSpan: 1, colSpan: 1 }
        ]
      }
    ],

    6: [
      {
        id: "6-grid-2x3",
        name: "2x3 Grid",
        grid: { rows: 2, cols: 3 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 0, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 1, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 5, row: 1, col: 2, rowSpan: 1, colSpan: 1 }
        ]
      }
    ],

    9: [
      {
        id: "9-grid-3x3",
        name: "3x3 Grid",
        grid: { rows: 3, cols: 3 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 0, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 1, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 5, row: 1, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 6, row: 2, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 7, row: 2, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 8, row: 2, col: 2, rowSpan: 1, colSpan: 1 }
        ]
      }
    ]
  },

  // Legal layouts (356mm x 216mm) - longer format, optimized for Legal proportions
  Legal: {
    1: [
      {
        id: "1-fullpage",
        name: "Full Page",
        grid: { rows: 1, cols: 1 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 }
        ]
      }
    ],

    2: [
      {
        id: "2-horizontal",
        name: "Side by Side",
        grid: { rows: 1, cols: 2 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 0, col: 1, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "2-vertical",
        name: "Top and Bottom",
        grid: { rows: 2, cols: 1 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 1, col: 0, rowSpan: 1, colSpan: 1 }
        ]
      }
    ],

    3: [
      {
        id: "3-strip",
        name: "3 in a Row",
        grid: { rows: 1, cols: 3 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 0, col: 2, rowSpan: 1, colSpan: 1 }
        ]
      }
    ],

    4: [
      {
        id: "4-strip",
        name: "4 in a Row",
        grid: { rows: 1, cols: 4 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 0, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 0, col: 3, rowSpan: 1, colSpan: 1 }
        ]
      }
    ],

    // Legal size works well with horizontal strips due to its wide format
    5: [
      {
        id: "5-strip",
        name: "5 in a Row",
        grid: { rows: 1, cols: 5 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 0, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 0, col: 3, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 0, col: 4, rowSpan: 1, colSpan: 1 }
        ]
      }
    ],

    6: [
      {
        id: "6-strip",
        name: "6 in a Row",
        grid: { rows: 1, cols: 6 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 0, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 0, col: 3, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 0, col: 4, rowSpan: 1, colSpan: 1 },
          { imageIndex: 5, row: 0, col: 5, rowSpan: 1, colSpan: 1 }
        ]
      },
      {
        id: "6-grid-2x3",
        name: "2x3 Grid",
        grid: { rows: 2, cols: 3 },
        positions: [
          { imageIndex: 0, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 1, row: 0, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 2, row: 0, col: 2, rowSpan: 1, colSpan: 1 },
          { imageIndex: 3, row: 1, col: 0, rowSpan: 1, colSpan: 1 },
          { imageIndex: 4, row: 1, col: 1, rowSpan: 1, colSpan: 1 },
          { imageIndex: 5, row: 1, col: 2, rowSpan: 1, colSpan: 1 }
        ]
      }
    ]
  }
};

// Create the final HARDCODED_LAYOUTS object - all paper sizes use the same layout proportions
const UNIVERSAL_LAYOUTS = HARDCODED_LAYOUTS_RAW.A4;

const HARDCODED_LAYOUTS = {
  A4: UNIVERSAL_LAYOUTS,
  A3: UNIVERSAL_LAYOUTS,
  Letter: UNIVERSAL_LAYOUTS,
  Legal: UNIVERSAL_LAYOUTS,
};

// Future paper sizes can be added here
export const SUPPORTED_PAPER_SIZES = ["A4", "A3", "Letter", "Legal"];

/**
 * Get layout options for a specific paper size and number of images
 * @param {string} paperSize - Paper size (A4, A3, Letter, Legal)
 * @param {number} imageCount - Number of images
 * @param {boolean} isPortrait - Whether to transpose layouts for portrait orientation
 * @returns {Array} Array of layout options
 */
export function getLayoutOptions(paperSize = "A4", imageCount = 1, isPortrait = false) {
  const layouts = HARDCODED_LAYOUTS[paperSize];
  if (!layouts) {
    return [];
  }

  const baseLayouts = layouts[imageCount] || [];
  
  // If portrait orientation, transpose the layouts (swap rows/cols)
  if (isPortrait) {
    return baseLayouts.map(layout => transposeLayout(layout));
  }
  
  return baseLayouts;
}

/**
 * Transpose a layout for portrait orientation (swap rows and columns)
 * @param {Object} layout - Layout configuration
 * @returns {Object} Transposed layout
 */
function transposeLayout(layout) {
  // For portrait orientation, we swap width and height
  // This means rows become columns and columns become rows
  return {
    ...layout,
    id: `${layout.id}-portrait`,
    // Keep the name as-is without the suffix for cleaner UI
    name: layout.name,
    grid: {
      rows: layout.grid.cols,
      cols: layout.grid.rows
    },
    positions: layout.positions.map(pos => ({
      imageIndex: pos.imageIndex,
      row: pos.col,
      col: pos.row,
      rowSpan: pos.colSpan,
      colSpan: pos.rowSpan
    }))
  };
}

/**
 * Get all available layouts for a paper size
 * @param {string} paperSize - Paper size (A4, A3, Letter, Legal)
 * @returns {Object} Object with image counts as keys and layout arrays as values
 */
export function getAllLayouts(paperSize = "A4") {
  return HARDCODED_LAYOUTS[paperSize] || {};
}

/**
 * Convert hardcoded layout to fullCoverLayoutUtils format
 * @param {Object} layout - Hardcoded layout configuration
 * @param {Array} images - Array of images to layout
 * @param {number} pageWidth - Page width in pixels
 * @param {number} pageHeight - Page height in pixels
 * @returns {Array} Array of positioned images
 */
export function convertToFullCoverFormat(layout, images, pageWidth, pageHeight, borderOffset = 0) {
  const { grid, positions } = layout;
  const cellWidth = pageWidth / grid.cols;
  const cellHeight = pageHeight / grid.rows;

  const result = [];

  for (const pos of positions) {
    if (pos.imageIndex >= images.length) continue;

    const image = images[pos.imageIndex];
    const x = pos.col * cellWidth + borderOffset;
    const y = pos.row * cellHeight + borderOffset;
    const width = pos.colSpan * cellWidth;
    const height = pos.rowSpan * cellHeight;

    result.push({
      ...image,
      x,
      y,
      previewWidth: width,
      previewHeight: height,
      rowIndex: pos.row,
      colIndex: pos.col,
      fullCoverMode: true,
      gridSpan: {
        rowStart: pos.row,
        rowEnd: pos.row + pos.rowSpan,
        colStart: pos.col,
        colEnd: pos.col + pos.colSpan
      }
    });
  }

  return result;
}

/**
 * Get layout names and IDs for UI selection
 * @param {string} paperSize - Paper size (A4, A3, Letter, Legal)
 * @param {number} imageCount - Number of images
 * @param {boolean} isPortrait - Whether to transpose layouts for portrait orientation
 * @returns {Array} Array of {id, name} objects for UI display
 */
export function getLayoutSelectionOptions(paperSize = "A4", imageCount = 1, isPortrait = false) {
  const layouts = getLayoutOptions(paperSize, imageCount, isPortrait);
  return layouts.map(layout => ({
    id: layout.id,
    name: layout.name,
    description: `${layout.grid.rows}×${layout.grid.cols} grid`
  }));
}

/**
 * Check if hardcoded layouts are available for given parameters
 * @param {string} paperSize - Paper size (A4, A3, Letter, Legal)
 * @param {number} imageCount - Number of images
 * @param {boolean} isPortrait - Whether to transpose layouts for portrait orientation
 * @returns {boolean} True if layouts are available
 */
export function hasHardcodedLayouts(paperSize = "A4", imageCount = 1, isPortrait = false) {
  const layouts = getLayoutOptions(paperSize, imageCount, isPortrait);
  return layouts.length > 0;
}

/**
 * Apply a specific hardcoded layout to images
 * @param {Object} layout - Selected hardcoded layout
 * @param {Array} images - Array of images to layout
 * @param {number} pageWidth - Page width in pixels
 * @param {number} pageHeight - Page height in pixels
 * @returns {Array} Array of positioned images with layout applied
 */
export function applyHardcodedLayout(layout, images, pageWidth, pageHeight, borderOffset = 0) {
  if (!layout || !images || images.length === 0) {
    return images;
  }

  return convertToFullCoverFormat(layout, images, pageWidth, pageHeight, borderOffset);
}

/**
 * Validate and filter layouts to remove invalid ones
 */
function validateLayout(layout) {
  const { grid, positions } = layout;
  const totalGridSpaces = grid.rows * grid.cols;
  
  // Check for overlapping positions
  const occupiedCells = new Map();
  let hasOverlaps = false;
  
  for (const pos of positions) {
    for (let r = pos.row; r < pos.row + pos.rowSpan; r++) {
      for (let c = pos.col; c < pos.col + pos.colSpan; c++) {
        const cellKey = `${r}-${c}`;
        if (occupiedCells.has(cellKey)) {
          hasOverlaps = true;
          break;
        }
        occupiedCells.set(cellKey, pos.imageIndex);
      }
      if (hasOverlaps) break;
    }
    if (hasOverlaps) break;
  }
  
  // Check efficiency (must use at least 70% of grid space)
  const usedSpaces = occupiedCells.size;
  const efficiencyRatio = usedSpaces / totalGridSpaces;
  const isEfficient = efficiencyRatio >= 0.7;
  
  return !hasOverlaps && isEfficient;
}

/**
 * Filter out invalid layouts
 */
function filterValidLayouts(layouts) {
  const filtered = {};
  
  Object.keys(layouts).forEach(paperSize => {
    filtered[paperSize] = {};
    
    Object.keys(layouts[paperSize]).forEach(imageCount => {
      const validLayouts = layouts[paperSize][imageCount].filter(validateLayout);
      if (validLayouts.length > 0) {
        filtered[paperSize][imageCount] = validLayouts;
      }
    });
  });
  
  return filtered;
}

// Use pre-validated hardcoded layouts (no runtime filtering)
export { HARDCODED_LAYOUTS };

/**
 * Get current layout ID from positioned images (reverse engineering)
 * @param {Array} images - Array of positioned images
 * @param {string} paperSize - Paper size (A4, A3, Letter, Legal)
 * @param {boolean} isPortrait - Whether to transpose layouts for portrait orientation
 * @returns {string|null} Layout ID if detected, null otherwise
 */
export function detectCurrentLayoutId(images, paperSize = "A4", isPortrait = false) {
  if (!images || images.length === 0) {
    return null;
  }

  const layouts = getLayoutOptions(paperSize, images.length, isPortrait);
  
  // For now, return null as layout detection is complex
  // This could be enhanced in the future to reverse-engineer the current layout
  return null;
}