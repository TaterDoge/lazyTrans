import { getDefaultKeyMap } from "../../config/shortcuts.config";
import { isMac } from "../../utils/platform";
import { createSettingsModule } from "./base";

export type ShortcutKeyMap = Record<string, string>;

function migrateKey(key: string): string {
  return key
    .replace(/\bCommandOrControl\b/gi, isMac ? "command" : "ctrl")
    .replace(/\bControl\b/g, "ctrl")
    .replace(/\bShift\b/g, "shift")
    .replace(/\bAlt\b/g, "alt")
    .toLowerCase();
}

function migrateKeyMap(map: ShortcutKeyMap): ShortcutKeyMap {
  const migrated: ShortcutKeyMap = {};
  let changed = false;
  for (const [id, key] of Object.entries(map)) {
    const newKey = migrateKey(key);
    if (newKey !== key) {
      changed = true;
    }
    migrated[id] = newKey;
  }
  return changed ? migrated : map;
}

const { store: shortcutKeys, actions: shortcutsActions } =
  createSettingsModule<ShortcutKeyMap>("shortcuts", getDefaultKeyMap(), {
    onLoad: (saved, defaults) =>
      migrateKeyMap({ ...defaults, ...(saved || {}) }),
  });

export { shortcutKeys, shortcutsActions };
