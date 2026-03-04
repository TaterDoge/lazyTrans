/**
 * 翻译设置分组配置
 *
 * 新增设置项：在对应分组的 items 数组里加一个对象，control 字段直接写组件。
 * 新增分组：在 translateSettingGroups 数组里加一个 SettingGroup 对象。
 */

import { Show } from "solid-js";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LanguageOption } from "@/services/translate/config";
import { translateActions, translateConfig } from "@/stores/settings/services";
import type { SettingGroup } from "./config";
import { SOURCE_LANGUAGE_OPTIONS, TARGET_LANGUAGE_OPTIONS } from "./config";

// 源语言选择控件
function SourceLangControl() {
  return (
    <Select<LanguageOption>
      itemComponent={(props) => (
        <SelectItem item={props.item}>
          <div class="flex items-center gap-2">
            <span>{props.item.rawValue.icon}</span>
            <span>{props.item.rawValue.label}</span>
          </div>
        </SelectItem>
      )}
      onChange={(opt) => {
        if (opt) {
          translateActions.update({ sourceLang: opt.value });
        }
      }}
      options={SOURCE_LANGUAGE_OPTIONS}
      optionTextValue="label"
      optionValue="value"
      value={SOURCE_LANGUAGE_OPTIONS.find(
        (o) => o.value === translateConfig.sourceLang
      )}
    >
      <SelectTrigger class="h-8 w-40">
        <SelectValue<LanguageOption>>
          {(state) => (
            <div class="flex items-center gap-2">
              <Show when={state.selectedOption()?.icon}>
                <span>{state.selectedOption()?.icon}</span>
              </Show>
              <span>{state.selectedOption()?.label}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent />
    </Select>
  );
}

// 目标语言选择控件
function TargetLangControl() {
  return (
    <Select<LanguageOption>
      itemComponent={(props) => (
        <SelectItem item={props.item}>
          <div class="flex items-center gap-2">
            <span>{props.item.rawValue.icon}</span>
            <span>{props.item.rawValue.label}</span>
          </div>
        </SelectItem>
      )}
      onChange={(opt) => {
        if (opt) {
          translateActions.update({ targetLang: opt.value });
        }
      }}
      options={TARGET_LANGUAGE_OPTIONS}
      optionTextValue="label"
      optionValue="value"
      value={TARGET_LANGUAGE_OPTIONS.find(
        (o) => o.value === translateConfig.targetLang
      )}
    >
      <SelectTrigger class="h-8 w-40">
        <SelectValue<LanguageOption>>
          {(state) => (
            <div class="flex items-center gap-2">
              <Show when={state.selectedOption()?.icon}>
                <span>{state.selectedOption()?.icon}</span>
              </Show>
              <span>{state.selectedOption()?.label}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent />
    </Select>
  );
}

export const translateSettingGroups: SettingGroup[] = [
  {
    titleKey: "settings.translate.languageConfig",
    items: [
      {
        key: "sourceLang",
        labelKey: "settings.translate.sourceLang",
        control: SourceLangControl,
      },
      {
        key: "targetLang",
        labelKey: "settings.translate.targetLang",
        control: TargetLangControl,
      },
    ],
  },
];
