import { getStore, type SettingsModule } from "./base";
import { generalActions } from "./general.store";
import { shortcutsActions } from "./shortcuts.store";

const modules: SettingsModule[] = [generalActions, shortcutsActions];

let loaded = false;

export async function initSettingsStore() {
  if (loaded) {
    return;
  }
  const store = await getStore();
  await Promise.all(modules.map((m) => m.load(store)));
  loaded = true;
}
