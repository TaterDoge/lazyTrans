/**
 * Provider 基础接口定义
 */

import type { ServiceCapability, ServiceType } from "@/services/core";

// 通用Provider接口
export interface IProvider<TConfig, TOptions, TResult> {
  readonly name: string;
  readonly type: ServiceType;

  // 配置验证
  validateConfig(config: TConfig): Promise<boolean>;

  // 执行服务
  execute(config: TConfig, options: TOptions): Promise<TResult>;

  // 流式执行（可选）
  executeStream?(
    config: TConfig,
    options: TOptions,
    onChunk: (chunk: TResult) => void
  ): Promise<void>;

  // 获取能力
  getCapabilities(): ServiceCapability;
}
