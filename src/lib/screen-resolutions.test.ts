import { describe, expect, test } from "bun:test";

import {
  SCREEN_RESOLUTIONS,
  getOrientedResolution,
  findScreenResolution,
  searchScreenResolutions,
} from "./screen-resolutions";

describe("screen resolutions", () => {
  test("includes iPad presets as portrait tablet wallpaper resolutions", () => {
    expect(SCREEN_RESOLUTIONS).toContainEqual(
      expect.objectContaining({
        name: "iPad Pro 11-inch",
        width: 1668,
        height: 2420,
        deviceType: "tablet",
      }),
    );
    expect(SCREEN_RESOLUTIONS).toContainEqual(
      expect.objectContaining({
        name: "iPad Air 13-inch",
        width: 2048,
        height: 2732,
        deviceType: "tablet",
      }),
    );
  });

  test("finds presets by name", () => {
    expect(findScreenResolution("iPad mini")).toEqual(
      expect.objectContaining({
        name: "iPad mini",
        width: 1488,
        height: 2266,
      }),
    );
  });

  test("searches presets by name, keyword, and resolution", () => {
    expect(searchScreenResolutions("ipad 13 pro").map((resolution) => resolution.name)).toContain(
      "iPad Pro 13-inch",
    );
    expect(searchScreenResolutions("standard").map((resolution) => resolution.name)).toContain(
      "iPad 11-inch",
    );
    expect(searchScreenResolutions("1640").map((resolution) => resolution.name)).toEqual(
      expect.arrayContaining(["iPad Air 11-inch", "iPad 11-inch"]),
    );
  });

  test("swaps tablet preset dimensions for landscape orientation", () => {
    const ipad = findScreenResolution("iPad Pro 11-inch");

    expect(ipad).toBeDefined();
    expect(getOrientedResolution(ipad!, "portrait")).toEqual({ width: 1668, height: 2420 });
    expect(getOrientedResolution(ipad!, "landscape")).toEqual({ width: 2420, height: 1668 });
  });

  test("does not rotate phone preset dimensions", () => {
    const iphone = findScreenResolution("iPhone 15 / 15 Pro / 16");

    expect(iphone).toBeDefined();
    expect(getOrientedResolution(iphone!, "landscape")).toEqual({ width: 1179, height: 2556 });
  });
});
