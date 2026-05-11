import type { Accessor } from "solid-js";
import {
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  untrack,
} from "solid-js";
import type {
  ProviderConfig,
  TranslateProvider,
} from "@/services/translate/types";
import { initSettingsStore } from "@/stores/settings";
import { translateConfig } from "@/stores/settings/services";
import type { TranslateResultItem } from "../types";

type TranslateFn = typeof import("@/services/translate").translate;

interface ProviderRuntimeState {
  error: string | null;
  loading: boolean;
  resultLines: string[];
  triggeredTextVersion: number | null;
}

interface TranslationProviderSnapshot {
  apiEndpoint?: string;
  apiKey?: string;
  maxTokens?: number;
  model?: string;
  promptTemplate?: string;
  provider: TranslateProvider;
  temperature?: number;
}

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

function sortProviders(providers: ProviderConfig[]): ProviderConfig[] {
  return [...providers].sort((a, b) => {
    const orderA = translateConfig.providerOrder.indexOf(a.provider);
    const orderB = translateConfig.providerOrder.indexOf(b.provider);
    const fallbackOrder = Number.MAX_SAFE_INTEGER;
    return (
      (orderA === -1 ? fallbackOrder : orderA) -
      (orderB === -1 ? fallbackOrder : orderB)
    );
  });
}

function createRuntimeState(): ProviderRuntimeState {
  return {
    error: null,
    loading: false,
    resultLines: [],
    triggeredTextVersion: null,
  };
}

