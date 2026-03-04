/**
 * 服务配置 Store 工厂函数
 */

import type { SettingsModuleResult } from "../base";
import { createSettingsModule } from "../base";

export function createServiceStore<TConfig extends object>(
  serviceKey: string,
  defaultConfig: TConfig
): SettingsModuleResult<TConfig> {
  return createSettingsModule<TConfig>(serviceKey, defaultConfig);
}
