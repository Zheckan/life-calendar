const HEX_COLOR_RE = /^#[0-9A-F]{6}$/i;

export function isValidHexColor(color: string | null | undefined): color is string {
  return typeof color === "string" && HEX_COLOR_RE.test(color);
}

export function normalizeHexColor(color: string | null | undefined): string | null {
  return isValidHexColor(color) ? color.toUpperCase() : null;
}
