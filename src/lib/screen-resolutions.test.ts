import { describe, expect, test } from "bun:test";

import {
  SCREEN_RESOLUTIONS,
  findScreenResolution,
  searchScreenResolutions,
} from "./screen-resolutions";

describe("screen resolutions", () => {
  test("includes phone presets and a custom option", () => {
    expect(SCREEN_RESOLUTIONS).toContainEqual(
      expect.objectContaining({
        name: "iPhone 15 / 15 Pro / 16",
        width: 1179,
        height: 2556,
        deviceType: "phone",
      }),
    );
    expect(SCREEN_RESOLUTIONS).toContainEqual(
      expect.objectContaining({
        name: "Custom",
        deviceType: "custom",
      }),
    );
  });

  test("exposes only phone presets and the custom option", () => {
    expect(
      SCREEN_RESOLUTIONS.every((resolution) => ["phone", "custom"].includes(resolution.deviceType)),
    ).toBe(true);
  });

  test("finds phone presets by name", () => {
    expect(findScreenResolution("Google Pixel 9 Pro")).toEqual(
      expect.objectContaining({
        name: "Google Pixel 9 Pro",
        width: 1280,
        height: 2856,
        deviceType: "phone",
      }),
    );
  });

  test("searches phone presets by name, category, and resolution", () => {
    expect(searchScreenResolutions("iphone 16 pro").map((resolution) => resolution.name)).toEqual(
      expect.arrayContaining(["iPhone 16 Pro", "iPhone 16 Pro Max"]),
    );
    expect(searchScreenResolutions("samsung").map((resolution) => resolution.name)).toEqual(
      expect.arrayContaining(["Samsung Galaxy S24", "Samsung Galaxy S24+ / Ultra"]),
    );
    expect(searchScreenResolutions("1179x2556").map((resolution) => resolution.name)).toContain(
      "iPhone 15 / 15 Pro / 16",
    );
  });
});
