import { getStore, type SettingsModule } from "./base";
import { generalActions } from "./general.store";
import { ocrActions, translateActions, ttsActions } from "./services";
import { shortcutsActions } from "./shortcuts.store";

const settingsModules: SettingsModule[] = [
  generalActions,
  shortcutsActions,
  translateActions,
  ttsActions,
  ocrActions,
];

let settingsInitPromise: Promise<void> | null = null;

async function loadModules() {
  const store = await getStore();
  await Promise.all(settingsModules.map((module) => module.load(store)));
}

function ensureSettingsLoaded() {
  if (!settingsInitPromise) {
    settingsInitPromise = loadModules().catch((error) => {
      settingsInitPromise = null;
      throw error;
    });
  }

  return settingsInitPromise;
}

export async function initSettingsStore() {
  await ensureSettingsLoaded();
}
