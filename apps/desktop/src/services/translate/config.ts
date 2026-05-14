import type { ProviderMeta } from "@/services/translate-core";
import type {
  BuiltinTranslateProvider,
  ProviderConfig,
  TranslateProvider,
} from "./types";
import { isCustomTranslateProvider } from "./types";

/** 语言选项格式 */
export interface LanguageOption {
  icon: string;
  label: string;
  value: string;
}

// Provider 元信息由业务层维护，避免污染 translate-core
export const TRANSLATE_PROVIDERS: Partial<
  Record<BuiltinTranslateProvider, ProviderMeta>
> = {
  openai: {
    id: "openai",
    name: "OpenAI",
    icon: "icon-[simple-icons--openai]",
    description: "OpenAI GPT 系列模型",
    requiresApiKey: true,
    defaultEndpoint: "https://api.openai.com/v1",
    supportedModels: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
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
  google: {
    id: "google",
    name: "Google",
    icon: "icon-[simple-icons--google]",
    description: "Google 翻译 (免费)",
    requiresApiKey: false,
    defaultEndpoint: "https://translate.googleapis.com",
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

const CUSTOM_OPENAI_PROVIDER_META: ProviderMeta = {
  id: "custom",
  name: "自定义",
  icon: "icon-[tabler--api]",
  description: "自定义 OpenAI 兼容 API",
  requiresApiKey: true,
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

export function getProviderMeta(
  provider: TranslateProvider
): ProviderMeta | undefined {
  if (isCustomTranslateProvider(provider)) {
    return CUSTOM_OPENAI_PROVIDER_META;
  }

  return TRANSLATE_PROVIDERS[provider];
}

export function getProviderDefaults(provider: TranslateProvider): {
  apiEndpoint: string;
  model: string;
} {
  const meta = getProviderMeta(provider);
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
