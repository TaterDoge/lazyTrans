import { onMount } from "solid-js";
import { render } from "solid-js/web";
import { useAppShortcuts } from "./hooks/use-app-shortcuts";
import { useAutoStart } from "./hooks/use-autostart";
import { useTray } from "./hooks/use-tray";
import { initSettingsStore } from "./stores/settings";
import { showWindow } from "./utils/window";

function Daemon() {
  onMount(async () => {
    await initSettingsStore();
  });

  useTray();
  useAutoStart();
  useAppShortcuts({
    translate: () => showWindow("translator"),
  });

  return null;
}

render(() => <Daemon />, document.getElementById("root") as HTMLElement);
