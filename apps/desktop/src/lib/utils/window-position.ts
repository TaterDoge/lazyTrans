export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Point = {
  x: number;
  y: number;
};

export type Size = {
  width: number;
  height: number;
};

export type WindowPositionMode = "mouse" | "center";

function clamp(value: number, min: number, max: number) {
  if (max < min) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
}

function sanitizeSize(size: Size): Size {
  return {
    width: Math.max(0, size.width),
    height: Math.max(0, size.height),
  };
}

export function clampWindowPosition(
  point: Point,
  windowSize: Size,
  workArea: Rect
) {
  const size = sanitizeSize(windowSize);
  const maxX = workArea.x + Math.max(0, workArea.width - size.width);
  const maxY = workArea.y + Math.max(0, workArea.height - size.height);

  return {
    x: clamp(point.x, workArea.x, maxX),
    y: clamp(point.y, workArea.y, maxY),
  };
}

export function resolveMouseWindowPosition(
  cursor: Point,
  windowSize: Size,
  workArea: Rect
) {
  return clampWindowPosition(cursor, windowSize, workArea);
}

export function resolveCenteredWindowPosition(
  windowSize: Size,
  workArea: Rect
) {
  const size = sanitizeSize(windowSize);

  return clampWindowPosition(
    {
      x: workArea.x + (workArea.width - size.width) / 2,
      y: workArea.y + (workArea.height - size.height) / 2,
    },
    size,
    workArea
  );
}

export function resolveResizedWindowPosition(
  mode: WindowPositionMode,
  currentPosition: Point,
  windowSize: Size,
  workArea: Rect
) {
  if (mode === "center") {
    return resolveCenteredWindowPosition(windowSize, workArea);
  }

  return clampWindowPosition(currentPosition, windowSize, workArea);
}

export function toIntegerPoint(point: Point) {
  return {
    x: Math.round(point.x),
    y: Math.round(point.y),
  };
}
