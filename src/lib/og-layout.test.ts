import { describe, expect, test } from "bun:test";

import { capDotSizeByVerticalSpace, getFittedDotGridLayout } from "./og-layout";

describe("OG dot grid layout", () => {
  test("fits days calendar dots inside an iPad Air portrait image", () => {
    const topPadding = Math.round(2360 * 0.155);
    const footerHeight = 40 + 36;
    const bottomReserve = Math.round(2360 * 0.06);
    const layout = getFittedDotGridLayout({
      width: 1640,
      height: 2360,
      cols: 15,
      rows: 25,
      maxGridWidthRatio: 0.79,
      reservedHeight: topPadding + footerHeight + bottomReserve,
      dotRatio: 0.6,
      minDotSize: 4,
    });

    expect(layout.gridHeight + topPadding + footerHeight + bottomReserve).toBeLessThanOrEqual(2360);
    expect(layout.dotSize).toBeLessThan(52);
  });

  test("fits days calendar dots inside an iPad Air landscape image", () => {
    const topPadding = Math.round(1640 * 0.155);
    const footerHeight = 40 + 36;
    const bottomReserve = Math.round(1640 * 0.06);
    const layout = getFittedDotGridLayout({
      width: 2360,
      height: 1640,
      cols: 15,
      rows: 25,
      maxGridWidthRatio: 0.79,
      reservedHeight: topPadding + footerHeight + bottomReserve,
      dotRatio: 0.6,
      minDotSize: 4,
    });

    expect(layout.gridHeight + topPadding + footerHeight + bottomReserve).toBeLessThanOrEqual(1640);
    expect(layout.gridWidth).toBeLessThan(2360 * 0.79);
  });

  test("caps quarter calendar dots inside an iPad Air landscape image", () => {
    const topPadding = Math.round(1640 * 0.138);
    const footerHeight = 50 + 36;
    const bottomReserve = Math.round(1640 * 0.06);
    const dotSize = capDotSizeByVerticalSpace({
      dotSize: 25,
      height: 1640,
      reservedHeight: topPadding + footerHeight + bottomReserve,
      rowCounts: [14, 14],
      cellPitchRatio: 1.88,
      rowGapRatio: 1.6,
      minDotSize: 4,
    });
    const contentHeight = (14 + 14) * (dotSize * 1.88) + dotSize * 1.6;

    expect(topPadding + contentHeight + footerHeight + bottomReserve).toBeLessThanOrEqual(1640);
    expect(dotSize).toBeLessThan(25);
  });
});
