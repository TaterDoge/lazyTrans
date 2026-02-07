import { RouterProvider } from "@tanstack/solid-router";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { onCleanup, onMount } from "solid-js";
import { render } from "solid-js/web";
import type { WindowLabel } from "./config/window.config";
import { LISTEN_KEY } from "./constants";
import "./index.css";
import { router } from "./router";
import { hideWindow, showWindow } from "./utils/window";

function App() {
  const appWindow = getCurrentWebviewWindow();
  let unlistenShow: UnlistenFn | null = null;
  let unlistenHide: UnlistenFn | null = null;

  onMount(async () => {
    unlistenShow = await listen<WindowLabel>(
      LISTEN_KEY.SHOW_WINDOW,
      ({ payload }) => {
        if (appWindow.label !== payload) {
          return;
        }

        showWindow();
      }
    );

    unlistenHide = await listen<WindowLabel>(
      LISTEN_KEY.HIDE_WINDOW,
      ({ payload }) => {
        if (appWindow.label !== payload) {
          return;
        }

        hideWindow();
      }
    );
  });

  onCleanup(() => {
    unlistenShow?.();
    unlistenHide?.();
  });

  return <RouterProvider router={router} />;
}

render(() => <App />, document.getElementById("root") as HTMLElement);
