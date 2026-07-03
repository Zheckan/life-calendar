import { describe, expect, test } from "bun:test";

import {
  capDotSizeByVerticalSpace,
  getFittedDotGridLayout,
  getImageOffsetPixels,
  getPreviewImageTransform,
  normalizeImageScale,
  normalizeImageOffset,
} from "./og-layout";

describe("OG dot grid layout", () => {
  test("fits days calendar dots inside a standard phone wallpaper", () => {
    const topPadding = Math.round(2556 * 0.155);
    const footerHeight = 40 + 36;
    const bottomReserve = Math.round(2556 * 0.06);
    const layout = getFittedDotGridLayout({
      width: 1179,
      height: 2556,
      cols: 15,
      rows: 25,
      maxGridWidthRatio: 0.79,
      reservedHeight: topPadding + footerHeight + bottomReserve,
      dotRatio: 0.6,
      minDotSize: 4,
    });

    expect(layout.gridHeight + topPadding + footerHeight + bottomReserve).toBeLessThanOrEqual(2556);
    expect(layout.dotSize).toBeLessThan(52);
  });

  test("fits days calendar dots inside a compact custom phone wallpaper", () => {
    const topPadding = Math.round(1800 * 0.155);
    const footerHeight = 40 + 36;
    const bottomReserve = Math.round(1800 * 0.06);
    const layout = getFittedDotGridLayout({
      width: 1080,
      height: 1800,
      cols: 15,
      rows: 25,
      maxGridWidthRatio: 0.79,
      reservedHeight: topPadding + footerHeight + bottomReserve,
      dotRatio: 0.6,
      minDotSize: 4,
    });

    expect(layout.gridHeight + topPadding + footerHeight + bottomReserve).toBeLessThanOrEqual(1800);
    expect(layout.gridWidth).toBeLessThan(1080 * 0.79);
  });

  test("caps quarter calendar dots inside a compact custom phone wallpaper", () => {
    const topPadding = Math.round(1600 * 0.138);
    const footerHeight = 50 + 36;
    const bottomReserve = Math.round(1600 * 0.06);
    const dotSize = capDotSizeByVerticalSpace({
      dotSize: 25,
      height: 1600,
      reservedHeight: topPadding + footerHeight + bottomReserve,
      rowCounts: [14, 14],
      cellPitchRatio: 1.88,
      rowGapRatio: 1.6,
      minDotSize: 4,
    });
    const contentHeight = (14 + 14) * (dotSize * 1.88) + dotSize * 1.6;

    expect(topPadding + contentHeight + footerHeight + bottomReserve).toBeLessThanOrEqual(1600);
    expect(dotSize).toBeLessThan(25);
  });

  test("normalizes image offsets into a bounded percent range", () => {
    expect(normalizeImageOffset("12.4")).toBe(12.4);
    expect(normalizeImageOffset("-50")).toBe(-30);
    expect(normalizeImageOffset("nonsense")).toBe(0);
  });

  test("converts image offset percentages to output pixels", () => {
    expect(getImageOffsetPixels({ width: 1179, height: 2556, x: 10, y: -5 })).toEqual({
      x: 118,
      y: -128,
    });
  });

  test("normalizes image scale into a bounded percent range", () => {
    expect(normalizeImageScale("115")).toBe(115);
    expect(normalizeImageScale("10")).toBe(80);
    expect(normalizeImageScale("200")).toBe(140);
    expect(normalizeImageScale("nonsense")).toBe(100);
  });

  test("builds a CSS transform for client-side preview adjustment", () => {
    expect(getPreviewImageTransform({ x: 8, y: -4, scale: 120 })).toBe(
      "translate(8%, -4%) scale(1.2)",
    );
  });
});
