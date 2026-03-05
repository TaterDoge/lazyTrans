import type { TranslateConfig as CoreTranslateConfig } from "@lazytrans/translate-core/translate/types";

export type TranslateProvider =
  | "openai"
  | "deepl"
  | "ollama"
  | "custom"
  | "google"
  | "bing";

export type TranslateConfig = Omit<CoreTranslateConfig, "provider"> & {
  provider: TranslateProvider;
};

export type {
  TranslateOptions,
  TranslateResult,
} from "@lazytrans/translate-core/translate/types";
