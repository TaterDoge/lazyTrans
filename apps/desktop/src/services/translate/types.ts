export type BuiltinTranslateProvider = "openai" | "ollama" | "google" | "bing";
export type CustomTranslateProvider = "custom" | `custom:${string}`;
export type TranslateProvider =
  | BuiltinTranslateProvider
  | CustomTranslateProvider;

export function isCustomTranslateProvider(
  provider: string
): provider is CustomTranslateProvider {
  return provider === "custom" || provider.startsWith("custom:");
}

// 每个 provider 的独立配置
export interface ProviderConfig {
  apiEndpoint?: string;
  apiKey?: string;
  /** 是否启用该服务 */
  enabled?: boolean;
  /** 是否手动折叠该服务结果 */
  isCollapsed?: boolean;
  maxTokens?: number;
  model?: string;
  promptTemplate?: string;
  provider: TranslateProvider;
  temperature?: number;
}

// 新的 TranslateConfig 结构
export interface TranslateConfig {
  activeProvider: TranslateProvider;
  providerOrder: TranslateProvider[];
  providers: ProviderConfig[];
  sourceLang: string;
  targetLang: string;
}

export type {
  TranslateOptions,
  TranslateResult,
} from "@/services/translate-core/translate/types";
