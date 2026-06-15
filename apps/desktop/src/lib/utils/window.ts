import { hide } from "@tauri-apps/api/app";
import { PhysicalPosition } from "@tauri-apps/api/dpi";
import {
  getCurrentWebviewWindow,
  WebviewWindow,
} from "@tauri-apps/api/webviewWindow";
import {
  currentMonitor,
  cursorPosition,
  monitorFromPoint,
} from "@tauri-apps/api/window";
import { WINDOW_CONFIG, type WindowLabel } from "@/config/window.config";
import { getGeneralSettingsSnapshot } from "@/stores/settings/general.store";
import {
  type Point,
  type Rect,
  resolveCenteredWindowPosition,
  resolveMouseWindowPosition,
  type Size,
  toIntegerPoint,
  type WindowPositionMode,
} from "./window-position";

const TRANSLATOR_POSITION_REAPPLY_DELAYS = [0, 120, 280];

type TranslatorWindowPlacement = {
  anchor: Point | null;
  mode: WindowPositionMode;
  workArea: Rect;
};

async function getWindow(label?: WindowLabel) {
  if (!label) {
    return getCurrentWebviewWindow();
  }

  return await WebviewWindow.getByLabel(label);
}

async function focusAnotherVisibleWindow(): Promise<boolean> {
  const windows = await WebviewWindow.getAll();

  for (const win of windows) {
    if (await win.isVisible()) {
      await win.show();
      await win.unminimize();
      await win.setFocus();
      return true;
    }
  }

  await hide();
  return false;
}

function getConfiguredWindowSize(
  label: WindowLabel,
  scaleFactor: number
): Size {
  const config = WINDOW_CONFIG[label];

  return {
    width: Math.max(1, (config.width ?? 0) * scaleFactor),
    height: Math.max(1, (config.height ?? config.minHeight ?? 0) * scaleFactor),
  };
}

async function getWindowSize(win: WebviewWindow, label: WindowLabel) {
  const measuredSize = await win.outerSize().catch(() => null);
  const scaleFactor = await win.scaleFactor().catch(() => 1);
  const fallbackSize = getConfiguredWindowSize(label, scaleFactor);

  if (
    measuredSize &&
    measuredSize.width > 0 &&
    measuredSize.height > 0 &&
    Number.isFinite(measuredSize.width) &&
    Number.isFinite(measuredSize.height)
  ) {
    return measuredSize;
  }

  return fallbackSize;
}

function getMonitorWorkArea(
  monitor: Awaited<ReturnType<typeof currentMonitor>>
) {
  if (!monitor) {
    return null;
  }

  return {
    x: monitor.workArea.position.x,
    y: monitor.workArea.position.y,
    width: monitor.workArea.size.width,
    height: monitor.workArea.size.height,
  } satisfies Rect;
}

async function getMonitorAtPoint(point: Point) {
  return (
    (await monitorFromPoint(point.x, point.y).catch(() => null)) ??
    (await currentMonitor().catch(() => null))
  );
}

async function resolveTranslatorPlacement(): Promise<TranslatorWindowPlacement | null> {
  const { translatorWindowPosition } = await getGeneralSettingsSnapshot();
  const mode = translatorWindowPosition ?? "mouse";
  const cursor = await cursorPosition().catch(() => null);
  const anchor = cursor ? { x: cursor.x, y: cursor.y } : null;

  if (mode === "mouse" && !anchor) {
    return null;
  }

  const monitor = anchor
    ? await getMonitorAtPoint(anchor)
    : await currentMonitor().catch(() => null);
  const workArea = getMonitorWorkArea(monitor);

  if (!workArea) {
    return null;
  }

  return { anchor, mode, workArea };
}

async function applyTranslatorPlacement(
  win: WebviewWindow,
  placement: TranslatorWindowPlacement
) {
  const size = await getWindowSize(win, "translator");
  const position =
    placement.mode === "center"
      ? resolveCenteredWindowPosition(size, placement.workArea)
      : resolveMouseWindowPosition(
          placement.anchor ?? placement.workArea,
          size,
          placement.workArea
        );
  const roundedPosition = toIntegerPoint(position);

  await win.setPosition(
    new PhysicalPosition(roundedPosition.x, roundedPosition.y)
  );
}

function reapplyTranslatorPlacement(
  win: WebviewWindow,
  placement: TranslatorWindowPlacement
) {
  for (const delay of TRANSLATOR_POSITION_REAPPLY_DELAYS) {
    window.setTimeout(() => {
      applyTranslatorPlacement(win, placement).catch(console.error);
    }, delay);
  }
}

async function showTranslatorWindow(win: WebviewWindow) {
  const placement = await resolveTranslatorPlacement().catch(() => null);

  await win.unminimize();

  if (placement) {
    await applyTranslatorPlacement(win, placement).catch(console.error);
  }

  await win.show();

  if (placement) {
    await applyTranslatorPlacement(win, placement).catch(console.error);
  }

  await win.setFocus();

  if (placement) {
    reapplyTranslatorPlacement(win, placement);
  }
}

export async function getTranslatorWindowPlacementMode(): Promise<WindowPositionMode> {
  const { translatorWindowPosition } = await getGeneralSettingsSnapshot();

  return translatorWindowPosition ?? "mouse";
}

export function showWindow(label?: WindowLabel) {
  getWindow(label)
    .then(async (win) => {
      if (!win) {
        return;
      }

      if (label === "translator") {
        await showTranslatorWindow(win);
        return;
      }

      await win.show();
      await win.unminimize();
      await win.setFocus();
    })
    .catch(() => undefined);
}

export function hideWindow(label?: WindowLabel) {
  getWindow(label)
    .then(async (win) => {
      if (!win) {
        return;
      }

      await win.hide();

      await focusAnotherVisibleWindow();
    })
    .catch(() => undefined);
}

export function toggleWindow(label?: WindowLabel) {
  getWindow(label)
    .then(async (win) => {
      if (!win) {
        return;
      }

      if (await win.isVisible()) {
        await win.hide();
        await focusAnotherVisibleWindow();
        return;
      }

      if (label === "translator") {
        await showTranslatorWindow(win);
        return;
      }

      await win.show();
      await win.unminimize();
      await win.setFocus();
    })
    .catch(() => undefined);
}

export async function hideAllWindows(): Promise<void> {
  const windows = await WebviewWindow.getAll();
  await Promise.all(windows.map((win) => win.hide()));
}

export function setAlwaysOnTop(alwaysOnTop: boolean, label?: WindowLabel) {
  getWindow(label)
    .then((win) => {
      if (!win) {
        return;
      }

      return win.setAlwaysOnTop(alwaysOnTop);
    })
    .catch(() => undefined);
}
