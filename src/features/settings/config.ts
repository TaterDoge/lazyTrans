import type { Dictionary } from "../../i18n";
import type { FileRouteTypes } from "../../routeTree.gen";

type RouteTo = FileRouteTypes["to"];

export type SettingsMenuItem = {
  id: string;
  labelKey: keyof Dictionary & `settings.menu.${string}`;
  to: RouteTo;
  icon: string;
};

export const settingsMenuItems: SettingsMenuItem[] = [
  {
    id: "general",
    icon: "icon-[tabler--settings]",
    labelKey: "settings.menu.general",
    to: "/settings",
  },
  {
    id: "shortcuts",
    icon: "icon-[tabler--keyboard]",
    labelKey: "settings.menu.shortcuts",
    to: "/settings/shortcuts",
  },
  {
    id: "about",
    icon: "icon-[tabler--info-circle]",
    labelKey: "settings.menu.about",
    to: "/settings/about",
  },
];
