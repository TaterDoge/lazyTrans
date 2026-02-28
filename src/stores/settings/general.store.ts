import type { Locale } from "../../i18n/types";
import { createSettingsModule } from "./base";

export type GeneralSettings = {
  locale: Locale;
  theme: "system" | "light" | "dark";
  autoStart: boolean;
};

const { store: generalStore, actions: generalActions } =
  createSettingsModule<GeneralSettings>("general", {
    locale: "zh-CN",
    theme: "system",
    autoStart: false,
  });

export { generalStore, generalActions };
