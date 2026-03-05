import type { IProvider } from "./base-provider";
import { serviceRegistry } from "./registry";
import type { ServiceType } from "./types";

export interface ServiceConfigBase {
  provider: string;
}

type ProviderCtor<TConfig, TOptions, TResult> = new () => IProvider<
  TConfig,
  TOptions,
  TResult
>;

export function registerServiceProvider<TConfig, TOptions, TResult>(
  type: ServiceType,
  name: string,
  provider: ProviderCtor<TConfig, TOptions, TResult>
): void {
  serviceRegistry.register(type, name, provider);
}

async function getValidatedProvider<
  TConfig extends ServiceConfigBase,
  TOptions,
  TResult,
>(
  type: ServiceType,
  config: TConfig
): Promise<IProvider<TConfig, TOptions, TResult>> {
  const provider = serviceRegistry.get<IProvider<TConfig, TOptions, TResult>>(
    type,
    config.provider
  );

  if (!provider) {
    throw new Error(`Unknown ${type} provider: ${config.provider}`);
  }

  const isValid = await provider.validateConfig(config);
  if (!isValid) {
    throw new Error(`Invalid ${type} config`);
  }

  return provider;
}

export async function executeService<
  TConfig extends ServiceConfigBase,
  TOptions,
  TResult,
>(type: ServiceType, config: TConfig, options: TOptions): Promise<TResult> {
  const provider = await getValidatedProvider<TConfig, TOptions, TResult>(
    type,
    config
  );

  return provider.execute(config, options);
}

export async function executeServiceStream<
  TConfig extends ServiceConfigBase,
  TOptions,
  TResult,
>(
  type: ServiceType,
  config: TConfig,
  options: TOptions,
  onChunk: (result: TResult) => void
): Promise<void> {
  const provider = await getValidatedProvider<TConfig, TOptions, TResult>(
    type,
    config
  );

  if (!provider.executeStream) {
    const result = await provider.execute(config, options);
    onChunk(result);
    return;
  }

  return provider.executeStream(config, options, onChunk);
}
