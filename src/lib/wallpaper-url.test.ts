import { describe, expect, test } from "bun:test";

import {
  buildAbsoluteWallpaperUrl,
  buildAdjustedWallpaperQueryString,
  buildWallpaperImagePath,
  DEFAULT_IMAGE_ADJUSTMENT,
  type ImageAdjustment,
} from "@/lib/wallpaper-url";

describe("wallpaper URL helpers", () => {
  test("keeps the base query unchanged for default image adjustment", () => {
    expect(
      buildAdjustedWallpaperQueryString("view=days&theme=dark", DEFAULT_IMAGE_ADJUSTMENT),
    ).toBe("view=days&theme=dark");
  });

  test("adds image adjustment query params when the wallpaper is moved or scaled", () => {
    const adjustment: ImageAdjustment = { offsetX: 4, offsetY: -6, scale: 115 };

    expect(buildAdjustedWallpaperQueryString("view=days&theme=dark", adjustment)).toBe(
      "view=days&theme=dark&offsetX=4&offsetY=-6&imageScale=115",
    );
  });

  test("builds an OG wallpaper image path", () => {
    expect(buildWallpaperImagePath(2420, 1668, "view=days&theme=dark")).toBe(
      "/og/2420x1668?view=days&theme=dark",
    );
  });

  test("builds absolute URLs only after the browser origin is known", () => {
    expect(buildAbsoluteWallpaperUrl("", "/og/2420x1668?view=days")).toBe("");
    expect(buildAbsoluteWallpaperUrl("https://life.example", "/og/2420x1668?view=days")).toBe(
      "https://life.example/og/2420x1668?view=days",
    );
  });
});
