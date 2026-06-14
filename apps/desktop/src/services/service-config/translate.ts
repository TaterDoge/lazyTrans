import type { ProviderMeta } from "@/services/translate-core";
import type {
  BuiltinTranslateProvider,
  TranslateProvider,
} from "../translate/types";
import { isCustomTranslateProvider } from "../translate/types";
import { createDefaultProviderConfig, type ServiceDefinition } from "./types";

function createCustomTranslateProviderId(): TranslateProvider {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return `custom:${globalThis.crypto.randomUUID()}`;
  }

  return `custom:${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export const TRANSLATE_PROVIDERS: Partial<
  Record<BuiltinTranslateProvider, ProviderMeta>
> = {
  openai: {
    id: "openai",
    name: "OpenAI",
    icon: "icon-[simple-icons--openai]",
    description: "OpenAI 与兼容 OpenAI 协议的云端模型",
    requiresApiKey: true,
    defaultEndpoint: "https://api.openai.com/v1",
    defaultApiMode: "chat-completions",
    providerKind: "llm",
    supportedApiModes: ["chat-completions", "responses"],
    supportsModelConfig: true,
  },
  ollama: {
    id: "ollama",
    name: "Ollama",
    icon: "icon-[simple-icons--ollama]",
    description: "本地 Ollama 模型（OpenAI 协议）",
    requiresApiKey: false,
    defaultEndpoint: "http://localhost:11434",
    defaultApiMode: "chat-completions",
    providerKind: "llm",
    supportedApiModes: ["chat-completions"],
    supportsModelConfig: true,
  },
  google: {
    id: "google",
    name: "Google",
    icon: "icon-[simple-icons--google]",
    description: "Google 翻译 (免费)",
    requiresApiKey: false,
    defaultEndpoint: "https://translate.googleapis.com",
    providerKind: "http-translate",
    supportsAdvancedConfig: false,
    supportsModelConfig: false,
  },
  bing: {
    id: "bing",
    name: "Bing",
    icon: "icon-[lineicons--bing]",
    description: "Bing 翻译 (免费)",
    requiresApiKey: false,
    defaultEndpoint: "https://api-edge.cognitive.microsofttranslator.com",
    providerKind: "http-translate",
    supportsAdvancedConfig: false,
    supportsModelConfig: false,
  },
};

const CUSTOM_OPENAI_PROVIDER_META: ProviderMeta = {
  id: "openai",
  name: "自定义 OpenAI",
  icon: "icon-[tabler--api]",
  description: "自定义 OpenAI 协议 API",
  requiresApiKey: false,
  defaultApiMode: "chat-completions",
  providerKind: "llm",
  supportedApiModes: ["chat-completions", "responses"],
  supportsModelConfig: true,
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
    createCustomProviderId: createCustomTranslateProviderId,
    customProviderMeta: CUSTOM_OPENAI_PROVIDER_META,
    isCustomProvider: isCustomTranslateProvider,
    getProviderMeta: getTranslateProviderMeta,
    getDefaultProviderConfig: (provider) =>
      createDefaultProviderConfig(provider, getTranslateProviderMeta(provider)),
  };
