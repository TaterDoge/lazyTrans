/**
 * 服务核心类型定义
 */

// 服务类型枚举
export type ServiceType = "translate" | "tts" | "ocr";

// 服务状态
export type ServiceStatus = "idle" | "connecting" | "ready" | "error";

// 服务能力描述
export interface ServiceCapability {
  languages?: string[];
  models?: string[];
  streaming: boolean;
}

// Provider元信息
export interface ProviderMeta {
  defaultEndpoint?: string;
  description?: string;
  icon?: string;
  id: string;
  name: string;
  requiresApiKey: boolean;
  supportedModels?: string[];
}
