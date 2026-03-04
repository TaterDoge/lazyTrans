/**
 * 翻译服务入口
 */

import type { IProvider } from "@/services/core";
import { serviceRegistry } from "@/services/core";
import { BingTranslateProvider } from "./providers/bing";
import { GoogleTranslateProvider } from "./providers/google";
import { OpenAITranslateProvider } from "./providers/openai";
import type {
  TranslateConfig,
  TranslateOptions,
  TranslateResult,
} from "./types";

// 注册所有翻译 Provider
serviceRegistry.register("translate", "openai", OpenAITranslateProvider);
serviceRegistry.register("translate", "google", GoogleTranslateProvider);
serviceRegistry.register("translate", "bing", BingTranslateProvider);

export type { LanguageOption, ProviderOption } from "./config";
// 导出配置和辅助函数
export {
  getProviderDefaults,
  getProviderMeta,
  getProviderOptions,
  LANGUAGE_OPTIONS,
  LANGUAGES,
  TRANSLATE_PROVIDER_OPTIONS,
  TRANSLATE_PROVIDERS,
} from "./config";
export { BingTranslateProvider } from "./providers/bing";
export { GoogleTranslateProvider } from "./providers/google";
// 导出 Provider
export { OpenAITranslateProvider } from "./providers/openai";
// 导出类型
export * from "./types";

/**
 * 执行翻译
 */
export async function translate(
  config: TranslateConfig,
  options: TranslateOptions
): Promise<TranslateResult> {
  const provider = serviceRegistry.get<
    IProvider<TranslateConfig, TranslateOptions, TranslateResult>
  >("translate", config.provider);

  if (!provider) {
    throw new Error(`Unknown translate provider: ${config.provider}`);
  }

  const isValid = await provider.validateConfig(config);
  if (!isValid) {
    throw new Error("Invalid translate config");
  }

  return provider.execute(config, options);
}

/**
 * 流式翻译
 */
export async function translateStream(
  config: TranslateConfig,
  options: TranslateOptions,
  onChunk: (result: TranslateResult) => void
): Promise<void> {
  const provider = serviceRegistry.get<
    IProvider<TranslateConfig, TranslateOptions, TranslateResult>
  >("translate", config.provider);

  if (!provider) {
    throw new Error(`Unknown translate provider: ${config.provider}`);
  }

  if (!provider.executeStream) {
    // 不支持流式，降级为普通翻译
    const result = await translate(config, options);
    onChunk(result);
    return;
  }

  const isValid = await provider.validateConfig(config);
  if (!isValid) {
    throw new Error("Invalid translate config");
  }

  return provider.executeStream(config, options, onChunk);
}
