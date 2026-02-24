import { onMount } from "solid-js";
import { render } from "solid-js/web";
import { openTranslator } from "./actions/window";
import { useAppShortcuts } from "./hooks/use-app-shortcuts";
import { useTray } from "./hooks/use-tray";
import { initSettingsStore } from "./stores/settings";

function Daemon() {
  onMount(async () => {
    await initSettingsStore();
  });

  useTray();
  useAppShortcuts({
    translate: () => openTranslator(),
  });

  return null;
}

render(() => <Daemon />, document.getElementById("root") as HTMLElement);
