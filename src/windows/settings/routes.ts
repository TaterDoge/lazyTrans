const settingsBase = "/settings";

export const settingsRoutes = {
  general: settingsBase,
  appearance: `${settingsBase}/appearance`,
  shortcuts: `${settingsBase}/shortcuts`,
  language: `${settingsBase}/language`,
  about: `${settingsBase}/about`,
} as const;

export type SettingsRoute =
  (typeof settingsRoutes)[keyof typeof settingsRoutes];

export interface SettingsMenuItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
}

export const settingsMenuItems: SettingsMenuItem[] = [
  { id: "general", label: "通用", path: settingsRoutes.general },
  { id: "appearance", label: "外观", path: settingsRoutes.appearance },
  { id: "shortcuts", label: "快捷键", path: settingsRoutes.shortcuts },
  { id: "language", label: "语言", path: settingsRoutes.language },
  { id: "about", label: "关于", path: settingsRoutes.about },
];
