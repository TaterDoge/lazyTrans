import type { Locale } from "../../i18n/types";
import { createSettingsModule } from "./base";

export type GeneralSettings = {
  locale: Locale;
};

const { store: generalStore, actions: generalActions } =
  createSettingsModule<GeneralSettings>("general", { locale: "zh-CN" });

export { generalStore, generalActions };
