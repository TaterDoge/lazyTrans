import type { Locale } from "../../i18n/types";
import { createSettingsModule } from "./base";

export type GeneralSettings = {
  autoStart: boolean;
  locale: Locale;
  theme: "system" | "light" | "dark";
};

const { store: generalStore, actions: generalActions } =
  createSettingsModule<GeneralSettings>("general", {
    autoStart: false,
    locale: "zh-CN",
    theme: "system",
  });

export { generalStore, generalActions };
