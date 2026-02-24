import type { Flatten, Translator } from "@solid-primitives/i18n";
import { flatten, resolveTemplate, translator } from "@solid-primitives/i18n";
import {
  createContext,
  createResource,
  type ParentComponent,
  useContext,
} from "solid-js";
import { generalActions, generalStore } from "../stores/settings/general.store";
import { dict as enUS } from "./locales/en-us";
import { dict as zhCN } from "./locales/zh-cn";
import type { Locale, RawDictionary } from "./types";

export type { Locale, RawDictionary } from "./types";
export type Dictionary = Flatten<RawDictionary>;

const dictionaries: Record<Locale, () => Promise<RawDictionary>> = {
  "zh-CN": () => Promise.resolve(zhCN),
  en_US: () => Promise.resolve(enUS),
};

async function fetchDictionary(locale: Locale): Promise<Dictionary> {
  const raw = await dictionaries[locale]();
  return flatten(raw);
}

type I18nContextValue = {
  t: Translator<Dictionary>;
  locale: () => Locale;
  setLocale: (l: Locale) => void;
};

const I18nContext = createContext<I18nContextValue>();

export const I18nProvider: ParentComponent = (props) => {
  const locale = () => generalStore.locale;

  const initialRaw = locale() === "en_US" ? enUS : zhCN;

  const [dict] = createResource(locale, fetchDictionary, {
    initialValue: flatten(initialRaw),
  });

  const t = translator(dict, resolveTemplate);

  const setLocale = (l: Locale) => {
    generalActions.update({ locale: l });
  };

  return (
    <I18nContext.Provider value={{ t, locale, setLocale }}>
      {props.children}
    </I18nContext.Provider>
  );
};

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}
