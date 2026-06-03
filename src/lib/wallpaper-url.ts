export interface ImageAdjustment {
  offsetX: number;
  offsetY: number;
  scale: number;
}

export const DEFAULT_IMAGE_ADJUSTMENT: ImageAdjustment = {
  offsetX: 0,
  offsetY: 0,
  scale: 100,
};

export function buildAdjustedWallpaperQueryString(
  baseQueryString: string,
  adjustment: ImageAdjustment,
): string {
  const params = new URLSearchParams(baseQueryString);

  if (adjustment.offsetX !== 0) {
    params.set("offsetX", String(adjustment.offsetX));
  }
  if (adjustment.offsetY !== 0) {
    params.set("offsetY", String(adjustment.offsetY));
  }
  if (adjustment.scale !== 100) {
    params.set("imageScale", String(adjustment.scale));
  }

  return params.toString();
}

export function buildWallpaperImagePath(
  width: number,
  height: number,
  queryString: string,
): string {
  return `/og/${width}x${height}${queryString ? `?${queryString}` : ""}`;
}

export function buildAbsoluteWallpaperUrl(origin: string, wallpaperPath: string): string {
  return origin ? `${origin}${wallpaperPath}` : "";
}
