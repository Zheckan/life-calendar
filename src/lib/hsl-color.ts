export interface HslColor {
  h: number;
  s: number;
  l: number;
}

interface EditableHslSyncInput {
  previous: HslColor;
  incoming: HslColor;
  isInternalUpdate: boolean;
  isOpen: boolean;
}

export function mergeEditableHsl(previous: HslColor, incoming: HslColor): HslColor {
  if (incoming.s > 0) {
    return incoming;
  }

  return {
    h: previous.h,
    s: previous.s,
    l: incoming.l,
  };
}

export function getSyncedEditableHsl({
  previous,
  incoming,
  isInternalUpdate,
  isOpen,
}: EditableHslSyncInput): HslColor {
  if (isInternalUpdate) {
    return previous;
  }

  if (!isOpen) {
    return incoming;
  }

  return mergeEditableHsl(previous, incoming);
}
