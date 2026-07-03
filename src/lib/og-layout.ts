interface FittedDotGridLayoutInput {
  width: number;
  height: number;
  cols: number;
  rows: number;
  maxGridWidthRatio: number;
  reservedHeight: number;
  dotRatio: number;
  minDotSize: number;
}

interface FittedDotGridLayout {
  cellSize: number;
  dotSize: number;
  gapSize: number;
  gridWidth: number;
  gridHeight: number;
}

interface DotSizeVerticalCapInput {
  dotSize: number;
  height: number;
  reservedHeight: number;
  rowCounts: number[];
  cellPitchRatio: number;
  rowGapRatio: number;
  minDotSize: number;
}

interface ImageOffsetPixelsInput {
  width: number;
  height: number;
  x: number;
  y: number;
}

interface PreviewImageTransformInput {
  x: number;
  y: number;
  scale: number;
}

const MAX_IMAGE_OFFSET_PERCENT = 30;
const MIN_IMAGE_SCALE_PERCENT = 80;
const MAX_IMAGE_SCALE_PERCENT = 140;
const DEFAULT_IMAGE_SCALE_PERCENT = 100;

export function getFittedDotGridLayout({
  width,
  height,
  cols,
  rows,
  maxGridWidthRatio,
  reservedHeight,
  dotRatio,
  minDotSize,
}: FittedDotGridLayoutInput): FittedDotGridLayout {
  const maxGridWidth = width * maxGridWidthRatio;
  const maxGridHeight = Math.max(minDotSize * rows, height - reservedHeight);
  const widthCellSize = maxGridWidth / cols;
  const heightCellSize = maxGridHeight / rows;
  const cellSize = Math.max(minDotSize, Math.min(widthCellSize, heightCellSize));
  const dotSize = Math.max(minDotSize, cellSize * dotRatio);
  const gapSize = Math.max(0, cellSize - dotSize);

  return {
    cellSize,
    dotSize,
    gapSize,
    gridWidth: cellSize * cols,
    gridHeight: cellSize * rows,
  };
}

export function capDotSizeByVerticalSpace({
  dotSize,
  height,
  reservedHeight,
  rowCounts,
  cellPitchRatio,
  rowGapRatio,
  minDotSize,
}: DotSizeVerticalCapInput): number {
  const availableHeight = Math.max(minDotSize, height - reservedHeight);
  const rowWeight = rowCounts.reduce((sum, rowCount) => sum + rowCount, 0) * cellPitchRatio;
  const rowGapWeight = Math.max(0, rowCounts.length - 1) * rowGapRatio;
  const maxDotSize = availableHeight / (rowWeight + rowGapWeight);

  return Math.max(minDotSize, Math.min(dotSize, maxDotSize));
}

export function normalizeImageOffset(value: string | number | null | undefined): number {
  const parsed = typeof value === "number" ? value : Number.parseFloat(value ?? "0");

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.min(MAX_IMAGE_OFFSET_PERCENT, Math.max(-MAX_IMAGE_OFFSET_PERCENT, parsed));
}

export function getImageOffsetPixels({ width, height, x, y }: ImageOffsetPixelsInput): {
  x: number;
  y: number;
} {
  return {
    x: Math.round((width * normalizeImageOffset(x)) / 100),
    y: Math.round((height * normalizeImageOffset(y)) / 100),
  };
}

export function normalizeImageScale(value: string | number | null | undefined): number {
  const parsed = typeof value === "number" ? value : Number.parseFloat(value ?? "");

  if (!Number.isFinite(parsed)) {
    return DEFAULT_IMAGE_SCALE_PERCENT;
  }

  return Math.min(MAX_IMAGE_SCALE_PERCENT, Math.max(MIN_IMAGE_SCALE_PERCENT, parsed));
}

export function getPreviewImageTransform({ x, y, scale }: PreviewImageTransformInput): string {
  return `translate(${normalizeImageOffset(x)}%, ${normalizeImageOffset(y)}%) scale(${
    normalizeImageScale(scale) / 100
  })`;
}
