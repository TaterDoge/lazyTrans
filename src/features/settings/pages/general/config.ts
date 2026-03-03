/**
 * general 页面专属配置（语言、主题等选项常量）
 *
 * 通用类型（SettingItem、SettingGroup、SelectOption、DictionaryLeafKey）
 */

export type {
  DictionaryLeafKey,
  SelectOption,
  SettingGroup,
  SettingItem,
} from "../../components/types";

import type { Locale } from "../../../../i18n/types";
import type { GeneralSettings } from "../../../../stores/settings/general.store";
import type { SelectOption } from "../../components/types";

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
