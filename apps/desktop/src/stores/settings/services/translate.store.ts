/**
 * 翻译服务配置 Store
 */

import type {
  TranslateConfig,
  TranslateProvider,
} from "@/services/translate/types";
import { createServiceStore } from "./base-service.store";

const defaultTranslateConfig: TranslateConfig = {
  provider: "openai" as TranslateProvider,
  apiKey: "",
  apiEndpoint: "https://api.openai.com/v1",
  model: "gpt-4o-mini",
  sourceLang: "auto",
  targetLang: "zh-CN",
  promptTemplate: "",
  temperature: 0.3,
  maxTokens: 1024,
};

export const { store: translateConfig, actions: translateActions } =
  createServiceStore<TranslateConfig>("translate", defaultTranslateConfig);
