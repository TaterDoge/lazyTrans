import {
  getDefaultProviderConfig,
  TRANSLATE_PROVIDERS,
} from "@/services/translate/config";
import type {
  ProviderConfig,
  TranslateConfig,
  TranslateProvider,
} from "@/services/translate/types";
import { createSettingsModule } from "../base";

// 所有 provider 列表
const ALL_PROVIDERS = Object.keys(TRANSLATE_PROVIDERS) as TranslateProvider[];

const defaultEnabledProviders = ALL_PROVIDERS.filter(
  (provider) => !TRANSLATE_PROVIDERS[provider]?.requiresApiKey
);

const defaultTranslateConfig: TranslateConfig = {
  activeProvider: "openai",
  providers: defaultEnabledProviders.map((provider) =>
    getDefaultProviderConfig(provider)
  ),
  providerOrder: [...ALL_PROVIDERS],
  sourceLang: "auto",
  targetLang: "zh-CN",
};

// 旧配置结构（用于迁移）
interface LegacyTranslateConfig {
  apiEndpoint?: string;
  apiKey?: string;
  enabledProviders?: TranslateProvider[];
  maxTokens?: number;
  model?: string;
  promptTemplate?: string;
  provider?: TranslateProvider;
  sourceLang?: string;
  targetLang?: string;
  temperature?: number;
}

function normalizeProviderOrder(
  order: TranslateProvider[] | undefined
): TranslateProvider[] {
  const seen = new Set<TranslateProvider>();
  const normalized: TranslateProvider[] = [];

  for (const provider of order ?? []) {
    if (ALL_PROVIDERS.includes(provider) && !seen.has(provider)) {
      seen.add(provider);
      normalized.push(provider);
    }
  }

  for (const provider of ALL_PROVIDERS) {
    if (!seen.has(provider)) {
      normalized.push(provider);
    }
  }

  return normalized;
}

function normalizeEnabledProviders(
  providers: TranslateProvider[] | undefined
): TranslateProvider[] {
  const seen = new Set<TranslateProvider>();
  const normalized: TranslateProvider[] = [];

  for (const provider of providers ?? ALL_PROVIDERS) {
    if (ALL_PROVIDERS.includes(provider) && !seen.has(provider)) {
      seen.add(provider);
      normalized.push(provider);
    }
  }

  return normalized;
}

function normalizeProviders(
  providers: ProviderConfig[] | undefined
): ProviderConfig[] {
  const seen = new Set<TranslateProvider>();
  const normalized: ProviderConfig[] = [];

  for (const provider of providers ?? []) {
    if (
      !ALL_PROVIDERS.includes(provider.provider) ||
      seen.has(provider.provider)
    ) {
      continue;
    }

    if (provider.enabled === false) {
      continue;
    }

    const { enabled: _enabled, isCollapsed, ...providerConfig } = provider;
    normalized.push({ ...providerConfig, isCollapsed: isCollapsed ?? false });
    seen.add(provider.provider);
  }

  return normalized;
}

// 迁移旧配置到新配置
function migrateConfig(
  saved: TranslateConfig | LegacyTranslateConfig | null,
  defaults: TranslateConfig
): TranslateConfig {
  // 如果已经是新结构，直接返回
  if (saved && "providers" in saved && Array.isArray(saved.providers)) {
    const activeProvider = ALL_PROVIDERS.includes(saved.activeProvider)
      ? saved.activeProvider
      : defaults.activeProvider;
    const providers = normalizeProviders(saved.providers);

    return {
      activeProvider,
      providers,
      providerOrder: normalizeProviderOrder(saved.providerOrder),
      sourceLang: saved.sourceLang ?? defaults.sourceLang,
      targetLang: saved.targetLang ?? defaults.targetLang,
    };
  }

  // 旧配置迁移
  const legacy = saved as LegacyTranslateConfig | null;

  // 从旧配置中提取全局设置
  const legacyProvider =
    legacy?.provider && ALL_PROVIDERS.includes(legacy.provider)
      ? legacy.provider
      : "openai";
  const enabledProviders = normalizeEnabledProviders(legacy?.enabledProviders);
  const providerOrder = normalizeProviderOrder([
    ...enabledProviders,
    ...ALL_PROVIDERS,
  ]);

  // 构建 providers 数组
  const providers = enabledProviders.map((providerId) => {
    const defaultConfig = getDefaultProviderConfig(providerId);
    // 如果是当前使用的 provider，使用旧配置中的值
    if (providerId === legacyProvider && legacy) {
      return {
        ...defaultConfig,
        apiKey: legacy.apiKey ?? "",
        apiEndpoint: legacy.apiEndpoint ?? defaultConfig.apiEndpoint,
        model: legacy.model ?? defaultConfig.model,
        promptTemplate: legacy.promptTemplate ?? "",
        temperature: legacy.temperature ?? 0.3,
        maxTokens: legacy.maxTokens ?? 1024,
      };
    }
    return defaultConfig;
  });

  return {
    activeProvider: legacyProvider,
    providers,
    providerOrder,
    sourceLang: legacy?.sourceLang ?? defaults.sourceLang,
    targetLang: legacy?.targetLang ?? defaults.targetLang,
  };
}

export const { store: translateConfig, actions: translateActions } =
  createSettingsModule<TranslateConfig>("translate", defaultTranslateConfig, {
    onLoad: migrateConfig,
  });
