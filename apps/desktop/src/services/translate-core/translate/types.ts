/**
 * 翻译服务类型定义
 */

// 翻译服务配置（核心层不限制 provider 枚举，交由上层决定）
export interface TranslateConfig {
  apiEndpoint?: string;
  apiKey?: string;
  maxTokens?: number;
  model?: string;
  promptTemplate?: string;
  provider: string;
  sourceLang: string;
  targetLang: string;
  temperature?: number;
}

// 翻译请求选项
export interface TranslateOptions {
  sourceLang?: string;
  stream?: boolean;
  targetLang?: string;
  text: string;
}

// 翻译结果
export interface TranslateResult {
  detectedLang?: string;
  finished: boolean;
  text: string;
}
