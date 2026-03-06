export type TranslateProvider =
  | "openai"
  | "deepl"
  | "ollama"
  | "custom"
  | "google"
  | "bing";

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
} from "@lazytrans/translate-core/translate/types";
