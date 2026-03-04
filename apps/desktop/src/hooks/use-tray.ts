import { defaultWindowIcon } from "@tauri-apps/api/app";
import { Menu, MenuItem } from "@tauri-apps/api/menu";
import { TrayIcon } from "@tauri-apps/api/tray";
import { exit, relaunch } from "@tauri-apps/plugin-process";
import { onMount } from "solid-js";
import { hideAllWindows, showWindow } from "../utils/window";

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
      action: async () => {
        await hideAllWindows();
        showWindow("settings");
      },
    });

    const restartItem = await MenuItem.new({
      id: "restart",
      text: "重启",
      action: () => relaunch(),
    });

    const quitItem = await MenuItem.new({
      id: "quit",
      text: "退出",
      action: () => exit(0),
    });

    const menu = await Menu.new({
      items: [translateItem, settingsItem, restartItem, quitItem],
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

  return { initTray };
}
