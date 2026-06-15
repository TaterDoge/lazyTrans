/**
 * 翻译服务类型定义
 */

import type { OpenAIApiMode } from "../core";

export type { OpenAIApiMode } from "../core";

// 翻译服务配置（核心层不限制 provider 枚举，交由上层决定）
export interface TranslateConfig {
  apiEndpoint?: string;
  apiKey?: string;
  apiMode?: OpenAIApiMode;
  model?: string;
  promptTemplate?: string;
  provider: string;
  requiresApiKey?: boolean;
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
