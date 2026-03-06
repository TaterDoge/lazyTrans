import type { ProviderMeta } from "@lazytrans/translate-core";
import type { ProviderConfig, TranslateProvider } from "./types";

/** UI 选项格式 */
export interface ProviderOption<T extends string = string> {
  description?: string;
  icon?: string;
  label: string;
  value: T;
}

/** 语言选项格式 */
export interface LanguageOption {
  icon: string;
  label: string;
  value: string;
}

// Provider 元信息由业务层维护，避免污染 translate-core
export const TRANSLATE_PROVIDERS: Record<TranslateProvider, ProviderMeta> = {
  openai: {
    id: "openai",
    name: "OpenAI",
    icon: "icon-[simple-icons--openai]",
    description: "OpenAI GPT 系列模型",
    requiresApiKey: true,
    defaultEndpoint: "https://api.openai.com/v1",
    supportedModels: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
  },
  deepl: {
    id: "deepl",
    name: "DeepL",
    icon: "icon-[simple-icons--deepl]",
    description: "DeepL 专业翻译服务",
    requiresApiKey: true,
    defaultEndpoint: "https://api.deepl.com/v2",
  },
  ollama: {
    id: "ollama",
    name: "Ollama",
    icon: "icon-[simple-icons--ollama]",
    description: "本地 Ollama 模型",
    requiresApiKey: false,
    defaultEndpoint: "http://localhost:11434",
    supportedModels: ["llama3", "qwen2", "mistral"],
  },
  custom: {
    id: "custom",
    name: "自定义",
    icon: "icon-[tabler--api]",
    description: "自定义 OpenAI 兼容 API",
    requiresApiKey: true,
  },
  google: {
    id: "google",
    name: "Google",
    icon: "icon-[simple-icons--google]",
    description: "Google 翻译 (免费)",
    requiresApiKey: false,
    defaultEndpoint: "https://translate.google.com",
  },
  bing: {
    id: "bing",
    name: "Bing",
    icon: "icon-[lineicons--bing]",
    description: "Bing 翻译 (免费)",
    requiresApiKey: false,
    defaultEndpoint: "https://api-edge.cognitive.microsofttranslator.com",
  },
};

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

export function getProviderOptions(): ProviderOption<TranslateProvider>[] {
  return Object.entries(TRANSLATE_PROVIDERS).map(([key, meta]) => ({
    value: key as TranslateProvider,
    label: meta.name,
    icon: meta.icon,
    description: meta.description,
  }));
}

export function getProviderMeta(
  provider: TranslateProvider
): ProviderMeta | undefined {
  return TRANSLATE_PROVIDERS[provider];
}

export function getProviderDefaults(provider: TranslateProvider): {
  apiEndpoint: string;
  model: string;
} {
  const meta = TRANSLATE_PROVIDERS[provider];
  return {
    apiEndpoint: meta?.defaultEndpoint || "",
    model: meta?.supportedModels?.[0] || "",
  };
}

// 获取 provider 的完整默认配置
export function getDefaultProviderConfig(
  provider: TranslateProvider
): ProviderConfig {
  const defaults = getProviderDefaults(provider);
  return {
    provider,
    apiKey: "",
    apiEndpoint: defaults.apiEndpoint,
    model: defaults.model,
    promptTemplate: "",
    temperature: 0.3,
    maxTokens: 1024,
    isCollapsed: false,
  };
}

export const TRANSLATE_PROVIDER_OPTIONS = getProviderOptions();
