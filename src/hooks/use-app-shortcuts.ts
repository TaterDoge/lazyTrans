import { register, unregisterAll } from "@tauri-apps/plugin-global-shortcut";
import { onCleanup, onMount } from "solid-js";
import { openTranslator } from "../actions/window";

/** 系统全局快捷键（无论应用是否聚焦都生效） */
type GlobalShortcutEntry = {
  shortcut: string;
  handler: () => void;
};

const globalShortcuts: GlobalShortcutEntry[] = [
  {
    shortcut: "CmdOrCtrl+.",
    handler: () => openTranslator(),
  },
];

export function useAppShortcuts() {
  const registerGlobalShortcuts = async () => {
    for (const { shortcut, handler } of globalShortcuts) {
      await register(shortcut, (event) => {
        if (event.state === "Pressed") {
          handler();
        }
      });
    }
  };

  onMount(() => {
    registerGlobalShortcuts();
  });

  onCleanup(() => {
    unregisterAll();
  });
}
