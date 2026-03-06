import type { Accessor } from "solid-js";
import { createEffect, createMemo, createSignal, onCleanup } from "solid-js";
import type {
  ProviderConfig,
  TranslateProvider,
} from "@/services/translate/types";
import { initSettingsStore } from "@/stores/settings";
import { translateConfig } from "@/stores/settings/services";
import type { TranslateResultItem } from "../types";

type TranslateFn = typeof import("@/services/translate").translate;

let cachedTranslateFn: TranslateFn | null = null;
let pendingTranslateFn: Promise<TranslateFn> | null = null;

const LINE_BREAK_REGEX = /\r?\n+/;

function getTranslateFn(): Promise<TranslateFn> {
  if (cachedTranslateFn) {
    return Promise.resolve(cachedTranslateFn);
  }

  if (!pendingTranslateFn) {
    pendingTranslateFn = import("@/services/translate")
      .then((module) => {
        cachedTranslateFn = module.translate;
        return module.translate;
      })
      .catch((error) => {
        pendingTranslateFn = null;
        throw error;
      });
  }

  return pendingTranslateFn;
}

/**
 * 多服务翻译 Hook
 * 每次文本触发都会启动新一轮翻译，始终以最新触发为准
 */
export function useMultiTranslate(text: Accessor<string>) {
  const [results, setResults] = createSignal<TranslateResultItem[]>([]);
  const [isAnyLoading, setIsAnyLoading] = createSignal(false);

  // 单调递增版本号：用于屏蔽过期请求对 UI 的写入
  let activeRunVersion = 0;

  const normalizeResultLines = (resultText: string): string[] =>
    resultText
      .split(LINE_BREAK_REGEX)
      .map((line) => line.trim())
      .filter(Boolean);

  const getEnabledProviders = (): ProviderConfig[] => {
    return [...translateConfig.providers].sort((a, b) => {
      const orderA = translateConfig.providerOrder.indexOf(a.provider);
      const orderB = translateConfig.providerOrder.indexOf(b.provider);
      const fallbackOrder = Number.MAX_SAFE_INTEGER;
      return (
        (orderA === -1 ? fallbackOrder : orderA) -
        (orderB === -1 ? fallbackOrder : orderB)
      );
    });
  };

  const enabledProviders = createMemo(() => getEnabledProviders());

  const isProviderManuallyCollapsed = (provider: ProviderConfig): boolean =>
    provider.isCollapsed === true;

  const createIdleResults = (
    providers: ProviderConfig[]
  ): TranslateResultItem[] =>
    providers.map((config) => ({
      provider: config.provider,
      resultLines: [],
      error: null,
      loading: false,
    }));

  const applyProviderResult = (
    index: number,
    runVersion: number,
    updater: (current: TranslateResultItem) => TranslateResultItem
  ) => {
    if (runVersion !== activeRunVersion) {
      return;
    }

    setResults((prev) => {
      if (
        runVersion !== activeRunVersion ||
        index < 0 ||
        index >= prev.length
      ) {
        return prev;
      }
      const next = [...prev];
      next[index] = updater(next[index]);
      return next;
    });
  };

  const translateSingleProvider = async (
    config: ProviderConfig,
    index: number,
    textSnapshot: string,
    runVersion: number
  ) => {
    try {
      const translate = await getTranslateFn();
      const result = await translate(
        {
          apiKey: config.apiKey,
          apiEndpoint: config.apiEndpoint,
          model: config.model,
          promptTemplate: config.promptTemplate,
          maxTokens: config.maxTokens,
          temperature: config.temperature,
          provider: config.provider,
          sourceLang: translateConfig.sourceLang,
          targetLang: translateConfig.targetLang,
        },
        {
          text: textSnapshot,
          sourceLang: translateConfig.sourceLang,
          targetLang: translateConfig.targetLang,
        }
      );

      applyProviderResult(index, runVersion, (current) => ({
        ...current,
        resultLines: normalizeResultLines(result.text),
        error: null,
        loading: false,
      }));
    } catch (error) {
      applyProviderResult(index, runVersion, (current) => ({
        ...current,
        resultLines: [],
        error: error instanceof Error ? error.message : "Translation failed",
        loading: false,
      }));
    }
  };

  const executeTranslation = async (
    textSnapshot: string,
    runVersion: number
  ) => {
    await Promise.all([
      getTranslateFn(),
      initSettingsStore({ mode: "all", scheduleDeferred: false }),
    ]);

    if (runVersion !== activeRunVersion) {
      return;
    }

    const allProviders = enabledProviders();
    if (allProviders.length === 0) {
      setResults([]);
      setIsAnyLoading(false);
      return;
    }

    const initialResults: TranslateResultItem[] = allProviders.map(
      (config) => ({
        provider: config.provider,
        resultLines: [],
        error: null,
        loading: !isProviderManuallyCollapsed(config),
      })
    );

    setResults(initialResults);

    const hasTranslatableProvider = allProviders.some(
      (config) => !isProviderManuallyCollapsed(config)
    );
    if (!hasTranslatableProvider) {
      setIsAnyLoading(false);
      return;
    }

    const promises = allProviders.map(async (config, index) => {
      if (isProviderManuallyCollapsed(config)) {
        return;
      }

      await translateSingleProvider(config, index, textSnapshot, runVersion);
    });

    Promise.allSettled(promises).then(() => {
      if (runVersion !== activeRunVersion) {
        return;
      }
      setIsAnyLoading(false);
    });
  };

  const triggerProviderTranslation = async (provider: TranslateProvider) => {
    const textSnapshot = text().trim();
    if (!textSnapshot) {
      return;
    }

    const providerConfig = enabledProviders().find(
      (config) => config.provider === provider
    );
    const providerIndex = results().findIndex(
      (item) => item.provider === provider
    );

    if (!providerConfig || providerIndex === -1) {
      return;
    }

    const runVersion = activeRunVersion;
    setIsAnyLoading(true);
    applyProviderResult(providerIndex, runVersion, (current) => ({
      ...current,
      loading: true,
      error: null,
    }));

    await translateSingleProvider(
      providerConfig,
      providerIndex,
      textSnapshot,
      runVersion
    );

    if (runVersion !== activeRunVersion) {
      return;
    }

    setIsAnyLoading(results().some((item) => item.loading));
  };

  createEffect(() => {
    const currentText = text().trim();
    const runVersion = ++activeRunVersion;

    if (!currentText) {
      setIsAnyLoading(false);
      return;
    }

    setIsAnyLoading(true);
    executeTranslation(currentText, runVersion).catch((error) => {
      if (runVersion !== activeRunVersion) {
        return;
      }

      setResults([]);
      setIsAnyLoading(false);
      console.error("[translate] 初始化或执行失败", error);
    });
  });

  createEffect(() => {
    const hasText = text().trim().length > 0;
    const activeProviders = enabledProviders();

    if (hasText) {
      return;
    }

    setResults(createIdleResults(activeProviders));
    setIsAnyLoading(false);
  });

  onCleanup(() => {
    activeRunVersion += 1;
  });

  return {
    results,
    isAnyLoading,
    enabledProviders,
    triggerProviderTranslation,
  };
}
