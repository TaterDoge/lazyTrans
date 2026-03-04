/**
 * shortcuts 页面专属配置（按键映射、显示格式化等常量与工具函数）
 *
 * 通用类型（SettingItem、SettingGroup、SelectOption、DictionaryLeafKey）
 */

export type {
  DictionaryLeafKey,
  SelectOption,
  SettingGroup,
  SettingItem,
} from "../../components/types";

import { isMac } from "../../../../utils/platform";

// ─── 修饰键集合 ──────────────────────────────────────────────────────────────

export const MODIFIER_KEYS = new Set(["Control", "Shift", "Alt", "Meta"]);

// ─── 浏览器按键 -> hotkeys 格式映射 ──────────────────────────────────────────

export const BROWSER_TO_HOTKEYS_MODIFIER: Record<string, string> = {
  Control: isMac ? "ctrl" : "ctrl",
  Meta: isMac ? "command" : "ctrl",
  Shift: "shift",
  Alt: "alt",
};

export const BROWSER_TO_HOTKEYS_KEY: Record<string, string> = {
  " ": "space",
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
};

// ─── 显示格式映射 ────────────────────────────────────────────────────────────

export const DISPLAY_MAP: Record<string, string> = isMac
  ? { command: "⌘", ctrl: "⌃", shift: "⇧", alt: "⌥" }
  : { ctrl: "Ctrl", shift: "Shift", alt: "Alt" };

// ─── 工具函数 ────────────────────────────────────────────────────────────────

export function normalizeKey(key: string): string {
  return BROWSER_TO_HOTKEYS_KEY[key] ?? key.toLowerCase();
}

export function buildModifierParts(mods: Set<string>): string[] {
  const order = ["Control", "Meta", "Shift", "Alt"];
  const parts: string[] = [];
  let hasPrimary = false;
  for (const mod of order) {
    if (!mods.has(mod)) {
      continue;
    }
    const mapped = BROWSER_TO_HOTKEYS_MODIFIER[mod];
    if (mapped === "command" || mapped === "ctrl") {
      if (hasPrimary) {
        continue;
      }
      hasPrimary = true;
    }
    parts.push(mapped);
  }
  return parts;
}

export function formatDisplay(hotkey: string): string {
  return hotkey
    .split("+")
    .map((part) => DISPLAY_MAP[part] ?? part.toUpperCase())
    .join(" + ");
}
