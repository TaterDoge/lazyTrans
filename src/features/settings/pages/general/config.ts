import type { Component } from "solid-js";
import type { Dictionary } from "../../../../i18n";
import type { Locale } from "../../../../i18n/types";
import type { GeneralSettings } from "../../../../stores/settings/general.store";

// ─── i18n 类型 ───────────────────────────────────────────────────────────────

/** 只取 Dictionary 中值为 string 的叶子节点 key */
export type DictionaryLeafKey = {
  [K in keyof Dictionary]: Dictionary[K] extends string ? K : never;
}[keyof Dictionary];

// ─── 核心类型：每个设置项 = 标签元信息 + 一个控件组件 ────────────────────────

export type SettingItem = {
  key: string;
  labelKey: DictionaryLeafKey;
  descriptionKey?: DictionaryLeafKey;
  /** 直接渲染控件，无需渲染器做类型分发 */
  control: Component;
};

export type SettingGroup = {
  titleKey?: DictionaryLeafKey;
  items: SettingItem[];
};

// ─── 控件 Props 类型（供各控件组件使用） ─────────────────────────────────────

export type SelectOption<T extends string = string> = {
  value: T;
  label?: string;
  labelKey?: DictionaryLeafKey;
  icon?: string;
};

// ─── 语言选项 ────────────────────────────────────────────────────────────────

export const LANGUAGE_OPTIONS: SelectOption<Locale>[] = [
  { value: "zh-CN", label: "简体中文", icon: "🇨🇳" },
  { value: "en_US", label: "English", icon: "🇺🇸" },
];

// ─── 主题选项 ────────────────────────────────────────────────────────────────

export const THEME_OPTIONS: SelectOption<GeneralSettings["theme"]>[] = [
  {
    value: "system",
    labelKey: "settings.general.themeSystem",
    icon: "icon-[line-md--computer]",
  },
  {
    value: "light",
    labelKey: "settings.general.themeLight",
    icon: "icon-[line-md--moon-to-sunny-outline-loop-transition]",
  },
  {
    value: "dark",
    labelKey: "settings.general.themeDark",
    icon: "icon-[line-md--moon-rising-alt-loop]",
  },
];
