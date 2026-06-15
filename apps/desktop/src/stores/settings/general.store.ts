import type { Locale } from "../../i18n/types";
import { createSettingsModule, getStore } from "./base";

export type GeneralSettings = {
  autoStart: boolean;
  locale: Locale;
  theme: "system" | "light" | "dark";
  translatorWindowPosition: TranslatorWindowPosition;
};

export type TranslatorWindowPosition = "mouse" | "center";

const defaultGeneralSettings: GeneralSettings = {
  autoStart: false,
  locale: "zh-CN",
  theme: "system",
  translatorWindowPosition: "mouse",
};

const { store: generalStore, actions: generalActions } =
  createSettingsModule<GeneralSettings>("general", defaultGeneralSettings, {
    onLoad: (saved, defaults) => ({
      ...defaults,
      ...(saved ?? {}),
    }),
  });

export async function getGeneralSettingsSnapshot(): Promise<GeneralSettings> {
  const settingsStore = await getStore();
  const saved = await settingsStore.get<Partial<GeneralSettings>>("general");

  return {
    ...defaultGeneralSettings,
    ...(saved ?? {}),
  };
}

export { generalActions, generalStore };
