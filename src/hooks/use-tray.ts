import { defaultWindowIcon } from "@tauri-apps/api/app";
import { Menu, MenuItem } from "@tauri-apps/api/menu";
import { TrayIcon } from "@tauri-apps/api/tray";
import { exit } from "@tauri-apps/plugin-process";
import { onCleanup, onMount } from "solid-js";
import { showWindow } from "../utils/window";

const TRAY_ID = "LAZYTRANS_TRAY";

export function useTray() {
  const getTrayById = () => TrayIcon.getById(TRAY_ID);

  const initTray = async () => {
    const tray = await getTrayById();

    if (tray) {
      return;
    }

    const translateItem = await MenuItem.new({
      id: "translate",
      text: "翻译",
      action: () => showWindow("translator"),
    });

    const settingsItem = await MenuItem.new({
      id: "settings",
      text: "设置",
      action: () => showWindow("settings"),
    });

    const quitItem = await MenuItem.new({
      id: "quit",
      text: "退出",
      action: () => exit(0),
    });

    const menu = await Menu.new({
      items: [translateItem, settingsItem, quitItem],
    });

    const icon = await defaultWindowIcon();
    if (!icon) {
      throw new Error("Failed to load default window icon");
    }

    return TrayIcon.new({
      id: TRAY_ID,
      icon,
      menu,
      menuOnLeftClick: true,
    });
  };

  onMount(() => {
    initTray();
  });

  onCleanup(() => {
    console.log("[useTray] Hook cleanup");
  });

  return { initTray };
}
