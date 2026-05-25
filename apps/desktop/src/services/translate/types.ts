import type {
  ProviderConfig as BaseProviderConfig,
  ServiceConfig,
} from "@/services/service-config/types";

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

export type ProviderConfig = BaseProviderConfig<TranslateProvider> & {
  /** 旧配置迁移字段：新结构通过 providers 数组表达启用状态。 */
  enabled?: boolean;
};

// 新的 TranslateConfig 结构
export interface TranslateConfig extends ServiceConfig<TranslateProvider> {
  providers: ProviderConfig[];
  sourceLang: string;
  targetLang: string;
}

export type {
  TranslateOptions,
  TranslateResult,
} from "@/services/translate-core/translate/types";
