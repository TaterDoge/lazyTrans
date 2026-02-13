import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { register, unregisterAll } from "@tauri-apps/plugin-global-shortcut";
import { onCleanup, onMount } from "solid-js";
import {
  DEFAULT_SHORTCUTS,
  getDefaultKeyMap,
} from "../config/shortcuts.config";
import { initSettings } from "../stores/settings";
import { getStore } from "../stores/settings/base";
import { SHORTCUTS_CHANGED_EVENT } from "../stores/settings/shortcuts.store";

async function loadShortcutKeysFromStore(): Promise<Record<string, string>> {
  const store = await getStore();
  return (
    (await store.get<Record<string, string>>("shortcuts")) || getDefaultKeyMap()
  );
}

async function registerAllGlobalShortcuts() {
  const keys = await loadShortcutKeysFromStore();

  for (const def of DEFAULT_SHORTCUTS) {
    if (def.category !== "global") {
      continue;
    }

    const key = keys[def.id] || def.defaultKey;
    try {
      await register(key, (e) => {
        if (e.state === "Pressed") {
          def.action();
        }
      });
    } catch (error) {
      console.error(`[Shortcuts] 注册失败: ${key}`, error);
    }
  }
}

async function reregisterAllGlobalShortcuts() {
  try {
    await unregisterAll();
  } catch (e) {
    console.error("[Shortcuts] 注销全部失败", e);
  }
  await registerAllGlobalShortcuts();
}

export function useAppShortcuts() {
  let unlisten: UnlistenFn | undefined;

  onMount(async () => {
    await initSettings();
    await registerAllGlobalShortcuts();

    unlisten = await listen(SHORTCUTS_CHANGED_EVENT, () => {
      reregisterAllGlobalShortcuts();
    });
  });

  onCleanup(() => {
    unlisten?.();
    unregisterAll();
  });
}
