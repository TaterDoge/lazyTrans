/**
 * 服务设置页面 - UI 配置
 *
 * 注意: Provider 和语言配置已迁移到 services/translate/config.ts
 * 这里只保留 UI 层特有的配置 (如 Tab 配置)
 */

import type { Dictionary } from "@/i18n";

// 服务Tab类型
export type ServiceTab = "translate" | "tts" | "ocr";

// Tab 配置
export const SERVICE_TABS: {
  id: ServiceTab;
  labelKey: keyof Dictionary & `settings.service.tab.${string}`;
  icon: string;
}[] = [
  {
    id: "translate",
    labelKey: "settings.service.tab.translate",
    icon: "icon-[tabler--language]",
  },
  {
    id: "tts",
    labelKey: "settings.service.tab.tts",
    icon: "icon-[tabler--volume]",
  },
  {
    id: "ocr",
    labelKey: "settings.service.tab.ocr",
    icon: "icon-[tabler--photo-scan]",
  },
];
