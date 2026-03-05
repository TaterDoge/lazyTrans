/**
 * Provider 基础接口定义
 */

import type { ServiceCapability, ServiceType } from "./types";

// 通用Provider接口
export interface IProvider<TConfig, TOptions, TResult> {
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
  readonly name: string;
  readonly type: ServiceType;

  // 配置验证
  validateConfig(config: TConfig): Promise<boolean>;
}
