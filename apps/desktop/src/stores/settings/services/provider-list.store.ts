import type {
  ProviderConfig,
  ServiceConfig,
  ServiceDefinition,
} from "@/services/service-config/types";
import { createSettingsModule } from "../base";

export function getKnownProviders<TProvider extends string>(
  definition: ServiceDefinition<TProvider>
): TProvider[] {
  return Object.keys(definition.providers) as TProvider[];
}

export function isKnownProvider<TProvider extends string>(
  provider: string,
  definition: ServiceDefinition<TProvider>
): provider is TProvider {
  return (
    getKnownProviders(definition).includes(provider as TProvider) ||
    definition.isCustomProvider?.(provider) === true
  );
}

export function normalizeProviderOrder<TProvider extends string>(
  order: readonly TProvider[] | undefined,
  definition: ServiceDefinition<TProvider>
): TProvider[] {
  const seen = new Set<TProvider>();
  const normalized: TProvider[] = [];

  for (const provider of order ?? []) {
    if (isKnownProvider(provider, definition) && !seen.has(provider)) {
      seen.add(provider);
      normalized.push(provider);
    }
  }

  for (const provider of getKnownProviders(definition)) {
    if (!seen.has(provider)) {
      normalized.push(provider);
    }
  }

  return normalized;
}

export function normalizeProviderConfigs<TProvider extends string>(
  providers: readonly ProviderConfig<TProvider>[] | undefined,
  definition: ServiceDefinition<TProvider>
): ProviderConfig<TProvider>[] {
  const seen = new Set<TProvider>();
  const normalized: ProviderConfig<TProvider>[] = [];

  for (const provider of providers ?? []) {
    if (
      !isKnownProvider(provider.provider, definition) ||
      seen.has(provider.provider)
    ) {
      continue;
    }

    normalized.push({
      ...definition.getDefaultProviderConfig(provider.provider),
      ...provider,
      isCollapsed: provider.isCollapsed ?? false,
      enabled: provider.enabled ?? true,
    });
    seen.add(provider.provider);
  }

  return normalized;
}

export function createDefaultServiceConfig<TProvider extends string>(
  definition: ServiceDefinition<TProvider>
): ServiceConfig<TProvider> {
  const providerOrder = normalizeProviderOrder(undefined, definition);
  const providers = providerOrder.map((provider) => ({
    ...definition.getDefaultProviderConfig(provider),
    enabled: !definition.getProviderMeta(provider)?.requiresApiKey,
  }));

  return {
    activeProvider:
      providers.find((p) => p.enabled !== false)?.provider ??
      definition.defaultProvider,
    providerOrder,
    providers,
  };
}

export function fillMissingProviders<TProvider extends string>(
  providers: ProviderConfig<TProvider>[],
  providerOrder: readonly TProvider[],
  definition: ServiceDefinition<TProvider>
): ProviderConfig<TProvider>[] {
  const seen = new Set(providers.map((p) => p.provider));
  const filled = [...providers];

  for (const providerId of providerOrder) {
    if (isKnownProvider(providerId, definition) && !seen.has(providerId)) {
      filled.push({
        ...definition.getDefaultProviderConfig(providerId),
        enabled: false,
      });
      seen.add(providerId);
    }
  }

  return filled;
}

export function migrateServiceConfig<TProvider extends string>(
  saved: ServiceConfig<TProvider> | null,
  defaults: ServiceConfig<TProvider>,
  definition: ServiceDefinition<TProvider>
): ServiceConfig<TProvider> {
  if (!saved) {
    return defaults;
  }

  const providers = normalizeProviderConfigs(saved.providers, definition);
  const allProviders = fillMissingProviders(
    providers,
    saved.providerOrder ?? [],
    definition
  );
  const activeProvider = isKnownProvider(saved.activeProvider, definition)
    ? saved.activeProvider
    : defaults.activeProvider;

  return {
    activeProvider,
    providers: allProviders,
    providerOrder: normalizeProviderOrder(
      [...(saved.providerOrder ?? []), ...allProviders.map((p) => p.provider)],
      definition
    ),
  };
}

export function createProviderServiceStore<TProvider extends string>(
  key: string,
  definition: ServiceDefinition<TProvider>
) {
  const defaults = createDefaultServiceConfig(definition);

  return createSettingsModule<ServiceConfig<TProvider>>(key, defaults, {
    onLoad: (saved) => migrateServiceConfig(saved, defaults, definition),
  });
}
