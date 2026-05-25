import type { ProviderMeta } from "@/services/translate-core";
import { createDefaultProviderConfig, type ServiceDefinition } from "./types";

export type OCRProvider = "tesseract" | "openai" | "azure";

export const OCR_PROVIDERS: Partial<Record<OCRProvider, ProviderMeta>> = {
  tesseract: {
    id: "tesseract",
    name: "Tesseract",
    icon: "icon-[simple-icons--tesseract]",
    description: "本地 OCR 识别引擎",
    requiresApiKey: false,
    defaultEndpoint: "",
    supportedModels: ["tesseract"],
  },
  openai: {
    id: "openai",
    name: "OpenAI Vision",
    icon: "icon-[simple-icons--openai]",
    description: "OpenAI 视觉模型 OCR",
    requiresApiKey: true,
    defaultEndpoint: "https://api.openai.com/v1",
    supportedModels: ["gpt-4o", "gpt-4o-mini"],
  },
  azure: {
    id: "azure",
    name: "Azure OCR",
    icon: "icon-[simple-icons--microsoftazure]",
    description: "Azure AI Vision 文字识别",
    requiresApiKey: true,
    defaultEndpoint: "https://api.cognitive.microsoft.com",
    supportedModels: ["read"],
  },
};

export function getOCRProviderMeta(
  provider: OCRProvider
): ProviderMeta | undefined {
  return OCR_PROVIDERS[provider];
}

export const ocrServiceDefinition: ServiceDefinition<OCRProvider> = {
  service: "ocr",
  defaultProvider: "tesseract",
  providers: OCR_PROVIDERS,
  getProviderMeta: getOCRProviderMeta,
  getDefaultProviderConfig: (provider) =>
    createDefaultProviderConfig(provider, getOCRProviderMeta(provider)),
};
