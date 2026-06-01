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
