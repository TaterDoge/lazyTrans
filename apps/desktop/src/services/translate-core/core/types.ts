/**
 * 服务核心类型定义
 */

// 服务类型枚举
export type ServiceType = "translate" | "tts" | "ocr";

// 服务状态
export type ServiceStatus = "idle" | "connecting" | "ready" | "error";

// OpenAI 协议模式：Chat Completions 或 Responses。
export type OpenAIApiMode = "chat-completions" | "responses";

// Provider 类型，用于设置页决定展示哪些协议相关配置。
export type ProviderKind = "llm" | "http-translate" | "tts" | "ocr";

// 服务能力描述
export interface ServiceCapability {
  languages?: string[];
  models?: string[];
  streaming: boolean;
}

// Provider元信息
export interface ProviderMeta {
  defaultApiMode?: OpenAIApiMode;
  defaultEndpoint?: string;
  description?: string;
  icon?: string;
  id: string;
  name: string;
  providerKind?: ProviderKind;
  requiresApiKey: boolean;
  supportedApiModes?: OpenAIApiMode[];
  supportedModels?: string[];
  supportsAdvancedConfig?: boolean;
  supportsModelConfig?: boolean;
}
