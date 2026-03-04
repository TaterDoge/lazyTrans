/**
 * 服务注册表
 * 管理所有服务Provider的注册和获取
 */

import type { IProvider } from "./base-provider";
import type { ServiceType } from "./types";

type ProviderConstructor<T> = new () => T;

class ServiceRegistry {
  private readonly providers = new Map<
    ServiceType,
    Map<string, ProviderConstructor<IProvider<unknown, unknown, unknown>>>
  >();

  constructor() {
    this.providers.set("translate", new Map());
    this.providers.set("tts", new Map());
    this.providers.set("ocr", new Map());
  }

  // 注册Provider
  register<T extends IProvider<unknown, unknown, unknown>>(
    type: ServiceType,
    name: string,
    provider: ProviderConstructor<T>
  ): void {
    const typeProviders = this.providers.get(type);
    if (typeProviders) {
      typeProviders.set(
        name,
        provider as ProviderConstructor<IProvider<unknown, unknown, unknown>>
      );
    }
  }

  // 获取Provider实例
  get<T extends IProvider<unknown, unknown, unknown>>(
    type: ServiceType,
    name: string
  ): T | undefined {
    const typeProviders = this.providers.get(type);
    if (!typeProviders) {
      return undefined;
    }

    const Provider = typeProviders.get(name);
    return Provider ? (new Provider() as T) : undefined;
  }

  // 获取所有可用Provider名称
  getAvailableProviders(type: ServiceType): string[] {
    const typeProviders = this.providers.get(type);
    return typeProviders ? Array.from(typeProviders.keys()) : [];
  }

  // 检查Provider是否存在
  has(type: ServiceType, name: string): boolean {
    const typeProviders = this.providers.get(type);
    return typeProviders?.has(name) ?? false;
  }
}

export const serviceRegistry = new ServiceRegistry();
