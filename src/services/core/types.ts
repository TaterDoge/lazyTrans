/**
 * 服务核心类型定义
 */

// 服务类型枚举
export type ServiceType = "translate" | "tts" | "ocr";

// 服务状态
export type ServiceStatus = "idle" | "connecting" | "ready" | "error";

// 服务能力描述
export interface ServiceCapability {
  streaming: boolean;
  languages?: string[];
  models?: string[];
}

// Provider元信息
export interface ProviderMeta {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  requiresApiKey: boolean;
  defaultEndpoint?: string;
  supportedModels?: string[];
}
