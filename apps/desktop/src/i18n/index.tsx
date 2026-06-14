import type { Flatten, Translator } from "@solid-primitives/i18n";
import { flatten, resolveTemplate, translator } from "@solid-primitives/i18n";
import {
  createContext,
  createMemo,
  type ParentComponent,
  useContext,
} from "solid-js";
import { generalStore } from "../stores/settings/general.store";
import { dict as enUS } from "./locales/en-us";
import { dict as zhCN } from "./locales/zh-cn";
import type { Locale, RawDictionary } from "./types";

export type { Locale, RawDictionary } from "./types";

/**
 * Flatten sometimes fails to generate dot-notation keys for top-level
 * namespaces when the total dictionary complexity exceeds TypeScript's
 * recursive type instantiation depth. We manually merge the global
 * leaf keys so `t("global.xxx")` type-checks correctly.
 */
type GlobalLeafKeys = {
  readonly [K in keyof RawDictionary["global"] as `global.${K}`]: RawDictionary["global"][K];
};

type SettingsServiceLeafKeys = {
  readonly [K in keyof RawDictionary["settings"]["service"] as `settings.service.${K}`]: RawDictionary["settings"]["service"][K];
};

type ProviderConfigLeafKeys = {
  readonly [K in keyof RawDictionary["settings"]["service"]["providerConfig"] as `settings.service.providerConfig.${K}`]: RawDictionary["settings"]["service"]["providerConfig"][K];
};

export type Dictionary = Flatten<RawDictionary> &
  GlobalLeafKeys &
  SettingsServiceLeafKeys &
  ProviderConfigLeafKeys;

const dictionaries: Record<Locale, RawDictionary> = {
  "zh-CN": zhCN,
  en_US: enUS,
};

type I18nContextValue = {
  t: Translator<Dictionary>;
};

const I18nContext = createContext<I18nContextValue>();

export const I18nProvider: ParentComponent = (props) => {
  const dict = createMemo(() => flatten(dictionaries[generalStore.locale]));
  const t = translator(dict, resolveTemplate);

  return (
    <I18nContext.Provider value={{ t }}>{props.children}</I18nContext.Provider>
  );
};

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}
