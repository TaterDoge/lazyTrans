/**
 * 翻译设置页面配置
 */

// 重新导出语言选项供 groups.tsx 使用
export { LANGUAGE_OPTIONS } from "@/services/translate/config";

import { LANGUAGE_OPTIONS } from "@/services/translate/config";

export type {
  DictionaryLeafKey,
  SelectOption,
  SettingGroup,
  SettingItem,
} from "../../components/types";

// 源语言选项（包含 auto）
export const SOURCE_LANGUAGE_OPTIONS = LANGUAGE_OPTIONS;

// 目标语言选项（不包含 auto）
export const TARGET_LANGUAGE_OPTIONS = LANGUAGE_OPTIONS.filter(
  (o) => o.value !== "auto"
);
