import { translateServiceDefinition } from "@/services/service-config";
import {
  getDefaultProviderConfig,
  TRANSLATE_PROVIDERS,
} from "@/services/translate/config";
import type {
  BuiltinTranslateProvider,
  ProviderConfig,
  TranslateConfig,
  TranslateProvider,
} from "@/services/translate/types";
import { createSettingsModule } from "../base";
import {
  fillMissingProviders as fillMissingServiceProviders,
  isKnownProvider as isKnownServiceProvider,
  normalizeProviderOrder as normalizeServiceProviderOrder,
} from "./provider-list.store";

// 默认展示的内置 provider 列表，自定义 OpenAI 由设置页添加按钮写入。
const BUILTIN_PROVIDERS = Object.keys(
  TRANSLATE_PROVIDERS
) as BuiltinTranslateProvider[];

const defaultTranslateConfig: TranslateConfig = {
  activeProvider: "openai",
  providers: BUILTIN_PROVIDERS.map((provider) => ({
    ...getDefaultProviderConfig(provider),
    enabled: !TRANSLATE_PROVIDERS[provider]?.requiresApiKey,
  })),
  providerOrder: [...BUILTIN_PROVIDERS],
  sourceLang: "auto",
  targetLang: "zh-CN",
};

// 旧配置结构（用于迁移）
interface LegacyTranslateConfig {
  apiEndpoint?: string;
  apiKey?: string;
  apiMode?: ProviderConfig["apiMode"];
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
  return normalizeServiceProviderOrder(order, translateServiceDefinition);
}

function normalizeEnabledProviders(
  providers: TranslateProvider[] | undefined
): TranslateProvider[] {
  const seen = new Set<TranslateProvider>();
  const normalized: TranslateProvider[] = [];

  for (const provider of providers ?? BUILTIN_PROVIDERS) {
    if (isKnownProvider(provider) && !seen.has(provider)) {
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
    if (!isKnownProvider(provider.provider) || seen.has(provider.provider)) {
      continue;
    }

    normalized.push({
      ...translateServiceDefinition.getDefaultProviderConfig(provider.provider),
      ...provider,
      isCollapsed: provider.isCollapsed ?? false,
      enabled: provider.enabled ?? true,
    });
    seen.add(provider.provider);
  }

  return normalized;
}

function isKnownProvider(provider: TranslateProvider): boolean {
  return isKnownServiceProvider(provider, translateServiceDefinition);
}

// 迁移旧配置到新配置
function migrateConfig(
  saved: TranslateConfig | LegacyTranslateConfig | null,
  defaults: TranslateConfig
): TranslateConfig {
  // 如果已经是新结构，直接返回
  if (saved && "providers" in saved && Array.isArray(saved.providers)) {
    const activeProvider = isKnownProvider(saved.activeProvider)
      ? saved.activeProvider
      : defaults.activeProvider;
    const providers = normalizeProviders(saved.providers);
    const allProviders = fillMissingServiceProviders(
      providers,
      saved.providerOrder ?? [],
      translateServiceDefinition
    );

    return {
      activeProvider,
      providers: allProviders,
      providerOrder: normalizeProviderOrder([
        ...(saved.providerOrder ?? []),
        ...allProviders.map((provider) => provider.provider),
      ]),
      sourceLang: saved.sourceLang ?? defaults.sourceLang,
      targetLang: saved.targetLang ?? defaults.targetLang,
    };
  }

  // 旧配置迁移：所有内置 provider 都写入 providers 数组，启用/禁用按旧配置决定
  const legacy = saved as LegacyTranslateConfig | null;

  // 从旧配置中提取全局设置
  const legacyProvider =
    legacy?.provider && isKnownProvider(legacy.provider)
      ? legacy.provider
      : "openai";
  const enabledProviders = normalizeEnabledProviders(legacy?.enabledProviders);
  const providerOrder = normalizeProviderOrder([
    ...enabledProviders,
    ...BUILTIN_PROVIDERS,
  ]);

  // 构建 providers 数组：所有内置 provider，enabled 根据旧配置判断
  const providers = BUILTIN_PROVIDERS.map((providerId) => {
    const isEnabled = enabledProviders.includes(providerId);
    const defaultConfig = getDefaultProviderConfig(providerId);
    // 如果是当前启用的 provider 且是旧配置选中的，使用旧配置中的值
    if (isEnabled && providerId === legacyProvider && legacy) {
      return {
        ...defaultConfig,
        enabled: true as const,
        apiKey: legacy.apiKey ?? "",
        apiEndpoint: legacy.apiEndpoint ?? defaultConfig.apiEndpoint,
        apiMode: legacy.apiMode ?? defaultConfig.apiMode,
        model: legacy.model ?? defaultConfig.model,
        promptTemplate: legacy.promptTemplate ?? "",
        temperature: legacy.temperature ?? 0.3,
        maxTokens: legacy.maxTokens ?? 1024,
      };
    }
    return { ...defaultConfig, enabled: isEnabled };
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
