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
    .then((win) => {
      if (!win) {
        return;
      }

      return win.hide();
    })
    .catch(() => undefined);
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
