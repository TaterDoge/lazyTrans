import type { OpenAIApiMode, ProviderMeta } from "@/services/translate-core";

export type AppServiceType = "translate" | "tts" | "ocr";

export interface ProviderConfig<TProvider extends string = string> {
  apiEndpoint?: string;
  apiKey?: string;
  apiMode?: OpenAIApiMode;
  customModels?: string[];
  displayName?: string;
  enabled?: boolean;
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
  createCustomProviderId?: () => TProvider;
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
    apiMode: meta?.defaultApiMode,
    model: meta?.supportedModels?.[0] ?? "",
    promptTemplate: "",
    temperature: 0.3,
    maxTokens: 1024,
    isCollapsed: false,
    customModels: [],
    enabled: true,
  };
}
