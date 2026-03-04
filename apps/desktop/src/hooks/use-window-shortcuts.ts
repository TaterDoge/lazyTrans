import hotkeys from "hotkeys-js";
import { createEffect, onCleanup } from "solid-js";
import { getWindowShortcutMetas } from "../config/shortcuts.config";
import type { WindowLabel } from "../config/window.config";
import { shortcutKeys } from "../stores/settings/shortcuts.store";

type ShortcutActionMap = Record<string, () => void | Promise<void>>;

hotkeys.filter = () => true;

export function useWindowShortcuts(
  windowLabel: WindowLabel,
  actions: ShortcutActionMap
) {
  const scope = `window-${windowLabel}`;
  const metas = getWindowShortcutMetas(windowLabel);
  const activeMetas = metas.filter((meta) => actions[meta.id]);

  createEffect(() => {
    const keys = { ...shortcutKeys };
    hotkeys.deleteScope(scope);

    for (const meta of activeMetas) {
      const combo = keys[meta.id] || meta.defaultKey;
      hotkeys(combo, { scope }, (e) => {
        e.preventDefault();
        e.stopPropagation();
        Promise.resolve(actions[meta.id]()).catch(console.error);
      });
    }

    hotkeys.setScope(scope);
  });

  onCleanup(() => {
    hotkeys.deleteScope(scope);
  });
}
