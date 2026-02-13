import { createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { initSettings } from "../../../stores/settings";
import { shortcutsStore } from "../../../stores/settings/shortcuts.store";
import { isMac } from "../../../utils/platform";

const MODIFIER_KEYS = new Set(["Control", "Shift", "Alt", "Meta"]);

const BROWSER_TO_TAURI_MODIFIER: Record<string, string> = {
  Control: "CommandOrControl",
  Meta: "CommandOrControl",
  Shift: "Shift",
  Alt: "Alt",
};

const BROWSER_TO_TAURI_KEY: Record<string, string> = {
  " ": "Space",
  ArrowUp: "Up",
  ArrowDown: "Down",
  ArrowLeft: "Left",
  ArrowRight: "Right",
};

function normalizeKey(key: string): string {
  if (BROWSER_TO_TAURI_KEY[key]) {
    return BROWSER_TO_TAURI_KEY[key];
  }
  if (key.length === 1) {
    return key.toUpperCase();
  }
  return key;
}

function buildModifierParts(mods: Set<string>): string[] {
  const order = ["Control", "Meta", "Shift", "Alt"];
  const parts: string[] = [];
  let hasCommandOrControl = false;
  for (const mod of order) {
    if (!mods.has(mod)) {
      continue;
    }
    const mapped = BROWSER_TO_TAURI_MODIFIER[mod];
    if (mapped === "CommandOrControl") {
      if (hasCommandOrControl) {
        continue;
      }
      hasCommandOrControl = true;
    }
    parts.push(mapped);
  }
  return parts;
}

function formatDisplay(tauriKey: string): string {
  return tauriKey
    .split("+")
    .map((part) => {
      switch (part) {
        case "CommandOrControl":
          return isMac ? "⌘" : "Ctrl";
        case "Shift":
          return isMac ? "⇧" : "Shift";
        case "Alt":
          return isMac ? "⌥" : "Alt";
        default:
          return part;
      }
    })
    .join(" + ");
}

function ShortcutRecorder(props: { id: string; currentKey: string }) {
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
    shortcutsStore.updateShortcut(props.id, parts.join("+"));
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
      return "请按下快捷键...";
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
  onMount(() => initSettings());

  const shortcuts = () => shortcutsStore.getShortcuts();
  const globalShortcuts = () =>
    shortcuts().filter((s) => s.category === "global");
  const internalShortcuts = () =>
    shortcuts().filter((s) => s.category === "internal");

  return (
    <div class="flex flex-col gap-6">
      <div>
        <h3 class="mb-3 font-semibold text-lg">全局快捷键</h3>
        <div class="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
          <For each={globalShortcuts()}>
            {(s) => (
              <div class="flex items-center justify-between py-2">
                <div>{s.label}</div>
                <ShortcutRecorder currentKey={s.currentKey} id={s.id} />
              </div>
            )}
          </For>
        </div>
      </div>

      <div>
        <h3 class="mb-3 font-semibold text-lg">应用内快捷键</h3>
        <div class="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
          <For each={internalShortcuts()}>
            {(s) => (
              <div class="flex items-center justify-between py-2">
                <div>{s.label}</div>
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
