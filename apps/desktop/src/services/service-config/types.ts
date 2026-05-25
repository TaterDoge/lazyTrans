import type { ProviderMeta } from "@/services/translate-core";

export type AppServiceType = "translate" | "tts" | "ocr";

export interface ProviderConfig<TProvider extends string = string> {
  apiEndpoint?: string;
  apiKey?: string;
  isCollapsed?: boolean;
  maxTokens?: number;
  model?: string;
  promptTemplate?: string;
  provider: TProvider;
  temperature?: number;
}

export interface ServiceConfig<TProvider extends string = string> {
  activeProvider: TProvider;
  providerOrder: TProvider[];
  providers: ProviderConfig<TProvider>[];
}

export interface ServiceDefinition<TProvider extends string = string> {
  customProviderMeta?: ProviderMeta;
  defaultProvider: TProvider;
  getDefaultProviderConfig: (provider: TProvider) => ProviderConfig<TProvider>;
  getProviderMeta: (provider: TProvider) => ProviderMeta | undefined;
  isCustomProvider?: (provider: string) => provider is TProvider;
  providers: Partial<Record<TProvider, ProviderMeta>>;
  service: AppServiceType;
}

export function createDefaultProviderConfig<TProvider extends string>(
  provider: TProvider,
  meta: ProviderMeta | undefined
): ProviderConfig<TProvider> {
  return {
    provider,
    apiKey: "",
    apiEndpoint: meta?.defaultEndpoint ?? "",
    model: meta?.supportedModels?.[0] ?? "",
    promptTemplate: "",
    temperature: 0.3,
    maxTokens: 1024,
    isCollapsed: false,
  };
}
