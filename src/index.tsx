import { HashRouter, Route } from "@solidjs/router";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { onCleanup, onMount } from "solid-js";
import { render } from "solid-js/web";
import type { WindowLabel } from "./config/window.config";
import { LISTEN_KEY } from "./constants";
import "./index.css";
import { hideWindow, showWindow } from "./utils/window";
import SettingsRoutes from "./windows/settings";
import TranslatorApp from "./windows/translator";

function AppRouter() {
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

  return (
    <HashRouter>
      <Route component={TranslatorApp} path="/" />
      <SettingsRoutes />
    </HashRouter>
  );
}

render(() => <AppRouter />, document.getElementById("root") as HTMLElement);
