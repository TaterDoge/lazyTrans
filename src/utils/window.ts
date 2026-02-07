import { invoke } from "@tauri-apps/api/core";
import { emit, listen, type UnlistenFn } from "@tauri-apps/api/event";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import type { WindowLabel } from "../config/window.config";

const LISTEN_KEY = {
  SHOW_WINDOW: "show_window",
  HIDE_WINDOW: "hide_window",
  TOGGLE_WINDOW: "toggle_window",
};

const COMMAND = {
  SHOW_WINDOW: "plugin:custom-window|show_window",
  HIDE_WINDOW: "plugin:custom-window|hide_window",
  SET_ALWAYS_ON_TOP: "plugin:custom-window|set_always_on_top",
  SET_TASKBAR_VISIBILITY: "plugin:custom-window|set_taskbar_visibility",
};

export function showWindow(label?: WindowLabel) {
  if (label) {
    emit(LISTEN_KEY.SHOW_WINDOW, label);
  } else {
    invoke(COMMAND.SHOW_WINDOW);
  }
}

export function hideWindow(label?: WindowLabel) {
  if (label) {
    emit(LISTEN_KEY.HIDE_WINDOW, label);
  } else {
    invoke(COMMAND.HIDE_WINDOW);
  }
}

export function setAlwaysOnTop(alwaysOnTop: boolean) {
  invoke(COMMAND.SET_ALWAYS_ON_TOP, { alwaysOnTop });
}

export async function toggleWindowVisible(label?: WindowLabel) {
  const appWindow = getCurrentWebviewWindow();

  if (appWindow.label !== label) {
    return;
  }

  const visible = await appWindow.isVisible();

  if (visible) {
    return hideWindow(label);
  }

  return showWindow(label);
}

export function setTaskbarVisibility(visible: boolean) {
  invoke(COMMAND.SET_TASKBAR_VISIBILITY, { visible });
}

export async function listenWindowVisibility(
  label?: WindowLabel
): Promise<UnlistenFn> {
  const appWindow = getCurrentWebviewWindow();
  const targetLabel = label ?? (appWindow.label as WindowLabel);

  const unlistenShow = await listen<WindowLabel>(
    LISTEN_KEY.SHOW_WINDOW,
    (event) => {
      if (event.payload !== targetLabel) {
        return;
      }

      showWindow();
    }
  );

  const unlistenHide = await listen<WindowLabel>(
    LISTEN_KEY.HIDE_WINDOW,
    (event) => {
      if (event.payload !== targetLabel) {
        return;
      }

      hideWindow();
    }
  );

  return () => {
    unlistenShow();
    unlistenHide();
  };
}
