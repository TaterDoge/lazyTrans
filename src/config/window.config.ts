import type { WindowOptions } from "@tauri-apps/api/window";

export type WindowConfig = WindowOptions & { url: string };

export const WINDOW_CONFIG: Record<string, WindowConfig> = {
  translator: {
    url: "/",
    title: "翻译",
    width: 450,
    height: 350,
    minWidth: 350,
    minHeight: 250,
    resizable: true,
    decorations: false,
    transparent: true,
    alwaysOnTop: false,
    skipTaskbar: true,
    focus: true,
    visible: true,
    center: true,
  },
  settings: {
    url: "/settings",
    title: "设置 - LazyTrans",
    width: 900,
    height: 650,
    resizable: true,
    decorations: true,
    alwaysOnTop: false,
    focus: true,
    visible: true,
    center: true,
  },
};

// 根据配置动态生成 WindowLabel 类型
export type WindowLabel = keyof typeof WINDOW_CONFIG;
