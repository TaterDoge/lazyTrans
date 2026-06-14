/**
 * 翻译服务入口
 */

import type { IProvider } from "../core";
import {
  executeService,
  executeServiceStream,
  registerServiceProvider,
  serviceRegistry,
} from "../core";
import { registerBuiltinTranslateProviders } from "./providers";
import type {
  TranslateConfig,
  TranslateOptions,
  TranslateResult,
} from "./types";

export {
  BingTranslateProvider,
  GoogleTranslateProvider,
  OllamaTranslateProvider,
  OpenAITranslateProvider,
} from "./providers";
export * from "./types";

function ensureBuiltinTranslateProvidersRegistered(): void {
  registerBuiltinTranslateProviders();
}

export function registerTranslateProvider(
  name: string,
  provider: new () => IProvider<
    TranslateConfig,
    TranslateOptions,
    TranslateResult
  >
): void {
  ensureBuiltinTranslateProvidersRegistered();
  registerServiceProvider("translate", name, provider);
}

/**
 * 执行翻译
 */
export function translate(
  config: TranslateConfig,
  options: TranslateOptions
): Promise<TranslateResult> {
  ensureBuiltinTranslateProvidersRegistered();
  return executeService<TranslateConfig, TranslateOptions, TranslateResult>(
    "translate",
    config,
    options
  );
}

/**
 * 流式翻译
 */
export function translateStream(
  config: TranslateConfig,
  options: TranslateOptions,
  onChunk: (result: TranslateResult) => void
): Promise<void> {
  ensureBuiltinTranslateProvidersRegistered();
  return executeServiceStream<
    TranslateConfig,
    TranslateOptions,
    TranslateResult
  >("translate", config, options, onChunk);
}

export function listTranslateModels(
  config: TranslateConfig
): Promise<string[]> {
  ensureBuiltinTranslateProvidersRegistered();

  const provider = serviceRegistry.get<
    IProvider<TranslateConfig, TranslateOptions, TranslateResult> & {
      listModels?: (config: TranslateConfig) => Promise<string[]>;
    }
  >("translate", config.provider);

  if (!provider?.listModels) {
    throw new Error(
      `Provider ${config.provider} does not support model listing`
    );
  }

  return provider.listModels(config);
}