export function useMultiTranslate(text: Accessor<string>) {
  const [providerStates, setProviderStates] = createSignal<
    Map<TranslateProvider, ProviderRuntimeState>
  >(new Map());

  let activeRequestVersion = 0;
  let textVersion = 0;
  let lastTextSnapshot = "";
  let lastTranslationSignature = "";
  let settingsReadyPromise: Promise<void> | null = null;

  const enabledProviders = createMemo(() =>
    sortProviders(translateConfig.providers)
  );

  const translationProviders = createMemo<TranslationProviderSnapshot[]>(() =>
    enabledProviders().map((config) => ({
      provider: config.provider,
      apiKey: config.apiKey,
      apiEndpoint: config.apiEndpoint,
      model: config.model,
      promptTemplate: config.promptTemplate,
      maxTokens: config.maxTokens,
      temperature: config.temperature,
    }))
  );

  const translationSignature = createMemo(() => {
    const providers = [...translationProviders()].sort((a, b) =>
      a.provider.localeCompare(b.provider)
    );

    return JSON.stringify({
      sourceLang: translateConfig.sourceLang,
      targetLang: translateConfig.targetLang,
      providers,
    });
  });

  const normalizeResultLines = (resultText: string): string[] =>
    resultText
      .split(LINE_BREAK_REGEX)
      .map((line) => line.trim())
      .filter(Boolean);

  const ensureSettingsReady = async () => {
    if (!settingsReadyPromise) {
      settingsReadyPromise = Promise.all([
        getTranslateFn(),
        initSettingsStore(),
      ])
        .then(() => undefined)
        .catch((error) => {
          settingsReadyPromise = null;
          throw error;
        });
    }

    await settingsReadyPromise;
  };

  const updateProviderState = (
    provider: TranslateProvider,
    requestVersion: number,
    updater: (current: ProviderRuntimeState) => ProviderRuntimeState
  ) => {
    if (requestVersion !== activeRequestVersion) {
      return;
    }

    setProviderStates((prev) => {
      if (requestVersion !== activeRequestVersion) {
        return prev;
      }

      const current = prev.get(provider);
      if (!current) {
        return prev;
      }

      const next = new Map(prev);
      next.set(provider, updater(current));
      return next;
    });
  };

  const runProvider = async (
    config: ProviderConfig,
    textSnapshot: string,
    requestVersion: number,
    currentTextVersion: number,
    sourceLang: string,
    targetLang: string
  ) => {
    updateProviderState(config.provider, requestVersion, (current) => ({
      ...current,
      loading: true,
      error: null,
    }));

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
          sourceLang,
          targetLang,
        },
        {
          text: textSnapshot,
          sourceLang,
          targetLang,
        }
      );

      updateProviderState(config.provider, requestVersion, (current) => ({
        ...current,
        resultLines: normalizeResultLines(result.text),
        error: null,
        loading: false,
        triggeredTextVersion: currentTextVersion,
      }));
    } catch (error) {
      updateProviderState(config.provider, requestVersion, (current) => ({
        ...current,
        resultLines: [],
        error: error instanceof Error ? error.message : "Translation failed",
        loading: false,
        triggeredTextVersion: currentTextVersion,
      }));
    }
  };

  const executeBatch = async (
    providers: ProviderConfig[],
    textSnapshot: string,
    requestVersion: number,
    currentTextVersion: number,
    sourceLang: string,
    targetLang: string
  ) => {
    await ensureSettingsReady();

    if (requestVersion !== activeRequestVersion) {
      return;
    }

    setProviderStates(() => {
      const next = new Map<TranslateProvider, ProviderRuntimeState>();
      for (const config of providers) {
        next.set(config.provider, {
          error: null,
          loading: config.isCollapsed !== true,
          resultLines: [],
          triggeredTextVersion: null,
        });
      }
      return next;
    });

    const tasks = providers
      .filter((config) => config.isCollapsed !== true)
      .map((config) =>
        runProvider(
          config,
          textSnapshot,
          requestVersion,
          currentTextVersion,
          sourceLang,
          targetLang
        )
      );

    await Promise.allSettled(tasks);
  };

  const triggerProviderTranslation = async (provider: TranslateProvider) => {
    const textSnapshot = text().trim();
    if (!textSnapshot) {
      return;
    }

    const providerConfig = enabledProviders().find(
      (config) => config.provider === provider
    );
    if (!providerConfig) {
      return;
    }

    const currentState = providerStates().get(provider);
    if (!currentState || currentState.loading) {
      return;
    }

    if (currentState.triggeredTextVersion === textVersion) {
      return;
    }

    await ensureSettingsReady();

    const requestVersion = activeRequestVersion;
    if (requestVersion <= 0) {
      return;
    }

    await runProvider(
      providerConfig,
      textSnapshot,
      requestVersion,
      textVersion,
      translateConfig.sourceLang,
      translateConfig.targetLang
    );
  };

  createEffect(() => {
    const currentText = text().trim();
    const currentSignature = translationSignature();

    const textChanged = currentText !== lastTextSnapshot;
    if (textChanged) {
      lastTextSnapshot = currentText;
      textVersion += 1;
    }

    const configChanged = currentSignature !== lastTranslationSignature;
    if (!(textChanged || configChanged)) {
      return;
    }

    lastTranslationSignature = currentSignature;

    const providers = untrack(() => enabledProviders());
    const requestVersion = ++activeRequestVersion;

    if (!currentText) {
      if (textChanged) {
        setProviderStates(new Map());
      }
      return;
    }

    executeBatch(
      providers,
      currentText,
      requestVersion,
      textVersion,
      translateConfig.sourceLang,
      translateConfig.targetLang
    ).catch((error) => {
      if (requestVersion !== activeRequestVersion) {
        return;
      }

      setProviderStates(() => {
        const next = new Map<TranslateProvider, ProviderRuntimeState>();
        for (const config of providers) {
          next.set(config.provider, createRuntimeState());
        }
        return next;
      });
      console.error("[translate] 初始化或执行失败", error);
    });
  });

  onCleanup(() => {
    activeRequestVersion += 1;
  });

  const results = createMemo<TranslateResultItem[]>(() => {
    const states = providerStates();

    return enabledProviders().map((config) => {
      const state = states.get(config.provider) ?? createRuntimeState();
      return {
        provider: config.provider,
        resultLines: state.resultLines,
        error: state.error,
        loading: state.loading,
        isCollapsed: config.isCollapsed === true,
      };
    });
  });

  return {
    results,
    enabledProviders,
    triggerProviderTranslation,
  };
}
