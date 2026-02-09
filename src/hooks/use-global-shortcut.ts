import { register, unregisterAll } from "@tauri-apps/plugin-global-shortcut";
import { onCleanup, onMount } from "solid-js";
import { openSettings, openTranslator } from "../actions/window";

/** 应用内快捷键（仅窗口聚焦时生效） */
type AppShortcutEntry = {
  key: string;
  metaKey: boolean;
  handler: () => void;
};

const appShortcuts: AppShortcutEntry[] = [
  {
    key: ",",
    metaKey: true,
    handler: () => openSettings(),
  },
];

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

export function useGlobalShortcut() {
  const handleKeyDown = (e: KeyboardEvent) => {
    const modifier = e.metaKey || e.ctrlKey;
    for (const shortcut of appShortcuts) {
      if (shortcut.metaKey && modifier && e.key === shortcut.key) {
        e.preventDefault();
        shortcut.handler();
      }
    }
  };

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
    document.addEventListener("keydown", handleKeyDown);
    registerGlobalShortcuts();
  });

  onCleanup(() => {
    document.removeEventListener("keydown", handleKeyDown);
    unregisterAll();
  });
}
