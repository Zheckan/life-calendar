import { describe, expect, test } from "bun:test";

import { getSyncedEditableHsl, mergeEditableHsl, type HslColor } from "@/lib/hsl-color";

describe("editable HSL color state", () => {
  test("preserves hue and saturation when the visible color becomes black", () => {
    const previous: HslColor = { h: 214, s: 80, l: 47 };
    const blackFromHex: HslColor = { h: 0, s: 0, l: 0 };

    expect(mergeEditableHsl(previous, blackFromHex)).toEqual({ h: 214, s: 80, l: 0 });
  });

  test("preserves hue and saturation when the visible color becomes gray", () => {
    const previous: HslColor = { h: 32, s: 76, l: 44 };
    const grayFromHex: HslColor = { h: 0, s: 0, l: 19 };

    expect(mergeEditableHsl(previous, grayFromHex)).toEqual({ h: 32, s: 76, l: 19 });
  });

  test("uses the incoming hue and saturation for chromatic colors", () => {
    const previous: HslColor = { h: 214, s: 80, l: 47 };
    const orangeFromHex: HslColor = { h: 14, s: 90, l: 60 };

    expect(mergeEditableHsl(previous, orangeFromHex)).toEqual(orangeFromHex);
  });

  test("keeps exact editable channels for color changes emitted by the picker", () => {
    const previous: HslColor = { h: 0, s: 60, l: 99 };
    const quantizedHexRoundTrip: HslColor = { h: 0, s: 61, l: 99 };

    expect(
      getSyncedEditableHsl({
        previous,
        incoming: quantizedHexRoundTrip,
        isInternalUpdate: true,
        isOpen: true,
      }),
    ).toEqual(previous);
  });
});
