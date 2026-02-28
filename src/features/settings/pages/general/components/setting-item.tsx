import { Show } from "solid-js";
import { Dynamic } from "solid-js/web";
import { useI18n } from "../../../../../i18n";
import type { SettingItem } from "../config";

/**
 * 通用设置行：只负责「标签 + 描述 + 控件插槽」的布局。
 * 控件由 item.control 直接提供，无需在此做任何类型分发。
 */
export function SettingItemRenderer(props: { item: SettingItem }) {
  const { t } = useI18n();

  return (
    <div class="flex items-center justify-between gap-4">
      <div class="flex flex-col gap-0.5">
        <span class="text-sm">{t(props.item.labelKey) as string}</span>
        <Show when={props.item.descriptionKey}>
          {(key) => (
            <span class="text-muted-foreground text-xs">
              {t(key()) as string}
            </span>
          )}
        </Show>
      </div>
      <div class="shrink-0">
        <Dynamic component={props.item.control} />
      </div>
    </div>
  );
}
