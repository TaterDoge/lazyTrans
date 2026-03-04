/**
 * 翻译服务类型定义
 */

// 翻译Provider类型
export type TranslateProvider =
  | "openai"
  | "deepl"
  | "ollama"
  | "custom"
  | "google"
  | "bing";

// 翻译服务配置
export interface TranslateConfig {
  provider: TranslateProvider;
  apiKey: string;
  apiEndpoint: string;
  model: string;
  sourceLang: string;
  targetLang: string;
  promptTemplate: string;
  temperature: number;
  maxTokens: number;
}

// 翻译请求选项
export interface TranslateOptions {
  text: string;
  sourceLang?: string;
  targetLang?: string;
  stream?: boolean;
}

// 翻译结果
export interface TranslateResult {
  text: string;
  detectedLang?: string;
  finished: boolean;
}
