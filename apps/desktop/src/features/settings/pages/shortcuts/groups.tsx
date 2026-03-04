/**
 * 快捷键设置分组配置
 *
 * 新增设置项：在对应分组的 items 数组里加一个对象，control 字段直接写组件。
 * 新增分组：在 shortcutsSettingGroups 数组里加一个 SettingGroup 对象。
 */

import { createSignal, onCleanup, onMount, Show } from "solid-js";
import { SHORTCUT_METAS } from "../../../../config/shortcuts.config";
import { useI18n } from "../../../../i18n";
import {
  shortcutKeys,
  shortcutsActions,
} from "../../../../stores/settings/shortcuts.store";
import { cn } from "../../../../utils";
import type { SettingGroup } from "../../components/types";
import {
  buildModifierParts,
  formatDisplay,
  MODIFIER_KEYS,
  normalizeKey,
} from "./config";

// ─── ShortcutRecorder 控件 ───────────────────────────────────────────────────

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
      class={cn(
        "inline-flex min-w-24 cursor-pointer select-none items-center justify-center gap-1 rounded-md border border-input bg-background px-3 py-1.5 font-mono text-sm shadow-xs outline-none transition-[color,box-shadow] hover:bg-accent hover:text-accent-foreground dark:bg-input/30",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        recording() &&
          "border-primary bg-primary/10 text-primary ring-[3px] ring-primary/50 hover:bg-primary/20 dark:bg-primary/20 dark:ring-primary/40"
      )}
      data-recording={recording()}
      data-slot="shortcut-recorder"
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

// ─── 设置分组定义 ────────────────────────────────────────────────────────────

export const shortcutsSettingGroups: SettingGroup[] = [
  {
    titleKey: "settings.shortcuts.globalTitle",
    items: SHORTCUT_METAS.filter((meta) => meta.type === "global").map(
      (meta) => ({
        key: meta.id,
        labelKey: meta.labelKey,
        control: () => (
          <ShortcutRecorder
            currentKey={shortcutKeys[meta.id] || meta.defaultKey}
            id={meta.id}
          />
        ),
      })
    ),
  },
  {
    titleKey: "settings.shortcuts.internalTitle",
    items: SHORTCUT_METAS.filter((meta) => meta.type === "internal").map(
      (meta) => ({
        key: meta.id,
        labelKey: meta.labelKey,
        control: () => (
          <ShortcutRecorder
            currentKey={shortcutKeys[meta.id] || meta.defaultKey}
            id={meta.id}
          />
        ),
      })
    ),
  },
];
