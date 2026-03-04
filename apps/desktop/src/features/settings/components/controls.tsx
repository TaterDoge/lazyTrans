/**
 * 通用设置控件组件
 *
 * 新增控件类型：在此文件定义新组件并导出，然后在 groups.tsx 中使用。
 * 无需修改渲染器（setting-item.tsx）。
 */

import { Show } from "solid-js";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useI18n } from "../../../i18n";
import type { SelectOption } from "./types";

// ─── Switch 控件 ──────────────────────────────────────────────────────────────

export function SwitchControl(props: {
  value: () => boolean;
  onChange: (val: boolean) => void | Promise<void>;
  disabled?: boolean | (() => boolean);
}) {
  const isDisabled = () => {
    const d = props.disabled;
    return typeof d === "function" ? d() : (d ?? false);
  };
  return (
    <Switch
      checked={props.value()}
      disabled={isDisabled()}
      onChange={props.onChange}
    />
  );
}

// ─── Select 控件 ──────────────────────────────────────────────────────────────

export function SelectControl<T extends string>(props: {
  options: SelectOption<T>[];
  value: () => T | undefined;
  onChange: (val: T) => void | Promise<void>;
  disabled?: boolean | (() => boolean);
}) {
  const { t } = useI18n();
  const isDisabled = () => {
    const d = props.disabled;
    return typeof d === "function" ? d() : (d ?? false);
  };
  const getLabel = (opt: SelectOption<T>) =>
    opt.labelKey ? (t(opt.labelKey) as string) : (opt.label ?? "");

  return (
    <Select
      disabled={isDisabled()}
      itemComponent={(itemProps) => (
        <SelectItem item={itemProps.item}>
          <div class="flex items-center gap-x-2">
            <Show when={itemProps.item.rawValue.icon}>
              <span class={itemProps.item.rawValue.icon} />
            </Show>
            <span>{getLabel(itemProps.item.rawValue)}</span>
          </div>
        </SelectItem>
      )}
      onChange={(opt) => opt && props.onChange(opt.value)}
      options={props.options}
      optionTextValue="label"
      optionValue="value"
      value={props.options.find((o) => o.value === props.value())}
    >
      <SelectTrigger class="w-36">
        <SelectValue<SelectOption<T>>>
          {(state) => (
            <div class="flex items-center gap-x-2">
              <Show when={state.selectedOption()?.icon}>
                <span class={state.selectedOption()?.icon} />
              </Show>
              <span>
                {getLabel(state.selectedOption() ?? props.options[0])}
              </span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent />
    </Select>
  );
}
