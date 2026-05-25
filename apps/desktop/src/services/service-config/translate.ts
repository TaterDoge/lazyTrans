import type { ProviderMeta } from "@/services/translate-core";
import type {
  BuiltinTranslateProvider,
  TranslateProvider,
} from "../translate/types";
import { isCustomTranslateProvider } from "../translate/types";
import { createDefaultProviderConfig, type ServiceDefinition } from "./types";

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

export function getTranslateProviderMeta(
  provider: TranslateProvider
): ProviderMeta | undefined {
  if (isCustomTranslateProvider(provider)) {
    return CUSTOM_OPENAI_PROVIDER_META;
  }

  return TRANSLATE_PROVIDERS[provider];
}

export const translateServiceDefinition: ServiceDefinition<TranslateProvider> =
  {
    service: "translate",
    defaultProvider: "openai",
    providers: TRANSLATE_PROVIDERS,
    customProviderMeta: CUSTOM_OPENAI_PROVIDER_META,
    isCustomProvider: isCustomTranslateProvider,
    getProviderMeta: getTranslateProviderMeta,
    getDefaultProviderConfig: (provider) =>
      createDefaultProviderConfig(provider, getTranslateProviderMeta(provider)),
  };
