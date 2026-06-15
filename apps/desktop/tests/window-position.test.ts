/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test";
import {
  clampWindowPosition,
  resolveCenteredWindowPosition,
  resolveMouseWindowPosition,
  resolveResizedWindowPosition,
} from "../src/lib/utils/window-position";

const workArea = { x: 0, y: 0, width: 1920, height: 1080 };
const windowSize = { width: 450, height: 320 };

describe("window-position", () => {
  test("uses the cursor as the initial top-left position", () => {
    expect(
      resolveMouseWindowPosition({ x: 240, y: 160 }, windowSize, workArea)
    ).toEqual({ x: 240, y: 160 });
  });

  test("keeps mouse-positioned windows inside the right and bottom edges", () => {
    expect(
      resolveMouseWindowPosition({ x: 1800, y: 1000 }, windowSize, workArea)
    ).toEqual({ x: 1470, y: 760 });
  });

  test("keeps windows inside work areas with negative monitor coordinates", () => {
    expect(
      clampWindowPosition(
        { x: -80, y: 1000 },
        { width: 400, height: 300 },
        { x: -1280, y: 0, width: 1280, height: 1024 }
      )
    ).toEqual({ x: -400, y: 724 });
  });

  test("centers a window within the monitor work area", () => {
    expect(resolveCenteredWindowPosition(windowSize, workArea)).toEqual({
      x: 735,
      y: 380,
    });
  });

  test("pins oversized windows to the work area origin", () => {
    expect(
      resolveCenteredWindowPosition(
        { width: 2400, height: 1400 },
        { x: 100, y: 50, width: 800, height: 600 }
      )
    ).toEqual({ x: 100, y: 50 });
  });

  test("recenters a center-positioned window after it shrinks", () => {
    expect(
      resolveResizedWindowPosition(
        "center",
        { x: 735, y: 0 },
        { width: 450, height: 320 },
        workArea
      )
    ).toEqual({ x: 735, y: 380 });
  });

  test("keeps mouse-positioned resized windows anchored to their current top-left", () => {
    expect(
      resolveResizedWindowPosition(
        "mouse",
        { x: 735, y: 0 },
        { width: 450, height: 320 },
        workArea
      )
    ).toEqual({ x: 735, y: 0 });
  });
});
