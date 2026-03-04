import { hide } from "@tauri-apps/api/app";
import {
  getCurrentWebviewWindow,
  WebviewWindow,
} from "@tauri-apps/api/webviewWindow";
import type { WindowLabel } from "../config/window.config";

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

export function showWindow(label?: WindowLabel) {
  getWindow(label)
    .then(async (win) => {
      if (!win) {
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
