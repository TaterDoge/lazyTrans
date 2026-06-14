import {
  getTranslateProviderMeta,
  translateServiceDefinition,
} from "@/services/service-config";
import type { TranslateProvider } from "./types";

/** 语言选项格式 */
export interface LanguageOption {
  icon: string;
  label: string;
  value: string;
}

export { TRANSLATE_PROVIDERS } from "@/services/service-config";

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { value: "auto", label: "自动检测", icon: "🌐" },
  { value: "zh-CN", label: "简体中文", icon: "🇨🇳" },
  { value: "zh-TW", label: "繁体中文", icon: "🇹🇼" },
  { value: "en", label: "English", icon: "🇺🇸" },
  { value: "ja", label: "日本語", icon: "🇯🇵" },
  { value: "ko", label: "한국어", icon: "🇰🇷" },
  { value: "fr", label: "Français", icon: "🇫🇷" },
  { value: "de", label: "Deutsch", icon: "🇩🇪" },
  { value: "es", label: "Español", icon: "🇪🇸" },
  { value: "ru", label: "Русский", icon: "🇷🇺" },
];

export function getProviderMeta(provider: TranslateProvider) {
  return getTranslateProviderMeta(provider);
}

export function getProviderDefaults(provider: TranslateProvider): {
  apiEndpoint: string;
  model: string;
} {
  const meta = getProviderMeta(provider);
  return {
    apiEndpoint: meta?.defaultEndpoint || "",
    model: "",
  };
}

// 获取 provider 的完整默认配置
export function getDefaultProviderConfig(provider: TranslateProvider) {
  return translateServiceDefinition.getDefaultProviderConfig(provider);
}
