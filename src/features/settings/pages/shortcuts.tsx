import { createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { SHORTCUT_METAS } from "../../../config/shortcuts.config";
import { useI18n } from "../../../i18n";
import {
  shortcutKeys,
  shortcutsActions,
} from "../../../stores/settings/shortcuts.store";
import { isMac } from "../../../utils/platform";

const MODIFIER_KEYS = new Set(["Control", "Shift", "Alt", "Meta"]);

const BROWSER_TO_HOTKEYS_MODIFIER: Record<string, string> = {
  Control: isMac ? "ctrl" : "ctrl",
  Meta: isMac ? "command" : "ctrl",
  Shift: "shift",
  Alt: "alt",
};

const BROWSER_TO_HOTKEYS_KEY: Record<string, string> = {
  " ": "space",
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
};

function normalizeKey(key: string): string {
  return BROWSER_TO_HOTKEYS_KEY[key] ?? key.toLowerCase();
}

function buildModifierParts(mods: Set<string>): string[] {
  const order = ["Control", "Meta", "Shift", "Alt"];
  const parts: string[] = [];
  let hasPrimary = false;
  for (const mod of order) {
    if (!mods.has(mod)) {
      continue;
    }
    const mapped = BROWSER_TO_HOTKEYS_MODIFIER[mod];
    if (mapped === "command" || mapped === "ctrl") {
      if (hasPrimary) {
        continue;
      }
      hasPrimary = true;
    }
    parts.push(mapped);
  }
  return parts;
}

const DISPLAY_MAP: Record<string, string> = isMac
  ? { command: "⌘", ctrl: "⌃", shift: "⇧", alt: "⌥" }
  : { ctrl: "Ctrl", shift: "Shift", alt: "Alt" };

function formatDisplay(hotkey: string): string {
  return hotkey
    .split("+")
    .map((part) => DISPLAY_MAP[part] ?? part.toUpperCase())
    .join(" + ");
}

function ShortcutRecorder(props: { id: string; currentKey: string }) {
  const { t } = useI18n();
  const [recording, setRecording] = createSignal(false);
  const [modifiers, setModifiers] = createSignal<Set<string>>(
    new Set<string>()
  );

  const [btnRef, setBtnRef] = createSignal<HTMLButtonElement>();

  function startRecording() {
    setRecording(true);
    setModifiers(new Set<string>());
  }

  function stopRecording() {
    setRecording(false);
    setModifiers(new Set<string>());
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (!recording()) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();

    if (e.key === "Escape") {
      stopRecording();
      return;
    }

    if (MODIFIER_KEYS.has(e.key)) {
      setModifiers((prev) => new Set<string>([...prev, e.key]));
      return;
    }

    const mods = modifiers();
    if (mods.size === 0) {
      return;
    }

    const parts = [...buildModifierParts(mods), normalizeKey(e.key)];
    shortcutsActions.update({ [props.id]: parts.join("+") });
    stopRecording();
  }

  function handleClickOutside(e: MouseEvent) {
    const el = btnRef();
    if (recording() && el && !el.contains(e.target as Node)) {
      stopRecording();
    }
  }

  onMount(() => {
    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("mousedown", handleClickOutside);
  });

  onCleanup(() => {
    document.removeEventListener("keydown", handleKeyDown, true);
    document.removeEventListener("mousedown", handleClickOutside);
  });

  const recordingPreview = () => {
    const mods = modifiers();
    if (mods.size === 0) {
      return t("settings.shortcuts.recording");
    }
    return `${formatDisplay(buildModifierParts(mods).join("+"))} + ...`;
  };

  return (
    <button
      class={`cursor-pointer select-none rounded px-2 py-1 font-mono text-sm transition-colors ${
        recording()
          ? "bg-blue-100 text-blue-700 ring-2 ring-blue-400 dark:bg-blue-900 dark:text-blue-200 dark:ring-blue-500"
          : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
      }`}
      onClick={() => !recording() && startRecording()}
      ref={setBtnRef}
      type="button"
    >
      <Show fallback={formatDisplay(props.currentKey)} when={recording()}>
        {recordingPreview()}
      </Show>
    </button>
  );
}

function ShortcutsSettings() {
  const { t } = useI18n();

  const shortcuts = () =>
    SHORTCUT_METAS.map((meta) => ({
      ...meta,
      currentKey: shortcutKeys[meta.id] || meta.defaultKey,
    }));
  const globalShortcuts = () =>
    shortcuts().filter((s) => s.category === "global");
  const internalShortcuts = () =>
    shortcuts().filter((s) => s.category === "internal");

  return (
    <div class="flex flex-col gap-6">
      <div>
        <h3 class="mb-3 font-semibold text-lg">
          {t("settings.shortcuts.globalTitle")}
        </h3>
        <div class="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
          <For each={globalShortcuts()}>
            {(s) => (
              <div class="flex items-center justify-between py-2">
                <div>{t(s.labelKey)}</div>
                <ShortcutRecorder currentKey={s.currentKey} id={s.id} />
              </div>
            )}
          </For>
        </div>
      </div>

      <div>
        <h3 class="mb-3 font-semibold text-lg">
          {t("settings.shortcuts.internalTitle")}
        </h3>
        <div class="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
          <For each={internalShortcuts()}>
            {(s) => (
              <div class="flex items-center justify-between py-2">
                <div>{t(s.labelKey)}</div>
                <ShortcutRecorder currentKey={s.currentKey} id={s.id} />
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  );
}

export default ShortcutsSettings;
