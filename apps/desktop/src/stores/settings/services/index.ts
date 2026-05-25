/**
 * 服务配置 Store 统一导出
 */

import type { SettingsModule } from "../base";
import { ocrActions } from "./ocr.store";
import { translateActions } from "./translate.store";
import { ttsActions } from "./tts.store";

// 所有服务模块
const serviceModules: SettingsModule[] = [
  translateActions,
  ttsActions,
  ocrActions,
];

let loaded = false;

/**
 * 初始化所有服务配置 Store
 */
export async function initServiceStores(): Promise<void> {
  if (loaded) {
    return;
  }

  const { getStore } = await import("../base");
  const store = await getStore();

  await Promise.all(serviceModules.map((m) => m.load(store)));
  loaded = true;
}

// 导出各服务配置
export { ocrActions, ocrConfig } from "./ocr.store";
export { translateActions, translateConfig } from "./translate.store";
export { ttsActions, ttsConfig } from "./tts.store";
