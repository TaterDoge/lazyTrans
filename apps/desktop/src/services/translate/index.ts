import type {
  TranslateConfig as CoreTranslateConfig,
  TranslateOptions,
  TranslateResult,
} from "@/services/translate-core";
import {
  translate as executeTranslate,
  translateStream as executeTranslateStream,
} from "@/services/translate-core";
import { isCustomTranslateProvider } from "./types";

export type {
  TranslateOptions,
  TranslateResult,
} from "@/services/translate-core";
export * from "./config";
export type { TranslateConfig, TranslateProvider } from "./types";

function resolveRuntimeConfig(
  config: CoreTranslateConfig
): CoreTranslateConfig {
  if (!isCustomTranslateProvider(config.provider)) {
    return config;
  }

  return { ...config, provider: "custom" };
}

export function translate(
  config: CoreTranslateConfig,
  options: TranslateOptions
): Promise<TranslateResult> {
  return executeTranslate(resolveRuntimeConfig(config), options);
}

export function translateStream(
  config: CoreTranslateConfig,
  options: TranslateOptions,
  onChunk: (result: TranslateResult) => void
): Promise<void> {
  return executeTranslateStream(resolveRuntimeConfig(config), options, onChunk);
}
