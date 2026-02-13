import { onCleanup, onMount } from "solid-js";
import { isMac } from "../utils/platform";

type WindowShortcutEntry = {
  shortcut: string;
  action: () => void;
};

type ParsedShortcut = {
  ctrl: boolean;
  meta: boolean;
  shift: boolean;
  alt: boolean;
  key: string;
};

function parseShortcut(shortcut: string): ParsedShortcut {
  const parts = shortcut.split("+").map((p) => p.trim().toLowerCase());
  const key = parts.pop() ?? "";

  const modifiers = new Set(parts);

  const hasMod = modifiers.has("mod");

  return {
    ctrl: modifiers.has("ctrl") || (hasMod && !isMac),
    meta: modifiers.has("meta") || (hasMod && isMac),
    shift: modifiers.has("shift"),
    alt: modifiers.has("alt"),
    key,
  };
}

function matchShortcut(e: KeyboardEvent, parsed: ParsedShortcut): boolean {
  return (
    e.ctrlKey === parsed.ctrl &&
    e.metaKey === parsed.meta &&
    e.shiftKey === parsed.shift &&
    e.altKey === parsed.alt &&
    e.key.toLowerCase() === parsed.key
  );
}

export function useWindowShortcuts(shortcuts: WindowShortcutEntry[]) {
  const parsedShortcuts = shortcuts.map((s) => ({
    ...s,
    parsed: parseShortcut(s.shortcut),
  }));

  const handleKeyDown = (e: KeyboardEvent) => {
    for (const { parsed, action } of parsedShortcuts) {
      if (matchShortcut(e, parsed)) {
        e.preventDefault();
        e.stopPropagation();
        action();
        break;
      }
    }
  };

  onMount(() => {
    document.addEventListener("keydown", handleKeyDown, { capture: true });
  });

  onCleanup(() => {
    document.removeEventListener("keydown", handleKeyDown, { capture: true });
  });
}
