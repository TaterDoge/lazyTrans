import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../components/ui/select";
import {
  type GeneralSettings,
  generalActions,
  generalStore,
} from "../../../../../stores/settings/general.store";

const options: Array<{
  value: GeneralSettings["theme"];
  icon: string;
  label: string;
}> = [
  { value: "system", icon: "icon-[line-md--computer]", label: "系统" },
  {
    value: "light",
    icon: "icon-[line-md--moon-to-sunny-outline-loop-transition]",
    label: "亮色",
  },
  {
    value: "dark",
    icon: "icon-[line-md--moon-rising-alt-loop]",
    label: "暗色",
  },
];

export function ThemeSelect() {
  return (
    <Select
      itemComponent={(props) => (
        <SelectItem item={props.item}>
          <div class="flex items-center gap-x-2">
            <span class={props.item.rawValue.icon} />
            <span>{props.item.rawValue.label}</span>
          </div>
        </SelectItem>
      )}
      onChange={(opt) => opt && generalActions.update({ theme: opt.value })}
      options={options}
      optionTextValue="label"
      optionValue="value"
      value={options.find((o) => o.value === generalStore.theme)}
    >
      <SelectTrigger>
        <SelectValue<(typeof options)[number]>>
          {(state) => (
            <>
              <span class={state.selectedOption().icon} />
              <span>{state.selectedOption().label}</span>
            </>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent />
    </Select>
  );
}
