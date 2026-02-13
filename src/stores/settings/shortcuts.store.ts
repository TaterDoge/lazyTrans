import { emit } from "@tauri-apps/api/event";
import type { Store } from "@tauri-apps/plugin-store";
import { createSignal } from "solid-js";
import {
  DEFAULT_SHORTCUTS,
  getDefaultKeyMap,
  type ShortcutDefinition,
} from "../../config/shortcuts.config";
import type { SettingsModule } from "./base";

type ShortcutKeyMap = Record<string, string>;

/** daemon 监听此事件来重新注册全局快捷键 */
export const SHORTCUTS_CHANGED_EVENT = "shortcuts-changed";

const [getShortcutKeys, setShortcutKeys] = createSignal<ShortcutKeyMap>({});

class ShortcutsStore implements SettingsModule {
  private store: Store | null = null;
  private readonly STORE_KEY = "shortcuts";

  async load(store: Store) {
    this.store = store;
    const saved = await store.get<ShortcutKeyMap>(this.STORE_KEY);
    setShortcutKeys(saved || getDefaultKeyMap());
  }

  getAllShortcutKeys = () => getShortcutKeys();

  getShortcutKey = (id: string) => getShortcutKeys()[id];

  updateShortcut = async (id: string, key: string) => {
    const newMap = { ...getShortcutKeys(), [id]: key };
    setShortcutKeys(newMap);
    await this.store?.set(this.STORE_KEY, newMap);
    await emit(SHORTCUTS_CHANGED_EVENT);
  };

  resetShortcuts = async () => {
    const defaults = getDefaultKeyMap();
    setShortcutKeys(defaults);
    await this.store?.set(this.STORE_KEY, defaults);
    await emit(SHORTCUTS_CHANGED_EVENT);
  };

  getShortcuts = (): (ShortcutDefinition & { currentKey: string })[] => {
    const keys = getShortcutKeys();
    return DEFAULT_SHORTCUTS.map((def) => ({
      ...def,
      currentKey: keys[def.id] || def.defaultKey,
    }));
  };

  getGlobalShortcuts = () =>
    this.getShortcuts().filter((s) => s.category === "global");

  getWindowShortcuts = () =>
    this.getShortcuts().filter((s) => s.category === "internal");
}

export const shortcutsStore = new ShortcutsStore();
