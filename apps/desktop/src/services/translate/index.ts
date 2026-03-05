export type {
  TranslateOptions,
  TranslateResult,
} from "@lazytrans/translate-core";
export {
  BingTranslateProvider,
  GoogleTranslateProvider,
  OpenAITranslateProvider,
  registerTranslateProvider,
  translate,
  translateStream,
} from "@lazytrans/translate-core";
export * from "./config";
export type { TranslateConfig, TranslateProvider } from "./types";
