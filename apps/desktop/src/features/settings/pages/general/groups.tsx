/**
 * 通用设置分组配置
 *
 * 新增设置项：在对应分组的 items 数组里加一个对象，control 字段直接写组件。
 * 新增分组：在 generalSettingGroups 数组里加一个 SettingGroup 对象。
 */

import {
  generalActions,
  generalStore,
} from "../../../../stores/settings/general.store";
import { SelectControl, SwitchControl } from "../../components/controls";
import type { SettingGroup } from "./config";
import { LANGUAGE_OPTIONS, THEME_OPTIONS } from "./config";

export const generalSettingGroups: SettingGroup[] = [
  {
    items: [
      {
        key: "autoStart",
        labelKey: "settings.general.autoStart",
        control: () => (
          <SwitchControl
            onChange={(val) => generalActions.update({ autoStart: val })}
            value={() => generalStore.autoStart ?? false}
          />
        ),
      },
      {
        key: "locale",
        labelKey: "settings.general.displayLanguage",
        control: () => (
          <SelectControl
            onChange={(val) => generalActions.update({ locale: val })}
            options={LANGUAGE_OPTIONS}
            value={() => generalStore.locale}
          />
        ),
      },
      {
        key: "theme",
        labelKey: "settings.general.systemTheme",
        control: () => (
          <SelectControl
            onChange={(val) => generalActions.update({ theme: val })}
            options={THEME_OPTIONS}
            value={() => generalStore.theme}
          />
        ),
      },
    ],
  },
];
