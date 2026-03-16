const HEX_COLOR_RE = /^#[0-9A-F]{6}$/i;

export function isValidHexColor(color: string | null | undefined): color is string {
  return typeof color === "string" && HEX_COLOR_RE.test(color);
}

export function normalizeHexColor(color: string | null | undefined): string | null {
  return isValidHexColor(color) ? color.toUpperCase() : null;
}

export function isDarkHexColor(color: string): boolean {
  const normalized = normalizeHexColor(color);
  if (!normalized) {
    return false;
  }

  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);
  return r + g + b < 384;
}

export function getAutoDotColor(theme: string, backgroundColor: string | null | undefined): string {
  const defaultDotColor = theme === "light" ? "#D1D5DB" : "#404040";
  const normalizedBackground = normalizeHexColor(backgroundColor);

  if (!normalizedBackground) {
    return defaultDotColor;
  }

  return isDarkHexColor(normalizedBackground) ? "#606060" : "#D1D5DB";
}
