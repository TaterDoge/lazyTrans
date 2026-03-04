/**
 * 设置模块通用类型定义
 *
 * 供 general、shortcuts 等设置页面共享使用
 */

import type { Component } from "solid-js";
import type { Dictionary } from "../../../i18n";

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
