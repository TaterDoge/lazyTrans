import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { onCleanup, onMount } from "solid-js";
import { hideWindow } from "@/lib/utils/window";

export function useCloseToHideWindow() {
  onMount(() => {
    let disposed = false;
    let unlisten: (() => void) | undefined;

    getCurrentWebviewWindow()
      .onCloseRequested((event) => {
        event.preventDefault();
        hideWindow();
      })
      .then((cleanup) => {
        if (disposed) {
          cleanup();
          return;
        }

        unlisten = cleanup;
      })
      .catch(console.error);

    onCleanup(() => {
      disposed = true;
      unlisten?.();
    });
  });
}
