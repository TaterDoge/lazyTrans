import type { Accessor } from "solid-js";
import {
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  untrack,
} from "solid-js";
import { getTranslateProviderMeta } from "@/services/service-config";
import type {
  ProviderConfig,
  TranslateProvider,
} from "@/services/translate/types";
import { initSettingsStore } from "@/stores/settings";
import { translateConfig } from "@/stores/settings/services";
import type { TranslateResultItem } from "../types";

type TranslateStreamFn = typeof import("@/services/translate").translateStream;

interface ProviderRuntimeState {
  error: string | null;
  loading: boolean;
  resultText: string;
  triggeredTextVersion: number | null;
}

interface TranslationProviderSnapshot {
  apiEndpoint?: string;
  apiKey?: string;
  apiMode?: ProviderConfig["apiMode"];
  model?: string;
  promptTemplate?: string;
  provider: TranslateProvider;
  temperature?: number;
}

let cachedTranslateStreamFn: TranslateStreamFn | null = null;
let pendingTranslateStreamFn: Promise<TranslateStreamFn> | null = null;

function getTranslateStreamFn(): Promise<TranslateStreamFn> {
  if (cachedTranslateStreamFn) {
    return Promise.resolve(cachedTranslateStreamFn);
  }

  if (!pendingTranslateStreamFn) {
    pendingTranslateStreamFn = import("@/services/translate")
      .then((module) => {
        cachedTranslateStreamFn = module.translateStream;
        return module.translateStream;
      })
      .catch((error) => {
        pendingTranslateStreamFn = null;
        throw error;
      });
  }

  return pendingTranslateStreamFn;
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
    resultText: "",
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
    sortProviders(
      translateConfig.providers.filter((provider) => provider.enabled !== false)
    )
  );

  const translationProviders = createMemo<TranslationProviderSnapshot[]>(() =>
    enabledProviders().map((config) => ({
      provider: config.provider,
      apiKey: config.apiKey,
      apiEndpoint: config.apiEndpoint,
      apiMode: config.apiMode,
      model: config.model,
      promptTemplate: config.promptTemplate,
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

  const ensureSettingsReady = async () => {
    if (!settingsReadyPromise) {
      settingsReadyPromise = Promise.all([
        getTranslateStreamFn(),
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
      const translateStream = await getTranslateStreamFn();
      await translateStream(
        {
          apiKey: config.apiKey,
          apiEndpoint: config.apiEndpoint,
          apiMode: config.apiMode,
          requiresApiKey: getTranslateProviderMeta(config.provider)
            ?.requiresApiKey,
          model: config.model,
          promptTemplate: config.promptTemplate,
          temperature: config.temperature,
          provider: config.provider,
          sourceLang,
          targetLang,
        },
        {
          text: textSnapshot,
          sourceLang,
          targetLang,
        },
        (result) => {
          updateProviderState(config.provider, requestVersion, (current) => ({
            ...current,
            resultText: result.text,
            error: null,
            loading: !result.finished,
            triggeredTextVersion: result.finished
              ? currentTextVersion
              : current.triggeredTextVersion,
          }));
        }
      );

      updateProviderState(config.provider, requestVersion, (current) => ({
        ...current,
        error: null,
        loading: false,
        triggeredTextVersion: currentTextVersion,
      }));
    } catch (error) {
      updateProviderState(config.provider, requestVersion, (current) => ({
        ...current,
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
          resultText: "",
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
        resultText: state.resultText,
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
