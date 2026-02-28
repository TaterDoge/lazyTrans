import type { WindowOptions } from "@tauri-apps/api/window";

export type WindowConfig = WindowOptions & { label: string; url: string };

export const WINDOW_CONFIG: Record<string, WindowConfig> = {
  daemon: {
    label: "daemon",
    url: "daemon.html",
    visible: false,
    width: 0,
    height: 0,
  },
  translator: {
    label: "translator",
    title: "翻译",
    url: "index.html/#/",
    width: 450,
    minWidth: 350,
    minHeight: 250,
    resizable: true,
    decorations: false,
    alwaysOnTop: false,
    transparent: true,
    visible: false,
  },
  settings: {
    label: "settings",
    title: "设置",
    url: "index.html/#/settings",
    width: 900,
    height: 650,
    minWidth: 900,
    resizable: true,
    decorations: true,
    alwaysOnTop: false,
    hiddenTitle: true,
    titleBarStyle: "overlay",
    center: true,
    visible: false,
  },
};

// 根据配置动态生成 WindowLabel 类型
export type WindowLabel = keyof typeof WINDOW_CONFIG;
