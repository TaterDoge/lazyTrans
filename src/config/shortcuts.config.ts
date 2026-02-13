import { openTranslator } from "../actions/window";

export type ShortcutDefinition = {
  id: string;
  label: string;
  defaultKey: string;
  category: "global" | "internal";
  /** 快捷键触发的动作 */
  action: () => void;
};

export const DEFAULT_SHORTCUTS: ShortcutDefinition[] = [
  {
    id: "translate",
    label: "翻译",
    defaultKey: "CommandOrControl+.",
    category: "global",
    action: () => openTranslator(),
  },
  // TODO: 添加更多快捷键
];

/** 生成默认 keyMap */
export const getDefaultKeyMap = () =>
  Object.fromEntries(DEFAULT_SHORTCUTS.map((s) => [s.id, s.defaultKey]));
