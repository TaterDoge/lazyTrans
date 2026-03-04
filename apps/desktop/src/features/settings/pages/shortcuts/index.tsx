import { For, Show } from "solid-js";
import { useI18n } from "../../../../i18n";
import { SettingItemRenderer } from "../../components/setting-item";
import type { DictionaryLeafKey } from "../../components/types";
import { shortcutsSettingGroups } from "./groups";

function ShortcutsSettings() {
  const { t } = useI18n();

  return (
    <div class="flex flex-col gap-6">
      <For each={shortcutsSettingGroups}>
        {(group) => (
          <div class="flex flex-col gap-3">
            <Show when={group.titleKey}>
              <h3 class="font-medium text-base">
                {t(group.titleKey as DictionaryLeafKey)}
              </h3>
            </Show>

            <section class="space-y-4 rounded-lg border p-6">
              <For each={group.items}>
                {(item) => <SettingItemRenderer item={item} />}
              </For>
            </section>
          </div>
        )}
      </For>
    </div>
  );
}

export default ShortcutsSettings;
