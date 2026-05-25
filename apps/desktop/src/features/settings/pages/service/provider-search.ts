import Fuse from "fuse.js";
import type { ProviderMeta } from "@/services/translate-core";

export interface ProviderSearchItem<TProvider extends string> {
  aliases: string[];
  description: string;
  name: string;
  providerId: TProvider;
}

const PROVIDER_SEARCH_ALIASES: Record<string, string[]> = {
  自定义: ["z", "zd", "zdy", "zi ding yi", "zidingyi"],
};

export function createProviderSearchItems<TProvider extends string>(
  providerIds: readonly TProvider[],
  getMeta: (providerId: TProvider) => ProviderMeta | undefined
): ProviderSearchItem<TProvider>[] {
  return providerIds.map((providerId) => {
    const meta = getMeta(providerId);
    const name = meta?.name ?? "";

    return {
      aliases: PROVIDER_SEARCH_ALIASES[name] ?? [],
      description: meta?.description ?? "",
      name,
      providerId,
    };
  });
}

export function filterProviderSearchItems<TProvider extends string>(
  items: ProviderSearchItem<TProvider>[],
  keyword: string
): TProvider[] {
  const normalizedKeyword = keyword.trim();
  if (!normalizedKeyword) {
    return items.map((item) => item.providerId);
  }

  const matchedProviderIds = new Set(
    new Fuse(items, {
      ignoreLocation: true,
      keys: ["providerId", "name", "description", "aliases"],
      threshold: 0.35,
    })
      .search(normalizedKeyword)
      .map((result) => result.item.providerId)
  );

  return items
    .filter((item) => matchedProviderIds.has(item.providerId))
    .map((item) => item.providerId);
}
