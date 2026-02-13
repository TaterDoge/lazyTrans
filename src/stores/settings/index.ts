import { getStore, type SettingsModule } from "./base";
import { shortcutsStore } from "./shortcuts.store";

const modules: SettingsModule[] = [shortcutsStore];

let loaded = false;

export async function initSettings() {
  if (loaded) {
    return;
  }
  const store = await getStore();
  await Promise.all(modules.map((m) => m.load(store)));
  loaded = true;
}
